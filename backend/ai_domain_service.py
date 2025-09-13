from dotenv import load_dotenv
import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from ai_domain_models import (
    HSCodeSuggestRequest, HSCodeSuggestResponse, LandedCostRequest, LandedCostResponse,
    FreightQuoteRequest, FreightQuoteResponse, ComplianceScreeningRequest, ComplianceScreeningResponse,
    PaymentMethodsRequest, PaymentMethodsResponse, TaxComputeRequest, TaxComputeResponse,
    get_hs_suggestions, calculate_landed_cost, get_distance_category, calculate_volumetric_weight,
    FREIGHT_COSTS, INCOTERMS_2020, TRANSPORT_MODES, SAMPLE_HS_CODES
)

load_dotenv()

class AIDomainService:
    """AI Domain Specialization Service - E-commerce & Global Trade Expert"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_trade_ai",
            system_message="""You are the AI Trade Intelligence Expert for AisleMarts - the world's #1 specialist for e-commerce & global trade.

Your expertise covers:
- Commerce Models: B2C, D2C, B2B, D2B, Wholesale, Retail, Marketplaces, Dropshipping, Cross-border
- Trade Domains: Supply Chain, Procurement, Inventory, Logistics, Freight, Customs, Taxes, Duties, Compliance, Payments, Returns
- Global Coverage: 4+ million cities, all countries, regional trade agreements

Core capabilities:
- HS code classification with confidence scores
- Landed cost estimation with duty/tax calculations
- Incoterms impact analysis and recommendations
- Freight optimization with volumetric weight awareness
- Payment method localization by country
- Tax compliance across jurisdictions
- Market targeting and demand signals
- Risk assessment and compliance screening

Always provide:
1. Specific, actionable recommendations
2. Confidence scores for estimates
3. Assumptions clearly stated
4. Compliance disclaimers where appropriate
5. Alternative options when available

Remember: You're helping global traders navigate complex international commerce successfully."""
        ).with_model("openai", "gpt-4o-mini")

    async def suggest_hs_codes(self, request: HSCodeSuggestRequest) -> HSCodeSuggestResponse:
        """Suggest HS codes for products with AI enhancement"""
        try:
            # Get initial suggestions from rule-based system
            suggestions = get_hs_suggestions(
                request["title"], 
                request.get("materials"), 
                request.get("use")
            )
            
            # Enhance with AI analysis
            prompt = f"""Analyze this product for HS code classification:

Product: {request['title']}
Materials: {request.get('materials', 'Not specified')}
Use/Purpose: {request.get('use', 'Not specified')}
Origin Country: {request.get('country_origin', 'Not specified')}

Current suggestions: {json.dumps(suggestions, indent=2)}

Please:
1. Validate these suggestions and adjust confidence scores
2. Identify any missing alternatives
3. Provide classification reasoning
4. Note any special considerations (regulations, duties, etc.)

Respond with analysis and any additional HS codes to consider."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            # Enhance suggestions with AI insights
            notes = [
                "AI-enhanced classification analysis",
                ai_response[:200] + "..." if len(ai_response) > 200 else ai_response,
                "Estimates only - confirm with customs broker for binding classification"
            ]
            
            return {
                "candidates": suggestions,
                "notes": notes
            }
            
        except Exception as e:
            return {
                "candidates": [{"hs": "9999.99", "desc": "Other products", "confidence": 0.5}],
                "notes": [f"Error in HS code suggestion: {str(e)}"]
            }

    async def calculate_landed_cost(self, request: LandedCostRequest) -> LandedCostResponse:
        """Calculate comprehensive landed cost analysis"""
        try:
            # Use the model's calculation function
            result = calculate_landed_cost(
                request["destination_country"],
                request["items"],
                request.get("freight_cost", 0.0),
                request.get("insurance_cost", 0.0)
            )
            
            # Enhance with AI insights
            total_value = sum(item["value"] * item["qty"] for item in request["items"])
            
            prompt = f"""Analyze this landed cost calculation for international trade:

