from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME = "your@mail.com",
    MAIL_PASSWORD = "yourpassword",
    MAIL_FROM = "your@mail.com",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.mailtrap.io",
    MAIL_TLS = True,
    MAIL_SSL = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_invite_email(email: str, short_link: str):
    message = MessageSchema(
        subject="You've been invited!",
        recipients=[email],
        body=f"Click the link to join: http://yourapp.com/invite/{short_link}",
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)