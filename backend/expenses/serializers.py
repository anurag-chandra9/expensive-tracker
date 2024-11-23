from rest_framework import serializers
from .models import Category, Expense
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db.models import Sum
from datetime import datetime

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

    def create(self, validated_data):
        try:
            user = self.context['request'].user
            return Category.objects.create(user=user, **validated_data)
        except IntegrityError:
            raise serializers.ValidationError({
                'name': ['A category with this name already exists for your account.']
            })
        except Exception as e:
            raise serializers.ValidationError(str(e))

    def update(self, instance, validated_data):
        try:
            instance.name = validated_data.get('name', instance.name)
            instance.save()
            return instance
        except IntegrityError:
            raise serializers.ValidationError({
                'name': ['A category with this name already exists for your account.']
            })
        except Exception as e:
            raise serializers.ValidationError(str(e))

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = Expense
        fields = [
            'id', 'amount', 'description', 'category', 
            'category_name', 'date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_name']

    def validate_category(self, value):
        if value.user != self.context['request'].user:
            raise serializers.ValidationError("Invalid category selected.")
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate(self, data):
        # Add any additional validation here
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class DashboardStatsSerializer(serializers.Serializer):
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    category_expenses = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(),
            required=False
        )
    )
    monthly_trend = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    recent_expenses = ExpenseSerializer(many=True, read_only=True, required=False)

    def validate_total_expenses(self, value):
        if value < 0:
            raise serializers.ValidationError("Total expenses cannot be negative")
        return value

    def validate_monthly_expenses(self, value):
        if value < 0:
            raise serializers.ValidationError("Monthly expenses cannot be negative")
        return value

    def validate_category_expenses(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Category expenses must be a list")
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each category expense must be a dictionary")
            if not all(k in item for k in ('category', 'amount', 'percentage')):
                raise serializers.ValidationError("Each category expense must have 'category', 'amount', and 'percentage' fields")
            try:
                amount = float(item['amount'])
                percentage = float(item['percentage'])
                if amount < 0:
                    raise serializers.ValidationError("Category amount cannot be negative")
                if percentage < 0 or percentage > 100:
                    raise serializers.ValidationError("Category percentage must be between 0 and 100")
            except ValueError:
                raise serializers.ValidationError("Invalid amount or percentage format")
        return value

    def validate_monthly_trend(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Monthly trend must be a list")
        for item in value:
            if not isinstance(item, dict) or 'month' not in item or 'amount' not in item:
                raise serializers.ValidationError("Each monthly trend item must have 'month' and 'amount' fields")
        return value