Destination: {request['destination_country']}
Incoterm: {request['incoterm']}
Total Value: {total_value} {request['currency']}
Number of Items: {len(request['items'])}

Calculated Results:
- Duty: {result['duty']:.2f}
- Tax: {result['tax']:.2f}
- Fees: {result['fees']:.2f}
- Total Landed Cost: {result['total_landed_cost']:.2f}

Provide insights on:
1. Cost optimization opportunities
2. Incoterm impact on total cost
3. Alternative shipping strategies
4. Regulatory considerations for {request['destination_country']}
5. Risk factors and mitigation"""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            # Add AI insights to assumptions
            result["assumptions"].append(f"AI Insights: {ai_response[:100]}...")
            
            return result
            
        except Exception as e:
            return {
                "duty": 0.0,
                "tax": 0.0,
                "fees": 0.0,
                "total_landed_cost": 0.0,
                "assumptions": [f"Error in calculation: {str(e)}"],
                "confidence": 0.0
            }

    async def get_freight_quote(self, request: FreightQuoteRequest) -> FreightQuoteResponse:
        """Get freight quotes with AI-powered optimization"""
        try:
            # Calculate volumetric weight
            volumetric_weight = calculate_volumetric_weight(request["dimensions"])
            chargeable_weight = max(request["weight_kg"], volumetric_weight)
            
            # Get distance category
            distance_cat = get_distance_category(request["origin"], request["destination"])
            
            # Calculate base costs
            mode_costs = FREIGHT_COSTS.get(request["mode"], FREIGHT_COSTS["Air"])
            base_rate_per_kg = mode_costs.get(distance_cat, mode_costs["medium_haul"])
            
            # Generate options based on service level
            options = []
            
            if request["service_level"] == "speed":
                # Prioritize fastest options
                if request["mode"] == "Air":
                    options.append({
                        "carrier": "DHL Express",
                        "eta_days": 2,
                        "cost": chargeable_weight * base_rate_per_kg * 1.3,
                        "notes": "Express air freight, door-to-door"
                    })
                    options.append({
                        "carrier": "FedEx International Priority",
                        "eta_days": 3,
                        "cost": chargeable_weight * base_rate_per_kg * 1.2,
                        "notes": "Priority air freight, customs clearance included"
                    })
                elif request["mode"] == "Courier":
                    options.append({
                        "carrier": "UPS Worldwide Express",
                        "eta_days": 1,
                        "cost": chargeable_weight * base_rate_per_kg * 1.1,
                        "notes": "Express courier, next-day delivery"
                    })
            
            elif request["service_level"] == "economy":
                # Prioritize cost-effective options
                if request["mode"] == "Sea FCL":
                    options.append({
                        "carrier": "Evergreen Marine",
                        "eta_days": 25,
                        "cost": chargeable_weight * base_rate_per_kg * 0.8,
                        "notes": "Full container load, port-to-port"
                    })
                    options.append({
                        "carrier": "COSCO Shipping",
                        "eta_days": 28,
                        "cost": chargeable_weight * base_rate_per_kg * 0.7,
                        "notes": "Economy ocean freight, basic service"
                    })
                elif request["mode"] == "Sea LCL":
                    options.append({
                        "carrier": "MSC Consolidation",
                        "eta_days": 30,
                        "cost": chargeable_weight * base_rate_per_kg * 0.9,
                        "notes": "Less than container load, weekly departures"
                    })
            
            else:  # balanced
                # Mix of speed and cost
                if request["mode"] == "Air":
                    options.append({
                        "carrier": "Turkish Airlines Cargo", 
                        "eta_days": 4,
                        "cost": chargeable_weight * base_rate_per_kg,
                        "notes": "Standard air freight, good reliability"
                    })
                    options.append({
                        "carrier": "Lufthansa Cargo",
                        "eta_days": 5,
                        "cost": chargeable_weight * base_rate_per_kg * 0.95,
                        "notes": "Reliable European network"
                    })
            
            # Default fallback option
            if not options:
                options.append({
                    "carrier": "Standard Freight Forwarder",
                    "eta_days": 7,
                    "cost": chargeable_weight * base_rate_per_kg,
                    "notes": f"Standard {request['mode']} service"
                })
            
            # Use AI to enhance recommendations
            prompt = f"""Analyze this freight shipping scenario:

Route: {request['origin']} → {request['destination']}
Mode: {request['mode']}
Weight: {request['weight_kg']}kg (Volumetric: {volumetric_weight:.1f}kg)
Service Level: {request['service_level']}
Ready Date: {request.get('ready_date', 'ASAP')}

Generated options: {json.dumps(options, indent=2)}

Provide insights on:
1. Best option recommendation with reasoning
2. Seasonal considerations
3. Potential delays or restrictions
4. Cost optimization suggestions
5. Documentation requirements"""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            # Add AI insights to the first option
            if options:
                options[0]["notes"] += f" | AI Insight: {ai_response[:50]}..."
            
            return {
                "options": options,
                "volumetric_weight_kg": volumetric_weight
            }
            
        except Exception as e:
            return {
                "options": [{
                    "carrier": "Error",
                    "eta_days": 0,
                    "cost": 0.0,
                    "notes": f"Error calculating freight: {str(e)}"
                }],
                "volumetric_weight_kg": 0.0
            }

    async def screen_compliance(self, request: ComplianceScreeningRequest) -> ComplianceScreeningResponse:
        """Screen parties for compliance and sanctions"""
        try:
            hits = []
            notes = []
            
            # Simple screening simulation (in production, use real screening APIs)
            high_risk_countries = ["KP", "IR", "SY", "CU", "RU"]  # Example list
            
            for party in request["parties"]:
                country = party["country"]
                name = party["name"].lower()
                
                risk_level = "low"
                screening_notes = []
                
                # Country-based risk
                if country in high_risk_countries:
                    risk_level = "high"
                    screening_notes.append("High-risk jurisdiction")
                
                # Name-based screening (simplified)
                if any(word in name for word in ["sanctioned", "restricted", "blocked"]):
                    risk_level = "high"
                    screening_notes.append("Name matching concern")
                
                if risk_level != "low":
                    hits.append({
                        "party": party["name"],
                        "list": "Example Sanctions List",
                        "risk": risk_level
                    })
                
                notes.extend(screening_notes)
            
            # AI-enhanced risk analysis
            prompt = f"""Analyze compliance screening results for international trade:

Parties screened: {len(request['parties'])}
Hits found: {len(hits)}
Countries involved: {[p['country'] for p in request['parties']]}

Screening results: {json.dumps(hits, indent=2)}

Provide guidance on:
1. Risk assessment and mitigation
2. Due diligence recommendations
3. Documentation requirements
4. Regulatory compliance steps
5. Alternative approaches if issues found"""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            notes.append(f"AI Risk Analysis: {ai_response[:100]}...")
            notes.append("This is a simplified screening - use professional compliance services for actual transactions")
            
            return {
                "hits": hits,
                "notes": notes
            }
            
        except Exception as e:
            return {
                "hits": [],
                "notes": [f"Compliance screening error: {str(e)}"]
            }

    async def suggest_payment_methods(self, request: PaymentMethodsRequest) -> PaymentMethodsResponse:
        """Suggest optimal payment methods for country/transaction"""
        try:
            # Country-specific payment method recommendations
            country_methods = {
                "US": [{"type": "card", "scheme": "visa_mastercard", "processor": "Stripe", "score": 95}],
                "DE": [{"type": "bank_transfer", "scheme": "sepa", "processor": "Wise", "score": 90}],
                "TR": [{"type": "card", "scheme": "visa_mastercard", "processor": "İyzico", "score": 85}],
                "GB": [{"type": "card", "scheme": "visa_mastercard", "processor": "Stripe", "score": 92}],
                "JP": [{"type": "konbini", "scheme": "konbini", "processor": "GMO", "score": 88}]
            }
            
            methods = country_methods.get(request["country"], [
                {"type": "card", "scheme": "visa_mastercard", "processor": "Generic", "score": 70}
            ])
            
            # Add contextual notes
            for method in methods:
                if request["cart_total"] > 1000:
                    method["notes"] = "Suitable for high-value transactions"
                else:
                    method["notes"] = "Standard payment processing"
            
            # AI rationale
            prompt = f"""Recommend payment methods for this transaction:

