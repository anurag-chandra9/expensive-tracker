from django.core.management.base import BaseCommand
from expenses.models import Category
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates default expense categories for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to create categories for')

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {username} does not exist'))
            return

        default_categories = [
            'Food & Dining',
            'Transportation',
            'Shopping',
            'Entertainment',
            'Bills & Utilities',
            'Healthcare',
            'Education',
            'Travel',
            'Groceries',
            'Others'
        ]

        created_count = 0
        for category_name in default_categories:
            category, created = Category.objects.get_or_create(
                name=category_name,
                user=user
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created category: {category_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Category already exists: {category_name}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} categories'))
