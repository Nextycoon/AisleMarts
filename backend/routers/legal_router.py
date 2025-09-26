"""
AisleMarts Legal Document Router
Serves Privacy Policy and Terms of Service as HTML with proper headers for App Store compliance
"""

from fastapi import APIRouter, Response, Header, HTTPException
from pathlib import Path
import hashlib
import markdown
import os
from datetime import datetime

router = APIRouter(prefix="/api/legal", tags=["legal"])

BASE = Path("/app/legal")

def render(doc_name: str) -> tuple[str, str, float]:
    """Render markdown document to HTML with metadata"""
    p = BASE / f"{doc_name}.md"
    if not p.exists():
        raise HTTPException(status_code=404, detail=f"Document {doc_name} not found")
    
    raw = p.read_text(encoding="utf-8")
    html = markdown.markdown(raw, extensions=["extra", "toc", "sane_lists"])
    etag = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]  # Short hash for ETag
    mtime = p.stat().st_mtime
    return html, etag, mtime

def legal_response(html: str, etag: str, mtime: float, doc_title: str) -> Response:
    """Create legal document response with proper headers and template"""
    last_modified = datetime.fromtimestamp(mtime).strftime('%a, %d %b %Y %H:%M:%S GMT')
    
    tpl = f"""<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{doc_title} - AisleMarts Legal</title>
    <meta name="robots" content="noindex">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:;">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="Referrer-Policy" content="no-referrer">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <style>
        body {{
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            max-width: 820px;
            margin: 32px auto;
            padding: 0 16px;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }}
        h1, h2 {{
            margin-top: 1.2em;
            color: #2c3e50;
        }}
        h1 {{
            border-bottom: 2px solid #e74c3c;
            padding-bottom: 0.3em;
        }}
        h2 {{
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 0.2em;
        }}
        .doc-meta {{
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 12px;
            margin: 16px 0;
            font-size: 0.9em;
            color: #6c757d;
        }}
        .contact-info {{
            background: #e8f4f8;
            border-left: 4px solid #17a2b8;
            padding: 16px;
            margin: 24px 0;
        }}
        code {{
            background: #f1f3f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 0.9em;
        }}
        @media (max-width: 768px) {{
            body {{
                margin: 16px auto;
                padding: 0 12px;
            }}
        }}
    </style>
</head>
<body>
    <div class="doc-meta">
        <strong>Document:</strong> {doc_title}<br>
        <strong>Version:</strong> {etag}<br>
        <strong>Last Updated:</strong> {last_modified}<br>
        <strong>Contact:</strong> legal@aislemarts.com
    </div>
    
    {html}
    
    <div class="contact-info">
        <h3>Contact Information</h3>
        <p><strong>Legal Department:</strong> legal@aislemarts.com</p>
        <p><strong>Privacy Team:</strong> privacy@aislemarts.com</p>
        <p><strong>Support:</strong> support@aislemarts.com</p>
    </div>
</body>
</html>"""
    
    return Response(
        content=tpl,
        media_type="text/html; charset=utf-8",
        headers={
            "Cache-Control": "public, max-age=3600",
            "ETag": f'"{etag}"',
            "Last-Modified": last_modified,
            "X-Doc-Version": etag,
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:;",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "no-referrer",
            "X-Frame-Options": "DENY"
        },
    )

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