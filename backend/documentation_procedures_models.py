from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal, Union
from enum import Enum

# Documentation Procedures Models - Document states, amendments, approval workflows

class WorkflowState(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUESTED = "revision_requested"
    SUPERSEDED = "superseded"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"

class ApprovalLevel(str, Enum):
    AUTO = "auto"  # Automated approval for low-risk
    PEER = "peer"  # Peer review
    SUPERVISOR = "supervisor"  # Supervisor approval
    MANAGER = "manager"  # Manager approval
    COMPLIANCE = "compliance"  # Compliance team approval
    SENIOR_COMPLIANCE = "senior_compliance"  # Senior compliance approval
    LEGAL = "legal"  # Legal team approval

class ReviewerRole(str, Enum):
    COMPLIANCE_OFFICER = "compliance_officer"
    SENIOR_COMPLIANCE = "senior_compliance"
    LEGAL_COUNSEL = "legal_counsel"
    OPERATIONS_MANAGER = "operations_manager"
    TRADE_SPECIALIST = "trade_specialist"
    CUSTOMS_EXPERT = "customs_expert"
    TAX_ADVISOR = "tax_advisor"

class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"
    WEBHOOK = "webhook"
    PUSH = "push"

class EscalationTrigger(str, Enum):
    TIME_EXCEEDED = "time_exceeded"  # SLA time exceeded
    COMPLEXITY_HIGH = "complexity_high"  # Document complexity high
    VALUE_THRESHOLD = "value_threshold"  # Value exceeds threshold
    RISK_HIGH = "risk_high"  # High risk assessment
    REGULATORY_FLAG = "regulatory_flag"  # Regulatory compliance flag
    MANUAL_REQUEST = "manual_request"  # Manual escalation request
    REVIEWER_UNAVAILABLE = "reviewer_unavailable"  # Assigned reviewer unavailable

class WorkflowAction(str, Enum):
    SUBMIT = "submit"
    APPROVE = "approve"
    REJECT = "reject"
    REQUEST_REVISION = "request_revision"
    ESCALATE = "escalate"
    ASSIGN_REVIEWER = "assign_reviewer"
    ADD_COMMENT = "add_comment"
    SUPERSEDE = "supersede"
    ARCHIVE = "archive"
    RESTORE = "restore"

class PriorityLevel(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"

class WorkflowComment(TypedDict):
    comment_id: str
    user_id: str
    user_name: str
    user_role: str
    comment: str
    timestamp: datetime
    is_internal: bool  # Internal comment not visible to document creator
    attachments: List[Dict[str, str]]  # {"filename": "...", "url": "..."}

class WorkflowApproval(TypedDict):
    approval_id: str
    approver_id: str
    approver_name: str
    approver_role: ReviewerRole
    approval_level: ApprovalLevel
    decision: Literal["approved", "rejected", "revision_requested"]
    timestamp: datetime
    comments: str
    conditions: Optional[List[str]]  # Conditional approval requirements
    signature_hash: Optional[str]  # Digital signature

class WorkflowEscalation(TypedDict):
    escalation_id: str
    trigger: EscalationTrigger
    from_level: ApprovalLevel
    to_level: ApprovalLevel
    escalated_by: str  # user_id or "system"
    escalated_at: datetime
    reason: str
    resolved_at: Optional[datetime]
    resolution: Optional[str]

class NotificationRule(TypedDict):
    rule_id: str
    event_type: str  # document_submitted, approval_required, etc.
    recipients: List[str]  # user_ids or email addresses
    notification_types: List[NotificationType]
    delay_minutes: int  # Delay before sending notification
    conditions: Dict[str, Any]  # Conditions for triggering notification

class SLAConfig(TypedDict):
    level: ApprovalLevel
    response_time_hours: int  # Time to acknowledge
    completion_time_hours: int  # Time to complete review
    escalation_time_hours: int  # Time before escalation
    business_hours_only: bool
    excluded_days: List[str]  # weekends, holidays

class DocumentProcedure(TypedDict):
    _id: str
    document_id: str
    document_type: str
    document_title: str
    
    # Workflow State
    current_state: WorkflowState
    approval_level_required: ApprovalLevel
    priority: PriorityLevel
    
    # Ownership & Assignment
    created_by: str
    current_assignee: Optional[str]
    reviewer_pool: List[str]  # Available reviewers
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]
    assigned_at: Optional[datetime]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    
    # SLA Tracking
    sla_config: SLAConfig
    sla_met: Optional[bool]
    response_time_minutes: Optional[int]
    completion_time_minutes: Optional[int]
    
    # Workflow History
    state_history: List[Dict[str, Any]]
    approvals: List[WorkflowApproval]
    comments: List[WorkflowComment]
    escalations: List[WorkflowEscalation]
    
    # Notifications
    notification_rules: List[NotificationRule]
    notifications_sent: List[Dict[str, Any]]
    
    # Risk & Compliance
    risk_score: float  # 0.0 to 1.0
    compliance_flags: List[str]
    regulatory_requirements: List[str]
    
    # Metadata
    tags: List[str]
    custom_fields: Dict[str, Any]
    external_references: List[Dict[str, str]]  # {"system": "SAP", "id": "12345"}
    
    # Audit Trail
    audit_log: List[Dict[str, Any]]

# Workflow configuration templates
WORKFLOW_TEMPLATES = {
    "standard_document": {
        "name": "Standard Document Review",
        "description": "Standard workflow for most trade documents",
        "states": [
            WorkflowState.DRAFT,
            WorkflowState.PENDING_REVIEW,
            WorkflowState.IN_REVIEW,
            WorkflowState.APPROVED
        ],
        "approval_levels": {
            "low_risk": ApprovalLevel.AUTO,
            "medium_risk": ApprovalLevel.PEER,
            "high_risk": ApprovalLevel.SUPERVISOR
        },
        "sla_configs": {
            ApprovalLevel.AUTO: {
                "response_time_hours": 0,
                "completion_time_hours": 1,
                "escalation_time_hours": 2
            },
            ApprovalLevel.PEER: {
                "response_time_hours": 4,
                "completion_time_hours": 24,
                "escalation_time_hours": 48
            },
            ApprovalLevel.SUPERVISOR: {
                "response_time_hours": 8,
                "completion_time_hours": 48,
                "escalation_time_hours": 72
            }
        }
    },
    "high_value_document": {
        "name": "High Value Document Review",
        "description": "Enhanced workflow for high-value transactions",
        "states": [
            WorkflowState.DRAFT,
            WorkflowState.PENDING_REVIEW,
            WorkflowState.IN_REVIEW,
            WorkflowState.APPROVED
        ],
        "approval_levels": {
            "any_risk": ApprovalLevel.MANAGER
        },
        "mandatory_reviews": [ReviewerRole.COMPLIANCE_OFFICER, ReviewerRole.TRADE_SPECIALIST],
        "sla_configs": {
            ApprovalLevel.MANAGER: {
                "response_time_hours": 8,
                "completion_time_hours": 72,
                "escalation_time_hours": 96
            }
        }
    },
    "regulatory_document": {
        "name": "Regulatory Compliance Review",
        "description": "Specialized workflow for regulatory-sensitive documents",
        "states": [
            WorkflowState.DRAFT,
            WorkflowState.PENDING_REVIEW,
            WorkflowState.IN_REVIEW,
            WorkflowState.APPROVED
        ],
        "approval_levels": {
            "any_risk": ApprovalLevel.SENIOR_COMPLIANCE
        },
        "mandatory_reviews": [ReviewerRole.SENIOR_COMPLIANCE, ReviewerRole.LEGAL_COUNSEL],
        "sla_configs": {
            ApprovalLevel.SENIOR_COMPLIANCE: {
                "response_time_hours": 12,
                "completion_time_hours": 120,  # 5 days
                "escalation_time_hours": 144   # 6 days
            }
        }
    }
}

# Risk assessment rules
RISK_ASSESSMENT_RULES = {
    "document_value": {
        "low": {"max": 10000},
        "medium": {"min": 10000, "max": 100000},
        "high": {"min": 100000}
    },
    "country_risk": {
        "low": ["US", "CA", "AU", "NZ", "SG", "JP", "KR"],
        "medium": ["EU", "GB", "MX", "BR", "IN", "TH", "MY"],
        "high": ["CN", "RU", "TR", "EG", "ZA", "NG"],
        "restricted": ["IR", "KP", "SY", "CU", "BY"]
    },
    "product_categories": {
        "controlled": ["chemicals", "pharmaceuticals", "technology", "defense"],
        "regulated": ["food", "cosmetics", "electronics", "textiles"],
        "standard": ["consumer_goods", "home_garden", "sports"]
    }
}

# Notification templates
NOTIFICATION_TEMPLATES = {
    "document_submitted": {
        "subject": "Document Review Required: {document_title}",
        "body": """A new document has been submitted for review:

Document: {document_title}
Type: {document_type}
Priority: {priority}
Due Date: {due_date}
Submitter: {created_by}

Please review and approve at your earliest convenience.

Link: {review_link}"""
    },
    "approval_required": {
        "subject": "Approval Required: {document_title}",
        "body": """Your approval is required for the following document:

Document: {document_title}
Type: {document_type}
Priority: {priority}
Due Date: {due_date}

Please review and provide your decision.

Link: {review_link}"""
    },
    "sla_warning": {
        "subject": "SLA Warning: {document_title}",
        "body": """ATTENTION: Document review is approaching SLA deadline:

Document: {document_title}
Due Date: {due_date}
Time Remaining: {time_remaining}

Please prioritize this review to avoid escalation.

Link: {review_link}"""
    },
    "escalation_notice": {
        "subject": "Escalation: {document_title}",
        "body": """A document has been escalated for your review:

Document: {document_title}
Escalation Reason: {escalation_reason}
Original Assignee: {original_assignee}
New Priority: {priority}

Please review immediately.

Link: {review_link}"""
    }
}

def get_workflow_template(template_name: str) -> Optional[Dict[str, Any]]:
    """Get workflow template by name"""
    return WORKFLOW_TEMPLATES.get(template_name)

def determine_approval_level(document_data: Dict[str, Any]) -> ApprovalLevel:
    """Determine required approval level based on document data"""
    # Calculate risk score
    risk_score = calculate_risk_score(document_data)
    
    # Determine approval level based on risk
    if risk_score >= 0.8:
        return ApprovalLevel.SENIOR_COMPLIANCE
    elif risk_score >= 0.6:
        return ApprovalLevel.MANAGER
    elif risk_score >= 0.4:
        return ApprovalLevel.SUPERVISOR
    elif risk_score >= 0.2:
        return ApprovalLevel.PEER
    else:
        return ApprovalLevel.AUTO

def calculate_risk_score(document_data: Dict[str, Any]) -> float:
    """Calculate document risk score (0.0 to 1.0)"""
    score = 0.0
    
    # Value-based risk
    total_value = document_data.get("total_value", 0)
    if total_value >= 100000:
        score += 0.3
    elif total_value >= 10000:
        score += 0.1
    
    # Country-based risk
    countries = document_data.get("countries", [])
    for country in countries:
        if country in RISK_ASSESSMENT_RULES["country_risk"]["restricted"]:
            score += 0.5
        elif country in RISK_ASSESSMENT_RULES["country_risk"]["high"]:
            score += 0.3
        elif country in RISK_ASSESSMENT_RULES["country_risk"]["medium"]:
            score += 0.1
    
    # Product category risk
    product_categories = document_data.get("product_categories", [])
    for category in product_categories:
        if category in RISK_ASSESSMENT_RULES["product_categories"]["controlled"]:
            score += 0.4
        elif category in RISK_ASSESSMENT_RULES["product_categories"]["regulated"]:
            score += 0.2
    
    # Additional risk factors
    if document_data.get("has_licensing_requirements"):
        score += 0.2
    
    if document_data.get("involves_restricted_parties"):
        score += 0.3
    
    if document_data.get("complex_tax_structure"):
        score += 0.1
    
    return min(score, 1.0)  # Cap at 1.0

def get_sla_config(approval_level: ApprovalLevel, template_name: str = "standard_document") -> SLAConfig:
    """Get SLA configuration for approval level"""
    template = get_workflow_template(template_name)
    if not template:
        # Default SLA config
        return {
            "level": approval_level,
            "response_time_hours": 8,
            "completion_time_hours": 48,
            "escalation_time_hours": 72,
            "business_hours_only": True,
            "excluded_days": ["Saturday", "Sunday"]
        }
    
    sla_configs = template.get("sla_configs", {})
    default_config = sla_configs.get(approval_level, {})
    
    return {
        "level": approval_level,
        "response_time_hours": default_config.get("response_time_hours", 8),
        "completion_time_hours": default_config.get("completion_time_hours", 48),
        "escalation_time_hours": default_config.get("escalation_time_hours", 72),
        "business_hours_only": default_config.get("business_hours_only", True),
        "excluded_days": default_config.get("excluded_days", ["Saturday", "Sunday"])
    }

def validate_state_transition(current_state: WorkflowState, new_state: WorkflowState) -> bool:
    """Validate if workflow state transition is allowed"""
    allowed_transitions = {
        WorkflowState.DRAFT: [WorkflowState.PENDING_REVIEW, WorkflowState.ARCHIVED],
        WorkflowState.PENDING_REVIEW: [WorkflowState.IN_REVIEW, WorkflowState.DRAFT],
        WorkflowState.IN_REVIEW: [
            WorkflowState.APPROVED, 
            WorkflowState.REJECTED, 
            WorkflowState.REVISION_REQUESTED,
            WorkflowState.SUSPENDED
        ],
        WorkflowState.REVISION_REQUESTED: [WorkflowState.DRAFT, WorkflowState.PENDING_REVIEW],
        WorkflowState.APPROVED: [WorkflowState.SUPERSEDED, WorkflowState.ARCHIVED],
        WorkflowState.REJECTED: [WorkflowState.ARCHIVED, WorkflowState.DRAFT],
        WorkflowState.SUPERSEDED: [WorkflowState.ARCHIVED],
        WorkflowState.SUSPENDED: [WorkflowState.IN_REVIEW, WorkflowState.ARCHIVED],
        WorkflowState.ARCHIVED: []  # Terminal state
    }
    
    return new_state in allowed_transitions.get(current_state, [])

def get_next_reviewer_role(approval_level: ApprovalLevel) -> ReviewerRole:
    """Get appropriate reviewer role for approval level"""
    role_mapping = {
        ApprovalLevel.AUTO: ReviewerRole.COMPLIANCE_OFFICER,  # For oversight
        ApprovalLevel.PEER: ReviewerRole.TRADE_SPECIALIST,
        ApprovalLevel.SUPERVISOR: ReviewerRole.OPERATIONS_MANAGER,
        ApprovalLevel.MANAGER: ReviewerRole.OPERATIONS_MANAGER,
        ApprovalLevel.COMPLIANCE: ReviewerRole.COMPLIANCE_OFFICER,
        ApprovalLevel.SENIOR_COMPLIANCE: ReviewerRole.SENIOR_COMPLIANCE,
        ApprovalLevel.LEGAL: ReviewerRole.LEGAL_COUNSEL
    }
    
    return role_mapping.get(approval_level, ReviewerRole.COMPLIANCE_OFFICER)

def should_escalate(procedure: DocumentProcedure) -> Optional[EscalationTrigger]:
    """Determine if procedure should be escalated"""
    now = datetime.utcnow()
    
    # Check time-based escalation
    if procedure["due_date"] and now > procedure["due_date"]:
        return EscalationTrigger.TIME_EXCEEDED
    
    # Check risk-based escalation
    if procedure["risk_score"] >= 0.8:
        return EscalationTrigger.RISK_HIGH
    
    # Check regulatory flags
    if procedure["compliance_flags"]:
        return EscalationTrigger.REGULATORY_FLAG
    
    return None

def generate_notification_content(template_name: str, context: Dict[str, Any]) -> Dict[str, str]:
    """Generate notification content from template"""
    template = NOTIFICATION_TEMPLATES.get(template_name)
    if not template:
        return {"subject": "Document Notification", "body": "A document requires your attention."}
    
    subject = template["subject"].format(**context)
    body = template["body"].format(**context)
    
    return {"subject": subject, "body": body}