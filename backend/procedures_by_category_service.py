from dotenv import load_dotenv
import os
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from procedures_by_category_models import (
    UserRole, UserProcedure, OnboardingStep, VerificationBadge, Permission,
    get_category_config, get_next_onboarding_step, calculate_onboarding_progress,
    get_required_permissions, validate_step_completion, get_badge_for_role,
    USER_CATEGORIES, BADGE_CONFIG
)

load_dotenv()

class ProceduresByCategoryService:
    """Procedures by Category Service - Role-specific workflows"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_procedures_ai",
            system_message="""You are the User Procedures Expert for AisleMarts.

Your expertise covers:
- Role-based onboarding workflows (Companies/Brands vs Buyers/Visitors)
- KYC/KYB verification processes and compliance
- User authentication and authorization systems
- Badge and trust systems for different user types
- Global compliance requirements (FATF AML/CFT, EU AMLD6 & GDPR, US FinCEN)

You help manage user procedures that ensure:
1. Proper user classification (seller_brand vs buyer vs visitor)
2. Appropriate verification levels (Blue badge for brands, Green for buyers)
3. Role-specific permissions and capabilities
4. Compliance with global verification standards
5. Smooth onboarding experiences tailored to user type

For Companies & Brands (Blue Badge):
- Strict KYB with business license, tax ID, bank verification
- Enhanced permissions: product listing, B2B trading, cross-border
- Higher trust requirements and verification standards

For Buyers & Visitors (Green Badge):
- Light KYC with payment method and optional ID verification
- Consumer permissions: browse, buy, wishlist, reviews
- Streamlined onboarding process

