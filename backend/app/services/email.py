import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Any, Dict
from jinja2 import Template

from app.core.config import settings

logger = logging.getLogger("app.services.email")

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.emails_from_email = settings.EMAILS_FROM_EMAIL
        self.emails_from_name = settings.EMAILS_FROM_NAME

    def _send_smtp_email(self, email_to: str, subject: str, html_content: str):
        if not self.smtp_host:
            logger.warning(f"SMTP not configured. Email to {email_to} suppressed.\nSubject: {subject}\nContent: {html_content[:100]}...")
            return

        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.emails_from_name} <{self.emails_from_email}>"
        message["To"] = email_to

        part = MIMEText(html_content, "html")
        message.attach(part)

        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.emails_from_email, email_to, message.as_string())
            logger.info(f"Email sent to {email_to}")
        except Exception as e:
            logger.error(f"Failed to send email to {email_to}: {e}")

    async def send_welcome_instructor_email(self, email_to: str, full_name: str, token: str):
        """
        Send welcome email to new instructor with password setup link.
        """
        subject = "Welcome to Mindporium - Setup your Instructor Account"
        setup_link = f"{settings.FRONTEND_URL}/auth/setup-password?token={token}"
        
        # Simple HTML Template
        html_content = f"""
        <html>
            <body>
                <h2>Welcome, {full_name}!</h2>
                <p>You have been invited to join Mindporium as an Instructor.</p>
                <p>Please click the link below to set up your password and access your dashboard:</p>
                <a href="{setup_link}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Setup Password</a>
                <p>Or copy this link: {setup_link}</p>
                <br>
                <p>If you did not expect this email, please ignore it.</p>
            </body>
        </html>
        """
        
        # In a real async app, you might want to run this in a threadpool or use aiosmtplib
        # For now, we'll run it synchronously or assume it's fast enough/background task
        self._send_smtp_email(email_to, subject, html_content)

    async def send_welcome_admin_email(self, email_to: str, full_name: str, token: str):
        """
        Send welcome email to new admin with password setup link.
        """
        subject = "Welcome to Mindporium - Setup your Admin Account"
        setup_link = f"{settings.FRONTEND_URL}/auth/setup-password?token={token}"
        
        # Simple HTML Template
        html_content = f"""
        <html>
            <body>
                <h2>Welcome, {full_name}!</h2>
                <p>You have been invited to join Mindporium as an Administrator.</p>
                <p>Please click the link below to set up your password and access your dashboard:</p>
                <a href="{setup_link}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Setup Password</a>
                <p>Or copy this link: {setup_link}</p>
                <br>
                <p>If you did not expect this email, please ignore it.</p>
            </body>
        </html>
        """
        
        self._send_smtp_email(email_to, subject, html_content)

    async def send_password_reset_otp_email(self, email_to: str, full_name: str, otp: str):
        """
        Send password reset OTP email to user.
        """
        subject = "Password Reset OTP - Mindporium"
        
        # Professional HTML Template for OTP
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #4F46E5; text-align: center;">Password Reset Request</h2>
                    <p>Hello {full_name},</p>
                    <p>We received a request to reset your password for your Mindporium account.</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px; display: inline-block;">
                            {otp}
                        </span>
                    </div>
                    <p><strong>This OTP will expire in 10 minutes.</strong></p>
                    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                    <br>
                    <p style="color: #666; font-size: 12px;">
                        For security reasons, never share this OTP with anyone. Mindporium staff will never ask for your OTP.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="text-align: center; color: #999; font-size: 12px;">
                        © 2024 Mindporium. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """
        
        self._send_smtp_email(email_to, subject, html_content)

email_service = EmailService()

