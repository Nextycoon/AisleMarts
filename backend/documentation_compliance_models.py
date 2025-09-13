from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal, Union
from enum import Enum

# Documentation Compliance Models - International trade document management

class DocumentType(str, Enum):
    COMMERCIAL_INVOICE = "commercial_invoice"
    PACKING_LIST = "packing_list"
    CERTIFICATE_OF_ORIGIN = "certificate_of_origin"
    CUSTOMS_DECLARATION = "customs_declaration"
    EXPORT_LICENSE = "export_license"
    INSURANCE_CERTIFICATE = "insurance_certificate"
    BILL_OF_LADING = "bill_of_lading"
    AIR_WAYBILL = "air_waybill"
    COMPLIANCE_CERTIFICATE = "compliance_certificate"
    TAX_REGISTRATION = "tax_registration"
    BANK_LETTER = "bank_letter"
    BRAND_AUTHORIZATION = "brand_authorization"
    PROFORMA_INVOICE = "proforma_invoice"
    ORDER_CONFIRMATION = "order_confirmation"
    RETURN_AUTHORIZATION = "return_authorization"
    WARRANTY_RECEIPT = "warranty_receipt"

class DocumentStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    AUTO_VALIDATED = "auto_validated"
    NEEDS_REVISION = "needs_revision"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUPERSEDED = "superseded"
    ARCHIVED = "archived"

class ComplianceStandard(str, Enum):
    INCOTERMS_2020 = "incoterms_2020"
    UN_EDIFACT = "un_edifact"
    WTO_TFA = "wto_tfa"
    ISO_9001 = "iso_9001"
    ISO_27001 = "iso_27001"
    EU_VAT = "eu_vat"
    UK_VAT = "uk_vat"
    US_CBP_IRS = "us_cbp_irs"
    GCC_VAT = "gcc_vat"
    CN_GACC = "cn_gacc"

class AmendmentLevel(str, Enum):
    MINOR = "minor"  # typos, non-financial address fix, contact update
    MATERIAL = "material"  # price/quantity change, HS code change, Incoterm change
    REGULATED = "regulated"  # export license data, dangerous goods, origin rewrite

class DocumentItem(TypedDict):
    sku: str
    description: str
    hs_code: Optional[str]
    value: float
    quantity: int
    unit_of_measure: str
    origin_country: str
    weight_kg: Optional[float]
    dimensions: Optional[Dict[str, float]]

class DocumentParty(TypedDict):
    name: str
    address: Dict[str, str]
    country: str
    tax_id: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    role: str  # seller, buyer, consignee, shipper, etc.

class ComplianceCheck(TypedDict):
    check_type: str
    status: Literal["pass", "fail", "warning"]
    message: str
    details: Optional[Dict[str, Any]]

class DocumentTemplate(TypedDict):
    template_id: str
    document_type: DocumentType
    country: str
    language: str
    required_fields: List[str]
    optional_fields: List[str]
    validation_rules: Dict[str, Any]
    compliance_standards: List[ComplianceStandard]

class DocumentAmendment(TypedDict):
    amendment_id: str
    original_document_id: str
    amendment_level: AmendmentLevel
    changes: Dict[str, Any]
    reason: str
    requested_by: str
    requested_at: datetime
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    verification_completed: Dict[str, bool]
    version_bump: Literal["patch", "minor", "major"]

class TradeDocument(TypedDict):
    _id: str
    document_type: DocumentType
    title: str
    user_id: str
    company_id: Optional[str]
    
    # Document Status
    status: DocumentStatus
    version: str
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]
    approved_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    # Document Content
    parties: List[DocumentParty]
    items: List[DocumentItem]
    terms: Dict[str, Any]
    totals: Dict[str, float]
    currency: str
    incoterm: Optional[str]
    
    # Compliance & Validation
    compliance_standards: List[ComplianceStandard]
    compliance_checks: List[ComplianceCheck]
    template_used: Optional[str]
    country_regulations: List[str]
    
    # Files & Generation
    generated_files: List[Dict[str, str]]  # {"format": "pdf", "url": "...", "language": "en"}
    source_data: Dict[str, Any]
    ai_generated: bool
    
    # Amendment History
    amendments: List[DocumentAmendment]
    superseded_by: Optional[str]
    supersedes: Optional[str]
    
    # Metadata
    tags: List[str]
    notes: Optional[str]
    audit_log: List[Dict[str, Any]]

