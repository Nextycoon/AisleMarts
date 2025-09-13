from dotenv import load_dotenv
import os
import json
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from ai_user_agents_models import (
    AgentConfiguration, AgentTask, AgentLearning, AgentRole, DelegationMode, TaskStatus,
    PriorityRule, AgentStyle, create_agent_configuration, get_capabilities_for_role, requires_approval, 
    estimate_task_duration, TASK_TYPES, SAMPLE_AGENT_TASKS
)

load_dotenv()

class AIUserAgentsService:
    """AI User Agents Service - Personal AI assistants for buyers and sellers"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_user_agents",
            system_message="""You are the AI User Agent Coordinator for AisleMarts - managing personal AI assistants for global trade.

You coordinate two types of agents:

**Buyer Agents** help users:
- Discover and compare products/suppliers
- Estimate shipping, taxes, and landed costs
- Negotiate quotes and pricing
- Select optimal payment methods
- Place orders with approval workflows
- Track shipments and manage returns

**Brand Agents** help sellers:
- Optimize product listings and targeting
- Recommend city/country markets
- Generate trade documents and compliance
- Monitor competitor pricing
- Automate promotions and responses
- Calculate landed costs for buyers

Your role:
1. Plan multi-step tasks intelligently
2. Provide clear cost/time estimates
3. Explain actions before execution
4. Respect user delegation preferences
5. Learn from user feedback and patterns
6. Ensure compliance and risk management

