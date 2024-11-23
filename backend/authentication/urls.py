from django.urls import path
from . import views
from api.views import request_password_reset, verify_otp

urlpatterns = [
    path('login/', views.login_user, name='login'),
    path('register/', views.register_user, name='register'),
    path('request-password-reset/', request_password_reset, name='request-password-reset'),
    path('verify-otp/', verify_otp, name='verify-otp'),
]
