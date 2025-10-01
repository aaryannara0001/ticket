"""Email service for sending verification emails."""

import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime, timedelta

from app.core.config import settings


class EmailService:
    """Email service for sending verification emails."""

    def __init__(self):
        # For demo purposes, we'll use a mock email service
        # In production, you would configure SMTP settings
        self.smtp_server = getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_username = getattr(settings, 'SMTP_USERNAME', '')
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', '')
        self.from_email = getattr(
            settings, 'FROM_EMAIL', 'noreply@ticketflow.com')

    def generate_otp(self, length: int = 6) -> str:
        """Generate a random OTP."""
        return ''.join(random.choices(string.digits, k=length))

    def send_verification_email(self, email: str, otp: str, name: str) -> bool:
        """Send verification email with OTP."""
        try:
            # Create email message
            msg = MIMEMultipart()
            msg['From'] = f"{getattr(settings, 'FROM_NAME', 'Ticket')} <{self.from_email}>"
            msg['To'] = email
            msg['Subject'] = "Verify your TicketFlow account"

            body = f"""
Hi {name},

Welcome to TicketFlow! Please verify your email address by entering the following code:

{otp}

This verification code will expire in 10 minutes.

If you didn't create an account, please ignore this email.

Best regards,
The TicketFlow Team
"""

            msg.attach(MIMEText(body, 'plain'))

            # Send email via SMTP
            if self.smtp_username and self.smtp_password:
                print(f"\n📧 Sending verification email to: {email}")
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                text = msg.as_string()
                server.sendmail(self.from_email, email, text)
                server.quit()
                print(f"✅ Email sent successfully!\n")
            else:
                # Fallback to console logging if SMTP not configured
                print(f"\n📧 EMAIL VERIFICATION (Console Mode)")
                print(f"To: {email}")
                print(f"Name: {name}")
                print(f"OTP: {otp}")
                print(f"Subject: Verify your TicketFlow account")
                print(f"Body: Hi {name}, your verification code is: {otp}")
                print(f"This code will expire in 10 minutes.\n")

            return True

        except Exception as e:
            print(f"❌ Failed to send email: {str(e)}")
            # Fallback to console logging on error
            print(f"\n📧 EMAIL VERIFICATION (Fallback - Console Mode)")
            print(f"To: {email}")
            print(f"Name: {name}")
            print(f"OTP: {otp}")
            print(f"This code will expire in 10 minutes.\n")
            return True  # Return True so registration can continue

    def get_otp_expiry_time(self) -> datetime:
        """Get OTP expiry time (10 minutes from now)."""
        return datetime.utcnow() + timedelta(minutes=10)


# Global email service instance
email_service = EmailService()
