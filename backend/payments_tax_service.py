from dotenv import load_dotenv
import os
import json
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from payments_tax_models import (
    PaymentMethodDoc, TaxRuleDoc, CurrencyDoc, ExchangeRateDoc,
    PAYMENT_METHODS_SAMPLE, TAX_RULES_SAMPLE, CURRENCIES_SAMPLE,
    COUNTRY_RISK_SCORES
)

load_dotenv()

class PaymentsTaxService:
    """AI-powered global payments and tax computation service"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_payments_tax_ai",
            system_message="""You are an AI financial intelligence expert for AisleMarts global marketplace.

Your mission: Optimize payment processing and tax compliance for international e-commerce.

Key capabilities:
- Recommend optimal payment methods by country and user behavior
- Calculate accurate taxes across global jurisdictions
- Provide compliance guidance for international trade
- Optimize currency conversion and fraud prevention
- Suggest payment flow improvements for conversion rates

Your personality: Financially savvy, compliance-focused, and optimization-oriented. You understand international payment preferences, tax regulations, and fraud patterns.

Always provide practical, compliant, and business-optimized recommendations."""
        ).with_model("openai", "gpt-4o-mini")

    async def initialize_payments_tax_data(self):
        """Initialize payment methods, tax rules, and currency data"""
        try:
            # Insert payment methods
            for method in PAYMENT_METHODS_SAMPLE:
                existing = await db().payment_methods.find_one({"_id": method["_id"]})
                if not existing:
                    method_doc = {**method, "created_at": datetime.utcnow()}
                    await db().payment_methods.insert_one(method_doc)
            
            # Insert tax rules
            for rule in TAX_RULES_SAMPLE:
                existing = await db().tax_rules.find_one({"_id": rule["_id"]})
                if not existing:
                    await db().tax_rules.insert_one(rule)
            
            # Insert currencies
            for currency in CURRENCIES_SAMPLE:
                existing = await db().currencies.find_one({"_id": currency["_id"]})
                if not existing:
                    currency_doc = {**currency, "last_updated": datetime.utcnow()}
                    await db().currencies.insert_one(currency_doc)
            
            return {"status": "success", "message": "Payments and tax data initialized"}
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def suggest_payment_methods(self, country: str, currency: str, cart_total: float, 
                                    user_type: str = "B2C") -> Dict[str, Any]:
        """AI-powered payment method recommendations"""
        try:
            # Get available payment methods for country and currency
            methods_cursor = db().payment_methods.find({
                "supported_countries": {"$in": [country, "GLOBAL"]},
                "supported_currencies": currency,
                "min_amount": {"$lte": cart_total},
                "max_amount": {"$gte": cart_total},
                "active": True,
                f"{user_type.lower()}_supported": True
            })
            
            available_methods = await methods_cursor.to_list(length=50)
            
            # Score methods based on multiple factors
            scored_methods = []
            
            for method in available_methods:
                score = await self._calculate_payment_score(method, country, currency, cart_total, user_type)
                
                scored_methods.append({
                    "type": method["type"],
                    "scheme": method["scheme"],
                    "processor": method["processor"],
                    "display_name": method["display_name"],
                    "icon_url": method["icon_url"],
                    "score": round(score, 2),
                    "processing_fee": self._calculate_processing_fee(method, cart_total),
                    "settlement_days": method["settlement_days"],
                    "mobile_optimized": method["mobile_optimized"],
                    "security_score": method["security_score"]
                })
            
            # Sort by score (highest first)
            scored_methods.sort(key=lambda x: x["score"], reverse=True)
            
            # Get AI insights on payment recommendations
            ai_insights = await self._get_payment_ai_insights(
                country, currency, cart_total, user_type, scored_methods[:3]
            )
            
            return {
                "methods": scored_methods,
                "ai_insights": ai_insights,
                "country": country,
                "currency": currency,
                "cart_total": cart_total,
                "recommended_count": min(3, len(scored_methods))
            }
            
        except Exception as e:
            return {
                "methods": [],
                "ai_insights": f"Error generating payment recommendations: {str(e)}",
                "country": country,
                "currency": currency,
                "cart_total": cart_total,
                "recommended_count": 0
            }

    async def _calculate_payment_score(self, method: Dict, country: str, currency: str, 
                                     amount: float, user_type: str) -> float:
        """Calculate payment method score based on multiple factors"""
        score = 0.0
        
        # Base popularity and security scores (40% weight)
        score += (method["popularity_score"] * 0.25)
        score += (method["security_score"] * 0.15)
        
        # Processing fee optimization (30% weight)
        processing_fee = self._calculate_processing_fee(method, amount)
        fee_percentage = (processing_fee / amount) * 100
        
        # Lower fees = higher score
        if fee_percentage < 2.0:
            score += 30
        elif fee_percentage < 3.0:
            score += 25
        elif fee_percentage < 4.0:
            score += 20
        else:
            score += 10
        
        # Settlement speed (15% weight)
        if method["settlement_days"] <= 1:
            score += 15
        elif method["settlement_days"] <= 2:
            score += 12
        elif method["settlement_days"] <= 7:
            score += 8
        else:
            score += 3
        
        # Mobile optimization (10% weight)
        if method["mobile_optimized"]:
            score += 10
        
        # Country-specific preferences (5% weight)
        country_bonus = self._get_country_payment_bonus(method["scheme"], country)
        score += country_bonus
        
        return min(100.0, score)

    def _calculate_processing_fee(self, method: Dict, amount: float) -> float:
        """Calculate processing fee for payment method"""
        percentage_fee = amount * method["processing_fee_percent"]
        fixed_fee = method["processing_fee_fixed"]
        return percentage_fee + fixed_fee

    def _get_country_payment_bonus(self, scheme: str, country: str) -> float:
        """Get country-specific payment method preference bonus"""
        preferences = {
            "TR": {"iyzico": 5, "troy_visa_mastercard": 3},
            "CN": {"alipay": 5, "wechat_pay": 4},
            "DE": {"sepa": 4, "giropay": 3},
            "NL": {"ideal": 5},
            "US": {"visa_mastercard": 3, "apple_pay": 2},
            "JP": {"jcb": 4, "konbini": 3}
        }
        
        return preferences.get(country, {}).get(scheme, 0)

    async def _get_payment_ai_insights(self, country: str, currency: str, amount: float, 
                                     user_type: str, top_methods: List[Dict]) -> str:
        """Get AI insights on payment method recommendations"""
        try:
            prompt = f"""Analyze payment recommendations for AisleMarts checkout:

