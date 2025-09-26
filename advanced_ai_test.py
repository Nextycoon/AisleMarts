#!/usr/bin/env python3
"""
Advanced AI & Personalization Engine Backend Testing Suite
Testing comprehensive AI capabilities for AisleMarts platform
"""

import asyncio
import aiohttp
import json
import time
import uuid
from datetime import datetime
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://marketplace-docs.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api/advanced-ai"

class AdvancedAITester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    async def setup(self):
        """Setup test session"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        
    async def cleanup(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
            
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"    Details: {details}")
            
    async def test_health_check(self):
        """Test Advanced AI Engine Health Check"""
        try:
            async with self.session.get(f"{API_BASE}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate health check response structure
                    required_fields = ["status", "service", "ai_capabilities", "ai_models_active", "emergent_llm_integration"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Advanced AI Health Check", False, f"Missing fields: {missing_fields}")
                        return
                        
                    # Check AI capabilities
                    expected_capabilities = [
                        "visual_product_recognition", "behavioral_analysis", "emotional_intelligence",
                        "trend_prediction", "content_virality_prediction", "personalized_recommendations",
                        "smart_pricing_optimization", "ai_content_generation", "ai_insight_generation"
                    ]
                    
                    capabilities = data.get("ai_capabilities", [])
                    missing_capabilities = [cap for cap in expected_capabilities if cap not in capabilities]
                    
                    if missing_capabilities:
                        self.log_test("Advanced AI Health Check", False, f"Missing AI capabilities: {missing_capabilities}")
                        return
                        
                    # Check AI models status
                    models_active = data.get("ai_models_active", {})
                    inactive_models = [model for model, status in models_active.items() if not status]
                    
                    details = f"Service: {data.get('service')}, LLM Integration: {data.get('emergent_llm_integration')}, Active Models: {len([m for m in models_active.values() if m])}/{len(models_active)}"
                    
                    if inactive_models:
                        details += f", Inactive Models: {inactive_models}"
                        
                    self.log_test("Advanced AI Health Check", True, details, data)
                else:
                    self.log_test("Advanced AI Health Check", False, f"HTTP {response.status}")
                    
        except Exception as e:
            self.log_test("Advanced AI Health Check", False, f"Exception: {str(e)}")
            
    async def test_visual_product_recognition(self):
        """Test Visual Product Recognition"""
        test_image_url = "https://images.unsplash.com/photo-1441986300917-64674bd600d8"
        
        try:
            params = {
                "image_url": test_image_url,
                "analysis_depth": "standard",
                "include_price_estimation": "true",
                "include_style_analysis": "true",
                "include_similar_products": "true"
            }
            
            async with self.session.post(f"{API_BASE}/visual/recognize", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["id", "image_url", "detected_products", "confidence_scores"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Visual Product Recognition", False, f"Missing fields: {missing_fields}")
                        return
                        
                    # Check if products were detected
                    detected_products = data.get("detected_products", [])
                    confidence_scores = data.get("confidence_scores", {})
                    
                    details = f"Products detected: {len(detected_products)}, Overall confidence: {confidence_scores.get('overall', 0):.2f}"
                    
                    if data.get("price_estimation"):
                        price_est = data["price_estimation"]
                        details += f", Price estimate: ${price_est.get('predicted_usd', 0):.2f}"
                        
                    self.log_test("Visual Product Recognition", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("Visual Product Recognition", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("Visual Product Recognition", False, f"Exception: {str(e)}")
            
    async def test_user_behavior_analysis(self):
        """Test User Behavior Analysis"""
        test_user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        session_data = {
            "session_id": f"session_{uuid.uuid4().hex[:8]}",
            "pages_visited": 15,
            "time_spent": 1200,
            "actions": ["view_product", "add_to_cart", "like_post"]
        }
        
        try:
            params = {
                "user_id": test_user_id,
                "session_data": json.dumps(session_data),
                "analysis_depth": "comprehensive",
                "include_predictions": "true"
            }
            
            async with self.session.post(f"{API_BASE}/behavior/analyze", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["user_id", "browsing_patterns", "purchase_probability", "engagement_score"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("User Behavior Analysis", False, f"Missing fields: {missing_fields}")
                        return
                        
                    purchase_prob = data.get("purchase_probability", 0)
                    engagement_score = data.get("engagement_score", 0)
                    
                    details = f"Purchase probability: {purchase_prob:.2f}, Engagement score: {engagement_score:.2f}"
                    
                    if data.get("conversion_likelihood"):
                        conv_likelihood = data["conversion_likelihood"]
                        details += f", 24h conversion: {conv_likelihood.get('within_24h', 0):.2f}"
                        
                    self.log_test("User Behavior Analysis", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("User Behavior Analysis", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("User Behavior Analysis", False, f"Exception: {str(e)}")
            
    async def test_emotional_intelligence(self):
        """Test Emotional Intelligence System"""
        test_user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        context_data = {
            "recent_activity": "browsing_wellness_products",
            "time_of_day": "evening",
            "weather": "rainy",
            "social_context": "alone"
        }
        
        try:
            params = {
                "user_id": test_user_id,
                "context": json.dumps(context_data),
                "include_mood_history": True,
                "include_recommendations": True
            }
            
            async with self.session.post(f"{API_BASE}/emotions/analyze", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["user_id", "current_mood", "mood_confidence", "emotional_triggers"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Emotional Intelligence Analysis", False, f"Missing fields: {missing_fields}")
                        return
                        
                    current_mood = data.get("current_mood")
                    mood_confidence = data.get("mood_confidence", 0)
                    emotional_triggers = data.get("emotional_triggers", [])
                    
                    details = f"Current mood: {current_mood}, Confidence: {mood_confidence:.2f}, Triggers: {len(emotional_triggers)}"
                    
                    if data.get("mood_based_recommendations"):
                        recommendations = data["mood_based_recommendations"]
                        details += f", Recommendations: {len(recommendations)}"
                        
                    self.log_test("Emotional Intelligence Analysis", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("Emotional Intelligence Analysis", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("Emotional Intelligence Analysis", False, f"Exception: {str(e)}")
            
    async def test_mood_categories(self):
        """Test Mood Categories Endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/emotions/moods/categories") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["mood_categories", "descriptions"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Mood Categories", False, f"Missing fields: {missing_fields}")
                        return
                        
                    mood_categories = data.get("mood_categories", [])
                    descriptions = data.get("descriptions", {})
                    
                    details = f"Categories available: {len(mood_categories)}, Descriptions: {len(descriptions)}"
                    
                    # Check for expected mood categories
                    expected_moods = ["happy", "excited", "relaxed", "stressed", "inspired"]
                    available_moods = [mood for mood in expected_moods if mood in mood_categories]
                    
                    details += f", Expected moods available: {len(available_moods)}/{len(expected_moods)}"
                    
                    self.log_test("Mood Categories", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("Mood Categories", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("Mood Categories", False, f"Exception: {str(e)}")
            
    async def test_trend_prediction(self):
        """Test Trend Prediction Engine"""
        categories = ["fashion", "technology", "lifestyle"]
        geographic_scope = ["north_america", "europe", "asia_pacific"]
        
        try:
            params = {
                "categories": json.dumps(categories),
                "time_horizon": "30d",
                "geographic_scope": json.dumps(geographic_scope),
                "confidence_threshold": 0.7,
                "include_predictions": True
            }
            
            async with self.session.post(f"{API_BASE}/trends/predict", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not isinstance(data, list):
                        self.log_test("Trend Prediction", False, "Response should be a list of trends")
                        return
                        
                    if len(data) == 0:
                        self.log_test("Trend Prediction", False, "No trends predicted")
                        return
                        
                    # Validate trend structure
                    first_trend = data[0]
                    required_fields = ["id", "trend_category", "trend_name", "prediction_confidence"]
                    missing_fields = [field for field in required_fields if field not in first_trend]
                    
                    if missing_fields:
                        self.log_test("Trend Prediction", False, f"Missing fields in trend: {missing_fields}")
                        return
                        
                    high_confidence_trends = [t for t in data if t.get("prediction_confidence", 0) >= 0.8]
                    avg_confidence = sum(t.get("prediction_confidence", 0) for t in data) / len(data)
                    
                    details = f"Trends predicted: {len(data)}, High confidence (>0.8): {len(high_confidence_trends)}, Avg confidence: {avg_confidence:.2f}"
                    
                    self.log_test("Trend Prediction", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("Trend Prediction", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("Trend Prediction", False, f"Exception: {str(e)}")
            
    async def test_content_virality_prediction(self):
        """Test Content Virality Prediction"""
        content_id = f"content_{uuid.uuid4().hex[:8]}"
        content_data = {
            "type": "post",
            "title": "Amazing New Fashion Trend for 2025",
            "description": "Discover the latest sustainable fashion trend that's taking social media by storm",
            "hashtags": ["#fashion", "#sustainable", "#trend2025"],
            "media_type": "image",
            "target_audience": "gen_z_millennial"
        }
        
        try:
            params = {
                "content_id": content_id,
                "content_data": json.dumps(content_data),
                "include_optimization": True
            }
            
            async with self.session.post(f"{API_BASE}/content/predict-virality", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["content_id", "content_type", "virality_score", "predicted_reach"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Content Virality Prediction", False, f"Missing fields: {missing_fields}")
                        return
                        
                    virality_score = data.get("virality_score", 0)
                    predicted_reach = data.get("predicted_reach", 0)
                    predicted_engagement = data.get("predicted_engagement", 0)
                    
                    details = f"Virality score: {virality_score:.1f}/10, Predicted reach: {predicted_reach:,}, Engagement: {predicted_engagement:,}"
                    
                    if data.get("hashtag_recommendations"):
                        hashtags = data["hashtag_recommendations"]
                        details += f", Hashtag suggestions: {len(hashtags)}"
                        
                    self.log_test("Content Virality Prediction", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("Content Virality Prediction", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("Content Virality Prediction", False, f"Exception: {str(e)}")
            
    async def test_personalized_recommendations(self):
        """Test Personalized Recommendations"""
        test_user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        context_data = {
            "current_location": "new_york",
            "time_of_day": "evening",
            "recent_purchases": ["fashion", "electronics"],
            "browsing_history": ["sustainable_fashion", "tech_gadgets"]
        }
        
        try:
            params = {
                "user_id": test_user_id,
                "content_type": "product",
                "category": "fashion",
                "context": json.dumps(context_data),
                "personalization_level": "advanced",
                "include_explanations": True
            }
            
            async with self.session.post(f"{API_BASE}/recommendations/generate", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not isinstance(data, list):
                        self.log_test("Personalized Recommendations", False, "Response should be a list of recommendations")
                        return
                        
                    if len(data) == 0:
                        self.log_test("Personalized Recommendations", False, "No recommendations generated")
                        return
                        
                    # Validate recommendation structure
                    first_rec = data[0]
                    required_fields = ["user_id", "recommendation_type", "item_id", "relevance_score"]
                    missing_fields = [field for field in required_fields if field not in first_rec]
                    
                    if missing_fields:
                        self.log_test("Personalized Recommendations", False, f"Missing fields in recommendation: {missing_fields}")
                        return
                        
                    avg_relevance = sum(r.get("relevance_score", 0) for r in data) / len(data)
                    high_relevance_count = len([r for r in data if r.get("relevance_score", 0) >= 0.8])
                    
                    details = f"Recommendations: {len(data)}, Avg relevance: {avg_relevance:.2f}, High relevance (>0.8): {high_relevance_count}"
                    
                    self.log_test("Personalized Recommendations", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("Personalized Recommendations", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("Personalized Recommendations", False, f"Exception: {str(e)}")
            
    async def test_smart_pricing_optimization(self):
        """Test Smart Pricing Optimization"""
        product_id = f"product_{uuid.uuid4().hex[:8]}"
        seller_id = f"seller_{uuid.uuid4().hex[:8]}"
        market_data = {
            "current_price": 99.99,
            "competitor_prices": [89.99, 109.99, 95.00, 105.00],
            "demand_level": "high",
            "inventory_level": 45,
            "seasonal_factor": 1.1,
            "category": "fashion"
        }
        
        try:
            params = {
                "product_id": product_id,
                "seller_id": seller_id,
                "market_data": json.dumps(market_data),
                "include_dynamic_triggers": True,
                "include_personalized_pricing": True
            }
            
            async with self.session.post(f"{API_BASE}/pricing/optimize", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["product_id", "seller_id", "current_price", "optimal_price_range"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("Smart Pricing Optimization", False, f"Missing fields: {missing_fields}")
                        return
                        
                    current_price = data.get("current_price", 0)
                    optimal_range = data.get("optimal_price_range", {})
                    recommended_price = optimal_range.get("recommended_price", 0)
                    
                    details = f"Current: ${current_price:.2f}, Recommended: ${recommended_price:.2f}"
                    
                    if data.get("dynamic_pricing_triggers"):
                        triggers = data["dynamic_pricing_triggers"]
                        details += f", Dynamic triggers: {len(triggers)}"
                        
                    if data.get("personalized_pricing"):
                        personalized = data["personalized_pricing"]
                        details += f", Personalized segments: {len(personalized)}"
                        
                    self.log_test("Smart Pricing Optimization", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("Smart Pricing Optimization", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("Smart Pricing Optimization", False, f"Exception: {str(e)}")
            
    async def test_ai_content_generation(self):
        """Test AI Content Generation"""
        parameters = {
            "topic": "sustainable fashion trends 2025",
            "length": "medium",
            "tone": "inspirational",
            "call_to_action": "shop_now"
        }
        
        style_preferences = {
            "style": "modern",
            "voice": "friendly",
            "format": "engaging"
        }
        
        target_audience = {
            "age_group": "25-35",
            "interests": ["fashion", "sustainability", "lifestyle"],
            "platform": "instagram"
        }
        
        brand_voice = {
            "personality": "innovative",
            "values": ["sustainability", "quality", "inclusivity"],
            "tone": "approachable"
        }
        
        try:
            params = {
                "content_type": "post",
                "parameters": json.dumps(parameters),
                "style_preferences": json.dumps(style_preferences),
                "target_audience": json.dumps(target_audience),
                "brand_voice": json.dumps(brand_voice)
            }
            
            async with self.session.post(f"{API_BASE}/content/generate", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["id", "content_type", "generated_content", "quality_score"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("AI Content Generation", False, f"Missing fields: {missing_fields}")
                        return
                        
                    content_type = data.get("content_type")
                    quality_score = data.get("quality_score", 0)
                    originality_score = data.get("originality_score", 0)
                    
                    details = f"Content type: {content_type}, Quality: {quality_score:.2f}, Originality: {originality_score:.2f}"
                    
                    if data.get("optimization_suggestions"):
                        suggestions = data["optimization_suggestions"]
                        details += f", Optimization tips: {len(suggestions)}"
                        
                    self.log_test("AI Content Generation", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("AI Content Generation", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("AI Content Generation", False, f"Exception: {str(e)}")
            
    async def test_ai_insights_generation(self):
        """Test AI Insights Engine"""
        data_sources = [
            "user_behavior_data",
            "sales_analytics",
            "market_trends",
            "competitor_analysis",
            "social_media_metrics"
        ]
        
        try:
            params = {
                "scope": "business_optimization",
                "data_sources": json.dumps(data_sources),
                "insight_types": json.dumps(["user_behavior_pattern", "market_opportunity"]),
                "min_confidence": 0.75
            }
            
            async with self.session.post(f"{API_BASE}/insights/generate", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if not isinstance(data, list):
                        self.log_test("AI Insights Generation", False, "Response should be a list of insights")
                        return
                        
                    if len(data) == 0:
                        self.log_test("AI Insights Generation", False, "No insights generated")
                        return
                        
                    # Validate insight structure
                    first_insight = data[0]
                    required_fields = ["insight_id", "insight_type", "title", "confidence_level"]
                    missing_fields = [field for field in required_fields if field not in first_insight]
                    
                    if missing_fields:
                        self.log_test("AI Insights Generation", False, f"Missing fields in insight: {missing_fields}")
                        return
                        
                    avg_confidence = sum(i.get("confidence_level", 0) for i in data) / len(data)
                    high_impact_count = len([i for i in data if i.get("impact_score", 0) >= 0.8])
                    
                    details = f"Insights generated: {len(data)}, Avg confidence: {avg_confidence:.2f}, High impact (>0.8): {high_impact_count}"
                    
                    self.log_test("AI Insights Generation", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("AI Insights Generation", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("AI Insights Generation", False, f"Exception: {str(e)}")
            
    async def test_ai_dashboard_overview(self):
        """Test AI Dashboard Overview"""
        try:
            async with self.session.get(f"{API_BASE}/dashboard/overview") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    expected_sections = ["ai_system_health", "intelligence_metrics", "personalization_stats", "business_impact"]
                    missing_sections = [section for section in expected_sections if section not in data]
                    
                    if missing_sections:
                        self.log_test("AI Dashboard Overview", False, f"Missing sections: {missing_sections}")
                        return
                        
                    ai_health = data.get("ai_system_health", {})
                    intelligence_metrics = data.get("intelligence_metrics", {})
                    business_impact = data.get("business_impact", {})
                    
                    details = f"System status: {ai_health.get('overall_status')}"
                    
                    if intelligence_metrics:
                        total_processed = sum(intelligence_metrics.values()) if isinstance(intelligence_metrics, dict) else 0
                        details += f", Total AI operations: {total_processed}"
                        
                    if business_impact.get("revenue_attribution"):
                        revenue = business_impact["revenue_attribution"]
                        details += f", Revenue attribution: ${revenue:,.0f}"
                        
                    self.log_test("AI Dashboard Overview", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("AI Dashboard Overview", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("AI Dashboard Overview", False, f"Exception: {str(e)}")
            
    async def test_ai_models_status(self):
        """Test AI Models Status"""
        try:
            async with self.session.get(f"{API_BASE}/models/status") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Validate response structure
                    required_fields = ["models", "overall_health", "emergent_llm_status"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test("AI Models Status", False, f"Missing fields: {missing_fields}")
                        return
                        
                    models = data.get("models", {})
                    overall_health = data.get("overall_health")
                    llm_status = data.get("emergent_llm_status")
                    
                    active_models = len([m for m in models.values() if m.get("status") == "active"])
                    
                    details = f"Models: {len(models)}, Active: {active_models}, Health: {overall_health}, LLM: {llm_status}"
                    
                    # Check model accuracy
                    accuracies = [m.get("accuracy", 0) for m in models.values() if m.get("accuracy")]
                    if accuracies:
                        avg_accuracy = sum(accuracies) / len(accuracies)
                        details += f", Avg accuracy: {avg_accuracy:.2f}"
                        
                    self.log_test("AI Models Status", True, details, data)
                else:
                    error_text = await response.text()
                    self.log_test("AI Models Status", False, f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            self.log_test("AI Models Status", False, f"Exception: {str(e)}")
            
    async def run_all_tests(self):
        """Run all Advanced AI & Personalization Engine tests"""
        print("🤖✨ ADVANCED AI & PERSONALIZATION ENGINE BACKEND TESTING")
        print("=" * 70)
        print(f"Testing against: {API_BASE}")
        print()
        
        start_time = time.time()
        
        # Core AI Engine Tests
        await self.test_health_check()
        await self.test_ai_models_status()
        await self.test_ai_dashboard_overview()
        
        # Visual Product Recognition Tests
        await self.test_visual_product_recognition()
        
        # User Behavior Analysis Tests
        await self.test_user_behavior_analysis()
        
        # Emotional Intelligence Tests
        await self.test_emotional_intelligence()
        await self.test_mood_categories()
        
        # Trend Prediction Tests
        await self.test_trend_prediction()
        
        # Content Virality Tests
        await self.test_content_virality_prediction()
        
        # Personalized Recommendations Tests
        await self.test_personalized_recommendations()
        
        # Smart Pricing Tests
        await self.test_smart_pricing_optimization()
        
        # AI Content Generation Tests
        await self.test_ai_content_generation()
        
        # AI Insights Engine Tests
        await self.test_ai_insights_generation()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        print()
        print("=" * 70)
        print("🤖✨ ADVANCED AI & PERSONALIZATION ENGINE TEST SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        print(f"Duration: {duration:.2f} seconds")
        print()
        
        # Print failed tests details
        if self.failed_tests > 0:
            print("❌ FAILED TESTS DETAILS:")
            print("-" * 50)
            for result in self.test_results:
                if not result["success"]:
                    print(f"• {result['test']}: {result['details']}")
            print()
        
        # Print key capabilities validated
        print("🎯 KEY AI CAPABILITIES VALIDATED:")
        print("-" * 50)
        capabilities_tested = [
            "Advanced AI Engine Health Check",
            "Visual Product Recognition with Style Analysis", 
            "User Behavior Analysis with Predictive Insights",
            "Emotional Intelligence & Mood-Based Commerce",
            "Trend Prediction with Market Intelligence",
            "Content Virality Prediction & Optimization",
            "Personalized Recommendations Engine",
            "Smart Pricing Optimization with Dynamic Triggers",
            "AI Content Generation for Social Commerce",
            "AI Insights Engine with Business Intelligence"
        ]
        
        for capability in capabilities_tested:
            status = "✅" if any(capability.lower() in result["test"].lower() and result["success"] for result in self.test_results) else "❌"
            print(f"{status} {capability}")
        
        print()
        print("🚀 ADVANCED AI & PERSONALIZATION ENGINE TESTING COMPLETE")
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "success_rate": (self.passed_tests/self.total_tests)*100,
            "duration": duration,
            "test_results": self.test_results
        }

async def main():
    """Main test execution"""
    tester = AdvancedAITester()
    
    try:
        await tester.setup()
        results = await tester.run_all_tests()
        return results
    finally:
        await tester.cleanup()

if __name__ == "__main__":
    asyncio.run(main())