from django.urls import path
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/request-password-reset/', views.request_password_reset, name='request-password-reset'),
    path('auth/verify-otp/', views.verify_otp, name='verify-otp'),
]
