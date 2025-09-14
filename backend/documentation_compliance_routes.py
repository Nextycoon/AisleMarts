from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime

from security import decode_access_token
from db import db
from documentation_compliance_service import documentation_compliance_service
from documentation_compliance_models import DocumentType, DocumentStatus, AmendmentLevel

router = APIRouter(prefix="/api/documents", tags=["Documentation Compliance"])

# Pydantic models for API
class CreateDocumentRequest(BaseModel):
    document_type: DocumentType
    title: Optional[str] = None
    country: str = "US"
    currency: str = "USD"
    incoterm: Optional[str] = None
    parties: List[Dict[str, Any]] = []
    items: List[Dict[str, Any]] = []
    terms: Dict[str, Any] = {}
    totals: Dict[str, Any] = {}
    expires_at: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None
    ai_generated: bool = False

class AmendDocumentRequest(BaseModel):
    level: AmendmentLevel
    changes: Dict[str, Any]
    reason: str
    verification_completed: Dict[str, bool] = {}

class AIGenerateDocumentRequest(BaseModel):
    document_type: DocumentType
    context: Dict[str, Any]

async def get_current_user_required(authorization: str | None = Header(None)):
    """Extract user from auth token (required)"""
    if not authorization:
        raise HTTPException(401, "Authorization header required")
    
    try:
        token = authorization.split()[1]
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        
        user = await db().users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(401, "User not found")
        
        return user
    except Exception:
        raise HTTPException(401, "Invalid authorization")

@router.post("/create")
async def create_document(
    request: CreateDocumentRequest,
    user = Depends(get_current_user_required)
):
    """Create new trade document"""
    try:
        user_id = str(user["_id"])
        document_data = request.dict()
        
        document_id = await documentation_compliance_service.create_document(user_id, document_data)
        
        return {
            "success": True,
            "document_id": document_id,
            "message": "Document created successfully"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create document: {str(e)}")

@router.get("/list")
async def get_user_documents(
    document_type: Optional[DocumentType] = Query(None),
    status: Optional[DocumentStatus] = Query(None),
    limit: int = Query(50, le=100),
    user = Depends(get_current_user_required)
):
    """Get user's documents with optional filters"""
    try:
        user_id = str(user["_id"])
        
        filters = {}
        if document_type:
            filters["document_type"] = document_type.value
        if status:
            filters["status"] = status.value
        
        documents = await documentation_compliance_service.get_user_documents(user_id, filters)
        
        return {
            "documents": documents[:limit],
            "count": len(documents),
            "filters": filters
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error retrieving documents: {str(e)}")

@router.get("/{document_id}")
async def get_document(
    document_id: str,
    user = Depends(get_current_user_required)
):
    """Get document by ID"""
    try:
        user_id = str(user["_id"])
        document = await documentation_compliance_service.get_document(document_id, user_id)
        
        if not document:
            raise HTTPException(404, "Document not found")
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error retrieving document: {str(e)}")

@router.post("/{document_id}/submit")
async def submit_document(
    document_id: str,
    user = Depends(get_current_user_required)
):
    """Submit document for validation and approval"""
    try:
        user_id = str(user["_id"])
        success = await documentation_compliance_service.submit_document(document_id, user_id)
        
        if not success:
            raise HTTPException(400, "Failed to submit document")
        
        return {
            "success": True,
            "message": "Document submitted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error submitting document: {str(e)}")

@router.post("/{document_id}/amend")
async def amend_document(
    document_id: str,
    request: AmendDocumentRequest,
    user = Depends(get_current_user_required)
):
    """Create amendment for approved document"""
    try:
        user_id = str(user["_id"])
        amendment_data = request.dict()
        
        amendment_id = await documentation_compliance_service.create_amendment(
            document_id, user_id, amendment_data
        )
        
        return {
            "success": True,
            "amendment_id": amendment_id,
            "message": "Amendment created successfully"
        }
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create amendment: {str(e)}")

@router.post("/generate-ai")
async def generate_document_ai(
    request: AIGenerateDocumentRequest,
    user = Depends(get_current_user_required)
):
    """Generate document using AI"""
    try:
        user_id = str(user["_id"])
        
        result = await documentation_compliance_service.generate_document_ai(
            user_id, request.document_type, request.context
        )
        
        return {
            "success": True,
            "generated_content": result,
            "message": "Document generated using AI"
        }
        
    except Exception as e:
        raise HTTPException(500, f"AI document generation failed: {str(e)}")

@router.get("/templates/list")
async def get_document_templates():
    """Get available document templates"""
    try:
        templates = await documentation_compliance_service.get_document_templates()
        
        return {
            "templates": templates,
            "count": len(templates)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting templates: {str(e)}")

@router.get("/compliance/standards")
async def get_compliance_standards():
    """Get compliance standards and validation rules"""
    try:
        standards = await documentation_compliance_service.get_compliance_standards()
        
        return standards
        
    except Exception as e:
        raise HTTPException(500, f"Error getting compliance standards: {str(e)}")

@router.get("/types")
async def get_document_types():
    """Get available document types"""
    try:
        return {
            "document_types": [doc_type.value for doc_type in DocumentType],
            "statuses": [status.value for status in DocumentStatus],
            "amendment_levels": [level.value for level in AmendmentLevel]
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error getting document types: {str(e)}")

@router.get("/health")
async def documentation_service_health():
    """Health check for Documentation Compliance service"""
    try:
        return {
            "status": "healthy",
            "capabilities": [
                "document_creation",
                "compliance_validation", 
                "ai_document_generation",
                "amendment_processing",
                "international_standards",
                "country_regulations"
            ],
            "document_types": len([doc_type for doc_type in DocumentType]),
            "compliance_standards": ["ISO_9001", "ISO_27001", "WTO_TFA", "Incoterms_2020"],
            "supported_countries": ["US", "EU", "GB", "CN", "GCC"],
            "ai_model": "openai/gpt-4o-mini",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }