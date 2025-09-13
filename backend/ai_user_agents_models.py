from datetime import datetime
from typing import TypedDict, List, Dict, Any, Optional, Literal, Union
from enum import Enum

# AI User Agents Models - Personal AI assistants for buyers and sellers

class AgentRole(str, Enum):
    BUYER_AGENT = "buyer_agent"
    BRAND_AGENT = "brand_agent"

class DelegationMode(str, Enum):
    MANUAL = "manual"        # User asks; agent executes once
    SEMI_AUTO = "semi_auto"  # Agent proposes plan → user approves
    AUTO = "auto"           # Agent executes recurring/low-risk tasks

class TaskStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class AgentStyle(str, Enum):
    FORMAL = "formal"
    CONCISE = "concise"
    FRIENDLY = "friendly"
    DATA_DRIVEN = "data_driven"

class PriorityRule(str, Enum):
    SPEED = "speed"
    COST = "cost"
    SUSTAINABILITY = "sustainability"
    RELIABILITY = "reliability"

# User Agent Configuration
class AgentConfiguration(TypedDict):
    _id: str
    user_id: str
    agent_role: AgentRole
    
    # Customization settings
    tasks_enabled: List[str]
    priority_rules: List[PriorityRule]
    interest_tags: List[str]
    agent_style: AgentStyle
    
    # Policy settings
    default_mode: DelegationMode
    spend_limits: Dict[str, float]  # daily, monthly
    
    # Learning preferences
    learning_enabled: bool
    privacy_mode: bool
    
    created_at: datetime
    updated_at: datetime

# Task Definitions
class ShoppingTaskRequest(TypedDict):
    cart_id: str
    payment_pref: Literal["auto", "manual_select"]
    address_id: str
    max_budget: Optional[float]

class ShoppingTaskResponse(TypedDict):
    order_id: str
    status: Literal["placed", "pending", "failed"]
    receipt_url: Optional[str]

class LogisticsEstimateRequest(TypedDict):
    items: List[Dict[str, Any]]
    origin: Optional[str]
    destination: str
    incoterm: Optional[str]

class LogisticsEstimateResponse(TypedDict):
    options: List[Dict[str, Any]]
    recommended: Dict[str, Any]

class DocumentGenerationItem(TypedDict):
    sku: str
    desc: str
    hs: Optional[str]
    value: float
    qty: int
    origin: str

class DocumentGenerationRequest(TypedDict):
    flow: Literal["export", "import"]
    items: List[DocumentGenerationItem]
    incoterm: str
    destination: str

class DocumentGenerationResponse(TypedDict):
    files: List[str]  # File paths/URLs
    notes: List[str]

# Agent Task Contract
class AgentTask(TypedDict):
    _id: str
    user_id: str
    agent_id: str
    
    # Task details
    task_type: str
    task_name: str
    description: str
    input_data: Dict[str, Any]
    
    # Execution details
    status: TaskStatus
    delegation_mode: DelegationMode
    requires_approval: bool
    
    # Results
    output_data: Optional[Dict[str, Any]]
    execution_log: List[Dict[str, Any]]
    
    # Timestamps
    created_at: datetime
    approved_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    # Cost and performance
    estimated_cost: Optional[float]
    actual_cost: Optional[float]
    execution_time_seconds: Optional[int]

# Agent Learning Data
class AgentLearning(TypedDict):
    _id: str
    user_id: str
    agent_id: str
    
    # Learning data
    user_preferences: Dict[str, Any]
    behavior_patterns: Dict[str, Any]
    success_metrics: Dict[str, float]
    
    # Privacy controls
    learning_enabled: bool
    data_retention_days: int
    
    created_at: datetime
    updated_at: datetime
    last_learning_update: datetime

# Agent Capabilities by Role
BUYER_AGENT_CAPABILITIES = [
    "discover_products",
    "compare_prices_suppliers", 
    "negotiate_or_request_quotes",
    "estimate_shipping_taxes_duties",
    "select_payment_methods",
    "auto_apply_discounts_coupons",
    "place_orders_with_approval",
    "track_shipments_and_notify",
    "manage_returns_and_support"
]

BRAND_AGENT_CAPABILITIES = [
    "optimize_listings_and_attributes",
    "recommend_city_country_targets",
    "calculate_landed_costs", 
    "generate_trade_documents",
    "set_shipping_templates",
    "monitor_competitors_pricing",
    "respond_to_buyer_inquiries",
    "automate_promotions_and_bundles"
]

