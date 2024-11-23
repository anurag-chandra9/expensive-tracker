from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from expenses.models import Category

class Command(BaseCommand):
    help = 'Adds default expense categories'

    def handle(self, *args, **kwargs):
        # Get or create the admin user
        admin_user = User.objects.get(username='admin')

        # Default categories
        default_categories = [
            'Shopping',
            'Food & Dining',
            'Transportation',
            'Education',
            'Entertainment',
            'Bills & Utilities',
            'Healthcare',
            'Groceries',
            'Travel',
            'Personal Care',
            'Housing',
            'Gifts & Donations',
            'Investments',
            'Others'
        ]

        # Create categories
        for category_name in default_categories:
            Category.objects.get_or_create(
                name=category_name,
                user=admin_user
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created category "{category_name}"')
            )
