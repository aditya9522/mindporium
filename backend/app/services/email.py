import logging
import smtplib
from html import escape
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

    def _build_action_email(self, title: str, greeting: str, body: str, button_text: str, action_link: str) -> str:
        safe_title = escape(title)
        safe_greeting = escape(greeting)
        safe_body = escape(body)
        safe_button_text = escape(button_text)
        safe_action_link = escape(action_link, quote=True)
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; margin: 0; padding: 24px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 28px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="font-size: 22px; font-weight: 800; color: #111827;">Mindporium</div>
                        <div style="font-size: 12px; font-weight: 700; color: #4F46E5; text-transform: uppercase; letter-spacing: 1px;">Mindporium AI Team</div>
                    </div>
                    <h2 style="color: #111827; text-align: center; margin: 0 0 18px;">{safe_title}</h2>
                    <p>{safe_greeting}</p>
                    <p>{safe_body}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{safe_action_link}" style="display: inline-block; padding: 12px 22px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">{safe_button_text}</a>
                    </div>
                    <p style="font-size: 13px; color: #4b5563;">Or copy this link:<br>{safe_action_link}</p>
                    <p style="font-size: 13px; color: #6b7280;">If you did not expect this email, please ignore it.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    <p style="text-align: center; color: #9ca3af; font-size: 12px;">
                        Copyright 2026 Mindporium. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """

    def _clean_header(self, value: str) -> str:
        return " ".join(str(value).splitlines())

    def _send_smtp_email(self, email_to: str, subject: str, html_content: str):
        if not self.smtp_host:
            logger.warning(f"SMTP not configured. Email to {email_to} suppressed.\nSubject: {subject}\nContent: {html_content[:100]}...")
            return

        message = MIMEMultipart("alternative")
        message["Subject"] = self._clean_header(subject)
        message["From"] = f"{self.emails_from_name} <{self.emails_from_email}>"
        message["To"] = email_to

        part = MIMEText(html_content, "html")
        message.attach(part)

        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=settings.SMTP_TIMEOUT_SECONDS) as server:
                server.ehlo()
                if settings.SMTP_TLS:
                    server.starttls()
                    server.ehlo()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)
                server.sendmail(self.emails_from_email, email_to, message.as_string())
            logger.info(f"Email sent to {email_to}")
        except Exception as e:
            logger.error(f"Failed to send email to {email_to}: {e}")

    def send_welcome_instructor_email(self, email_to: str, full_name: str, token: str):
        """
        Send welcome email to new instructor with password setup link.
        """
        subject = "Welcome to Mindporium - Setup your Instructor Account"
        setup_link = f"{settings.FRONTEND_URL}/auth/setup-password?token={token}"
        
        html_content = self._build_action_email(
            title="Set up your instructor account",
            greeting=f"Welcome, {full_name}!",
            body="You have been invited to join Mindporium as an Instructor. Use the secure link below to set your password and access your dashboard.",
            button_text="Setup Password",
            action_link=setup_link,
        )
        
        self._send_smtp_email(email_to, subject, html_content)

    def send_welcome_admin_email(self, email_to: str, full_name: str, token: str):
        """
        Send welcome email to new admin with password setup link.
        """
        subject = "Welcome to Mindporium - Setup your Admin Account"
        setup_link = f"{settings.FRONTEND_URL}/auth/setup-password?token={token}"
        
        html_content = self._build_action_email(
            title="Set up your admin account",
            greeting=f"Welcome, {full_name}!",
            body="You have been invited to join Mindporium as an Administrator. Use the secure link below to set your password and access your dashboard.",
            button_text="Setup Password",
            action_link=setup_link,
        )
        
        self._send_smtp_email(email_to, subject, html_content)

    def send_password_reset_otp_email(self, email_to: str, full_name: str, otp: str):
        """
        Send password reset OTP email to user.
        """
        subject = "Password Reset OTP - Mindporium"
        safe_full_name = escape(full_name)
        safe_otp = escape(otp)
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #4F46E5; text-align: center;">Password Reset Request</h2>
                    <p>Hello {safe_full_name},</p>
                    <p>We received a request to reset your password for your Mindporium account.</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px; display: inline-block;">
                            {safe_otp}
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
                        Copyright 2026 Mindporium. All rights reserved.
                    </p>
                </div>
            </body>
        </html>
        """
        
        self._send_smtp_email(email_to, subject, html_content)

    def send_referral_email(self, email_to: str, referrer_name: str, referral_link: str):
        """
        Send referral invitation email.
        """
        subject = f"{self._clean_header(referrer_name)} invited you to join Mindporium"

        html_content = self._build_action_email(
            title="You're invited to Mindporium",
            greeting="Hello,",
            body=f"{referrer_name} invited you to join Mindporium. Use the link below to create your account.",
            button_text="Accept Invite",
            action_link=referral_link,
        )

        self._send_smtp_email(email_to, subject, html_content)

email_service = EmailService()

