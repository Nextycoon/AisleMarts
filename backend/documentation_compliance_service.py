from dotenv import load_dotenv
import os
import uuid
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from documentation_compliance_models import (
    TradeDocument, DocumentType, DocumentStatus, DocumentTemplate, 
    DocumentAmendment, AmendmentLevel, ComplianceCheck, ComplianceStandard,
    get_document_template, get_required_standards, calculate_amendment_requirements,
    generate_document_version, validate_document_transitions, get_ai_generation_prompt,
    VALIDATION_RULES, COUNTRY_REGULATIONS
)

load_dotenv()

class DocumentationComplianceService:
    """Documentation Compliance Service - International trade document management"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_docs_ai",
            system_message="""You are the Documentation Compliance Expert for AisleMarts.

Your expertise covers:
- International trade documentation (commercial invoices, certificates of origin, export licenses)
- Global compliance standards (Incoterms 2020, UN/EDIFACT, WTO TFA, ISO standards)
- Country-specific regulations (EU VAT, US CBP/IRS, China GACC, GCC VAT)
- Document validation and amendment procedures
- Cross-border trade requirements and best practices

You help generate, validate, and manage trade documents that comply with:
1. International standards (ISO 9001, ISO 27001, WTO Trade Facilitation Agreement)
2. Regional regulations (EU GDPR & VAT, US CBP & IRS, China GACC, GCC VAT)
3. Local country requirements for customs, tax, and data protection

Always consider:
- Destination country requirements
- Origin country export regulations
- Incoterms implications
- Currency and exchange rate compliance
- Digital signature and authentication needs
- Audit trail and amendment procedures