# Document templates for different countries and standards
DOCUMENT_TEMPLATES = {
    "commercial_invoice_eu": {
        "template_id": "commercial_invoice_eu",
        "document_type": DocumentType.COMMERCIAL_INVOICE,
        "country": "EU",
        "language": "en",
        "required_fields": [
            "seller_name", "seller_address", "seller_vat_number",
            "buyer_name", "buyer_address", "buyer_vat_number",
            "invoice_number", "invoice_date", "items", "totals",
            "currency", "incoterm", "country_of_origin"
        ],
        "optional_fields": [
            "buyer_reference", "contract_number", "transport_details",
            "payment_terms", "bank_details"
        ],
        "validation_rules": {
            "vat_number_format": "EU_VAT_FORMAT",
            "currency_code": "ISO_4217",
            "totals_calculation": "MUST_MATCH_ITEMS",
            "hs_codes": "REQUIRED_FOR_NON_EU"
        },
        "compliance_standards": [
            ComplianceStandard.EU_VAT,
            ComplianceStandard.ISO_9001,
            ComplianceStandard.INCOTERMS_2020
        ]
    },
    "commercial_invoice_us": {
        "template_id": "commercial_invoice_us",
        "document_type": DocumentType.COMMERCIAL_INVOICE,
        "country": "US",
        "language": "en",
        "required_fields": [
            "seller_name", "seller_address", "seller_ein",
            "buyer_name", "buyer_address", "consignee_name",
            "invoice_number", "invoice_date", "items", "totals",
            "currency", "country_of_origin", "hs_codes"
        ],
        "optional_fields": [
            "purchase_order_number", "terms_of_sale", "freight_costs",
            "insurance_costs", "packing_costs"
        ],
        "validation_rules": {
            "ein_format": "US_EIN_FORMAT",
            "currency_code": "ISO_4217",
            "hs_codes": "REQUIRED_6_DIGIT_MINIMUM",
            "country_of_origin": "ISO_3166"
        },
        "compliance_standards": [
            ComplianceStandard.US_CBP_IRS,
            ComplianceStandard.INCOTERMS_2020
        ]
    },
    "certificate_of_origin_general": {
        "template_id": "certificate_of_origin_general",
        "document_type": DocumentType.CERTIFICATE_OF_ORIGIN,
        "country": "GLOBAL",
        "language": "en",
        "required_fields": [
            "exporter_name", "exporter_address", "consignee_name",
            "consignee_address", "country_of_origin", "destination_country",
            "description_of_goods", "hs_codes", "origin_criteria"
        ],
        "optional_fields": [
            "invoice_number", "invoice_date", "transport_details",
            "chamber_of_commerce_stamp"
        ],
        "validation_rules": {
            "origin_criteria": "MUST_SPECIFY_MANUFACTURING_OR_PROCESSING",
            "hs_codes": "REQUIRED_6_DIGIT_MINIMUM",
            "countries": "ISO_3166"
        },
        "compliance_standards": [
            ComplianceStandard.WTO_TFA,
            ComplianceStandard.ISO_9001
        ]
    }
}

# Compliance validation rules
VALIDATION_RULES = {
    "schema_fields": {
        "description": "Check all required fields are present and properly formatted",
        "severity": "error"
    },
    "numbers_formats": {
        "description": "Validate number formats, currencies, and calculations",
        "severity": "error"
    },
    "currency_consistency": {
        "description": "Ensure currency is consistent throughout document",
        "severity": "error"
    },
    "fx_rate_ref": {
        "description": "Validate foreign exchange rates against reference rates",
        "severity": "warning"
    },
    "hs_preclassification": {
        "description": "AI-powered HS code validation and suggestions",
        "severity": "warning"
    },
    "incoterms_consistency": {
        "description": "Validate Incoterms usage and implications",
        "severity": "warning"
    },
    "totals_math": {
        "description": "Verify mathematical calculations and totals",
        "severity": "error"
    },
    "signatures_presence": {
        "description": "Check for required signatures and stamps",
        "severity": "warning"
    },
    "sanctions_screening": {
        "description": "Screen parties against sanctions lists",
        "severity": "error"
    }
}

# Country-specific regulations
COUNTRY_REGULATIONS = {
    "US": [
        "CBP customs regulations",
        "IRS tax requirements",
        "Export Administration Regulations (EAR)",
        "International Traffic in Arms Regulations (ITAR)"
    ],
    "EU": [
        "EU VAT Directive",
        "GDPR data protection",
        "CE marking requirements",
        "REACH chemical regulations"
    ],
    "GB": [
        "UK VAT requirements",
        "HMRC customs procedures",
        "UKCA marking",
        "Post-Brexit trade rules"
    ],
    "CN": [
        "GACC customs requirements",
        "CCC certification",
        "Import/export licensing",
        "VAT and consumption tax"
    ],
    "GCC": [
        "GCC unified VAT",
        "Halal certification requirements",
        "ESMA conformity",
        "WTO trade facilitation"
    ]
}

def get_document_template(document_type: DocumentType, country: str) -> Optional[DocumentTemplate]:
    """Get document template for specific type and country"""
    template_key = f"{document_type.value}_{country.lower()}"
    if template_key in DOCUMENT_TEMPLATES:
        return DOCUMENT_TEMPLATES[template_key]
    
    # Fallback to general template
    general_key = f"{document_type.value}_general"
    return DOCUMENT_TEMPLATES.get(general_key)

def get_required_standards(country: str) -> List[ComplianceStandard]:
    """Get required compliance standards for a country"""
    country_standards = {
        "US": [ComplianceStandard.US_CBP_IRS, ComplianceStandard.INCOTERMS_2020],
        "EU": [ComplianceStandard.EU_VAT, ComplianceStandard.ISO_9001],
        "GB": [ComplianceStandard.UK_VAT, ComplianceStandard.INCOTERMS_2020],
        "CN": [ComplianceStandard.CN_GACC, ComplianceStandard.WTO_TFA],
        "GCC": [ComplianceStandard.GCC_VAT, ComplianceStandard.WTO_TFA]
    }
    
    return country_standards.get(country, [ComplianceStandard.WTO_TFA, ComplianceStandard.INCOTERMS_2020])

def calculate_amendment_requirements(amendment_level: AmendmentLevel) -> Dict[str, Any]:
    """Calculate verification requirements for amendment level"""
    requirements = {
        AmendmentLevel.MINOR: {
            "verification_required": ["2fa", "reason_text"],
            "approval": "auto_on_low_risk",
            "version_bump": "patch"
        },
        AmendmentLevel.MATERIAL: {
            "verification_required": ["2fa", "email_reconfirm", "phone_reconfirm", "gov_id_recheck", "selfie_liveness"],
            "approval": "manual_reviewer",
            "version_bump": "minor"
        },
        AmendmentLevel.REGULATED: {
            "verification_required": ["all_material_requirements", "supporting_docs"],
            "approval": "senior_compliance",
            "version_bump": "major"
        }
    }
    
    return requirements.get(amendment_level, requirements[AmendmentLevel.MINOR])

def generate_document_version(current_version: str, version_bump: str) -> str:
    """Generate new document version using semver-like scheme"""
    try:
        parts = current_version.split('.')
        major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])
        
        if version_bump == "major":
            major += 1
            minor = 0
            patch = 0
        elif version_bump == "minor":
            minor += 1
            patch = 0
        else:  # patch
            patch += 1
            
        return f"{major}.{minor}.{patch}"
    except:
        return "1.0.1"  # Default fallback

def validate_document_transitions(current_status: DocumentStatus, new_status: DocumentStatus) -> bool:
    """Validate if status transition is allowed"""
    allowed_transitions = {
        DocumentStatus.DRAFT: [DocumentStatus.SUBMITTED],
        DocumentStatus.SUBMITTED: [DocumentStatus.AUTO_VALIDATED, DocumentStatus.NEEDS_REVISION, DocumentStatus.REJECTED],
        DocumentStatus.AUTO_VALIDATED: [DocumentStatus.APPROVED, DocumentStatus.NEEDS_REVISION],
        DocumentStatus.NEEDS_REVISION: [DocumentStatus.SUBMITTED],
        DocumentStatus.APPROVED: [DocumentStatus.SUPERSEDED, DocumentStatus.ARCHIVED],
        DocumentStatus.SUPERSEDED: [DocumentStatus.ARCHIVED],
        DocumentStatus.REJECTED: [DocumentStatus.ARCHIVED],
        DocumentStatus.ARCHIVED: []  # Terminal state
    }
    
    return new_status in allowed_transitions.get(current_status, [])

# AI document generation prompts
DOCUMENT_GENERATION_PROMPTS = {
    "commercial_invoice": """Generate a professional commercial invoice based on the provided data.
    Include all required fields for international trade compliance.
    Format numbers according to the specified locale and currency.
    Apply the appropriate Incoterms and ensure mathematical accuracy.
    Include necessary disclaimers and compliance statements.""",
    
    "certificate_of_origin": """Generate a certificate of origin document that meets international standards.
    Clearly state the country of origin and manufacturing details.
    Include appropriate classification codes and origin criteria.
    Ensure compliance with destination country requirements.""",
    
    "packing_list": """Create a detailed packing list that matches the commercial invoice.
    Include accurate weights, dimensions, and packaging details.
    Organize items logically and include handling instructions.
    Add safety and transport information as needed."""
}

def get_ai_generation_prompt(document_type: DocumentType, context: Dict[str, Any]) -> str:
    """Get AI prompt for document generation"""
    base_prompt = DOCUMENT_GENERATION_PROMPTS.get(document_type.value, "Generate a professional trade document.")
    
    context_info = f"""
    Document Type: {document_type.value}
    Country: {context.get('country', 'Unknown')}
    Currency: {context.get('currency', 'USD')}
    Incoterm: {context.get('incoterm', 'DDP')}
    Language: {context.get('language', 'en')}
    
    Additional Requirements:
    - Follow {context.get('country', 'international')} regulations
    - Use {context.get('currency', 'USD')} currency formatting
    - Apply {context.get('incoterm', 'DDP')} terms appropriately
    - Generate in {context.get('language', 'English')} language
    """
    
    return f"{base_prompt}\n\n{context_info}"