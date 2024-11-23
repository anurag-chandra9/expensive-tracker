from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import datetime
from calendar import monthrange
from .models import Expense, Category
from .serializers import ExpenseSerializer, CategorySerializer, DashboardStatsSerializer
import logging

logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except Exception as e:
            logger.error(f"Error creating category: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error updating category: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance.expenses.exists():
                return Response(
                    {"error": "Cannot delete category with associated expenses. Please delete or reassign expenses first."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting category: {str(e)}")
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        try:
            # Log the request
            logger.info(f"Fetching dashboard stats for user: {request.user.username}")
            
            # Get user's expenses
            user_expenses = Expense.objects.filter(user=request.user)
            logger.debug(f"Found {user_expenses.count()} expenses for user")
            
            # Calculate total expenses
            total_expenses = user_expenses.aggregate(
                total=Sum('amount')
            )['total'] or 0
            logger.debug(f"Total expenses: {total_expenses}")

            # Calculate this month's expenses
            now = timezone.now()
            this_month_expenses = user_expenses.filter(
                date__year=now.year,
                date__month=now.month
            ).aggregate(total=Sum('amount'))['total'] or 0
            logger.debug(f"This month's expenses: {this_month_expenses}")

            # Get expenses by category
            category_expenses = []
            categories = Category.objects.filter(user=request.user)
            logger.debug(f"Found {categories.count()} categories for user")
            
            for category in categories:
                amount = user_expenses.filter(
                    category=category,
                    date__year=now.year,
                    date__month=now.month
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                # Include all categories, even those with zero expenses
                category_expenses.append({
                    'category': category.name,
                    'amount': float(amount),  # Convert to float
                    'percentage': float(amount) / float(this_month_expenses) * 100 if this_month_expenses > 0 else 0.0
                })

            # Sort categories by amount (descending)
            category_expenses.sort(key=lambda x: float(x['amount']), reverse=True)
            logger.debug(f"Processed {len(category_expenses)} categories")

            # Calculate monthly trend (last 6 months)
            monthly_trend = []
            for i in range(5, -1, -1):
                month_date = now.replace(day=1) - timezone.timedelta(days=i*30)
                month_expenses = user_expenses.filter(
                    date__year=month_date.year,
                    date__month=month_date.month
                ).aggregate(total=Sum('amount'))['total'] or 0
                monthly_trend.append({
                    'month': month_date.strftime('%B %Y'),
                    'amount': float(month_expenses)
                })
            logger.debug("Generated monthly trend data")

            # Get recent expenses
            recent_expenses = user_expenses.order_by('-date', '-created_at')[:5]
            logger.debug(f"Retrieved {recent_expenses.count()} recent expenses")

            data = {
                'total_expenses': float(total_expenses),
                'monthly_expenses': float(this_month_expenses),
                'category_expenses': category_expenses,
                'monthly_trend': monthly_trend,
                'recent_expenses': ExpenseSerializer(recent_expenses, many=True).data
            }

            serializer = DashboardStatsSerializer(data=data)
            if not serializer.is_valid():
                logger.error(f"Serializer validation failed: {serializer.errors}")
                return Response(
                    {'error': 'Invalid dashboard data format', 'details': serializer.errors},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            logger.info("Successfully generated dashboard stats")
            return Response(serializer.data)

        except Exception as e:
            logger.error(f"Error getting dashboard stats: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch dashboard statistics', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
