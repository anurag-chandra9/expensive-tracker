from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = ['user', 'name']
        ordering = ['name']

    def __str__(self):
        return self.name

class Expense(models.Model):
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.TextField()
    date = models.DateField()
    category = models.ForeignKey(
        Category, 
        on_delete=models.PROTECT,
        related_name='expenses',
        null=True,  # Allow null for existing records
        blank=True  # Allow blank in forms
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='expenses'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - ₹{self.amount}"