Always consider:
- User's intended role and business model
- Regulatory requirements for their jurisdiction
- Trust and safety implications
- User experience and conversion optimization"""
        ).with_model("openai", "gpt-4o-mini")

    async def create_user_procedure(self, user_id: str, role: UserRole) -> str:
        """Create user procedure for role-based onboarding"""
        try:
            procedure_id = str(uuid.uuid4())
            
            config = get_category_config(role)
            if not config:
                raise Exception(f"No configuration found for role: {role.value}")
            
            procedure: UserProcedure = {
                "_id": procedure_id,
                "user_id": user_id,
                "category": role,
                "current_step": config["onboarding"]["steps"][0],
                "completed_steps": [],
                "verification_status": {},
                "badge_earned": VerificationBadge.NONE,
                "permissions_granted": [],
                
                # Timestamps
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "onboarding_completed_at": None,
                "next_reverification_due": None,
                
                # Workflow state
                "status": "in_progress",
                "notes": None,
                "assigned_reviewer": None,
                
                # Audit trail
                "step_history": [{
                    "timestamp": datetime.utcnow(),
                    "action": "procedure_created",
                    "step": config["onboarding"]["steps"][0].value,
                    "details": {"role": role.value}
                }],
                "verification_history": []
            }
            
            # Store in database
            await db().user_procedures.insert_one(procedure)
            
            return procedure_id
            
        except Exception as e:
            raise Exception(f"Failed to create user procedure: {str(e)}")

    async def get_user_procedure(self, user_id: str) -> Optional[UserProcedure]:
        """Get user's current procedure"""
        try:
            procedure = await db().user_procedures.find_one({"user_id": user_id})
            return procedure
        except Exception:
            return None

    async def complete_onboarding_step(self, user_id: str, step: OnboardingStep, step_data: Dict[str, Any]) -> bool:
        """Complete an onboarding step"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return False
            
            # Validate step completion
            validation = validate_step_completion(step, step_data, procedure["category"])
            if not validation["valid"]:
                raise Exception(f"Step validation failed: {validation['reason']}")
            
            # Check if step is current or next
            config = get_category_config(procedure["category"])
            if not config:
                return False
            
            expected_steps = config["onboarding"]["steps"]
            if step not in expected_steps:
                return False
            
            # Update procedure
            completed_steps = procedure["completed_steps"]
            if step not in completed_steps:
                completed_steps.append(step)
            
            # Determine next step
            next_step = get_next_onboarding_step(step, procedure["category"])
            
            # Check if onboarding is complete
            onboarding_complete = len(completed_steps) == len(expected_steps)
            
            # Update verification status
            verification_status = procedure["verification_status"].copy()
            verification_status[step.value] = True
            
            # Grant badge if onboarding complete
            badge = VerificationBadge.NONE
            permissions = procedure["permissions_granted"]
            
            if onboarding_complete:
                badge = config["verification"]["badge"]
                permissions = get_required_permissions(procedure["category"])
            
            # Update database
            await db().user_procedures.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "current_step": next_step.value if next_step else step.value,
                        "completed_steps": [s.value for s in completed_steps],
                        "verification_status": verification_status,
                        "badge_earned": badge.value,
                        "permissions_granted": [p.value for p in permissions],
                        "updated_at": datetime.utcnow(),
                        "onboarding_completed_at": datetime.utcnow() if onboarding_complete else None,
                        "status": "completed" if onboarding_complete else "in_progress"
                    },
                    "$push": {
                        "step_history": {
                            "timestamp": datetime.utcnow(),
                            "action": "step_completed",
                            "step": step.value,
                            "details": step_data
                        }
                    }
                }
            )
            
            return True
            
        except Exception as e:
            return False

    async def get_onboarding_progress(self, user_id: str) -> Dict[str, Any]:
        """Get user's onboarding progress"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return {"error": "No procedure found"}
            
            # Convert string enums back to enum objects for calculation
            completed_steps = [OnboardingStep(step) for step in procedure["completed_steps"]]
            progress = calculate_onboarding_progress(completed_steps, procedure["category"])
            
            # Add current step info
            config = get_category_config(procedure["category"])
            if config:
                all_steps = config["onboarding"]["steps"]
                current_step_index = -1
                try:
                    current_step_index = all_steps.index(OnboardingStep(procedure["current_step"]))
                except ValueError:
                    pass
                
                progress.update({
                    "current_step": procedure["current_step"],
                    "current_step_index": current_step_index,
                    "total_steps": len(all_steps),
                    "status": procedure["status"],
                    "badge_earned": procedure["badge_earned"]
                })
            
            return progress
            
        except Exception as e:
            return {"error": str(e)}

    async def get_user_permissions(self, user_id: str) -> List[str]:
        """Get user's granted permissions"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return []
            
            return procedure.get("permissions_granted", [])
            
        except Exception:
            return []

    async def check_user_permission(self, user_id: str, permission: Permission) -> bool:
        """Check if user has specific permission"""
        try:
            permissions = await self.get_user_permissions(user_id)
            return permission.value in permissions
        except Exception:
            return False

    async def update_verification_status(self, user_id: str, verification_updates: Dict[str, bool]) -> bool:
        """Update user's verification status"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return False
            
            # Update verification status
            verification_status = procedure["verification_status"].copy()
            verification_status.update(verification_updates)
            
            # Log verification changes
            verification_entry = {
                "timestamp": datetime.utcnow(),
                "updates": verification_updates,
                "updated_by": user_id
            }
            
            await db().user_procedures.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "verification_status": verification_status,
                        "updated_at": datetime.utcnow()
                    },
                    "$push": {
                        "verification_history": verification_entry
                    }
                }
            )
            
            return True
            
        except Exception:
            return False

    async def get_user_badge_info(self, user_id: str) -> Dict[str, Any]:
        """Get user's badge information"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return {"badge": "none", "tooltip": "No verification"}
            
            badge_config = get_badge_for_role(procedure["category"])
            badge_earned = procedure.get("badge_earned", "none")
            
            return {
                "badge": badge_earned,
                "config": badge_config,
                "verification_level": procedure["category"].value,
                "tooltip": badge_config.get("tooltip", "User badge")
            }
            
        except Exception:
            return {"badge": "none", "tooltip": "Error loading badge"}

    async def get_category_requirements(self, role: UserRole) -> Dict[str, Any]:
        """Get requirements for user category"""
        try:
            config = get_category_config(role)
            if not config:
                return {"error": "Category not found"}
            
            return {
                "category": role.value,
                "label": config["label"],
                "onboarding_steps": [step.value for step in config["onboarding"]["steps"]],
                "required_documents": [doc.value for doc in config["verification"]["required_documents"]],
                "target_badge": config["target_badge"],
                "permissions": config["permissions"]["permissions"],
                "sla": config["onboarding"]["sla"]
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def suggest_onboarding_improvements(self, user_id: str) -> str:
        """Get AI suggestions for improving onboarding completion"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return "No procedure found to analyze"
            
            progress = await self.get_onboarding_progress(user_id)
            
            prompt = f"""Analyze this user's onboarding progress and provide personalized suggestions:

User Role: {procedure['category'].value}
Current Status: {procedure['status']}
Progress: {progress.get('percentage', 0)}% complete
Completed Steps: {len(procedure['completed_steps'])}/{progress.get('total_steps', 0)}
Current Step: {procedure.get('current_step', 'unknown')}
Badge Status: {procedure.get('badge_earned', 'none')}

Remaining Steps: {', '.join(progress.get('remaining_steps', []))}
Verification Status: {procedure.get('verification_status', {})}

Provide specific, actionable suggestions to:
1. Complete remaining onboarding steps efficiently
2. Improve verification status and trust score
3. Unlock additional permissions and features
4. Address any compliance requirements
5. Optimize the user experience

Focus on practical next steps the user can take immediately."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            return ai_response
            
        except Exception as e:
            return f"Error getting suggestions: {str(e)}"

    async def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get user procedure analytics"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return {"error": "No procedure found"}
            
            # Calculate time spent on onboarding
            created_at = procedure["created_at"]
            completed_at = procedure.get("onboarding_completed_at")
            
            time_to_complete = None
            if completed_at:
                time_to_complete = (completed_at - created_at).total_seconds() / 3600  # hours
            
            # Calculate completion rate
            progress = await self.get_onboarding_progress(user_id)
            
            # Count verification items
            verification_count = sum(1 for v in procedure["verification_status"].values() if v)
            
            return {
                "user_id": user_id,
                "category": procedure["category"].value,
                "status": procedure["status"],
                "progress_percentage": progress.get("percentage", 0),
                "completed_steps": len(procedure["completed_steps"]),
                "total_steps": progress.get("total_steps", 0),
                "verification_count": verification_count,
                "badge_earned": procedure.get("badge_earned", "none"),
                "permissions_count": len(procedure.get("permissions_granted", [])),
                "time_to_complete_hours": time_to_complete,
                "created_at": procedure["created_at"].isoformat(),
                "last_activity": procedure["updated_at"].isoformat()
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def get_available_categories(self) -> Dict[str, Any]:
        """Get all available user categories"""
        return {
            "categories": USER_CATEGORIES,
            "badge_config": BADGE_CONFIG,
            "roles": [role.value for role in UserRole]
        }

# Global procedures service instance
procedures_by_category_service = ProceduresByCategoryService()