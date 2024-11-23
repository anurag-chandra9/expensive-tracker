from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from expenses.models import Category

class Command(BaseCommand):
    help = 'Creates default user and categories'

    def handle(self, *args, **kwargs):
        # Create default user if it doesn't exist
        username = 'admin'
        email = 'admin@example.com'
        password = 'admin123'

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Successfully created default user: {username}'))
        else:
            self.stdout.write(self.style.WARNING(f'User {username} already exists'))

        # Get or create the default user
        default_user = User.objects.get(username=username)

        # Default categories
        default_categories = [
            'Food & Dining',
            'Transportation',
            'Shopping',
            'Entertainment',
            'Bills & Utilities',
            'Health & Medical',
            'Travel',
            'Education',
            'Personal Care',
            'Others'
        ]

        # Create categories
        for category_name in default_categories:
            category, created = Category.objects.get_or_create(
                name=category_name,
                user=default_user
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Category {category_name} already exists'))
