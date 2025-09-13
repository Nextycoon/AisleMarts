from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal, Union
from enum import Enum

# Documentation Compliance Models - International trade document management

class DocumentType(str, Enum):
    COMMERCIAL_INVOICE = "CommercialInvoice"
    PACKING_LIST = "PackingList"
    CERTIFICATE_OF_ORIGIN = "CertificateOfOrigin"
    CUSTOMS_DECLARATION = "CustomsDeclaration"
    EXPORT_LICENSE = "ExportLicense"
    INSURANCE_CERTIFICATE = "InsuranceCertificate"
    BILL_OF_LADING = "BillOfLading"
    AIR_WAYBILL = "AirWaybill"
    COMPLIANCE_CERTIFICATES = "ComplianceCertificates"
    TAX_REGISTRATION = "TaxRegistration"
    BANK_LETTER = "BankLetter"
    BRAND_AUTHORIZATION = "BrandAuthorization"
    PROFORMA_INVOICE = "ProFormaInvoice"
    ORDER_CONFIRMATION = "OrderConfirmation"
    RETURN_AUTHORIZATION = "ReturnAuthorization"
    IMPORT_DECLARATION = "ImportDeclaration_Personal"
    WARRANTY_RECEIPT = "WarrantyReceipt"

class DocumentState(str, Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    AUTO_VALIDATED = "AutoValidated"
    NEEDS_REVISION = "NeedsRevision"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    SUPERSEDED = "Superseded"
    ARCHIVED = "Archived"

class AmendmentLevel(str, Enum):
    MINOR = "minor"      # typos, non-financial changes
    MATERIAL = "material"  # price/quantity/commercial changes
    REGULATED = "regulated"  # export license, dangerous goods, origin changes

class VersionBump(str, Enum):
    PATCH = "patch"    # 1.0.1
    MINOR = "minor"    # 1.1.0
    MAJOR = "major"    # 2.0.0

# Document base model
class TradeDocument(TypedDict):
    _id: str
    document_type: DocumentType
    document_number: str
    version: str  # Semantic versioning
    
    # Ownership and roles
    created_by: str  # user_id
    company_id: Optional[str]
    role: Literal["companies_brands", "visitors_buyers"]
    
    # Document state
    state: DocumentState
    workflow_history: List[Dict[str, Any]]
    
    # Content
    data: Dict[str, Any]  # Document-specific data
    attachments: List[str]  # File URLs/IDs
    
    # Validation
    validation_results: Dict[str, Any]
    compliance_checks: List[Dict[str, Any]]
    
    # Amendment tracking
    parent_document_id: Optional[str]
    amendment_level: Optional[AmendmentLevel]
    amendment_reason: Optional[str]
    superseded_by: Optional[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]
    approved_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    # Processing SLA
    auto_validation_deadline: Optional[datetime]
    manual_review_deadline: Optional[datetime]
    
    # Metadata
    tags: List[str]
    custom_fields: Dict[str, Any]

# Document workflow transitions
DOCUMENT_TRANSITIONS = {
    DocumentState.DRAFT: [DocumentState.SUBMITTED],
    DocumentState.SUBMITTED: [
        DocumentState.AUTO_VALIDATED, 
        DocumentState.NEEDS_REVISION, 
        DocumentState.REJECTED
    ],
    DocumentState.AUTO_VALIDATED: [
        DocumentState.APPROVED, 
        DocumentState.NEEDS_REVISION,
        DocumentState.REJECTED
    ],
    DocumentState.NEEDS_REVISION: [DocumentState.SUBMITTED],
    DocumentState.APPROVED: [DocumentState.SUPERSEDED, DocumentState.ARCHIVED],
    DocumentState.SUPERSEDED: [DocumentState.ARCHIVED],
    DocumentState.REJECTED: [DocumentState.ARCHIVED],
    DocumentState.ARCHIVED: []  # Terminal state
}

# SLA configurations by role
SLA_CONFIG = {
    "companies_brands": {
        "auto_validation_minutes": 5,
        "manual_review_hours": 24
    },
    "visitors_buyers": {
        "auto_validation_minutes": 2,
        "manual_review_hours": 8
    }
}

# Document type configurations
DOCUMENT_TYPE_CONFIG = {
    DocumentType.COMMERCIAL_INVOICE: {
        "roles": ["companies_brands"],
        "required_fields": [
            "invoice_number", "invoice_date", "seller_info", "buyer_info",
            "items", "currency", "total_amount", "incoterm", "payment_terms"
        ],
        "validation_checks": [
            "schema_fields", "numbers_formats", "currency_consistency", 
            "totals_math", "incoterms_consistency", "hs_preclassification"
        ],
        "amendment_window_hours": 72,
        "retention_years": 7
    },
    
    DocumentType.PACKING_LIST: {
        "roles": ["companies_brands"],
        "required_fields": [
            "packing_list_number", "date", "shipper_info", "consignee_info",
            "items", "packaging_details", "total_packages", "total_weight"
        ],
        "validation_checks": [
            "schema_fields", "packaging_consistency", "weight_calculations"
        ],
        "amendment_window_hours": 72,
        "retention_years": 7
    },
    
    DocumentType.CERTIFICATE_OF_ORIGIN: {
        "roles": ["companies_brands"],
        "required_fields": [
            "certificate_number", "issue_date", "exporter_info", "consignee_info",
            "goods_description", "origin_country", "hs_codes", "issuing_authority"
        ],
        "validation_checks": [
            "schema_fields", "authority_validation", "hs_codes_match", "origin_consistency"
        ],
        "amendment_window_hours": 48,
        "retention_years": 10
    },
    
    DocumentType.PROFORMA_INVOICE: {
        "roles": ["visitors_buyers"],
        "required_fields": [
            "proforma_number", "date", "seller_info", "buyer_info",
            "items", "currency", "total_amount", "validity_date"
        ],
        "validation_checks": [
            "schema_fields", "totals_math", "validity_check"
        ],
        "amendment_window_hours": 24,
        "retention_years": 2
    },
    
    DocumentType.ORDER_CONFIRMATION: {
        "roles": ["visitors_buyers"],
        "required_fields": [
            "order_number", "order_date", "customer_info", "items",
            "total_amount", "delivery_date", "payment_method"
        ],
        "validation_checks": [
            "schema_fields", "payment_match", "delivery_feasibility"
        ],
        "amendment_window_hours": 24,
        "retention_years": 3
    }
}

# Amendment configurations
AMENDMENT_CONFIG = {
    AmendmentLevel.MINOR: {
        "examples": ["typos", "non-financial address fix", "contact update"],
        "requirements": ["2fa", "reason_text"],
        "approval": "auto_on_low_risk",
        "version_bump": VersionBump.PATCH,
        "notification_level": "low"
    },
    
    AmendmentLevel.MATERIAL: {
        "examples": ["price/quantity change", "HS code change", "Incoterm change", "consignee change"],
        "requirements": ["2fa", "email_reconfirm", "phone_reconfirm", "gov_id_recheck", "selfie_liveness"],
        "approval": "manual_reviewer",
        "version_bump": VersionBump.MINOR,
        "notification_level": "high"
    },
    
    AmendmentLevel.REGULATED: {
        "examples": ["export_license data", "dangerous_goods", "origin rewrite"],
        "requirements": ["all_material_requirements", "supporting_docs"],
        "approval": "senior_compliance",
        "version_bump": VersionBump.MAJOR,
        "notification_level": "critical"
    }
}

# Validation checks by standard
VALIDATION_STANDARDS = {
    "international": [
        "ISO_9001", "ISO_27001", "WTO_TFA", "Incoterms_2020", "UN_EDIFACT"
    ],
    "regional": {
        "EU": ["EU_VAT", "GDPR", "CE_marking"],
        "US": ["CBP_requirements", "IRS_compliance", "FDA_regulations"],
        "UK": ["UK_VAT", "HMRC_requirements", "UKCA_marking"],
        "GCC": ["GCC_VAT", "SABER_platform", "Gulf_standards"],
        "APAC": ["ASEAN_ATIGA", "RCEP_rules", "APEC_guidelines"]
    }
}

# Sample document templates
SAMPLE_COMMERCIAL_INVOICE = {
    "invoice_number": "INV-2024-001",
    "invoice_date": "2024-09-14",
    "seller_info": {
        "name": "Turkish Organic Textiles Ltd",
        "address": "Merkez Mah. Tekstil Cad. No:45, 34100 Istanbul, Turkey",
        "tax_id": "1234567890",
        "phone": "+90 212 555 0123",
        "email": "exports@turkishtextiles.com"
    },
    "buyer_info": {
        "name": "European Imports GmbH",
        "address": "Hauptstraße 123, 10115 Berlin, Germany",
        "tax_id": "DE123456789",
        "phone": "+49 30 12345678",
        "email": "purchasing@euroimports.de"
    },
    "items": [
        {
            "description": "Organic Cotton T-Shirts - White",
            "hs_code": "6109.10",
            "quantity": 1000,
            "unit": "pieces",
            "unit_price": 4.20,
            "total_price": 4200.00,
            "origin": "Turkey"
        }
    ],
    "currency": "EUR",
    "subtotal": 4200.00,
    "total_amount": 4200.00,
    "incoterm": "FOB Istanbul",
    "payment_terms": "30 days from B/L date",
    "shipping_marks": "European Imports GmbH - Order #EI-2024-089"
}

SAMPLE_PACKING_LIST = {
    "packing_list_number": "PL-2024-001",
    "date": "2024-09-14",
    "shipper_info": {
        "name": "Turkish Organic Textiles Ltd",
        "address": "Merkez Mah. Tekstil Cad. No:45, 34100 Istanbul, Turkey"
    },
    "consignee_info": {
        "name": "European Imports GmbH", 
        "address": "Hauptstraße 123, 10115 Berlin, Germany"
    },
    "items": [
        {
            "description": "Organic Cotton T-Shirts - White",
            "quantity": 1000,
            "unit": "pieces",
            "cartons": 20,
            "net_weight_kg": 150.0,
            "gross_weight_kg": 170.0,
            "dimensions_cm": "60x40x30"
        }
    ],
    "total_packages": 20,
    "total_net_weight": 150.0,
    "total_gross_weight": 170.0,
    "container_info": {
        "type": "LCL",
        "estimated_cbm": 14.4
    }
}

def get_document_schema(document_type: DocumentType, role: str) -> Dict[str, Any]:
    """Get required schema for document type and role"""
    config = DOCUMENT_TYPE_CONFIG.get(document_type, {})
    
    if role not in config.get("roles", []):
        raise ValueError(f"Document type {document_type} not allowed for role {role}")
    
    return {
        "required_fields": config.get("required_fields", []),
        "validation_checks": config.get("validation_checks", []),
        "amendment_window_hours": config.get("amendment_window_hours", 24),
        "retention_years": config.get("retention_years", 3)
    }

def validate_document_transition(current_state: DocumentState, new_state: DocumentState) -> bool:
    """Validate if state transition is allowed"""
    allowed_transitions = DOCUMENT_TRANSITIONS.get(current_state, [])
    return new_state in allowed_transitions

def calculate_version_bump(current_version: str, amendment_level: AmendmentLevel) -> str:
    """Calculate new version number based on amendment level"""
    try:
        parts = current_version.split('.')
        major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])
        
        if amendment_level == AmendmentLevel.REGULATED:
            major += 1
            minor = 0
            patch = 0
        elif amendment_level == AmendmentLevel.MATERIAL:
            minor += 1
            patch = 0
        else:  # MINOR
            patch += 1
        
        return f"{major}.{minor}.{patch}"
    except (IndexError, ValueError):
        return "1.0.1"  # Default fallback

def get_amendment_requirements(amendment_level: AmendmentLevel) -> Dict[str, Any]:
    """Get requirements for amendment level"""
    return AMENDMENT_CONFIG.get(amendment_level, AMENDMENT_CONFIG[AmendmentLevel.MINOR])

def estimate_processing_time(document_type: DocumentType, role: str) -> Dict[str, int]:
    """Estimate processing time for document"""
    sla = SLA_CONFIG.get(role, SLA_CONFIG["visitors_buyers"])
    
    return {
        "auto_validation_minutes": sla["auto_validation_minutes"],
        "manual_review_hours": sla["manual_review_hours"]
    }