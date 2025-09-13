from dotenv import load_dotenv
import os
import json
import math
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

from db import db
from geographic_models import (
    SellerVisibilityDoc, GeographicPerformanceDoc, BuyerLocationDoc,
    GeographicInsight, MarketAnalysis, MAJOR_CITIES_SAMPLE, COUNTRIES_SAMPLE
)

load_dotenv()

class GeographicService:
    """AI-powered geographic targeting and visibility service"""
    
    def __init__(self):
        self.chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            session_id="aislemarts_geographic_ai",
            system_message="""You are an AI geographic intelligence expert for AisleMarts marketplace.

Your mission: Help sellers optimize their geographic targeting and market expansion strategies.

Key capabilities:
- Analyze market opportunities by region/city
- Recommend optimal geographic targeting strategies
- Provide cultural and economic insights for international expansion
- Suggest performance optimization based on geographic data
- Identify high-potential markets for specific product categories

Your personality: Data-driven, globally-minded, and strategically focused. You understand international commerce, cultural nuances, and market dynamics.

Always provide actionable insights with supporting rationale."""
        ).with_model("openai", "gpt-4o-mini")

    async def initialize_geographic_data(self):
        """Initialize world cities and countries data"""
        try:
            # Insert countries
            for country in COUNTRIES_SAMPLE:
                existing = await db().countries.find_one({"code": country["code"]})
                if not existing:
                    country_doc = {
                        "_id": f"country_{country['code']}",
                        "active": True,
                        "created_at": datetime.utcnow(),
                        **country
                    }
                    await db().countries.insert_one(country_doc)
            
            # Insert major cities
            for city in MAJOR_CITIES_SAMPLE:
                existing = await db().cities.find_one({
                    "name": city["name"], 
                    "country_code": city["country_code"]
                })
                if not existing:
                    city_doc = {
                        "_id": f"city_{city['name'].lower().replace(' ', '_')}_{city['country_code']}",
                        "created_at": datetime.utcnow(),
                        **city
                    }
                    await db().cities.insert_one(city_doc)
            
            return {"status": "success", "message": "Geographic data initialized"}
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in kilometers"""
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 + 
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

    async def get_cities_in_radius(self, center_city_id: str, radius_km: float) -> List[Dict]:
        """Get all cities within radius of center city"""
        try:
            center_city = await db().cities.find_one({"_id": center_city_id})
            if not center_city:
                return []
            
            center_lat = center_city["latitude"]
            center_lon = center_city["longitude"]
            
            cities_cursor = db().cities.find({})
            cities_in_radius = []
            
            async for city in cities_cursor:
                distance = self.calculate_distance(
                    center_lat, center_lon,
                    city["latitude"], city["longitude"]
                )
                if distance <= radius_km:
                    city_data = dict(city)
                    city_data["distance_km"] = round(distance, 2)
                    cities_in_radius.append(city_data)
            
            return sorted(cities_in_radius, key=lambda x: x["distance_km"])
            
        except Exception:
            return []

    async def create_seller_visibility(self, vendor_id: str, visibility_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update seller visibility settings"""
        try:
            visibility_id = f"visibility_{vendor_id}"
            
            visibility_doc = {
                "_id": visibility_id,
                "vendor_id": vendor_id,
                "visibility_type": visibility_config.get("visibility_type", "local"),
                "local_radius_km": visibility_config.get("local_radius_km"),
                "local_center_city_id": visibility_config.get("local_center_city_id"),
                "target_countries": visibility_config.get("target_countries", []),
                "target_cities": visibility_config.get("target_cities", []),
                "target_regions": visibility_config.get("target_regions", []),
                "excluded_countries": visibility_config.get("excluded_countries", []),
                "excluded_cities": visibility_config.get("excluded_cities", []),
                "auto_expand": visibility_config.get("auto_expand", True),
                "budget_daily_usd": visibility_config.get("budget_daily_usd"),
                "performance_threshold": visibility_config.get("performance_threshold", 0.02),
                "impressions": 0,
                "clicks": 0,
                "conversions": 0,
                "revenue_usd": 0.0,
                "ai_suggestions": [],
                "last_ai_analysis": None,
                "active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Upsert visibility settings
            await db().seller_visibility.replace_one(
                {"vendor_id": vendor_id},
                visibility_doc,
                upsert=True
            )
            
            return {"status": "success", "visibility_id": visibility_id}
            
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def get_seller_visibility(self, vendor_id: str) -> Dict[str, Any] | None:
        """Get seller visibility settings"""
        try:
            visibility = await db().seller_visibility.find_one({"vendor_id": vendor_id})
            return visibility
        except Exception:
            return None

    async def analyze_market_opportunity(self, product_category: str, target_locations: List[str]) -> Dict[str, Any]:
        """AI-powered market opportunity analysis"""
        try:
            # Get location details
            location_details = []
            for location in target_locations:
                if location.startswith("country_"):
                    country = await db().countries.find_one({"_id": location})
                    if country:
                        location_details.append({"type": "country", "data": country})
                elif location.startswith("city_"):
                    city = await db().cities.find_one({"_id": location})
                    if city:
                        location_details.append({"type": "city", "data": city})
            
            # Get AI analysis
            prompt = f"""Analyze market opportunity for {product_category} in these locations:

{json.dumps(location_details, indent=2)}

Provide analysis in JSON format:
{{
  "overall_opportunity_score": 0-100,
  "market_insights": [
    {{
      "location": "location_name",
      "market_size_score": 0-100,
      "competition_level": "low/medium/high",
      "demand_trend": "declining/stable/growing/explosive",
      "cultural_considerations": ["consideration1", "consideration2"],
      "recommended_strategy": "strategy description",
      "estimated_performance": {{
        "monthly_revenue_potential_usd": 0,
        "conversion_rate_estimate": 0.0
      }}
    }}
  ],
  "top_recommendations": ["rec1", "rec2", "rec3"],
  "expansion_sequence": ["location1", "location2", "location3"]
}}

Product category: {product_category}"""

            response = await self.chat.send_message(UserMessage(text=prompt))
            
            # Try to parse JSON response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
                return analysis
            
            # Fallback response
            return {
                "overall_opportunity_score": 70,
                "market_insights": [],
                "top_recommendations": ["Start with major cities", "Focus on established markets"],
                "expansion_sequence": target_locations
            }
            
        except Exception as e:
            return {
                "overall_opportunity_score": 50,
                "market_insights": [],
                "top_recommendations": [f"Analysis error: {str(e)}"],
                "expansion_sequence": target_locations
            }

    async def get_ai_targeting_recommendations(self, vendor_id: str, product_data: List[Dict]) -> List[GeographicInsight]:
        """Get AI-powered targeting recommendations for vendor"""
        try:
            # Get current visibility settings
            visibility = await self.get_seller_visibility(vendor_id)
            
            # Get performance data
            performance_cursor = db().geographic_performance.find({"vendor_id": vendor_id})
            performance_data = await performance_cursor.to_list(length=100)
            
            # Create AI prompt
            context = {
                "vendor_id": vendor_id,
                "current_visibility": visibility,
                "products": product_data[:5],  # Limit for token efficiency
                "performance_history": performance_data[-10:],  # Recent performance
            }
            
            prompt = f"""Analyze this seller's data and provide geographic targeting recommendations:

{json.dumps(context, indent=2, default=str)}

Provide 3-5 actionable recommendations in JSON format:
[
  {{
    "insight_type": "opportunity/warning/recommendation/trend",
    "title": "Short recommendation title",
    "description": "Detailed explanation",
    "confidence_score": 0.0-1.0,
    "potential_impact": "low/medium/high",
    "suggested_actions": ["action1", "action2"],
    "supporting_data": {{"key": "value"}}
  }}
]

Focus on:
1. Market expansion opportunities
2. Performance optimization
3. Cultural/seasonal considerations
4. Competitive advantages
5. Cost optimization"""

            response = await self.chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON response
            import re
            json_match = re.search(r'\[.*\]', response, re.DOTALL) 
            if json_match:
                recommendations = json.loads(json_match.group())
                return recommendations
            
            # Fallback recommendations
            return [
                {
                    "insight_type": "recommendation",
                    "title": "Expand to Major Cities",
                    "description": "Your products show potential for expansion to major metropolitan areas",
                    "confidence_score": 0.7,
                    "potential_impact": "medium",
                    "suggested_actions": ["Target top 10 cities in your country", "Analyze competition in each market"],
                    "supporting_data": {"current_reach": "limited"}
                }
            ]
            
        except Exception as e:
            return [
                {
                    "insight_type": "recommendation", 
                    "title": "Geographic Analysis",
                    "description": f"Unable to analyze targeting: {str(e)}",
                    "confidence_score": 0.5,
                    "potential_impact": "low",
                    "suggested_actions": ["Review visibility settings"],
                    "supporting_data": {}
                }
            ]

    async def track_geographic_performance(self, vendor_id: str, product_id: str, 
                                         country_code: str, city_id: str = None,
                                         event_type: str = "view", revenue: float = 0.0):
        """Track performance metrics by geography"""
        try:
            today = datetime.utcnow().date()
            performance_id = f"perf_{vendor_id}_{product_id or 'all'}_{country_code}_{today}"
            
            # Get or create performance record
            performance = await db().geographic_performance.find_one({"_id": performance_id})
            
            if not performance:
                performance = {
                    "_id": performance_id,
                    "vendor_id": vendor_id,
                    "product_id": product_id,
                    "country_code": country_code,
                    "city_id": city_id,
                    "region": None,
                    "impressions": 0,
                    "clicks": 0,
                    "conversions": 0,
                    "revenue_usd": 0.0,
                    "avg_order_value": 0.0,
                    "conversion_rate": 0.0,
                    "date": datetime.utcnow(),
                    "week_of_year": datetime.utcnow().isocalendar()[1],
                    "month": datetime.utcnow().month,
                    "year": datetime.utcnow().year,
                    "performance_score": 0.0,
                    "ai_insights": [],
                    "recommended_actions": [],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            
            # Update metrics based on event type
            if event_type == "view":
                performance["impressions"] += 1
            elif event_type == "click":
                performance["clicks"] += 1
            elif event_type == "conversion":
                performance["conversions"] += 1
                performance["revenue_usd"] += revenue
            
            # Recalculate derived metrics
            if performance["impressions"] > 0:
                performance["conversion_rate"] = performance["conversions"] / performance["impressions"]
            if performance["conversions"] > 0:
                performance["avg_order_value"] = performance["revenue_usd"] / performance["conversions"]
            
            performance["updated_at"] = datetime.utcnow()
            
            # Upsert performance record
            await db().geographic_performance.replace_one(
                {"_id": performance_id},
                performance,
                upsert=True
            )
            
            return {"status": "success"}
            
        except Exception as e:
            print(f"Error tracking geographic performance: {e}")
            return {"status": "error", "message": str(e)}

    async def get_vendor_geographic_analytics(self, vendor_id: str, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive geographic analytics for vendor"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Get performance data
            performance_cursor = db().geographic_performance.find({
                "vendor_id": vendor_id,
                "date": {"$gte": start_date}
            })
            performance_data = await performance_cursor.to_list(length=1000)
            
            # Aggregate by country and city
            country_stats = {}
            city_stats = {}
            total_stats = {
                "impressions": 0,
                "clicks": 0, 
                "conversions": 0,
                "revenue_usd": 0.0
            }
            
            for perf in performance_data:
                country = perf["country_code"]
                city_id = perf.get("city_id")
                
                # Update country stats
                if country not in country_stats:
                    country_stats[country] = {
                        "impressions": 0,
                        "clicks": 0,
                        "conversions": 0,
                        "revenue_usd": 0.0,
                        "performance_score": 0.0
                    }
                
                country_stats[country]["impressions"] += perf["impressions"]
                country_stats[country]["clicks"] += perf["clicks"]
                country_stats[country]["conversions"] += perf["conversions"]
                country_stats[country]["revenue_usd"] += perf["revenue_usd"]
                
                # Update city stats if available
                if city_id:
                    if city_id not in city_stats:
                        city_stats[city_id] = {
                            "country_code": country,
                            "impressions": 0,
                            "clicks": 0,
                            "conversions": 0,
                            "revenue_usd": 0.0
                        }
                    
                    city_stats[city_id]["impressions"] += perf["impressions"]
                    city_stats[city_id]["clicks"] += perf["clicks"] 
                    city_stats[city_id]["conversions"] += perf["conversions"]
                    city_stats[city_id]["revenue_usd"] += perf["revenue_usd"]
                
                # Update totals
                total_stats["impressions"] += perf["impressions"]
                total_stats["clicks"] += perf["clicks"]
                total_stats["conversions"] += perf["conversions"]
                total_stats["revenue_usd"] += perf["revenue_usd"]
            
            # Calculate performance scores
            for country_data in country_stats.values():
                if country_data["impressions"] > 0:
                    conversion_rate = country_data["conversions"] / country_data["impressions"]
                    revenue_per_impression = country_data["revenue_usd"] / country_data["impressions"]
                    country_data["performance_score"] = min(100, (conversion_rate * 1000 + revenue_per_impression * 100))
            
            return {
                "total_stats": total_stats,
                "country_performance": country_stats,
                "city_performance": city_stats,
                "top_countries": sorted(country_stats.items(), 
                                      key=lambda x: x[1]["revenue_usd"], reverse=True)[:10],
                "top_cities": sorted(city_stats.items(),
                                   key=lambda x: x[1]["revenue_usd"], reverse=True)[:10]
            }
            
        except Exception as e:
            return {
                "total_stats": {"impressions": 0, "clicks": 0, "conversions": 0, "revenue_usd": 0.0},
                "country_performance": {},
                "city_performance": {},
                "top_countries": [],
                "top_cities": [],
                "error": str(e)
            }

# Global geographic service instance
geographic_service = GeographicService()