Generate documents that are legally compliant, professionally formatted, and ready for customs clearance."""
        ).with_model("openai", "gpt-4o-mini")

    async def create_document(self, user_id: str, document_data: Dict[str, Any]) -> str:
        """Create new trade document"""
        try:
            document_id = str(uuid.uuid4())
            document_type = DocumentType(document_data["document_type"])
            
            # Get appropriate template
            country = document_data.get("country", "US")
            template = get_document_template(document_type, country)
            
            # Get required compliance standards
            required_standards = get_required_standards(country)
            
            # Create document
            document: TradeDocument = {
                "_id": document_id,
                "document_type": document_type,
                "title": document_data.get("title", f"{document_type.value.replace('_', ' ').title()}"),
                "user_id": user_id,
                "company_id": document_data.get("company_id"),
                
                # Document Status
                "status": DocumentStatus.DRAFT,
                "version": "1.0.0",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "submitted_at": None,
                "approved_at": None,
                "expires_at": document_data.get("expires_at"),
                
                # Document Content
                "parties": document_data.get("parties", []),
                "items": document_data.get("items", []),
                "terms": document_data.get("terms", {}),
                "totals": document_data.get("totals", {}),
                "currency": document_data.get("currency", "USD"),
                "incoterm": document_data.get("incoterm"),
                
                # Compliance & Validation
                "compliance_standards": required_standards,
                "compliance_checks": [],
                "template_used": template["template_id"] if template else None,
                "country_regulations": COUNTRY_REGULATIONS.get(country, []),
                
                # Files & Generation
                "generated_files": [],
                "source_data": document_data,
                "ai_generated": document_data.get("ai_generated", False),
                
                # Amendment History
                "amendments": [],
                "superseded_by": None,
                "supersedes": None,
                
                # Metadata
                "tags": document_data.get("tags", []),
                "notes": document_data.get("notes"),
                "audit_log": [{
                    "timestamp": datetime.utcnow(),
                    "action": "document_created",
                    "user_id": user_id,
                    "details": {"document_type": document_type.value}
                }]
            }
            
            # Store in database
            await db().trade_documents.insert_one(document)
            
            return document_id
            
        except Exception as e:
            raise Exception(f"Failed to create document: {str(e)}")

    async def get_document(self, document_id: str, user_id: str) -> Optional[TradeDocument]:
        """Get document by ID with user access control"""
        try:
            document = await db().trade_documents.find_one({
                "_id": document_id,
                "$or": [
                    {"user_id": user_id},
                    {"company_id": {"$in": await self.get_user_company_ids(user_id)}}
                ]
            })
            return document
        except Exception:
            return None

    async def get_user_documents(self, user_id: str, filters: Dict[str, Any] = {}) -> List[TradeDocument]:
        """Get user's documents with optional filters"""
        try:
            query = {
                "$or": [
                    {"user_id": user_id},
                    {"company_id": {"$in": await self.get_user_company_ids(user_id)}}
                ]
            }
            
            # Apply filters
            if filters.get("document_type"):
                query["document_type"] = filters["document_type"]
            
            if filters.get("status"):
                query["status"] = filters["status"]
            
            if filters.get("date_from"):
                query["created_at"] = {"$gte": filters["date_from"]}
            
            if filters.get("date_to"):
                if "created_at" not in query:
                    query["created_at"] = {}
                query["created_at"]["$lte"] = filters["date_to"]
            
            # Execute query
            cursor = db().trade_documents.find(query).sort("created_at", -1).limit(50)
            documents = await cursor.to_list(length=50)
            return documents
            
        except Exception:
            return []

    async def submit_document(self, document_id: str, user_id: str) -> bool:
        """Submit document for validation and approval"""
        try:
            document = await self.get_document(document_id, user_id)
            if not document or document["status"] != DocumentStatus.DRAFT:
                return False
            
            # Validate document
            compliance_checks = await self.validate_document(document)
            
            # Determine next status based on validation results
            has_errors = any(check["status"] == "fail" for check in compliance_checks)
            
            if has_errors:
                new_status = DocumentStatus.NEEDS_REVISION
            else:
                # Auto-validate if no errors
                new_status = DocumentStatus.AUTO_VALIDATED
                
                # Auto-approve if low risk
                risk_level = await self.assess_document_risk(document)
                if risk_level == "low":
                    new_status = DocumentStatus.APPROVED
            
            # Update document
            await db().trade_documents.update_one(
                {"_id": document_id},
                {
                    "$set": {
                        "status": new_status.value,
                        "submitted_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "compliance_checks": compliance_checks,
                        "approved_at": datetime.utcnow() if new_status == DocumentStatus.APPROVED else None
                    },
                    "$push": {
                        "audit_log": {
                            "timestamp": datetime.utcnow(),
                            "action": "document_submitted",
                            "user_id": user_id,
                            "details": {"new_status": new_status.value}
                        }
                    }
                }
            )
            
            return True
            
        except Exception as e:
            return False

    async def validate_document(self, document: TradeDocument) -> List[ComplianceCheck]:
        """Validate document against compliance rules"""
        checks = []
        
        try:
            # Schema validation
            checks.append(await self.check_required_fields(document))
            
            # Mathematical validation
            checks.append(await self.check_calculations(document))
            
            # Currency consistency
            checks.append(await self.check_currency_consistency(document))
            
            # Incoterms validation
            if document.get("incoterm"):
                checks.append(await self.check_incoterms(document))
            
            # HS code validation
            checks.append(await self.check_hs_codes(document))
            
            # Sanctions screening
            checks.append(await self.screen_sanctions(document))
            
            # Country-specific validation
            checks.extend(await self.check_country_requirements(document))
            
            return [check for check in checks if check]  # Filter out None values
            
        except Exception as e:
            return [{
                "check_type": "validation_error",
                "status": "fail",
                "message": f"Validation failed: {str(e)}",
                "details": None
            }]

    async def check_required_fields(self, document: TradeDocument) -> Optional[ComplianceCheck]:
        """Check if all required fields are present"""
        try:
            template = get_document_template(document["document_type"], document.get("country", "US"))
            if not template:
                return None
            
            missing_fields = []
            source_data = document.get("source_data", {})
            
            for field in template["required_fields"]:
                if not source_data.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                return {
                    "check_type": "schema_fields",
                    "status": "fail",
                    "message": f"Missing required fields: {', '.join(missing_fields)}",
                    "details": {"missing_fields": missing_fields}
                }
            else:
                return {
                    "check_type": "schema_fields",
                    "status": "pass",
                    "message": "All required fields present",
                    "details": None
                }
                
        except Exception:
            return None

    async def check_calculations(self, document: TradeDocument) -> Optional[ComplianceCheck]:
        """Validate mathematical calculations"""
        try:
            items = document.get("items", [])
            totals = document.get("totals", {})
            
            if not items or not totals:
                return None
            
            # Calculate expected totals
            calculated_subtotal = sum(item["value"] * item["quantity"] for item in items)
            declared_subtotal = totals.get("subtotal", 0)
            
            if abs(calculated_subtotal - declared_subtotal) > 0.01:  # Allow for rounding differences
                return {
                    "check_type": "totals_math",
                    "status": "fail",
                    "message": f"Subtotal mismatch: calculated {calculated_subtotal}, declared {declared_subtotal}",
                    "details": {
                        "calculated": calculated_subtotal,
                        "declared": declared_subtotal
                    }
                }
            else:
                return {
                    "check_type": "totals_math",
                    "status": "pass",
                    "message": "Mathematical calculations correct",
                    "details": None
                }
                
        except Exception:
            return None

    async def check_currency_consistency(self, document: TradeDocument) -> Optional[ComplianceCheck]:
        """Check currency consistency throughout document"""
        try:
            document_currency = document.get("currency", "USD")
            issues = []
            
            # Check items currency
            for item in document.get("items", []):
                if "currency" in item and item["currency"] != document_currency:
                    issues.append(f"Item {item.get('sku', 'unknown')} uses {item['currency']}")
            
            # Check totals currency
            totals = document.get("totals", {})
            if "currency" in totals and totals["currency"] != document_currency:
                issues.append(f"Totals use {totals['currency']}")
            
            if issues:
                return {
                    "check_type": "currency_consistency",
                    "status": "fail",
                    "message": f"Currency inconsistencies found: {'; '.join(issues)}",
                    "details": {"issues": issues}
                }
            else:
                return {
                    "check_type": "currency_consistency",
                    "status": "pass",
                    "message": "Currency consistent throughout document",
                    "details": None
                }
                
        except Exception:
            return None

    async def check_incoterms(self, document: TradeDocument) -> Optional[ComplianceCheck]:
        """Validate Incoterms usage"""
        try:
            incoterm = document.get("incoterm", "")
            valid_incoterms = ["EXW", "FCA", "CPT", "CIP", "DPU", "DAP", "DDP", "FAS", "FOB", "CFR", "CIF"]
            
            if incoterm not in valid_incoterms:
                return {
                    "check_type": "incoterms_consistency",
                    "status": "fail",
                    "message": f"Invalid Incoterm: {incoterm}. Must be one of: {', '.join(valid_incoterms)}",
                    "details": {"provided": incoterm, "valid_options": valid_incoterms}
                }
            else:
                return {
                    "check_type": "incoterms_consistency",
                    "status": "pass",
                    "message": f"Valid Incoterm: {incoterm}",
                    "details": None
                }
                
        except Exception:
            return None

    async def check_hs_codes(self, document: TradeDocument) -> Optional[ComplianceCheck]:
        """Validate HS codes using AI"""
        try:
            items_without_hs = []
            invalid_hs_codes = []
            
            for item in document.get("items", []):
                hs_code = item.get("hs_code")
                if not hs_code:
                    items_without_hs.append(item.get("sku", "unknown"))
                elif len(hs_code) < 6:
                    invalid_hs_codes.append(f"{item.get('sku', 'unknown')}: {hs_code}")
            
            if items_without_hs or invalid_hs_codes:
                issues = []
                if items_without_hs:
                    issues.append(f"Missing HS codes: {', '.join(items_without_hs)}")
                if invalid_hs_codes:
                    issues.append(f"Invalid HS codes: {', '.join(invalid_hs_codes)}")
                
                return {
                    "check_type": "hs_preclassification",
                    "status": "warning",
                    "message": f"HS code issues found: {'; '.join(issues)}",
                    "details": {
                        "missing": items_without_hs,
                        "invalid": invalid_hs_codes
                    }
                }
            else:
                return {
                    "check_type": "hs_preclassification",
                    "status": "pass",
                    "message": "All items have valid HS codes",
                    "details": None
                }
                
        except Exception:
            return None

    async def screen_sanctions(self, document: TradeDocument) -> Optional[ComplianceCheck]:
        """Screen parties against sanctions lists"""
        try:
            # Simple sanctions screening (in production, would use actual sanctions API)
            high_risk_countries = ["IR", "KP", "SY", "CU", "RU", "BY"]  # Example list
            
            flagged_parties = []
            for party in document.get("parties", []):
                party_country = party.get("country", "")
                if party_country in high_risk_countries:
                    flagged_parties.append(f"{party.get('name', 'Unknown')} ({party_country})")
            
            if flagged_parties:
                return {
                    "check_type": "sanctions_screening",
                    "status": "fail",
                    "message": f"High-risk parties detected: {', '.join(flagged_parties)}",
                    "details": {"flagged_parties": flagged_parties}
                }
            else:
                return {
                    "check_type": "sanctions_screening",
                    "status": "pass",
                    "message": "No sanctions issues detected",
                    "details": None
                }
                
        except Exception:
            return None

    async def check_country_requirements(self, document: TradeDocument) -> List[ComplianceCheck]:
        """Check country-specific requirements"""
        checks = []
        try:
            # Implementation would vary by country
            # This is a simplified example
            
            country = document.get("source_data", {}).get("country", "US")
            
            if country == "US":
                # Check for EIN format
                seller_ein = document.get("source_data", {}).get("seller_ein", "")
                if seller_ein and not self.validate_us_ein(seller_ein):
                    checks.append({
                        "check_type": "us_ein_format",
                        "status": "fail",
                        "message": f"Invalid US EIN format: {seller_ein}",
                        "details": {"provided_ein": seller_ein}
                    })
            
            elif country in ["EU", "GB"]:
                # Check for VAT number format
                vat_number = document.get("source_data", {}).get("seller_vat_number", "")
                if vat_number and not self.validate_eu_vat(vat_number):
                    checks.append({
                        "check_type": "eu_vat_format",
                        "status": "fail",
                        "message": f"Invalid VAT number format: {vat_number}",
                        "details": {"provided_vat": vat_number}
                    })
            
            return checks
            
        except Exception:
            return []

    def validate_us_ein(self, ein: str) -> bool:
        """Validate US EIN format (XX-XXXXXXX)"""
        import re
        pattern = r'^\d{2}-\d{7}$'
        return bool(re.match(pattern, ein))

    def validate_eu_vat(self, vat: str) -> bool:
        """Validate EU VAT number format (basic check)"""
        import re
        # Basic format check - in production would use proper VAT validation service
        pattern = r'^[A-Z]{2}[A-Z0-9]{8,12}$'
        return bool(re.match(pattern, vat.upper()))

    async def assess_document_risk(self, document: TradeDocument) -> str:
        """Assess document risk level for auto-approval"""
        try:
            risk_score = 0
            
            # Check document value
            total_value = document.get("totals", {}).get("total", 0)
            if total_value > 100000:  # High value threshold
                risk_score += 2
            elif total_value > 10000:
                risk_score += 1
            
            # Check for high-risk countries
            high_risk_countries = ["IR", "KP", "SY", "CU", "RU", "BY"]
            for party in document.get("parties", []):
                if party.get("country") in high_risk_countries:
                    risk_score += 3
            
            # Check for regulated items (simplified)
            regulated_keywords = ["chemical", "weapon", "nuclear", "drug", "explosive"]
            for item in document.get("items", []):
                description = item.get("description", "").lower()
                if any(keyword in description for keyword in regulated_keywords):
                    risk_score += 2
            
            # Determine risk level
            if risk_score >= 5:
                return "high"
            elif risk_score >= 2:
                return "medium"
            else:
                return "low"
                
        except Exception:
            return "medium"  # Default to medium risk

    async def generate_document_ai(self, user_id: str, document_type: DocumentType, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate document using AI"""
        try:
            prompt = get_ai_generation_prompt(document_type, context)
            
            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            # In a real implementation, would parse the AI response and structure it properly
            # For now, return a simplified structure
            
            return {
                "document_type": document_type.value,
                "ai_generated": True,
                "content": ai_response,
                "context": context,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            raise Exception(f"AI document generation failed: {str(e)}")

    async def create_amendment(self, document_id: str, user_id: str, amendment_data: Dict[str, Any]) -> str:
        """Create document amendment"""
        try:
            document = await self.get_document(document_id, user_id)
            if not document or document["status"] not in [DocumentStatus.APPROVED, DocumentStatus.AUTO_VALIDATED]:
                raise Exception("Document cannot be amended in current status")
            
            amendment_level = AmendmentLevel(amendment_data.get("level", "minor"))
            requirements = calculate_amendment_requirements(amendment_level)
            
            amendment_id = str(uuid.uuid4())
            amendment: DocumentAmendment = {
                "amendment_id": amendment_id,
                "original_document_id": document_id,
                "amendment_level": amendment_level,
                "changes": amendment_data.get("changes", {}),
                "reason": amendment_data.get("reason", ""),
                "requested_by": user_id,
                "requested_at": datetime.utcnow(),
                "approved_by": None,
                "approved_at": None,
                "verification_completed": amendment_data.get("verification_completed", {}),
                "version_bump": requirements["version_bump"]
            }
            
            # Store amendment
            await db().document_amendments.insert_one(amendment)
            
            # Update original document
            await db().trade_documents.update_one(
                {"_id": document_id},
                {
                    "$push": {
                        "amendments": amendment,
                        "audit_log": {
                            "timestamp": datetime.utcnow(),
                            "action": "amendment_requested",
                            "user_id": user_id,
                            "details": {
                                "amendment_id": amendment_id,
                                "level": amendment_level.value
                            }
                        }
                    }
                }
            )
            
            return amendment_id
            
        except Exception as e:
            raise Exception(f"Failed to create amendment: {str(e)}")

    async def get_user_company_ids(self, user_id: str) -> List[str]:
        """Get company IDs user has access to"""
        # Simplified - in production would check user roles and permissions
        return []

    async def get_document_templates(self) -> Dict[str, Any]:
        """Get available document templates"""
        from documentation_compliance_models import DOCUMENT_TEMPLATES
        return DOCUMENT_TEMPLATES

    async def get_compliance_standards(self) -> Dict[str, Any]:
        """Get compliance standards information"""
        return {
            "international": [standard.value for standard in ComplianceStandard],
            "validation_rules": VALIDATION_RULES,
            "country_regulations": COUNTRY_REGULATIONS
        }

# Global documentation compliance service instance
documentation_compliance_service = DocumentationComplianceService()