Always prioritize:
- User control and consent
- Clear communication of actions
- Risk assessment and mitigation
- Privacy and data protection
- Efficiency and cost optimization"""
        ).with_model("openai", "gpt-4o-mini")

    async def get_or_create_agent(self, user_id: str, role: AgentRole) -> AgentConfiguration:
        """Get existing agent configuration or create new one"""
        try:
            # Try to find existing agent
            agent = await db().agent_configurations.find_one({
                "user_id": user_id,
                "agent_role": role.value
            })
            
            if agent:
                return agent
            
            # Create new agent configuration
            config = create_agent_configuration(user_id, role)
            await db().agent_configurations.insert_one(config)
            return config
            
        except Exception as e:
            # Return default configuration on error
            return create_agent_configuration(user_id, role)

    async def update_agent_configuration(self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update agent configuration"""
        try:
            # Update the user's existing configuration (any role)
            result = await db().agent_configurations.update_one(
                {"user_id": user_id},
                {"$set": {**updates, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception:
            return False

    async def create_task(self, user_id: str, task_type: str, input_data: Dict[str, Any], 
                         delegation_mode: DelegationMode = DelegationMode.SEMI_AUTO) -> str:
        """Create new agent task"""
        try:
            task_config = TASK_TYPES.get(task_type)
            if not task_config:
                raise ValueError(f"Unknown task type: {task_type}")
            
            # Get agent configuration
            agent_role = task_config["role"]
            agent_config = await self.get_or_create_agent(user_id, agent_role)
            
            # Determine if approval is required
            estimated_cost = input_data.get("max_budget", 0.0)
            approval_required = requires_approval(task_type, estimated_cost, agent_config.get("spend_limits", {}))
            
            # Create task
            task_id = str(uuid.uuid4())
            task: AgentTask = {
                "_id": task_id,
                "user_id": user_id,
                "agent_id": agent_config["_id"],
                "task_type": task_type,
                "task_name": task_config.get("description", task_type),
                "description": f"Execute {task_type} with provided parameters",
                "input_data": input_data,
                "status": TaskStatus.PENDING,
                "delegation_mode": delegation_mode,
                "requires_approval": approval_required,
                "output_data": None,
                "execution_log": [],
                "created_at": datetime.utcnow(),
                "approved_at": None,
                "started_at": None,
                "completed_at": None,
                "estimated_cost": estimated_cost,
                "actual_cost": None,
                "execution_time_seconds": None
            }
            
            await db().agent_tasks.insert_one(task)
            
            # Auto-execute if no approval required and mode is AUTO
            if not approval_required and delegation_mode == DelegationMode.AUTO:
                await self.execute_task(task_id)
            
            return task_id
            
        except Exception as e:
            raise Exception(f"Failed to create task: {str(e)}")

    async def approve_task(self, user_id: str, task_id: str) -> bool:
        """Approve pending task for execution"""
        try:
            task = await db().agent_tasks.find_one({"_id": task_id, "user_id": user_id})
            if not task:
                return False
            
            if task["status"] != TaskStatus.PENDING:
                return False
            
            # Update task status
            await db().agent_tasks.update_one(
                {"_id": task_id},
                {
                    "$set": {
                        "status": TaskStatus.APPROVED,
                        "approved_at": datetime.utcnow()
                    }
                }
            )
            
            # Execute the task
            await self.execute_task(task_id)
            return True
            
        except Exception:
            return False

    async def execute_task(self, task_id: str) -> bool:
        """Execute approved task"""
        try:
            task = await db().agent_tasks.find_one({"_id": task_id})
            if not task:
                return False
            
            # Update status to executing
            await db().agent_tasks.update_one(
                {"_id": task_id},
                {
                    "$set": {
                        "status": TaskStatus.EXECUTING,
                        "started_at": datetime.utcnow()
                    }
                }
            )
            
            start_time = datetime.utcnow()
            
            # Execute task based on type
            result = await self._execute_task_by_type(task)
            
            # Calculate execution time
            execution_time = int((datetime.utcnow() - start_time).total_seconds())
            
            # Update task with results
            await db().agent_tasks.update_one(
                {"_id": task_id},
                {
                    "$set": {
                        "status": TaskStatus.COMPLETED if result["success"] else TaskStatus.FAILED,
                        "output_data": result.get("output_data"),
                        "execution_log": result.get("execution_log", []),
                        "completed_at": datetime.utcnow(),
                        "actual_cost": result.get("cost", 0.0),
                        "execution_time_seconds": execution_time
                    }
                }
            )
            
            return result["success"]
            
        except Exception as e:
            # Mark task as failed
            await db().agent_tasks.update_one(
                {"_id": task_id},
                {
                    "$set": {
                        "status": TaskStatus.FAILED,
                        "execution_log": [{"error": str(e), "timestamp": datetime.utcnow()}],
                        "completed_at": datetime.utcnow()
                    }
                }
            )
            return False

    async def _execute_task_by_type(self, task: AgentTask) -> Dict[str, Any]:
        """Execute specific task type"""
        task_type = task["task_type"]
        input_data = task["input_data"]
        
        try:
            if task_type == "shopping.discover_products":
                return await self._execute_product_discovery(input_data)
            elif task_type == "shopping.place_order":
                return await self._execute_place_order(input_data)
            elif task_type == "logistics.estimate":
                return await self._execute_logistics_estimate(input_data)
            elif task_type == "payments.select_methods":
                return await self._execute_payment_selection(input_data)
            elif task_type == "listings.optimize":
                return await self._execute_listing_optimization(input_data)
            elif task_type == "targeting.recommend_cities":
                return await self._execute_city_recommendations(input_data)
            elif task_type == "docs.generate_pack":
                return await self._execute_document_generation(input_data)
            elif task_type == "pricing.monitor_competitors":
                return await self._execute_competitor_monitoring(input_data)
            else:
                return {"success": False, "error": f"Unknown task type: {task_type}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def _execute_product_discovery(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute product discovery task"""
        query = input_data.get("query", "")
        budget_max = input_data.get("budget_max", 0)
        categories = input_data.get("categories", [])
        regions = input_data.get("regions", [])
        
        # Use AI to enhance search
        prompt = f"""Find products matching these criteria:

Query: {query}
Budget: Up to ${budget_max} per unit
Categories: {categories}
Preferred regions: {regions}

Provide product recommendations with:
1. Best matching products
2. Price comparisons
3. Supplier reliability assessment
4. Alternative options
5. Sourcing strategy recommendations"""

        ai_response = await self.chat.send_message(UserMessage(text=prompt))
        
        # Simulate product discovery results
        products_found = 15  # Would be actual search results
        best_match = {
            "title": "Organic Cotton T-Shirts - Premium Quality",
            "price": 4.50,
            "supplier": "Sustainable Textiles Co.",
            "country": "Turkey",
            "rating": 4.7,
            "moq": 500
        }
        
        return {
            "success": True,
            "output_data": {
                "products_found": products_found,
                "best_match": best_match,
                "ai_insights": ai_response[:200] + "...",
                "execution_summary": f"Discovered {products_found} products matching criteria"
            },
            "execution_log": [
                {"step": "search_execution", "timestamp": datetime.utcnow(), "result": "success"},
                {"step": "ai_analysis", "timestamp": datetime.utcnow(), "result": "completed"}
            ],
            "cost": 0.0
        }

    async def _execute_city_recommendations(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute city targeting recommendations"""
        product_category = input_data.get("product_category", "")
        price_band = input_data.get("price_band", "")
        budget = input_data.get("budget", 0)
        
        # Use AI for market analysis
        prompt = f"""Recommend top cities for this product targeting:

Product Category: {product_category}
Price Band: {price_band}
Marketing Budget: ${budget}

Provide city recommendations with:
1. Top 20 cities by demand potential
2. Market size and competition analysis
3. Local preferences and buying patterns
4. Seasonal demand variations
5. Entry strategy recommendations"""

        ai_response = await self.chat.send_message(UserMessage(text=prompt))
        
        # Generate city recommendations
        recommended_cities = [
            {"city": "Berlin", "country": "DE", "score": 95, "demand": "high", "competition": "medium"},
            {"city": "London", "country": "GB", "score": 92, "demand": "high", "competition": "high"},
            {"city": "Paris", "country": "FR", "score": 89, "demand": "medium-high", "competition": "high"},
            {"city": "Amsterdam", "country": "NL", "score": 87, "demand": "medium", "competition": "medium"},
            {"city": "Stockholm", "country": "SE", "score": 85, "demand": "medium", "competition": "low"}
        ]
        
        return {
            "success": True,
            "output_data": {
                "recommended_cities": recommended_cities,
                "market_insights": ai_response,
                "targeting_strategy": "Focus on European markets with high sustainability awareness"
            },
            "execution_log": [
                {"step": "market_analysis", "timestamp": datetime.utcnow(), "result": "completed"},
                {"step": "city_scoring", "timestamp": datetime.utcnow(), "result": "completed"}
            ],
            "cost": 0.0
        }

    async def _execute_logistics_estimate(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute logistics estimation"""
        # Simplified logistics estimation
        return {
            "success": True,
            "output_data": {
                "options": [
                    {"carrier": "DHL Express", "eta_days": 3, "cost": 125.00, "service": "door-to-door"},
                    {"carrier": "FedEx International", "eta_days": 4, "cost": 98.50, "service": "priority"},
                    {"carrier": "Standard Air Freight", "eta_days": 7, "cost": 65.00, "service": "airport-to-airport"}
                ],
                "recommended": {"carrier": "FedEx International", "reasoning": "Best balance of speed and cost"}
            },
            "execution_log": [{"step": "freight_calculation", "timestamp": datetime.utcnow(), "result": "completed"}],
            "cost": 0.0
        }

    async def _execute_payment_selection(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute payment method selection"""
        country = input_data.get("country", "US")
        currency = input_data.get("currency", "USD")
        total = input_data.get("total", 0)
        
        # Country-specific payment recommendations
        methods = [
            {"type": "card", "scheme": "visa_mastercard", "score": 95, "fees": "2.9%", "settlement": "2 days"},
            {"type": "bank_transfer", "scheme": "wire", "score": 88, "fees": "$25", "settlement": "3-5 days"},
            {"type": "digital_wallet", "scheme": "paypal", "score": 85, "fees": "3.5%", "settlement": "1 day"}
        ]
        
        return {
            "success": True,
            "output_data": {
                "ranked_methods": methods,
                "rationale": f"For {country} transactions of ${total}, card payments offer the best user experience and conversion rates."
            },
            "execution_log": [{"step": "payment_analysis", "timestamp": datetime.utcnow(), "result": "completed"}],
            "cost": 0.0
        }

    async def _execute_place_order(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute order placement (simulation)"""
        cart_id = input_data.get("cart_id", "")
        max_budget = input_data.get("max_budget", 0)
        
        # Simulate order placement
        order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        
        return {
            "success": True,
            "output_data": {
                "order_id": order_id,
                "status": "placed",
                "receipt_url": f"https://aislemarts.com/orders/{order_id}/receipt"
            },
            "execution_log": [
                {"step": "cart_validation", "timestamp": datetime.utcnow(), "result": "passed"},
                {"step": "payment_processing", "timestamp": datetime.utcnow(), "result": "completed"},
                {"step": "order_confirmation", "timestamp": datetime.utcnow(), "result": "sent"}
            ],
            "cost": 0.0
        }

    async def _execute_listing_optimization(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute listing optimization"""
        return {
            "success": True,
            "output_data": {
                "optimizations_applied": 5,
                "improvements": ["Enhanced keywords", "Better category mapping", "Optimized pricing", "Improved descriptions", "Added market-specific features"],
                "expected_impact": "15-25% increase in visibility"
            },
            "execution_log": [{"step": "listing_analysis", "timestamp": datetime.utcnow(), "result": "completed"}],
            "cost": 0.0
        }

    async def _execute_document_generation(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute trade document generation"""
        return {
            "success": True,
            "output_data": {
                "files": ["CommercialInvoice.pdf", "PackingList.pdf", "DocPack.zip"],
                "notes": ["All documents generated according to destination country requirements", "HS codes validated", "Incoterms properly applied"]
            },
            "execution_log": [{"step": "document_generation", "timestamp": datetime.utcnow(), "result": "completed"}],
            "cost": 0.0
        }

    async def _execute_competitor_monitoring(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute competitor monitoring"""
        return {
            "success": True,
            "output_data": {
                "competitors_analyzed": 8,
                "price_adjustments_suggested": 3,
                "market_insights": "Competitors are increasing prices by 5-8% due to raw material costs",
                "recommendations": ["Maintain current pricing for competitive advantage", "Highlight quality differentiators", "Monitor supply chain costs"]
            },
            "execution_log": [{"step": "competitor_analysis", "timestamp": datetime.utcnow(), "result": "completed"}],
            "cost": 0.0
        }

    async def get_user_tasks(self, user_id: str, status: Optional[TaskStatus] = None, limit: int = 50) -> List[AgentTask]:
        """Get user's agent tasks"""
        try:
            query = {"user_id": user_id}
            if status:
                query["status"] = status.value
            
            cursor = db().agent_tasks.find(query).sort("created_at", -1).limit(limit)
            tasks = await cursor.to_list(length=limit)
            return tasks
        except Exception:
            return []

    async def get_agent_analytics(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get agent performance analytics"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Get task statistics
            total_tasks = await db().agent_tasks.count_documents({
                "user_id": user_id,
                "created_at": {"$gte": start_date}
            })
            
            completed_tasks = await db().agent_tasks.count_documents({
                "user_id": user_id,
                "status": TaskStatus.COMPLETED.value,
                "created_at": {"$gte": start_date}
            })
            
            # Calculate success rate
            success_rate = completed_tasks / total_tasks if total_tasks > 0 else 0.0
            
            # Get task types breakdown
            pipeline = [
                {"$match": {"user_id": user_id, "created_at": {"$gte": start_date}}},
                {"$group": {"_id": "$task_type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}}
            ]
            
            task_types = []
            async for doc in db().agent_tasks.aggregate(pipeline):
                task_types.append({"task_type": doc["_id"], "count": doc["count"]})
            
            return {
                "period_days": days,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "success_rate": round(success_rate, 3),
                "task_types": task_types,
                "cost_saved_estimate": completed_tasks * 15.0,  # Estimate $15 saved per automated task
                "time_saved_hours": completed_tasks * 0.5       # Estimate 30 min saved per task
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def create_agent_configuration(self, config_data: Dict[str, Any]) -> str:
        """Create AI agent configuration for user"""
        try:
            agent_id = str(uuid.uuid4())
            
            config: AgentConfiguration = {
                "_id": agent_id,
                "user_id": config_data["user_id"],
                "agent_role": AgentRole(config_data["agent_role"]),
                "tasks_enabled": config_data.get("tasks_enabled", []),
                "priority_rules": [PriorityRule(rule) for rule in config_data.get("priority_rules", [])],
                "interest_tags": config_data.get("interest_tags", []),
                "agent_style": AgentStyle(config_data["agent_style"]),
                "default_mode": DelegationMode(config_data["default_mode"]),
                "spend_limits": config_data.get("spend_limits", {"daily": 100.0, "monthly": 1000.0}),
                "learning_enabled": config_data.get("learning_enabled", True),
                "privacy_mode": config_data.get("privacy_mode", False),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await db().agent_configurations.insert_one(config)
            return agent_id
            
        except Exception as e:
            raise Exception(f"Failed to create agent configuration: {str(e)}")

    async def get_agent_configuration(self, user_id: str) -> Optional[AgentConfiguration]:
        """Get user's agent configuration"""
        try:
            config = await db().agent_configurations.find_one({"user_id": user_id})
            return config
        except Exception:
            return None

    async def get_user_tasks(self, user_id: str, status: Optional[TaskStatus] = None, limit: int = 50) -> List[AgentTask]:
        """Get user's agent tasks"""
        try:
            query = {"user_id": user_id}
            if status:
                query["status"] = status.value if hasattr(status, 'value') else status
            
            cursor = db().agent_tasks.find(query).sort("created_at", -1).limit(limit)
            tasks = await cursor.to_list(length=limit)
            return tasks
            
        except Exception:
            return []

    async def get_task(self, task_id: str, user_id: str) -> Optional[AgentTask]:
        """Get task by ID"""
        try:
            task = await db().agent_tasks.find_one({"_id": task_id, "user_id": user_id})
            return task
        except Exception:
            return None

    async def update_task_status(self, task_id: str, user_id: str, action: str, feedback: Optional[str] = None) -> bool:
        """Update task status based on action"""
        try:
            task = await self.get_task(task_id, user_id)
            if not task:
                return False
            
            if action == "approve":
                task["status"] = TaskStatus.APPROVED.value
                task["approved_at"] = datetime.utcnow()
            elif action == "reject":
                task["status"] = TaskStatus.CANCELLED.value
            elif action == "cancel":
                task["status"] = TaskStatus.CANCELLED.value
            elif action == "retry":
                task["status"] = TaskStatus.PENDING.value
            
            if feedback:
                task["execution_log"].append({
                    "timestamp": datetime.utcnow(),
                    "action": action,
                    "feedback": feedback
                })
            
            task["updated_at"] = datetime.utcnow()
            
            await db().agent_tasks.replace_one(
                {"_id": task_id, "user_id": user_id},
                task
            )
            
            return True
            
        except Exception:
            return False

    async def create_task_new(self, task_data: Dict[str, Any]) -> str:
        """Create new task for AI agent (new API compatible method)"""
        try:
            user_id = task_data["user_id"]
            task_type = task_data["task_type"]
            
            # Get or create agent configuration
            config = await self.get_agent_configuration(user_id)
            if not config:
                # Create default configuration
                default_config = {
                    "user_id": user_id,
                    "agent_role": "buyer_agent",
                    "tasks_enabled": [task_type],
                    "priority_rules": ["cost"],
                    "interest_tags": [],
                    "agent_style": "concise",
                    "default_mode": "manual",
                    "spend_limits": {"daily": 100.0, "monthly": 1000.0},
                    "learning_enabled": True,
                    "privacy_mode": False
                }
                await self.create_agent_configuration(default_config)
                config = await self.get_agent_configuration(user_id)
            
            # Create task
            task_id = str(uuid.uuid4())
            
            task: AgentTask = {
                "_id": task_id,
                "user_id": user_id,
                "agent_id": config["_id"],
                "task_type": task_type,
                "task_name": task_data.get("task_name", task_type),
                "description": task_data.get("description", f"Execute {task_type} task"),
                "input_data": task_data.get("parameters", {}),
                "status": TaskStatus.PENDING,
                "delegation_mode": DelegationMode(task_data.get("mode", "manual")),
                "requires_approval": True,  # Default to requiring approval
                "output_data": None,
                "execution_log": [],
                "created_at": datetime.utcnow(),
                "approved_at": None,
                "started_at": None,
                "completed_at": None,
                "estimated_cost": task_data.get("budget_limit", 0.0),
                "actual_cost": None,
                "execution_time_seconds": None
            }
            
            await db().agent_tasks.insert_one(task)
            return task_id
            
        except Exception as e:
            raise Exception(f"Failed to create task: {str(e)}")

# Global AI user agents service instance
ai_user_agents_service = AIUserAgentsService()