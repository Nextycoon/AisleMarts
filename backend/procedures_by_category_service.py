from dotenv import load_dotenv
import os
import uuid
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from procedures_by_category_models import (
    UserProcedure, UserRole, OnboardingStep, VerificationBadge, Permission,
    get_category_config, get_next_onboarding_step, calculate_onboarding_progress,
    get_required_permissions, validate_step_completion, get_badge_for_role,
    should_show_public_notice, USER_CATEGORIES, BADGE_CONFIG, STEP_REQUIREMENTS
)

load_dotenv()

class ProceduresByCategoryService:
    """Procedures by Category Service - Role-specific workflows for companies/brands vs. buyers/visitors"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_procedures_ai",
            system_message="""You are the Procedures by Category Expert for AisleMarts.

Your expertise covers:
- Role-specific onboarding workflows (Companies/Brands vs. Visitors/Buyers)
- User verification and trust badge systems (Blue badges for verified brands, Green badges for verified buyers)
- Authentication and authorization procedures
- KYC/KYB compliance requirements
- Permission and access control management
- Onboarding step validation and progress tracking

You help users navigate through:
1. Account creation and email/phone verification
2. Two-factor authentication setup
3. Business profile setup (for brands) or personal profile (for buyers)
4. Document submission and verification processes
5. Payment method and bank account verification
6. Badge earning and permission granting

User Categories:
- Companies & Brands: Blue verified badge, comprehensive KYB process, seller permissions
- Visitors & Buyers: Green verified badge, simplified verification, buyer permissions

Always provide clear guidance on:
- Required vs. optional steps for each user category
- Next steps in onboarding process  
- Verification requirements and timelines
- Permission implications and access levels
- Badge requirements and display rules
- Public notice requirements for profile changes

