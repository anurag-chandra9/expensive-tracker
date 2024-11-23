from django.contrib import admin
from .models import Category, Expense

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at', 'updated_at')
    list_filter = ('user',)
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('description', 'amount', 'category', 'user', 'date', 'created_at')
    list_filter = ('user', 'category', 'date')
    search_fields = ('description',)
    ordering = ('-date', '-created_at')
    date_hierarchy = 'date'