Country: {request['country']}
Currency: {request['currency']}
Amount: {request['cart_total']} {request['currency']}

Available methods: {json.dumps(methods, indent=2)}

Provide rationale covering:
1. Why these methods are optimal for {request['country']}
2. Cost considerations
3. User experience factors
4. Risk and security aspects
5. Alternative methods to consider"""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            return {
                "methods": methods,
                "rationale": ai_response
            }
            
        except Exception as e:
            return {
                "methods": [],
                "rationale": f"Error in payment method suggestion: {str(e)}"
            }

    async def compute_tax(self, request: TaxComputeRequest) -> TaxComputeResponse:
        """Compute taxes based on jurisdiction and role"""
        try:
            # Tax computation logic (simplified)
            country = request["country"]
            role = request["role"]
            items = request["items"]
            
            total_tax = 0.0
            tax_lines = []
            
            # Country-specific tax rates
            tax_rates = {
                "US": 0.0875,   # Average sales tax
                "DE": 0.19,     # VAT
                "GB": 0.20,     # VAT
                "TR": 0.18,     # KDV
                "JP": 0.10      # Consumption tax
            }
            
            base_rate = tax_rates.get(country, 0.0)
            
            for item in items:
                item_tax = item["price"] * base_rate
                
                # B2B exemptions
                if role == "merchant_of_record" and country in ["DE", "GB"]:
                    item_tax = 0.0  # B2B reverse charge
                
                total_tax += item_tax
                tax_lines.append({
                    "sku": item["sku"],
                    "rate": base_rate,
                    "amount": item_tax
                })
            
            # Required invoice fields
            required_fields = ["seller_info", "buyer_info", "tax_breakdown"]
            if country in ["DE", "GB", "TR"]:
                required_fields.extend(["vat_number", "tax_id"])
            
            return {
                "total_tax": total_tax,
                "lines": tax_lines,
                "invoice": {"required_fields": required_fields}
            }
            
        except Exception as e:
            return {
                "total_tax": 0.0,
                "lines": [],
                "invoice": {"required_fields": []}
            }

    async def get_trade_insights(self, query: str, context: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Get AI-powered trade insights for any query"""
        try:
            prompt = f"""Provide expert trade intelligence for this query:

Query: {query}
Context: {json.dumps(context)}

As the #1 AI trade expert, provide comprehensive analysis covering:
1. Direct answer to the query
2. Relevant trade regulations
3. Cost implications
4. Risk considerations
5. Best practices and recommendations
6. Relevant Incoterms, HS codes, or procedures
7. Market intelligence if applicable

Be specific, actionable, and include confidence levels for key recommendations."""

            ai_response = await self.chat.send_message(UserMessage(text=prompt))
            
            return {
                "insights": ai_response,
                "confidence": 0.85,
                "sources": ["AI Trade Intelligence", "Global Trade Knowledge Base"],
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "insights": f"Error generating trade insights: {str(e)}",
                "confidence": 0.0,
                "sources": [],
                "timestamp": datetime.utcnow().isoformat()
            }

# Global trade domain service instance
ai_domain_service = AIDomainService()