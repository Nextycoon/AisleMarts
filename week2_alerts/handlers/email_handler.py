import os, smtplib
from email.message import EmailMessage

def notify_email(subject: str, html_body: str):
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT","587"))
    user = os.getenv("SMTP_USER")
    pwd  = os.getenv("SMTP_PASSWORD")
    from_addr = os.getenv("EMAIL_FROM","alerts@yourdomain.com")
    to_addrs = [x.strip() for x in os.getenv("EMAIL_TO","ops@yourdomain.com").split(",") if x.strip()]

    if not (host and user and pwd):
        return {"ok": False, "error": "SMTP creds missing"}

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = ", ".join(to_addrs)
    msg.set_content("This email requires an HTML-capable client.")
    msg.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(host, port, timeout=15) as s:
            s.starttls()
            s.login(user, pwd)
            s.send_message(msg)
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}
