import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending emails via Gmail SMTP."""
    
    def __init__(self):
        self.server = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
        self.port = int(os.getenv('MAIL_PORT', 587))
        self.use_tls = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
        self.username = os.getenv('MAIL_USERNAME')
        self.password = os.getenv('MAIL_PASSWORD')
        self.sender = os.getenv('MAIL_DEFAULT_SENDER', self.username)

    def _create_otp_email_html(self, otp_code: str) -> str:
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Logo/Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2563eb; margin: 0; font-size: 28px;">CareerMate</h1>
                        <p style="color: #6b7280; margin-top: 8px;">Your AI Career Companion</p>
                    </div>
            
                    <!-- Content -->
                    <div style="text-align: center;">
                        <h2 style="color: #1f2937; margin-bottom: 16px;">Reset Password</h2>
                        <p style="color: #4b5563; margin-bottom: 24px; line-height: 1.6;">
                            You have requested to reset the password for your CareerMate account. 
                            Use the OTP code below to continue:
                        </p>
                        
                        <!-- OTP Code -->
                        <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); border-radius: 12px; padding: 24px; margin: 24px 0;">
                            <p style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0;">
                                {otp_code}
                            </p>
                        </div>
                        
                        <p style="color: #ef4444; font-size: 14px; margin-top: 16px;">
                            ⚠️ This code will expire in <strong>10 minutes</strong>
                        </p>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 24px; line-height: 1.6;">
                            If you did not request a password reset, please ignore this email.
                            Your account is safe.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © 2026 CareerMate. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

    def _create_otp_email_text(self, otp_code: str) -> str:
        return f"""
CareerMate - Reset Password

You have requested to reset the password for your CareerMate account.

Your OTP code: {otp_code}

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email.

---
© 2026 CareerMate. All rights reserved.
        """

    def send_otp_email(self, to_email: str, otp_code: str) -> bool:
        if not self.username or not self.password:
            logger.error("Email credentials not configured. Please set MAIL_USERNAME and MAIL_PASSWORD in .env")
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"[CareerMate] Password Reset Verification Code: {otp_code}"
            msg['From'] = self.sender
            msg['To'] = to_email

            text_part = MIMEText(self._create_otp_email_text(otp_code), 'plain', 'utf-8')
            html_part = MIMEText(self._create_otp_email_html(otp_code), 'html', 'utf-8')

            msg.attach(text_part)
            msg.attach(html_part)

            with smtplib.SMTP(self.server, self.port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.username, self.password)
                server.sendmail(self.sender, to_email, msg.as_string())
            
            logger.info(f"OTP email sent successfully to {to_email}")
            return True

        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP Authentication failed: {e}")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    def send_password_reset_success_email(self, to_email: str) -> bool:
        if not self.username or not self.password:
            logger.warning("Email credentials not configured. Skipping confirmation email.")
            return False

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "[CareerMate] Password Reset Successful"
            msg['From'] = self.sender
            msg['To'] = to_email

            html_content = """
            <!DOCTYPE html>
            <html>
            <body style="font-family: 'Segoe UI', sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px;">
                    <div style="text-align: center;">
                        <h1 style="color: #2563eb;">CareerMate</h1>
                        <div style="background-color: #10b981; border-radius: 50%; width: 60px; height: 60px; margin: 20px auto; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 30px;">✓</span>
                        </div>
                        <h2 style="color: #1f2937;">Password Reset Successful!</h2>
                        <p style="color: #6b7280;">Your password has been successfully changed. You can now log in with your new password.</p>
                        <p style="color: #ef4444; font-size: 14px; margin-top: 24px;">
                            If you did not make this change, please contact us immediately.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """

            text_content = """
CareerMate - Password Reset Successful

Your password has been successfully changed. You can now log in with your new password.

If you did not make this change, please contact us immediately.
            """

            msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))

            with smtplib.SMTP(self.server, self.port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.username, self.password)
                server.sendmail(self.sender, to_email, msg.as_string())

            logger.info(f"Password reset confirmation email sent to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send confirmation email: {e}")
            return False
