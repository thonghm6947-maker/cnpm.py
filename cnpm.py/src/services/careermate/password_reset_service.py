import random
import string
import logging
from datetime import datetime, timedelta
from typing import Optional
from werkzeug.security import generate_password_hash

from infrastructure.databases.factory_database import FactoryDatabase
from infrastructure.models.careermate.password_reset_model import PasswordResetModel
from infrastructure.models.careermate.user_model import CMUserModel
from services.careermate.email_service import EmailService

logger = logging.getLogger(__name__)


class PasswordResetService:
    """Service for password reset operations with OTP."""
    
    # Configuration
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5
    
    def __init__(self, session=None):
        self.session = session or FactoryDatabase.get_database('MSSQL').session
        self.email_service = EmailService()
    
    def _generate_otp(self) -> str:
        """Generate a random 6-digit OTP code."""
        return ''.join(random.choices(string.digits, k=self.OTP_LENGTH))
    
    def _invalidate_existing_otps(self, email: str):
        """Invalidate all existing OTPs for an email."""
        self.session.query(PasswordResetModel).filter_by(
            email=email,
            is_used=False
        ).update({'is_used': True})
        self.session.commit()
    
    def _get_user_by_email(self, email: str) -> Optional[CMUserModel]:
        """Get user by email."""
        return self.session.query(CMUserModel).filter_by(email=email).first()
    
    def _get_valid_otp(self, email: str, otp_code: str) -> Optional[PasswordResetModel]:
        """Get a valid OTP record for verification."""
        otp_record = self.session.query(PasswordResetModel).filter_by(
            email=email,
            otp_code=otp_code,
            is_used=False
        ).order_by(PasswordResetModel.created_at.desc()).first()
        
        if otp_record and otp_record.is_valid():
            return otp_record
        return None
    
    def send_otp(self, email: str) -> dict:
        """
        Generate and send OTP to user's email.
        
        Args:
            email: User's email address
            
        Returns:
            dict with success status and message
        """
        try:
            # Check if user exists
            user = self._get_user_by_email(email)
            if not user:
                # Don't reveal if email exists for security
                # Still return success to prevent email enumeration
                logger.warning(f"Password reset requested for non-existent email: {email}")
                return {
                    'success': True,
                    'message': 'Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi đến email của bạn.'
                }
            
            # Invalidate existing OTPs
            self._invalidate_existing_otps(email)
            
            # Generate new OTP
            otp_code = self._generate_otp()
            expires_at = datetime.utcnow() + timedelta(minutes=self.OTP_EXPIRY_MINUTES)
            
            # Save OTP to database
            otp_record = PasswordResetModel(
                email=email,
                otp_code=otp_code,
                expires_at=expires_at
            )
            self.session.add(otp_record)
            self.session.commit()
            
            # Send email
            email_sent = self.email_service.send_otp_email(email, otp_code)
            
            if email_sent:
                logger.info(f"OTP sent successfully to {email}")
                return {
                    'success': True,
                    'message': 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.'
                }
            else:
                logger.error(f"Failed to send OTP email to {email}")
                return {
                    'success': False,
                    'message': 'Không thể gửi email. Vui lòng kiểm tra cấu hình email server.'
                }
                
        except Exception as e:
            logger.error(f"Error in send_otp: {e}")
            self.session.rollback()
            return {
                'success': False,
                'message': 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
            }
    
    def verify_otp(self, email: str, otp_code: str) -> dict:
        """
        Verify OTP code.
        
        Args:
            email: User's email address
            otp_code: 6-digit OTP code
            
        Returns:
            dict with success status and message
        """
        try:
            # Find the most recent OTP for this email
            otp_record = self.session.query(PasswordResetModel).filter_by(
                email=email,
                is_used=False
            ).order_by(PasswordResetModel.created_at.desc()).first()
            
            if not otp_record:
                return {
                    'success': False,
                    'valid': False,
                    'message': 'Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại.'
                }
            
            # Check if expired
            if otp_record.is_expired():
                return {
                    'success': False,
                    'valid': False,
                    'message': 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.'
                }
            
            # Check attempts
            if otp_record.attempts >= self.MAX_ATTEMPTS:
                otp_record.is_used = True
                self.session.commit()
                return {
                    'success': False,
                    'valid': False,
                    'message': 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới.'
                }
            
            # Verify OTP
            if otp_record.otp_code != otp_code:
                otp_record.attempts += 1
                self.session.commit()
                remaining = self.MAX_ATTEMPTS - otp_record.attempts
                return {
                    'success': False,
                    'valid': False,
                    'message': f'Mã OTP không đúng. Còn {remaining} lần thử.'
                }
            
            # OTP is valid
            logger.info(f"OTP verified successfully for {email}")
            return {
                'success': True,
                'valid': True,
                'message': 'Mã OTP hợp lệ.'
            }
            
        except Exception as e:
            logger.error(f"Error in verify_otp: {e}")
            return {
                'success': False,
                'valid': False,
                'message': 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
            }
    
    def reset_password(self, email: str, otp_code: str, new_password: str) -> dict:
        """
        Reset user's password after OTP verification.
        
        Args:
            email: User's email address
            otp_code: 6-digit OTP code
            new_password: New password
            
        Returns:
            dict with success status and message
        """
        try:
            # Validate password
            if len(new_password) < 6:
                return {
                    'success': False,
                    'message': 'Mật khẩu phải có ít nhất 6 ký tự.'
                }
            
            # Verify OTP again
            otp_result = self.verify_otp(email, otp_code)
            if not otp_result.get('valid'):
                return otp_result
            
            # Get user
            user = self._get_user_by_email(email)
            if not user:
                return {
                    'success': False,
                    'message': 'Không tìm thấy tài khoản.'
                }
            
            # Update password
            user.password_hash = generate_password_hash(new_password)
            user.updated_at = datetime.utcnow()
            
            # Mark OTP as used
            otp_record = self._get_valid_otp(email, otp_code)
            if otp_record:
                otp_record.is_used = True
            
            self.session.commit()
            
            # Send confirmation email (non-blocking)
            try:
                self.email_service.send_password_reset_success_email(email)
            except Exception as e:
                logger.warning(f"Failed to send confirmation email: {e}")
            
            logger.info(f"Password reset successfully for {email}")
            return {
                'success': True,
                'message': 'Mật khẩu đã được đặt lại thành công. Bạn có thể đăng nhập với mật khẩu mới.'
            }
            
        except Exception as e:
            logger.error(f"Error in reset_password: {e}")
            self.session.rollback()
            return {
                'success': False,
                'message': 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
            }