Generate responses that are helpful, compliant, and role-appropriate."""
        ).with_model("openai", "gpt-4o-mini")

    async def create_user_procedure(self, user_id: str, role: UserRole) -> str:
        """Create new user procedure workflow"""
        try:
            procedure_id = str(uuid.uuid4())
            config = get_category_config(role)
            
            if not config:
                raise Exception(f"Invalid user role: {role}")
            
            first_step = config["onboarding"]["steps"][0] if config["onboarding"]["steps"] else OnboardingStep.CREATE_ACCOUNT
            
            procedure: UserProcedure = {
                "_id": procedure_id,
                "user_id": user_id,
                "category": role,
                "current_step": first_step,
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
                    "step": first_step.value,
                    "action": "started",
                    "timestamp": datetime.utcnow(),
                    "user_id": user_id,
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

    async def complete_onboarding_step(self, user_id: str, step: OnboardingStep, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """Complete an onboarding step"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                raise Exception("User procedure not found")
            
            # Validate step completion
            validation_result = validate_step_completion(step, step_data, procedure["category"])
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": validation_result["reason"],
                    "missing_fields": validation_result.get("missing_fields", [])
                }
            
            # Check if step is current or next
            current_step = procedure["current_step"]
            next_step = get_next_onboarding_step(current_step, procedure["category"])
            
            if step != current_step and step != next_step:
                return {
                    "success": False,
                    "error": f"Cannot complete step {step.value}. Current step is {current_step.value}"
                }
            
            # Update procedure
            completed_steps = procedure["completed_steps"]
            if step not in completed_steps:
                completed_steps.append(step)
            
            new_current_step = get_next_onboarding_step(step, procedure["category"])
            
            # Check if onboarding is complete
            config = get_category_config(procedure["category"])
            is_complete = set(completed_steps) >= set(config["onboarding"]["steps"])
            
            update_data = {
                "completed_steps": completed_steps,
                "current_step": new_current_step,
                "updated_at": datetime.utcnow(),
                "verification_status.{step.value}": True,
                "onboarding_completed_at": datetime.utcnow() if is_complete else None,
                "status": "completed" if is_complete else "in_progress"
            }
            
            # Grant badge and permissions if onboarding complete
            if is_complete:
                update_data["badge_earned"] = config["verification"]["badge"]
                update_data["permissions_granted"] = get_required_permissions(procedure["category"])
                
                # Set reverification due date
                reverification_days = config["verification"]["reverification_interval_days"]
                update_data["next_reverification_due"] = datetime.utcnow() + timedelta(days=reverification_days)
            
            # Add to audit trail
            step_entry = {
                "step": step.value,
                "action": "completed",
                "timestamp": datetime.utcnow(),
                "user_id": user_id,
                "details": step_data
            }
            
            await db().user_procedures.update_one(
                {"user_id": user_id},
                {
                    "$set": update_data,
                    "$push": {"step_history": step_entry}
                }
            )
            
            # Calculate progress
            progress = calculate_onboarding_progress(completed_steps, procedure["category"])
            
            return {
                "success": True,
                "step_completed": step.value,
                "next_step": new_current_step.value if new_current_step else None,
                "onboarding_complete": is_complete,
                "progress": progress,
                "badge_earned": config["verification"]["badge"].value if is_complete else None,
                "permissions_granted": get_required_permissions(procedure["category"]) if is_complete else []
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    async def get_onboarding_progress(self, user_id: str) -> Dict[str, Any]:
        """Get user's onboarding progress"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return {"error": "User procedure not found"}
            
            progress = calculate_onboarding_progress(procedure["completed_steps"], procedure["category"])
            config = get_category_config(procedure["category"])
            
            return {
                "user_id": user_id,
                "category": procedure["category"].value,
                "current_step": procedure["current_step"].value if procedure["current_step"] else None,
                "progress": progress,
                "badge_earned": procedure["badge_earned"].value,
                "permissions": procedure["permissions_granted"],
                "status": procedure["status"],
                "onboarding_complete": procedure["onboarding_completed_at"] is not None,
                "next_reverification_due": procedure["next_reverification_due"].isoformat() if procedure["next_reverification_due"] else None,
                "category_config": config
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def get_user_permissions(self, user_id: str) -> List[str]:
        """Get user's granted permissions"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return []
            
            return [perm.value for perm in procedure["permissions_granted"]]
            
        except Exception:
            return []

    async def check_user_permission(self, user_id: str, permission: Permission) -> bool:
        """Check if user has specific permission"""
        try:
            permissions = await self.get_user_permissions(user_id)
            return permission.value in permissions
        except Exception:
            return False

    async def get_user_badge(self, user_id: str) -> Dict[str, Any]:
        """Get user's verification badge information"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return {"badge": "none", "verified": False}
            
            badge_config = get_badge_for_role(procedure["category"])
            
            return {
                "badge": procedure["badge_earned"].value,
                "verified": procedure["badge_earned"] != VerificationBadge.NONE,
                "config": badge_config,
                "category": procedure["category"].value,
                "earned_at": procedure["onboarding_completed_at"].isoformat() if procedure["onboarding_completed_at"] else None
            }
            
        except Exception:
            return {"badge": "none", "verified": False}

    async def request_reverification(self, user_id: str) -> Dict[str, Any]:
        """Request user reverification"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return {"success": False, "error": "User procedure not found"}
            
            config = get_category_config(procedure["category"])
            reverification_days = config["verification"]["reverification_interval_days"]
            
            # Reset verification status and start reverification
            await db().user_procedures.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "verification_status": {},
                        "status": "under_review",
                        "next_reverification_due": datetime.utcnow() + timedelta(days=reverification_days),
                        "updated_at": datetime.utcnow()
                    },
                    "$push": {
                        "verification_history": {
                            "timestamp": datetime.utcnow(),
                            "action": "reverification_requested",
                            "user_id": user_id,
                            "reason": "periodic_reverification"
                        }
                    }
                }
            )
            
            return {
                "success": True,
                "message": "Reverification process started",
                "due_date": (datetime.utcnow() + timedelta(days=reverification_days)).isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def generate_onboarding_guidance(self, user_id: str, context: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Generate AI-powered onboarding guidance"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return {"error": "User procedure not found"}
            
            config = get_category_config(procedure["category"])
            progress = calculate_onboarding_progress(procedure["completed_steps"], procedure["category"])
            
            prompt = f"""Provide personalized onboarding guidance for a {procedure["category"].value} user.

Current Status:
- Category: {procedure["category"].value}
- Current Step: {procedure["current_step"].value if procedure["current_step"] else "Completed"}
- Progress: {progress["percentage"]}% ({progress["completed"]}/{progress["total"]} steps)
- Badge Status: {procedure["badge_earned"].value}
- Status: {procedure["status"]}

Remaining Steps: {', '.join([step.value for step in progress.get("remaining_steps", [])])}

User Context: {json.dumps(context, default=str) if context else "None provided"}

Please provide:
1. Congratulations on completed steps
2. Clear next action items
3. Estimated time to completion
4. Benefits they'll unlock
5. Any tips or requirements for next steps

Keep the response encouraging, specific, and actionable."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            return {
                "guidance": ai_response,
                "progress": progress,
                "current_step": procedure["current_step"].value if procedure["current_step"] else None,
                "badge_status": procedure["badge_earned"].value,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def get_category_configurations(self) -> Dict[str, Any]:
        """Get all user category configurations"""
        return {
            "categories": USER_CATEGORIES,
            "badges": BADGE_CONFIG,
            "step_requirements": STEP_REQUIREMENTS
        }

    async def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get user procedure analytics"""
        try:
            procedure = await self.get_user_procedure(user_id)
            if not procedure:
                return {"error": "User procedure not found"}
            
            # Calculate metrics
            created_at = procedure["created_at"]
            now = datetime.utcnow()
            days_since_start = (now - created_at).days
            
            config = get_category_config(procedure["category"])
            total_steps = len(config["onboarding"]["steps"])
            completed_steps = len(procedure["completed_steps"])
            
            # Calculate velocity
            steps_per_day = completed_steps / max(days_since_start, 1)
            estimated_completion_days = (total_steps - completed_steps) / max(steps_per_day, 0.1)
            
            return {
                "user_id": user_id,
                "category": procedure["category"].value,
                "metrics": {
                    "days_since_start": days_since_start,
                    "completion_percentage": (completed_steps / total_steps) * 100,
                    "steps_completed": completed_steps,
                    "steps_remaining": total_steps - completed_steps,
                    "average_steps_per_day": round(steps_per_day, 2),
                    "estimated_completion_days": round(estimated_completion_days, 1)
                },
                "milestones": {
                    "account_created": created_at.isoformat(),
                    "onboarding_completed": procedure["onboarding_completed_at"].isoformat() if procedure["onboarding_completed_at"] else None,
                    "badge_earned": procedure["onboarding_completed_at"].isoformat() if procedure["badge_earned"] != VerificationBadge.NONE else None,
                    "next_reverification": procedure["next_reverification_due"].isoformat() if procedure["next_reverification_due"] else None
                },
                "activity": {
                    "total_step_actions": len(procedure["step_history"]),
                    "verification_events": len(procedure["verification_history"])
                }
            }
            
        except Exception as e:
            return {"error": str(e)}

# Global procedures by category service instance
procedures_by_category_service = ProceduresByCategoryService()