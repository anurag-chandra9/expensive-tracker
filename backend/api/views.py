from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import PasswordResetOTP
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request a password reset OTP
    """
    email = request.data.get('email')
    logger.debug(f"Password reset request received for email: {email}")
    
    if not email:
        logger.warning("Email not provided in request")
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        logger.debug(f"User found with email: {email}")
    except User.DoesNotExist:
        logger.warning(f"No user found with email: {email}")
        return Response(
            {'error': 'No user found with this email address'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        # Generate OTP
        otp = PasswordResetOTP.generate_otp()
        logger.debug(f"OTP generated for user: {user.username}")
        
        # Save OTP in database
        PasswordResetOTP.objects.create(
            user=user,
            otp=otp
        )
        logger.debug("OTP saved in database")

        # Send email with OTP
        subject = 'Password Reset OTP - Expense Tracker'
        message = f'''
        Hello {user.username},

        Your OTP for password reset is: {otp}

        This OTP will expire in 10 minutes.

        If you didn't request this password reset, please ignore this email.

        Best regards,
        Expense Tracker Team
        '''
        
        logger.debug("Attempting to send email")
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        logger.info(f"Password reset OTP sent successfully to {email}")
        
        return Response(
            {'message': 'OTP has been sent to your email'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error in password reset process: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Failed to send OTP email. Please try again later.',
                'detail': str(e) if settings.DEBUG else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')

    if not all([email, otp, new_password]):
        logger.warning("Email, OTP, and new password are required")
        return Response(
            {'error': 'Email, OTP, and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
        logger.debug(f"User found with email: {email}")
    except User.DoesNotExist:
        logger.warning(f"No user found with email: {email}")
        return Response(
            {'error': 'Invalid email'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        otp_obj = PasswordResetOTP.objects.filter(
            user=user,
            otp=otp,
            is_used=False
        ).latest('created_at')
        logger.debug(f"OTP object found for user: {user.username}")
    except PasswordResetOTP.DoesNotExist:
        logger.warning(f"Invalid or expired OTP for user: {user.username}")
        return Response(
            {'error': 'Invalid or expired OTP'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not otp_obj.is_valid():
        logger.warning(f"OTP has expired for user: {user.username}")
        return Response(
            {'error': 'OTP has expired'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Set new password
        user.set_password(new_password)
        user.save()
        logger.info(f"Password reset successful for user: {user.username}")
        
        # Mark OTP as used
        otp_obj.is_used = True
        otp_obj.save()
        logger.debug("OTP marked as used")
        
        return Response(
            {'message': 'Password has been reset successfully'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"Error in password reset process: {str(e)}", exc_info=True)
        return Response(
            {
                'error': 'Failed to reset password. Please try again later.',
                'detail': str(e) if settings.DEBUG else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