# Task Type Definitions
TASK_TYPES = {
    # Buyer Agent Tasks
    "shopping.discover_products": {
        "role": AgentRole.BUYER_AGENT,
        "description": "Find products matching user criteria",
        "input_schema": {
            "query": "string",
            "budget_max": "number?",
            "categories": "string[]?",
            "regions": "string[]?"
        },
        "requires_approval": False,
        "estimated_duration_minutes": 2
    },
    
    "shopping.place_order": {
        "role": AgentRole.BUYER_AGENT,
        "description": "Place order on behalf of user",
        "input_schema": {
            "cart_id": "string",
            "payment_pref": "auto|manual_select",
            "address_id": "string",
            "max_budget": "number?"
        },
        "requires_approval": True,
        "estimated_duration_minutes": 5
    },
    
    "logistics.estimate": {
        "role": AgentRole.BUYER_AGENT,
        "description": "Get shipping estimates and recommendations",
        "input_schema": {
            "items": "array",
            "origin": "string?", 
            "destination": "string",
            "incoterm": "string?"
        },
        "requires_approval": False,
        "estimated_duration_minutes": 3
    },
    
    "payments.select_methods": {
        "role": AgentRole.BUYER_AGENT,
        "description": "Suggest optimal payment methods",
        "input_schema": {
            "country": "string",
            "currency": "string", 
            "total": "number"
        },
        "requires_approval": False,
        "estimated_duration_minutes": 1
    },
    
    # Brand Agent Tasks  
    "listings.optimize": {
        "role": AgentRole.BRAND_AGENT,
        "description": "Optimize product listings for better visibility",
        "input_schema": {
            "products": "string[]",
            "target_markets": "string[]?"
        },
        "requires_approval": False,
        "estimated_duration_minutes": 10
    },
    
    "targeting.recommend_cities": {
        "role": AgentRole.BRAND_AGENT,
        "description": "Recommend cities for product targeting",
        "input_schema": {
            "product_category": "string",
            "price_band": "string",
            "budget": "number?"
        },
        "requires_approval": False,
        "estimated_duration_minutes": 5
    },
    
    "docs.generate_pack": {
        "role": AgentRole.BRAND_AGENT,
        "description": "Generate trade documents",
        "input_schema": {
            "flow": "export|import",
            "items": "array",
            "incoterm": "string",
            "destination": "string"
        },
        "requires_approval": True,
        "estimated_duration_minutes": 8
    },
    
    "pricing.monitor_competitors": {
        "role": AgentRole.BRAND_AGENT,
        "description": "Monitor competitor pricing and suggest adjustments",
        "input_schema": {
            "products": "string[]",
            "competitors": "string[]?",
            "markets": "string[]?"
        },
        "requires_approval": False,
        "estimated_duration_minutes": 15
    }
}

# Default agent configurations
DEFAULT_BUYER_AGENT_CONFIG = {
    "tasks_enabled": [
        "shopping.discover_products",
        "logistics.estimate", 
        "payments.select_methods"
    ],
    "priority_rules": [PriorityRule.COST, PriorityRule.RELIABILITY],
    "interest_tags": ["electronics", "home", "fashion"],
    "agent_style": AgentStyle.FRIENDLY,
    "default_mode": DelegationMode.SEMI_AUTO,
    "spend_limits": {
        "daily": 0.0,   # Disabled by default
        "monthly": 0.0  # Disabled by default
    },
    "learning_enabled": True,
    "privacy_mode": False
}

DEFAULT_BRAND_AGENT_CONFIG = {
    "tasks_enabled": [
        "listings.optimize",
        "targeting.recommend_cities",
        "pricing.monitor_competitors"
    ],
    "priority_rules": [PriorityRule.RELIABILITY, PriorityRule.COST],
    "interest_tags": ["b2b", "wholesale", "export"],
    "agent_style": AgentStyle.DATA_DRIVEN, 
    "default_mode": DelegationMode.SEMI_AUTO,
    "spend_limits": {
        "daily": 0.0,   # Disabled by default
        "monthly": 0.0  # Disabled by default
    },
    "learning_enabled": True,
    "privacy_mode": False
}

