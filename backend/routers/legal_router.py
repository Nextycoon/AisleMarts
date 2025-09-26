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

@router.get("/privacy-policy")
def privacy_policy(if_none_match: str | None = Header(default=None)):
    """Serve AisleMarts Privacy Policy as formatted HTML"""
    html, etag, mtime = render("privacy-policy")
    
    # Handle conditional requests (304 Not Modified)
    if if_none_match and if_none_match.strip('"') == etag:
        return Response(status_code=304)
    
    return legal_response(html, etag, mtime, "Privacy Policy")

@router.get("/terms-of-service")
def terms_of_service(if_none_match: str | None = Header(default=None)):
    """Serve AisleMarts Terms of Service as formatted HTML"""
    html, etag, mtime = render("terms-of-service")
    
    # Handle conditional requests (304 Not Modified)
    if if_none_match and if_none_match.strip('"') == etag:
        return Response(status_code=304)
    
    return legal_response(html, etag, mtime, "Terms of Service")

@router.get("/privacy-policy/version")
def privacy_policy_version():
    """Get Privacy Policy version information"""
    try:
        _, etag, mtime = render("privacy-policy")
        return {
            "document": "privacy-policy",
            "version": etag,
            "last_modified": datetime.fromtimestamp(mtime).isoformat(),
            "url": "/api/legal/privacy-policy"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/terms-of-service/version")
def terms_of_service_version():
    """Get Terms of Service version information"""
    try:
        _, etag, mtime = render("terms-of-service")
        return {
            "document": "terms-of-service", 
            "version": etag,
            "last_modified": datetime.fromtimestamp(mtime).isoformat(),
            "url": "/api/legal/terms-of-service"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
def legal_health():
    """Health check for legal document service"""
    try:
        privacy_html, privacy_etag, privacy_mtime = render("privacy-policy")
        terms_html, terms_etag, terms_mtime = render("terms-of-service")
        
        return {
            "service": "legal-documents",
            "status": "operational",
            "documents": {
                "privacy_policy": {
                    "available": True,
                    "version": privacy_etag,
                    "size_kb": round(len(privacy_html) / 1024, 2),
                    "last_modified": datetime.fromtimestamp(privacy_mtime).isoformat()
                },
                "terms_of_service": {
                    "available": True,
                    "version": terms_etag,
                    "size_kb": round(len(terms_html) / 1024, 2),
                    "last_modified": datetime.fromtimestamp(terms_mtime).isoformat()
                }
            },
            "features": [
                "html_rendering",
                "etag_caching",
                "version_tracking",
                "app_store_headers",
                "mobile_responsive"
            ],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Legal service error: {str(e)}")