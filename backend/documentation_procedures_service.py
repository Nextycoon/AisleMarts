from dotenv import load_dotenv
import os
import uuid
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from documentation_procedures_models import (
    DocumentProcedure, WorkflowState, ApprovalLevel, ReviewerRole, 
    WorkflowAction, PriorityLevel, NotificationType, EscalationTrigger,
    WorkflowComment, WorkflowApproval, WorkflowEscalation, NotificationRule,
    get_workflow_template, determine_approval_level, calculate_risk_score,
    get_sla_config, validate_state_transition, get_next_reviewer_role,
    should_escalate, generate_notification_content, WORKFLOW_TEMPLATES
)

load_dotenv()

class DocumentationProceduresService:
    """Documentation Procedures Service - Document states, amendments, approval workflows"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_doc_procedures_ai",
            system_message="""You are the Documentation Procedures Expert for AisleMarts.

Your expertise covers:
- Document workflow management and approval processes
- Risk assessment and compliance validation
- SLA monitoring and escalation procedures
- Review assignment and workload distribution
- Notification and communication management
- Audit trail and compliance reporting

You manage sophisticated document workflows including:
1. Multi-level approval processes (Auto, Peer, Supervisor, Manager, Compliance, Legal)
2. Risk-based routing and escalation
3. SLA tracking and deadline management
4. Reviewer assignment and workload balancing
5. Notification and communication orchestration
6. Compliance monitoring and reporting

Workflow States: Draft → Pending Review → In Review → Approved/Rejected/Revision Requested
Approval Levels: Auto, Peer, Supervisor, Manager, Compliance, Senior Compliance, Legal
Risk Factors: Document value, country risk, product categories, regulatory requirements

You provide:
- Clear workflow status and next actions
- Risk assessment and mitigation recommendations
- SLA compliance monitoring and alerts
- Reviewer recommendations and workload insights
- Escalation triggers and resolution guidance
- Compliance reporting and audit support