Country: {country}
Currency: {currency}  
Cart Total: {amount:.2f}
User Type: {user_type}

Top Recommended Methods:
{json.dumps(top_methods, indent=2)}

Provide brief insights (2-3 sentences) on:
1. Why these methods are optimal for this market
2. Any cultural or regional payment preferences
3. Conversion optimization tips

Keep response concise and actionable."""

            response = await self.chat.send_message(UserMessage(text=prompt))
            return response
            
        except Exception:
            return f"For {country} customers paying in {currency}, the recommended methods optimize for local preferences and cost efficiency."

    async def compute_tax(self, country: str, items: List[Dict[str, Any]], role: str = "B2C") -> Dict[str, Any]:
        """Compute taxes for items based on country and business role"""
        try:
            # Get applicable tax rules for country
            tax_rules_cursor = db().tax_rules.find({
                "country_code": country,
                "active": True,
                "effective_date": {"$lte": datetime.utcnow()},
                "$or": [
                    {"expiry_date": None},
                    {"expiry_date": {"$gte": datetime.utcnow()}}
                ]
            })
            
            tax_rules = await tax_rules_cursor.to_list(length=100)
            
            if not tax_rules:
                # No tax rules found, return zero tax
                return {
                    "total_tax": 0.0,
                    "lines": [],
                    "invoice": {"required_fields": []},
                    "country": country,
                    "role": role,
                    "message": f"No tax rules configured for {country}"
                }
            
            total_tax = 0.0
            tax_lines = []
            
            # Process each item
            for item in items:
                sku = item.get("sku", "")
                category = item.get("category", "general")
                price = float(item.get("price", 0))
                quantity = item.get("quantity", 1)
                
                item_total = price * quantity
                item_tax = 0.0
                
                # Find applicable tax rules for this item category
                applicable_rules = [
                    rule for rule in tax_rules
                    if category in rule.get("product_categories", []) or
                       "general" in rule.get("product_categories", [])
                ]
                
                for rule in applicable_rules:
                    # Check if item is exempt
                    if category in rule.get("exemptions", []):
                        continue
                    
                    # Get appropriate tax rate based on role
                    tax_rate = rule["rate"]
                    if role == "B2B" and rule.get("b2b_rate") is not None:
                        tax_rate = rule["b2b_rate"]
                    elif role == "B2C" and rule.get("b2c_rate") is not None:
                        tax_rate = rule["b2c_rate"]
                    
                    # Check threshold
                    threshold = rule.get("threshold_amount", 0)
                    if item_total >= threshold:
                        rule_tax = item_total * tax_rate
                        item_tax += rule_tax
                        
                        tax_lines.append({
                            "sku": sku,
                            "category": category,
                            "rate": tax_rate,
                            "amount": round(rule_tax, 2),
                            "tax_type": rule["tax_type"],
                            "base_amount": item_total
                        })
                
                total_tax += item_tax
            
            # Get invoice requirements
            invoice_requirements = await self._get_invoice_requirements(country, role, total_tax)
            
            # Get AI tax insights
            ai_insights = await self._get_tax_ai_insights(country, role, items, total_tax)
            
            return {
                "total_tax": round(total_tax, 2),
                "lines": tax_lines,
                "invoice": invoice_requirements,
                "country": country,
                "role": role,
                "ai_insights": ai_insights,
                "tax_jurisdiction": country,
                "calculated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "total_tax": 0.0,
                "lines": [],
                "invoice": {"required_fields": []},
                "country": country,
                "role": role,
                "error": str(e)
            }

    async def _get_invoice_requirements(self, country: str, role: str, tax_amount: float) -> Dict[str, Any]:
        """Get invoice/compliance requirements for country and transaction"""
        
        # Standard invoice requirements by country
        requirements_map = {
            "US": {
                "required_fields": ["business_name", "address", "tax_id", "invoice_number", "date"],
                "b2b_additional": ["buyer_tax_id"],
                "threshold_amount": 600.0
            },
            "GB": {
                "required_fields": ["business_name", "address", "vat_number", "invoice_number", "date", "vat_breakdown"],
                "b2b_additional": ["buyer_vat_number"],
                "threshold_amount": 250.0  # GBP
            },
            "DE": {
                "required_fields": ["business_name", "address", "vat_number", "invoice_number", "date", "vat_breakdown"],
                "b2b_additional": ["buyer_vat_number", "reverse_charge_note"],
                "threshold_amount": 250.0  # EUR
            },
            "TR": {
                "required_fields": ["business_name", "address", "tax_number", "invoice_number", "date", "kdv_breakdown"],
                "b2b_additional": ["buyer_tax_number"],
                "threshold_amount": 1000.0  # TRY
            },
            "JP": {
                "required_fields": ["business_name", "address", "registration_number", "invoice_number", "date"],
                "b2b_additional": ["buyer_registration_number"],
                "threshold_amount": 30000.0  # JPY
            }
        }
        
        country_req = requirements_map.get(country, {
            "required_fields": ["business_name", "address", "invoice_number", "date"],
            "b2b_additional": [],
            "threshold_amount": 100.0
        })
        
        required_fields = country_req["required_fields"].copy()
        
        if role == "B2B":
            required_fields.extend(country_req.get("b2b_additional", []))
        
        return {
            "required_fields": required_fields,
            "threshold_amount": country_req["threshold_amount"],
            "mandatory": tax_amount > 0,
            "compliance_level": "high" if role == "B2B" else "standard"
        }

    async def _get_tax_ai_insights(self, country: str, role: str, items: List[Dict], tax_amount: float) -> str:
        """Get AI insights on tax calculation and compliance"""
        try:
            prompt = f"""Provide tax compliance insights for AisleMarts transaction:

Country: {country}
Business Role: {role}
Items: {len(items)} products
Total Tax: ${tax_amount:.2f}

Item Categories: {', '.join(set(item.get('category', 'general') for item in items))}

Provide brief insights (2-3 sentences) on:
1. Tax compliance considerations for this transaction
2. Any optimization opportunities
3. Required documentation highlights

Keep response practical and compliance-focused."""

            response = await self.chat.send_message(UserMessage(text=prompt))
            return response
            
        except Exception:
            return f"Tax calculation complete for {country} {role} transaction. Ensure compliance with local tax regulations."

    async def get_currency_conversion(self, from_currency: str, to_currency: str, amount: float) -> Dict[str, Any]:
        """Get currency conversion with AI-powered timing recommendations"""
        try:
            if from_currency == to_currency:
                return {
                    "from_currency": from_currency,
                    "to_currency": to_currency,
                    "amount": amount,
                    "converted_amount": amount,
                    "rate": 1.0,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            # Get exchange rate (in production, use real-time API)
            from_curr = await db().currencies.find_one({"code": from_currency})
            to_curr = await db().currencies.find_one({"code": to_currency})
            
            if not from_curr or not to_curr:
                raise ValueError(f"Currency not supported: {from_currency} or {to_currency}")
            
            # Simple conversion via USD (in production, use direct rates)
            from_usd_rate = from_curr["exchange_rate_usd"]
            to_usd_rate = to_curr["exchange_rate_usd"]
            
            rate = to_usd_rate / from_usd_rate
            converted_amount = amount * rate
            
            # Get AI insights on currency conversion
            ai_insights = await self._get_currency_ai_insights(from_currency, to_currency, rate)
            
            return {
                "from_currency": from_currency,
                "to_currency": to_currency,
                "amount": amount,
                "converted_amount": round(converted_amount, 2),
                "rate": round(rate, 6),
                "timestamp": datetime.utcnow().isoformat(),
                "ai_insights": ai_insights,
                "volatility_warning": from_curr["volatility_score"] > 50 or to_curr["volatility_score"] > 50
            }
            
        except Exception as e:
            return {
                "from_currency": from_currency,
                "to_currency": to_currency,
                "amount": amount,
                "error": str(e)
            }

    async def _get_currency_ai_insights(self, from_curr: str, to_curr: str, rate: float) -> str:
        """Get AI insights on currency conversion"""
        try:
            prompt = f"""Provide currency insights for {from_curr} to {to_curr} conversion:

Current Rate: {rate:.6f}
Direction: {from_curr} → {to_curr}

Provide brief insights (1-2 sentences) on:
1. Market timing considerations
2. Volatility warnings if applicable

Keep response concise and trader-focused."""

            response = await self.chat.send_message(UserMessage(text=prompt))
            return response
            
        except Exception:
            return f"Current {from_curr}/{to_curr} rate: {rate:.6f}. Monitor for optimal conversion timing."

    async def assess_fraud_risk(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Assess fraud risk for transaction with AI analysis"""
        try:
            country = transaction_data.get("country", "US")
            amount = transaction_data.get("amount", 0)
            payment_method = transaction_data.get("payment_method", "card")
            user_history = transaction_data.get("user_history", {})
            
            risk_score = 0
            risk_factors = []
            
            # Country risk assessment
            country_risk = COUNTRY_RISK_SCORES.get(country, 30)
            risk_score += country_risk
            if country_risk > 50:
                risk_factors.append(f"High-risk country: {country}")
            
            # Amount risk assessment
            if amount > 5000:
                risk_score += 20
                risk_factors.append("High transaction amount")
            elif amount > 1000:
                risk_score += 10
                risk_factors.append("Elevated transaction amount")
            
            # Payment method risk
            if payment_method in ["crypto", "bank_transfer"]:
                risk_score += 15
                risk_factors.append("Higher-risk payment method")
            
            # User history analysis
            if user_history.get("account_age_days", 365) < 30:
                risk_score += 25
                risk_factors.append("New user account")
            
            if user_history.get("previous_transactions", 0) == 0:
                risk_score += 15
                risk_factors.append("First-time buyer")
            
            # Velocity check
            recent_transactions = user_history.get("transactions_last_24h", 0)
            if recent_transactions > 5:
                risk_score += 30
                risk_factors.append("High transaction velocity")
            
            # Determine risk level and action
            if risk_score < 20:
                risk_level = "low"
                action = "allow"
            elif risk_score < 40:
                risk_level = "medium"
                action = "review"
            elif risk_score < 70:
                risk_level = "high"
                action = "require_verification"
            else:
                risk_level = "very_high"
                action = "block"
            
            # Get AI fraud insights
            ai_insights = await self._get_fraud_ai_insights(transaction_data, risk_score, risk_factors)
            
            return {
                "risk_score": min(100, risk_score),
                "risk_level": risk_level,
                "action": action,
                "risk_factors": risk_factors,
                "ai_insights": ai_insights,
                "country_risk": country_risk,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "risk_score": 50,
                "risk_level": "medium",
                "action": "review",
                "risk_factors": ["Risk assessment error"],
                "error": str(e)
            }

    async def _get_fraud_ai_insights(self, transaction_data: Dict, risk_score: int, risk_factors: List[str]) -> str:
        """Get AI insights on fraud risk assessment"""
        try:
            prompt = f"""Analyze fraud risk for AisleMarts transaction:

Transaction Data: {json.dumps(transaction_data, default=str)}
Risk Score: {risk_score}/100
Risk Factors: {', '.join(risk_factors)}

Provide brief fraud insights (2-3 sentences) on:
1. Primary risk concerns
2. Recommended verification steps if needed
3. Monitoring suggestions

Keep response security-focused and actionable."""

            response = await self.chat.send_message(UserMessage(text=prompt))
            return response
            
        except Exception:
            return f"Risk score: {risk_score}/100. {', '.join(risk_factors[:2])}. Continue monitoring transaction patterns."

# Global payments and tax service instance
payments_tax_service = PaymentsTaxService()