# Sample agent tasks for demonstration
SAMPLE_AGENT_TASKS = [
    {
        "task_type": "shopping.discover_products",
        "task_name": "Find Organic Cotton T-Shirts",
        "description": "Looking for wholesale organic cotton t-shirts under $5 per unit from verified suppliers",
        "input_data": {
            "query": "organic cotton t-shirts wholesale",
            "budget_max": 5.0,
            "categories": ["textiles", "fashion"],
            "regions": ["EU", "TR", "BD"]
        },
        "status": TaskStatus.COMPLETED,
        "delegation_mode": DelegationMode.SEMI_AUTO,
        "requires_approval": False,
        "output_data": {
            "products_found": 12,
            "best_match": {
                "title": "Organic Cotton Basic T-Shirts - White",
                "price": 4.20,
                "supplier": "Turkish Organic Textiles Ltd",
                "moq": 500,
                "location": "Istanbul, TR"
            },
            "alternatives": 3
        },
        "estimated_cost": 0.0,
        "actual_cost": 0.0,
        "execution_time_seconds": 45
    },
    {
        "task_type": "targeting.recommend_cities", 
        "task_name": "Find Best Cities for Hazelnut Export",
        "description": "Identify top 20 cities worldwide for premium Turkish hazelnut sales",
        "input_data": {
            "product_category": "food",
            "price_band": "premium",
            "budget": 10000.0
        },
        "status": TaskStatus.COMPLETED,
        "delegation_mode": DelegationMode.AUTO,
        "requires_approval": False,
        "output_data": {
            "recommended_cities": [
                {"city": "Berlin", "country": "DE", "score": 95, "estimated_demand": "high"},
                {"city": "London", "country": "GB", "score": 92, "estimated_demand": "high"}, 
                {"city": "Paris", "country": "FR", "score": 89, "estimated_demand": "medium-high"}
            ],
            "market_insights": "European markets show strong demand for premium Turkish hazelnuts, especially in Q4"
        },
        "estimated_cost": 0.0,
        "actual_cost": 0.0,
        "execution_time_seconds": 120
    }
]

def create_agent_configuration(user_id: str, role: AgentRole) -> AgentConfiguration:
    """Create default agent configuration for user"""
    if role == AgentRole.BUYER_AGENT:
        config = DEFAULT_BUYER_AGENT_CONFIG.copy()
    else:
        config = DEFAULT_BRAND_AGENT_CONFIG.copy()
    
    return {
        "_id": f"agent_{user_id}_{role.value}",
        "user_id": user_id,
        "agent_role": role,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        **config
    }

def get_capabilities_for_role(role: AgentRole) -> List[str]:
    """Get list of capabilities for agent role"""
    if role == AgentRole.BUYER_AGENT:
        return BUYER_AGENT_CAPABILITIES
    elif role == AgentRole.BRAND_AGENT:
        return BRAND_AGENT_CAPABILITIES
    else:
        return []

def requires_approval(task_type: str, amount: float = 0.0, user_limits: Dict[str, float] = {}) -> bool:
    """Determine if task requires user approval"""
    task_config = TASK_TYPES.get(task_type, {})
    
    # Check if task type inherently requires approval
    if task_config.get("requires_approval", False):
        return True
    
    # Check spend limits
    daily_limit = user_limits.get("daily", 0.0)
    monthly_limit = user_limits.get("monthly", 0.0)
    
    if daily_limit > 0 and amount > daily_limit:
        return True
    if monthly_limit > 0 and amount > monthly_limit:
        return True
    
    # High-risk tasks always require approval
    high_risk_tasks = ["shopping.place_order", "docs.generate_pack"]
    if task_type in high_risk_tasks:
        return True
    
    return False

def estimate_task_duration(task_type: str) -> int:
    """Estimate task duration in minutes"""
    task_config = TASK_TYPES.get(task_type, {})
    return task_config.get("estimated_duration_minutes", 5)

# Agent Capabilities and Templates
AGENT_CAPABILITIES = {
    "buyer_agent": [
        "shopping_automation",
        "price_comparison", 
        "product_research",
        "order_tracking",
        "return_processing",
        "wishlist_management"
    ],
    "brand_agent": [
        "inventory_management",
        "logistics_coordination",
        "document_generation",
        "compliance_screening",
        "market_research",
        "customer_communication",
        "analytics_reporting"
    ]
}

TASK_TEMPLATES = {
    "shopping_basic": {
        "template_id": "shopping_basic",
        "name": "Basic Shopping Task",
        "description": "Automated shopping with basic configuration",
        "task_type": "shopping.place_order",
        "default_parameters": {
            "payment_pref": "auto",
            "max_budget": 500.0
        },
        "required_fields": ["cart_id", "address_id"],
        "estimated_duration": 10
    },
    "logistics_estimate": {
        "template_id": "logistics_estimate",
        "name": "Logistics Estimation",
        "description": "Get shipping estimates and logistics options",
        "task_type": "logistics.estimate",
        "default_parameters": {
            "incoterm": "DDP",
            "service_level": "balanced"
        },
        "required_fields": ["items", "destination"],
        "estimated_duration": 5
    },
    "document_export": {
        "template_id": "document_export",
        "name": "Export Documents Generation",
        "description": "Generate export documentation package",
        "task_type": "docs.generate_pack",
        "default_parameters": {
            "flow": "export",
            "incoterm": "FOB"
        },
        "required_fields": ["items", "destination"],
        "estimated_duration": 15
    },
    "research_market": {
        "template_id": "research_market",
        "name": "Market Research",
        "description": "Research market conditions and opportunities",
        "task_type": "research.market",
        "default_parameters": {
            "scope": "competitive_analysis",
            "depth": "standard"
        },
        "required_fields": ["query", "target_market"],
        "estimated_duration": 20
    }
}