Generate responses that are professional, actionable, and compliance-focused."""
        ).with_model("openai", "gpt-4o-mini")

    async def create_document_procedure(self, document_id: str, document_data: Dict[str, Any], created_by: str) -> str:
        """Create new document procedure"""
        try:
            procedure_id = str(uuid.uuid4())
            
            # Determine approval level and risk
            approval_level = determine_approval_level(document_data)
            risk_score = calculate_risk_score(document_data)
            
            # Get SLA configuration
            sla_config = get_sla_config(approval_level)
            
            # Set due date based on SLA
            due_date = datetime.utcnow() + timedelta(hours=sla_config["completion_time_hours"])
            
            procedure: DocumentProcedure = {
                "_id": procedure_id,
                "document_id": document_id,
                "document_type": document_data.get("document_type", "unknown"),
                "document_title": document_data.get("title", "Untitled Document"),
                
                # Workflow State
                "current_state": WorkflowState.DRAFT,
                "approval_level_required": approval_level,
                "priority": self.determine_priority(risk_score, document_data),
                
                # Ownership & Assignment
                "created_by": created_by,
                "current_assignee": None,
                "reviewer_pool": await self.get_available_reviewers(approval_level),
                
                # Timestamps
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "submitted_at": None,
                "assigned_at": None,
                "due_date": due_date,
                "completed_at": None,
                
                # SLA Tracking
                "sla_config": sla_config,
                "sla_met": None,
                "response_time_minutes": None,
                "completion_time_minutes": None,
                
                # Workflow History
                "state_history": [{
                    "state": WorkflowState.DRAFT.value,
                    "timestamp": datetime.utcnow(),
                    "user_id": created_by,
                    "action": "created",
                    "details": {"approval_level": approval_level.value, "risk_score": risk_score}
                }],
                "approvals": [],
                "comments": [],
                "escalations": [],
                
                # Notifications
                "notification_rules": await self.create_default_notification_rules(approval_level),
                "notifications_sent": [],
                
                # Risk & Compliance
                "risk_score": risk_score,
                "compliance_flags": self.identify_compliance_flags(document_data),
                "regulatory_requirements": self.identify_regulatory_requirements(document_data),
                
                # Metadata
                "tags": document_data.get("tags", []),
                "custom_fields": document_data.get("custom_fields", {}),
                "external_references": document_data.get("external_references", []),
                
                # Audit Trail
                "audit_log": [{
                    "timestamp": datetime.utcnow(),
                    "action": "procedure_created",
                    "user_id": created_by,
                    "details": {
                        "document_id": document_id,
                        "approval_level": approval_level.value,
                        "risk_score": risk_score
                    }
                }]
            }
            
            # Store in database
            await db().document_procedures.insert_one(procedure)
            
            return procedure_id
            
        except Exception as e:
            raise Exception(f"Failed to create document procedure: {str(e)}")

    async def submit_for_review(self, procedure_id: str, user_id: str) -> Dict[str, Any]:
        """Submit document for review"""
        try:
            procedure = await self.get_procedure(procedure_id)
            if not procedure:
                return {"success": False, "error": "Procedure not found"}
            
            # Validate transition
            if not validate_state_transition(procedure["current_state"], WorkflowState.PENDING_REVIEW):
                return {"success": False, "error": "Invalid state transition"}
            
            # Assign reviewer
            reviewer_id = await self.assign_next_reviewer(procedure)
            
            # Update procedure
            submitted_at = datetime.utcnow()
            
            await db().document_procedures.update_one(
                {"_id": procedure_id},
                {
                    "$set": {
                        "current_state": WorkflowState.PENDING_REVIEW.value,
                        "submitted_at": submitted_at,
                        "assigned_at": submitted_at,
                        "current_assignee": reviewer_id,
                        "updated_at": submitted_at
                    },
                    "$push": {
                        "state_history": {
                            "state": WorkflowState.PENDING_REVIEW.value,
                            "timestamp": submitted_at,
                            "user_id": user_id,
                            "action": "submitted",
                            "details": {"assigned_to": reviewer_id}
                        },
                        "audit_log": {
                            "timestamp": submitted_at,
                            "action": "submitted_for_review",
                            "user_id": user_id,
                            "details": {"assigned_to": reviewer_id}
                        }
                    }
                }
            )
            
            # Send notifications
            await self.send_review_notifications(procedure_id, reviewer_id)
            
            return {
                "success": True,
                "new_state": WorkflowState.PENDING_REVIEW.value,
                "assigned_to": reviewer_id,
                "due_date": procedure["due_date"].isoformat() if procedure["due_date"] else None
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def approve_document(self, procedure_id: str, approver_id: str, approval_data: Dict[str, Any]) -> Dict[str, Any]:
        """Approve document"""
        try:
            procedure = await self.get_procedure(procedure_id)
            if not procedure:
                return {"success": False, "error": "Procedure not found"}
            
            # Create approval record
            approval_id = str(uuid.uuid4())
            approval_timestamp = datetime.utcnow()
            
            approval: WorkflowApproval = {
                "approval_id": approval_id,
                "approver_id": approver_id,
                "approver_name": approval_data.get("approver_name", "Unknown"),
                "approver_role": ReviewerRole(approval_data.get("approver_role", "compliance_officer")),
                "approval_level": procedure["approval_level_required"],
                "decision": "approved",
                "timestamp": approval_timestamp,
                "comments": approval_data.get("comments", ""),
                "conditions": approval_data.get("conditions", []),
                "signature_hash": approval_data.get("signature_hash")
            }
            
            # Calculate completion time
            completion_time_minutes = None
            if procedure["submitted_at"]:
                completion_time_minutes = int((approval_timestamp - procedure["submitted_at"]).total_seconds() / 60)
            
            # Update procedure
            await db().document_procedures.update_one(
                {"_id": procedure_id},
                {
                    "$set": {
                        "current_state": WorkflowState.APPROVED.value,
                        "completed_at": approval_timestamp,
                        "completion_time_minutes": completion_time_minutes,
                        "sla_met": completion_time_minutes <= (procedure["sla_config"]["completion_time_hours"] * 60) if completion_time_minutes else None,
                        "updated_at": approval_timestamp
                    },
                    "$push": {
                        "approvals": approval,
                        "state_history": {
                            "state": WorkflowState.APPROVED.value,
                            "timestamp": approval_timestamp,
                            "user_id": approver_id,
                            "action": "approved",
                            "details": {"approval_id": approval_id}
                        },
                        "audit_log": {
                            "timestamp": approval_timestamp,
                            "action": "document_approved",
                            "user_id": approver_id,
                            "details": {
                                "approval_id": approval_id,
                                "completion_time_minutes": completion_time_minutes
                            }
                        }
                    }
                }
            )
            
            # Send approval notifications
            await self.send_approval_notifications(procedure_id, "approved")
            
            return {
                "success": True,
                "approval_id": approval_id,
                "new_state": WorkflowState.APPROVED.value,
                "completion_time_minutes": completion_time_minutes,
                "sla_met": completion_time_minutes <= (procedure["sla_config"]["completion_time_hours"] * 60) if completion_time_minutes else None
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def reject_document(self, procedure_id: str, reviewer_id: str, rejection_data: Dict[str, Any]) -> Dict[str, Any]:
        """Reject document"""
        try:
            procedure = await self.get_procedure(procedure_id)
            if not procedure:
                return {"success": False, "error": "Procedure not found"}
            
            # Create rejection record
            approval_id = str(uuid.uuid4())
            rejection_timestamp = datetime.utcnow()
            
            approval: WorkflowApproval = {
                "approval_id": approval_id,
                "approver_id": reviewer_id,
                "approver_name": rejection_data.get("reviewer_name", "Unknown"),
                "approver_role": ReviewerRole(rejection_data.get("reviewer_role", "compliance_officer")),
                "approval_level": procedure["approval_level_required"],
                "decision": "rejected",
                "timestamp": rejection_timestamp,
                "comments": rejection_data.get("comments", ""),
                "conditions": None,
                "signature_hash": None
            }
            
            # Update procedure
            await db().document_procedures.update_one(
                {"_id": procedure_id},
                {
                    "$set": {
                        "current_state": WorkflowState.REJECTED.value,
                        "completed_at": rejection_timestamp,
                        "updated_at": rejection_timestamp
                    },
                    "$push": {
                        "approvals": approval,
                        "state_history": {
                            "state": WorkflowState.REJECTED.value,
                            "timestamp": rejection_timestamp,
                            "user_id": reviewer_id,
                            "action": "rejected",
                            "details": {"approval_id": approval_id, "reason": rejection_data.get("comments", "")}
                        },
                        "audit_log": {
                            "timestamp": rejection_timestamp,
                            "action": "document_rejected",
                            "user_id": reviewer_id,
                            "details": {"approval_id": approval_id}
                        }
                    }
                }
            )
            
            # Send rejection notifications
            await self.send_approval_notifications(procedure_id, "rejected")
            
            return {
                "success": True,
                "approval_id": approval_id,
                "new_state": WorkflowState.REJECTED.value,
                "rejection_reason": rejection_data.get("comments", "")
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def request_revision(self, procedure_id: str, reviewer_id: str, revision_data: Dict[str, Any]) -> Dict[str, Any]:
        """Request document revision"""
        try:
            procedure = await self.get_procedure(procedure_id)
            if not procedure:
                return {"success": False, "error": "Procedure not found"}
            
            # Add comment with revision request
            comment_id = str(uuid.uuid4())
            comment_timestamp = datetime.utcnow()
            
            comment: WorkflowComment = {
                "comment_id": comment_id,
                "user_id": reviewer_id,
                "user_name": revision_data.get("reviewer_name", "Unknown"),
                "user_role": revision_data.get("reviewer_role", "reviewer"),
                "comment": revision_data.get("comments", "Revision requested"),
                "timestamp": comment_timestamp,
                "is_internal": False,
                "attachments": revision_data.get("attachments", [])
            }
            
            # Update procedure
            await db().document_procedures.update_one(
                {"_id": procedure_id},
                {
                    "$set": {
                        "current_state": WorkflowState.REVISION_REQUESTED.value,
                        "current_assignee": procedure["created_by"],  # Back to creator
                        "updated_at": comment_timestamp
                    },
                    "$push": {
                        "comments": comment,
                        "state_history": {
                            "state": WorkflowState.REVISION_REQUESTED.value,
                            "timestamp": comment_timestamp,
                            "user_id": reviewer_id,
                            "action": "revision_requested",
                            "details": {"comment_id": comment_id}
                        },
                        "audit_log": {
                            "timestamp": comment_timestamp,
                            "action": "revision_requested",
                            "user_id": reviewer_id,
                            "details": {"comment_id": comment_id}
                        }
                    }
                }
            )
            
            # Send revision notifications
            await self.send_revision_notifications(procedure_id, revision_data.get("comments", ""))
            
            return {
                "success": True,
                "comment_id": comment_id,
                "new_state": WorkflowState.REVISION_REQUESTED.value,
                "assigned_to": procedure["created_by"]
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def add_comment(self, procedure_id: str, user_id: str, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add comment to document procedure"""
        try:
            comment_id = str(uuid.uuid4())
            comment_timestamp = datetime.utcnow()
            
            comment: WorkflowComment = {
                "comment_id": comment_id,
                "user_id": user_id,
                "user_name": comment_data.get("user_name", "Unknown"),
                "user_role": comment_data.get("user_role", "user"),
                "comment": comment_data.get("comment", ""),
                "timestamp": comment_timestamp,
                "is_internal": comment_data.get("is_internal", False),
                "attachments": comment_data.get("attachments", [])
            }
            
            # Update procedure
            await db().document_procedures.update_one(
                {"_id": procedure_id},
                {
                    "$set": {"updated_at": comment_timestamp},
                    "$push": {
                        "comments": comment,
                        "audit_log": {
                            "timestamp": comment_timestamp,
                            "action": "comment_added",
                            "user_id": user_id,
                            "details": {"comment_id": comment_id, "is_internal": comment_data.get("is_internal", False)}
                        }
                    }
                }
            )
            
            return {
                "success": True,
                "comment_id": comment_id,
                "timestamp": comment_timestamp.isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def escalate_procedure(self, procedure_id: str, escalation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Escalate document procedure"""
        try:
            procedure = await self.get_procedure(procedure_id)
            if not procedure:
                return {"success": False, "error": "Procedure not found"}
            
            escalation_id = str(uuid.uuid4())
            escalation_timestamp = datetime.utcnow()
            
            # Determine new approval level
            current_level = procedure["approval_level_required"]
            new_level = self.get_escalated_approval_level(current_level)
            
            escalation: WorkflowEscalation = {
                "escalation_id": escalation_id,
                "trigger": EscalationTrigger(escalation_data.get("trigger", "manual_request")),
                "from_level": current_level,
                "to_level": new_level,
                "escalated_by": escalation_data.get("escalated_by", "system"),
                "escalated_at": escalation_timestamp,
                "reason": escalation_data.get("reason", "Manual escalation"),
                "resolved_at": None,
                "resolution": None
            }
            
            # Assign new reviewer
            new_reviewer = await self.assign_reviewer_for_level(new_level)
            
            # Update procedure
            await db().document_procedures.update_one(
                {"_id": procedure_id},
                {
                    "$set": {
                        "approval_level_required": new_level.value,
                        "current_assignee": new_reviewer,
                        "priority": PriorityLevel.URGENT.value,
                        "updated_at": escalation_timestamp
                    },
                    "$push": {
                        "escalations": escalation,
                        "audit_log": {
                            "timestamp": escalation_timestamp,
                            "action": "procedure_escalated",
                            "user_id": escalation_data.get("escalated_by", "system"),
                            "details": {
                                "escalation_id": escalation_id,
                                "from_level": current_level.value,
                                "to_level": new_level.value
                            }
                        }
                    }
                }
            )
            
            # Send escalation notifications
            await self.send_escalation_notifications(procedure_id, escalation)
            
            return {
                "success": True,
                "escalation_id": escalation_id,
                "new_approval_level": new_level.value,
                "assigned_to": new_reviewer,
                "priority": PriorityLevel.URGENT.value
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_procedure(self, procedure_id: str) -> Optional[DocumentProcedure]:
        """Get document procedure by ID"""
        try:
            procedure = await db().document_procedures.find_one({"_id": procedure_id})
            return procedure
        except Exception:
            return None

    async def get_user_procedures(self, user_id: str, filters: Dict[str, Any] = {}) -> List[DocumentProcedure]:
        """Get procedures for user (created by or assigned to)"""
        try:
            query = {
                "$or": [
                    {"created_by": user_id},
                    {"current_assignee": user_id}
                ]
            }
            
            # Apply filters
            if filters.get("state"):
                query["current_state"] = filters["state"]
            
            if filters.get("priority"):
                query["priority"] = filters["priority"]
            
            if filters.get("overdue_only"):
                query["due_date"] = {"$lt": datetime.utcnow()}
            
            cursor = db().document_procedures.find(query).sort("updated_at", -1).limit(50)
            procedures = await cursor.to_list(length=50)
            return procedures
            
        except Exception:
            return []

    async def get_pending_reviews(self, reviewer_id: str) -> List[DocumentProcedure]:
        """Get procedures pending review by specific reviewer"""
        try:
            query = {
                "current_assignee": reviewer_id,
                "current_state": {"$in": [WorkflowState.PENDING_REVIEW.value, WorkflowState.IN_REVIEW.value]}
            }
            
            cursor = db().document_procedures.find(query).sort("due_date", 1).limit(20)
            procedures = await cursor.to_list(length=20)
            return procedures
            
        except Exception:
            return []

    # Helper methods
    def determine_priority(self, risk_score: float, document_data: Dict[str, Any]) -> PriorityLevel:
        """Determine procedure priority based on risk and data"""
        if risk_score >= 0.8:
            return PriorityLevel.CRITICAL
        elif risk_score >= 0.6:
            return PriorityLevel.HIGH
        elif document_data.get("urgent_flag"):
            return PriorityLevel.URGENT
        elif risk_score >= 0.4:
            return PriorityLevel.NORMAL
        else:
            return PriorityLevel.LOW

    async def get_available_reviewers(self, approval_level: ApprovalLevel) -> List[str]:
        """Get available reviewers for approval level"""
        # In production, would query user database for reviewers with appropriate roles
        reviewer_role = get_next_reviewer_role(approval_level)
        
        # Simplified - return mock reviewer IDs
        mock_reviewers = {
            ReviewerRole.COMPLIANCE_OFFICER: ["reviewer_1", "reviewer_2"],
            ReviewerRole.TRADE_SPECIALIST: ["reviewer_3", "reviewer_4"],
            ReviewerRole.OPERATIONS_MANAGER: ["reviewer_5"],
            ReviewerRole.SENIOR_COMPLIANCE: ["reviewer_6"],
            ReviewerRole.LEGAL_COUNSEL: ["reviewer_7"]
        }
        
        return mock_reviewers.get(reviewer_role, ["reviewer_1"])

    async def assign_next_reviewer(self, procedure: DocumentProcedure) -> str:
        """Assign next available reviewer"""
        available_reviewers = procedure["reviewer_pool"]
        if not available_reviewers:
            available_reviewers = await self.get_available_reviewers(procedure["approval_level_required"])
        
        # Simple round-robin assignment (in production, would consider workload)
        return available_reviewers[0] if available_reviewers else "default_reviewer"

    async def assign_reviewer_for_level(self, approval_level: ApprovalLevel) -> str:
        """Assign reviewer for specific approval level"""
        available_reviewers = await self.get_available_reviewers(approval_level)
        return available_reviewers[0] if available_reviewers else "default_reviewer"

    def get_escalated_approval_level(self, current_level: ApprovalLevel) -> ApprovalLevel:
        """Get escalated approval level"""
        escalation_map = {
            ApprovalLevel.AUTO: ApprovalLevel.PEER,
            ApprovalLevel.PEER: ApprovalLevel.SUPERVISOR,
            ApprovalLevel.SUPERVISOR: ApprovalLevel.MANAGER,
            ApprovalLevel.MANAGER: ApprovalLevel.COMPLIANCE,
            ApprovalLevel.COMPLIANCE: ApprovalLevel.SENIOR_COMPLIANCE,
            ApprovalLevel.SENIOR_COMPLIANCE: ApprovalLevel.LEGAL,
            ApprovalLevel.LEGAL: ApprovalLevel.LEGAL  # Max level
        }
        
        return escalation_map.get(current_level, ApprovalLevel.COMPLIANCE)

    def identify_compliance_flags(self, document_data: Dict[str, Any]) -> List[str]:
        """Identify compliance flags from document data"""
        flags = []
        
        # Check for high-risk countries
        countries = document_data.get("countries", [])
        high_risk_countries = ["IR", "KP", "SY", "CU", "RU", "BY"]
        if any(country in high_risk_countries for country in countries):
            flags.append("high_risk_country")
        
        # Check for controlled products
        categories = document_data.get("product_categories", [])
        controlled_categories = ["chemicals", "pharmaceuticals", "technology", "defense"]
        if any(category in controlled_categories for category in categories):
            flags.append("controlled_products")
        
        # Check for high value
        if document_data.get("total_value", 0) > 100000:
            flags.append("high_value_transaction")
        
        return flags

    def identify_regulatory_requirements(self, document_data: Dict[str, Any]) -> List[str]:
        """Identify regulatory requirements from document data"""
        requirements = []
        
        countries = document_data.get("countries", [])
        
        if "US" in countries:
            requirements.extend(["CBP_compliance", "IRS_reporting"])
        
        if any(country in ["DE", "FR", "IT", "ES", "NL"] for country in countries):
            requirements.extend(["EU_VAT_compliance", "GDPR_compliance"])
        
        if "GB" in countries:
            requirements.extend(["UK_VAT_compliance", "Brexit_requirements"])
        
        if "CN" in countries:
            requirements.append("GACC_compliance")
        
        return requirements

    async def create_default_notification_rules(self, approval_level: ApprovalLevel) -> List[NotificationRule]:
        """Create default notification rules for approval level"""
        rules = []
        
        # Review required notification
        rules.append({
            "rule_id": str(uuid.uuid4()),
            "event_type": "review_required",
            "recipients": ["current_assignee"],
            "notification_types": [NotificationType.EMAIL, NotificationType.IN_APP],
            "delay_minutes": 0,
            "conditions": {"state": "pending_review"}
        })
        
        # SLA warning notification
        sla_config = get_sla_config(approval_level)
        warning_hours = max(1, sla_config["completion_time_hours"] - 8)  # 8 hours before deadline
        
        rules.append({
            "rule_id": str(uuid.uuid4()),
            "event_type": "sla_warning",
            "recipients": ["current_assignee", "supervisor"],
            "notification_types": [NotificationType.EMAIL],
            "delay_minutes": warning_hours * 60,
            "conditions": {"state": "in_review"}
        })
        
        return rules

    async def send_review_notifications(self, procedure_id: str, reviewer_id: str):
        """Send review required notifications"""
        # In production, would integrate with notification service
        pass

    async def send_approval_notifications(self, procedure_id: str, decision: str):
        """Send approval/rejection notifications"""
        # In production, would integrate with notification service
        pass

    async def send_revision_notifications(self, procedure_id: str, revision_comments: str):
        """Send revision request notifications"""
        # In production, would integrate with notification service
        pass

    async def send_escalation_notifications(self, procedure_id: str, escalation: WorkflowEscalation):
        """Send escalation notifications"""
        # In production, would integrate with notification service
        pass

    async def generate_workflow_insights(self, user_context: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Generate AI-powered workflow insights"""
        try:
            prompt = f"""Provide workflow insights and recommendations based on the following context:

User Context: {json.dumps(user_context, default=str)}

Please analyze:
1. Current workflow performance and bottlenecks
2. SLA compliance and trends
3. Risk assessment accuracy
4. Reviewer workload distribution
5. Escalation patterns and causes
6. Process improvement opportunities

Provide actionable recommendations for:
- Workflow optimization
- Risk assessment improvements
- Resource allocation
- Process automation opportunities
- Compliance enhancements

Keep recommendations specific, measurable, and implementable."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            return {
                "insights": ai_response,
                "generated_at": datetime.utcnow().isoformat(),
                "context": user_context
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def get_workflow_analytics(self, time_period_days: int = 30) -> Dict[str, Any]:
        """Get workflow analytics for time period"""
        try:
            start_date = datetime.utcnow() - timedelta(days=time_period_days)
            
            # Get procedure statistics
            total_procedures = await db().document_procedures.count_documents({
                "created_at": {"$gte": start_date}
            })
            
            approved_procedures = await db().document_procedures.count_documents({
                "created_at": {"$gte": start_date},
                "current_state": WorkflowState.APPROVED.value
            })
            
            rejected_procedures = await db().document_procedures.count_documents({
                "created_at": {"$gte": start_date},
                "current_state": WorkflowState.REJECTED.value
            })
            
            pending_procedures = await db().document_procedures.count_documents({
                "created_at": {"$gte": start_date},
                "current_state": {"$in": [WorkflowState.PENDING_REVIEW.value, WorkflowState.IN_REVIEW.value]}
            })
            
            # Calculate metrics
            approval_rate = (approved_procedures / total_procedures * 100) if total_procedures > 0 else 0
            rejection_rate = (rejected_procedures / total_procedures * 100) if total_procedures > 0 else 0
            
            return {
                "time_period_days": time_period_days,
                "total_procedures": total_procedures,
                "metrics": {
                    "approved": approved_procedures,
                    "rejected": rejected_procedures,
                    "pending": pending_procedures,
                    "approval_rate": round(approval_rate, 1),
                    "rejection_rate": round(rejection_rate, 1)
                },
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {"error": str(e)}

    async def get_workflow_templates(self) -> Dict[str, Any]:
        """Get available workflow templates"""
        return WORKFLOW_TEMPLATES

# Global documentation procedures service instance
documentation_procedures_service = DocumentationProceduresService()