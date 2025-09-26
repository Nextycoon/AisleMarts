"""
AisleMarts Legal Document Router
Serves Privacy Policy and Terms of Service for app store compliance
"""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse
import os
from pathlib import Path
import markdown

router = APIRouter()

# Get legal documents directory
LEGAL_DIR = Path(__file__).parent.parent.parent / "legal"

def load_legal_document(filename: str) -> str:
    """Load and convert markdown legal document to HTML"""
    try:
        file_path = LEGAL_DIR / filename
        with open(file_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        # Convert markdown to HTML
        html_content = markdown.markdown(markdown_content, extensions=['toc'])
        
        # Wrap in basic HTML template
        html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AisleMarts - {filename.replace('-', ' ').replace('.md', '').title()}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }}
        .container {{
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        h1 {{ color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }}
        h2 {{ color: #555; margin-top: 30px; }}
        h3 {{ color: #666; margin-top: 20px; }}
        ul, ol {{ margin-left: 20px; }}
        strong {{ color: #333; }}
        .last-updated {{
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 40px;
        }}
        .toc {{ 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
        }}
        @media (max-width: 768px) {{
            body {{ padding: 10px; }}
            .container {{ padding: 20px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        {html_content}
        <div class="last-updated">
            <p><strong>AisleMarts, Inc.</strong><br>
            This document is part of our app store compliance and legal framework.<br>
            For questions, contact: <a href="mailto:legal@aislemarts.com">legal@aislemarts.com</a></p>
        </div>
    </div>
</body>
</html>
        """
        
        return html_template
        
    except FileNotFoundError:
        return """
<!DOCTYPE html>
<html><head><title>Document Not Found</title></head>
<body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
    <h1>Document Not Available</h1>
    <p>The requested legal document could not be found.</p>
    <p>Please contact <a href="mailto:legal@aislemarts.com">legal@aislemarts.com</a> for assistance.</p>
</body></html>
        """

@router.get("/legal/privacy-policy", response_class=HTMLResponse, tags=["legal"])
async def privacy_policy():
    """
    Privacy Policy - App Store Compliance
    
    Returns the complete Privacy Policy in HTML format.
    Required for Apple App Store and Google Play Store submissions.
    """
    return load_legal_document("privacy-policy.md")

@router.get("/legal/terms-of-service", response_class=HTMLResponse, tags=["legal"]) 
async def terms_of_service():
    """
    Terms of Service - App Store Compliance
    
    Returns the complete Terms of Service in HTML format.
    Required for Apple App Store and Google Play Store submissions.
    """
    return load_legal_document("terms-of-service.md")

@router.get("/legal/privacy", response_class=HTMLResponse, tags=["legal"])
async def privacy_policy_short():
    """Privacy Policy (short URL)"""
    return load_legal_document("privacy-policy.md")

@router.get("/legal/terms", response_class=HTMLResponse, tags=["legal"])
async def terms_of_service_short():
    """Terms of Service (short URL)"""
    return load_legal_document("terms-of-service.md")

@router.get("/privacy-policy", response_class=HTMLResponse, tags=["legal"])
async def privacy_policy_root():
    """Privacy Policy (root URL for app store)"""
    return load_legal_document("privacy-policy.md")

@router.get("/terms-of-service", response_class=HTMLResponse, tags=["legal"])  
async def terms_of_service_root():
    """Terms of Service (root URL for app store)"""
    return load_legal_document("terms-of-service.md")

@router.get("/legal", response_class=HTMLResponse, tags=["legal"])
async def legal_index():
    """Legal documents index page"""
    return HTMLResponse("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AisleMarts - Legal Documents</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .logo {
            color: #667eea;
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .links {
            margin: 30px 0;
        }
        .links a {
            display: inline-block;
            margin: 10px 20px;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: background 0.3s;
        }
        .links a:hover {
            background: #5a67d8;
        }
        .footer {
            margin-top: 40px;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">AisleMarts</div>
        <h1>Legal Documents</h1>
        <p>Access our legal policies and terms for app store compliance and user transparency.</p>
        
        <div class="links">
            <a href="/legal/privacy-policy">Privacy Policy</a>
            <a href="/legal/terms-of-service">Terms of Service</a>
        </div>
        
        <div class="footer">
            <p><strong>AisleMarts, Inc.</strong><br>
            AI-Powered Global Marketplace & Social Commerce Platform</p>
            <p>Questions? Contact: <a href="mailto:legal@aislemarts.com">legal@aislemarts.com</a></p>
        </div>
    </div>
</body>
</html>
    """)