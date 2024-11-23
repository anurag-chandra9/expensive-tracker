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

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard_stats(self, request):
        try:
            # Get user's expenses
            user_expenses = Expense.objects.filter(user=request.user)
            
            # Calculate total expenses
            total_expenses = user_expenses.aggregate(
                total=Sum('amount')
            )['total'] or 0

            # Calculate this month's expenses
            now = timezone.now()
            this_month_expenses = user_expenses.filter(
                date__year=now.year,
                date__month=now.month
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Get category-wise expenses
            category_expenses = user_expenses.values('category__name').annotate(
                total=Sum('amount')
            ).order_by('-total')

            # Get monthly trend (last 6 months)
            monthly_trend = user_expenses.annotate(
                month=TruncMonth('date')
            ).values('month').annotate(
                total=Sum('amount')
            ).order_by('-month')[:6]

            # Get recent expenses
            recent_expenses = user_expenses.order_by('-date')[:5]

            data = {
                'total_expenses': total_expenses,
                'monthly_expenses': this_month_expenses,
                'category_expenses': category_expenses,
                'monthly_trend': monthly_trend,
                'recent_expenses': ExpenseSerializer(recent_expenses, many=True).data
            }

            return Response(data)
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {str(e)}")
            return Response(
                {"error": "Failed to fetch dashboard statistics"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
