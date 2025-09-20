#!/usr/bin/env python3
"""
BlueWave Backend Systems Comprehensive Test Suite
===============================================
Testing newly implemented BlueWave systems including TikTok-inspired social commerce features.

Test Coverage:
1. Family Safety System (/api/family/*)
2. Business Console System (/api/business/*)
3. TikTok Features System (/api/social/*)
4. System Integration and Error Handling
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import os

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://bluewave-social.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class BlueWaveTestSuite:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    async def setup(self):
        """Initialize test session"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        
    async def teardown(self):
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
            
    async def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{BASE_URL}{endpoint}"
            
            if method.upper() == 'GET':
                async with self.session.get(url, params=params) as response:
                    response_data = await response.json()
                    return response.status < 400, response_data, response.status
            elif method.upper() == 'POST':
                async with self.session.post(url, json=data, params=params) as response:
                    response_data = await response.json()
                    return response.status < 400, response_data, response.status
            elif method.upper() == 'PUT':
                async with self.session.put(url, json=data, params=params) as response:
                    response_data = await response.json()
                    return response.status < 400, response_data, response.status
            else:
                return False, {"error": f"Unsupported method: {method}"}, 400
                
        except Exception as e:
            return False, {"error": str(e)}, 500

    # ============================================================================
    # FAMILY SAFETY SYSTEM TESTS
    # ============================================================================
    
    async def test_family_safety_health(self):
        """Test Family Safety system health check"""
        success, data, status = await self.make_request('GET', '/family/health')
        
        if success and 'service' in data:
            self.log_test(
                "Family Safety Health Check",
                True,
                f"Service operational with status: {data.get('status', 'unknown')}",
                data
            )
        else:
            self.log_test(
                "Family Safety Health Check",
                False,
                f"Health check failed with status {status}: {data}",
                data
            )
            
    async def test_screen_time_tracking(self):
        """Test screen time tracking functionality"""
        test_data = {
            "user_id": "user_test_001",
            "app_name": "AisleMarts",
            "minutes": 45,
            "category": "shopping"
        }
        
        success, data, status = await self.make_request('POST', '/family/screen-time/track', test_data)
        
        if success:
            self.log_test(
                "Screen Time Tracking",
                True,
                f"Successfully tracked 45 minutes for user_test_001",
                data
            )
        else:
            self.log_test(
                "Screen Time Tracking",
                False,
                f"Screen time tracking failed with status {status}: {data}",
                data
            )
            
    async def test_screen_time_summary(self):
        """Test screen time summary retrieval"""
        success, data, status = await self.make_request('GET', '/family/screen-time/user_test_001', params={'period': 'today'})
        
        if success:
            self.log_test(
                "Screen Time Summary",
                True,
                f"Retrieved screen time summary for user_test_001",
                data
            )
        else:
            self.log_test(
                "Screen Time Summary",
                False,
                f"Screen time summary failed with status {status}: {data}",
                data
            )
            
    async def test_screen_time_limit_setting(self):
        """Test setting screen time limits"""
        test_data = {
            "user_id": "user_test_001",
            "daily_limit_minutes": 120,
            "set_by_user_id": "parent_test_001"
        }
        
        success, data, status = await self.make_request('POST', '/family/screen-time/limit', test_data)
        
        if success:
            self.log_test(
                "Screen Time Limit Setting",
                True,
                f"Set 120-minute daily limit for user_test_001",
                data
            )
        else:
            self.log_test(
                "Screen Time Limit Setting",
                False,
                f"Screen time limit setting failed with status {status}: {data}",
                data
            )
            
    async def test_family_creation(self):
        """Test family group creation"""
        test_data = {
            "parent_user_id": "parent_test_001",
            "family_name": "Johnson Family"
        }
        
        success, data, status = await self.make_request('POST', '/family/create', test_data)
        
        if success:
            self.log_test(
                "Family Creation",
                True,
                f"Successfully created Johnson Family",
                data
            )
            # Store family_id for subsequent tests
            if 'family_id' in data:
                self.test_family_id = data['family_id']
        else:
            self.log_test(
                "Family Creation",
                False,
                f"Family creation failed with status {status}: {data}",
                data
            )
            
    async def test_family_invite_generation(self):
        """Test family invitation generation"""
        test_data = {
            "family_id": getattr(self, 'test_family_id', 'family_test_001'),
            "inviter_user_id": "parent_test_001",
            "invite_type": "general"
        }
        
        success, data, status = await self.make_request('POST', '/family/invite/generate', test_data)
        
        if success:
            self.log_test(
                "Family Invite Generation",
                True,
                f"Generated family invite successfully",
                data
            )
            # Store invite code for subsequent tests
            if 'invite_code' in data:
                self.test_invite_code = data['invite_code']
        else:
            self.log_test(
                "Family Invite Generation",
                False,
                f"Family invite generation failed with status {status}: {data}",
                data
            )
            
    async def test_family_join(self):
        """Test joining family with invite code"""
        test_data = {
            "invite_code": getattr(self, 'test_invite_code', 'INVITE123'),
            "user_id": "user_test_002",
            "user_name": "Emma Johnson",
            "user_age": 16
        }
        
        success, data, status = await self.make_request('POST', '/family/join', test_data)
        
        if success:
            self.log_test(
                "Family Join",
                True,
                f"Emma Johnson successfully joined family",
                data
            )
        else:
            self.log_test(
                "Family Join",
                False,
                f"Family join failed with status {status}: {data}",
                data
            )
            
    async def test_family_dashboard(self):
        """Test family dashboard retrieval"""
        family_id = getattr(self, 'test_family_id', 'family_test_001')
        success, data, status = await self.make_request('GET', f'/family/dashboard/{family_id}', params={'requesting_user_id': 'parent_test_001'})
        
        if success:
            self.log_test(
                "Family Dashboard",
                True,
                f"Retrieved family dashboard for {family_id}",
                data
            )
        else:
            self.log_test(
                "Family Dashboard",
                False,
                f"Family dashboard failed with status {status}: {data}",
                data
            )
            
    async def test_purchase_approval_check(self):
        """Test purchase approval checking"""
        test_data = {
            "user_id": "user_test_001",
            "amount": 89.99,
            "item_description": "Designer Handbag"
        }
        
        success, data, status = await self.make_request('POST', '/family/purchase/check-approval', test_data)
        
        if success:
            self.log_test(
                "Purchase Approval Check",
                True,
                f"Purchase approval check completed for €89.99 item",
                data
            )
        else:
            self.log_test(
                "Purchase Approval Check",
                False,
                f"Purchase approval check failed with status {status}: {data}",
                data
            )
            
    async def test_purchase_approval_request(self):
        """Test requesting purchase approval"""
        test_data = {
            "user_id": "user_test_001",
            "amount": 89.99,
            "item_description": "Designer Handbag",
            "merchant": "LuxeFashion"
        }
        
        success, data, status = await self.make_request('POST', '/family/purchase/request-approval', test_data)
        
        if success:
            self.log_test(
                "Purchase Approval Request",
                True,
                f"Purchase approval requested for €89.99 Designer Handbag",
                data
            )
        else:
            self.log_test(
                "Purchase Approval Request",
                False,
                f"Purchase approval request failed with status {status}: {data}",
                data
            )
            
    async def test_safety_insights(self):
        """Test safety insights generation"""
        success, data, status = await self.make_request('GET', '/family/insights/user_test_001')
        
        if success and 'insights' in data:
            insights_count = len(data['insights'])
            self.log_test(
                "Safety Insights",
                True,
                f"Generated {insights_count} safety insights for user_test_001",
                data
            )
        else:
            self.log_test(
                "Safety Insights",
                False,
                f"Safety insights failed with status {status}: {data}",
                data
            )
            
    async def test_user_badges(self):
        """Test user badges retrieval"""
        success, data, status = await self.make_request('GET', '/family/badges/user_test_001')
        
        if success and 'badges' in data:
            total_badges = data.get('total_badges', 0)
            earned_badges = data.get('earned_badges', 0)
            self.log_test(
                "User Badges",
                True,
                f"Retrieved {earned_badges}/{total_badges} badges for user_test_001",
                data
            )
        else:
            self.log_test(
                "User Badges",
                False,
                f"User badges failed with status {status}: {data}",
                data
            )
            
    async def test_user_missions(self):
        """Test user missions retrieval"""
        success, data, status = await self.make_request('GET', '/family/missions/user_test_001')
        
        if success and 'missions' in data:
            active_missions = data.get('active_missions', 0)
            self.log_test(
                "User Missions",
                True,
                f"Retrieved {active_missions} active missions for user_test_001",
                data
            )
        else:
            self.log_test(
                "User Missions",
                False,
                f"User missions failed with status {status}: {data}",
                data
            )
            
    async def test_family_notifications(self):
        """Test family notifications retrieval"""
        success, data, status = await self.make_request('GET', '/family/notifications/user_test_001')
        
        if success and 'notifications' in data:
            total_notifications = data.get('total_notifications', 0)
            unread_count = data.get('unread_count', 0)
            self.log_test(
                "Family Notifications",
                True,
                f"Retrieved {total_notifications} notifications ({unread_count} unread) for user_test_001",
                data
            )
        else:
            self.log_test(
                "Family Notifications",
                False,
                f"Family notifications failed with status {status}: {data}",
                data
            )

    # ============================================================================
    # BUSINESS CONSOLE SYSTEM TESTS
    # ============================================================================
    
    async def test_business_console_health(self):
        """Test Business Console system health check"""
        success, data, status = await self.make_request('GET', '/business/health')
        
        if success and 'service' in data:
            features_count = len(data.get('features', []))
            active_businesses = data.get('active_businesses', 0)
            self.log_test(
                "Business Console Health Check",
                True,
                f"Service operational with {features_count} features, {active_businesses} active businesses",
                data
            )
        else:
            self.log_test(
                "Business Console Health Check",
                False,
                f"Health check failed with status {status}: {data}",
                data
            )
            
    async def test_business_analytics(self):
        """Test business analytics retrieval"""
        success, data, status = await self.make_request('GET', '/business/analytics/business_test_001', params={'period': '7d'})
        
        if success and 'kpis' in data:
            kpis_count = len(data['kpis'])
            revenue = data['kpis'].get('revenue', {}).get('value', 0)
            self.log_test(
                "Business Analytics",
                True,
                f"Retrieved analytics with {kpis_count} KPIs, revenue: €{revenue}",
                data
            )
        else:
            self.log_test(
                "Business Analytics",
                False,
                f"Business analytics failed with status {status}: {data}",
                data
            )
            
    async def test_business_alerts(self):
        """Test business alerts retrieval"""
        success, data, status = await self.make_request('GET', '/business/alerts/business_test_001')
        
        if success and 'alerts' in data:
            total_alerts = data.get('total_alerts', 0)
            critical_alerts = data.get('critical_alerts', 0)
            self.log_test(
                "Business Alerts",
                True,
                f"Retrieved {total_alerts} alerts ({critical_alerts} critical) for business_test_001",
                data
            )
        else:
            self.log_test(
                "Business Alerts",
                False,
                f"Business alerts failed with status {status}: {data}",
                data
            )
            
    async def test_business_products(self):
        """Test business products catalog retrieval"""
        success, data, status = await self.make_request('GET', '/business/products/business_test_001', params={'limit': 10, 'offset': 0})
        
        if success and 'products' in data:
            total_products = data.get('total_products', 0)
            products_returned = len(data['products'])
            self.log_test(
                "Business Products",
                True,
                f"Retrieved {products_returned}/{total_products} products for business_test_001",
                data
            )
        else:
            self.log_test(
                "Business Products",
                False,
                f"Business products failed with status {status}: {data}",
                data
            )
            
    async def test_create_business_product(self):
        """Test creating new business product"""
        test_data = {
            "title": "Test Product",
            "description": "A test product for BlueWave testing",
            "price": 99.99,
            "currency": "EUR",
            "category": "Test Category",
            "images": ["https://example.com/test-image.jpg"],
            "stock": 50,
            "sku": "TEST-001"
        }
        
        success, data, status = await self.make_request('POST', '/business/products', test_data)
        
        if success and 'product' in data:
            product_id = data['product'].get('id', 'unknown')
            self.log_test(
                "Create Business Product",
                True,
                f"Created product {product_id}: {test_data['title']}",
                data
            )
        else:
            self.log_test(
                "Create Business Product",
                False,
                f"Product creation failed with status {status}: {data}",
                data
            )
            
    async def test_business_orders(self):
        """Test business orders retrieval"""
        success, data, status = await self.make_request('GET', '/business/orders/business_test_001', params={'limit': 10})
        
        if success and 'orders' in data:
            total_orders = data.get('total_orders', 0)
            orders_returned = len(data['orders'])
            self.log_test(
                "Business Orders",
                True,
                f"Retrieved {orders_returned}/{total_orders} orders for business_test_001",
                data
            )
        else:
            self.log_test(
                "Business Orders",
                False,
                f"Business orders failed with status {status}: {data}",
                data
            )
            
    async def test_update_order_status(self):
        """Test updating order status"""
        test_data = {
            "order_id": "ORD-8472",
            "status": "shipped",
            "tracking_number": "TRK-TEST-001",
            "notes": "Test shipment update"
        }
        
        success, data, status = await self.make_request('PUT', '/business/orders/ORD-8472', test_data)
        
        if success:
            new_status = data.get('new_status', 'unknown')
            self.log_test(
                "Update Order Status",
                True,
                f"Updated order ORD-8472 to status: {new_status}",
                data
            )
        else:
            self.log_test(
                "Update Order Status",
                False,
                f"Order status update failed with status {status}: {data}",
                data
            )
            
    async def test_business_customers(self):
        """Test business customers retrieval"""
        success, data, status = await self.make_request('GET', '/business/customers/business_test_001')
        
        if success and 'customers' in data:
            total_customers = data.get('total_customers', 0)
            tier_breakdown = data.get('tier_breakdown', {})
            self.log_test(
                "Business Customers",
                True,
                f"Retrieved {total_customers} customers with tier breakdown: {tier_breakdown}",
                data
            )
        else:
            self.log_test(
                "Business Customers",
                False,
                f"Business customers failed with status {status}: {data}",
                data
            )
            
    async def test_business_campaigns(self):
        """Test business campaigns retrieval"""
        success, data, status = await self.make_request('GET', '/business/campaigns/business_test_001')
        
        if success and 'campaigns' in data:
            total_campaigns = data.get('total_campaigns', 0)
            active_campaigns = data.get('active_campaigns', 0)
            total_budget = data.get('total_budget', 0)
            self.log_test(
                "Business Campaigns",
                True,
                f"Retrieved {active_campaigns}/{total_campaigns} campaigns, total budget: €{total_budget}",
                data
            )
        else:
            self.log_test(
                "Business Campaigns",
                False,
                f"Business campaigns failed with status {status}: {data}",
                data
            )
            
    async def test_create_campaign(self):
        """Test creating new advertising campaign"""
        test_data = {
            "name": "Test Campaign",
            "type": "conversion",
            "budget": 500.0,
            "duration_days": 14,
            "target_audience": {
                "age_range": "25-45",
                "interests": ["fashion", "luxury"],
                "location": "Germany"
            },
            "creative_assets": ["https://example.com/creative1.jpg"]
        }
        
        success, data, status = await self.make_request('POST', '/business/campaigns', test_data)
        
        if success and 'campaign' in data:
            campaign_id = data['campaign'].get('id', 'unknown')
            self.log_test(
                "Create Campaign",
                True,
                f"Created campaign {campaign_id}: {test_data['name']}",
                data
            )
        else:
            self.log_test(
                "Create Campaign",
                False,
                f"Campaign creation failed with status {status}: {data}",
                data
            )
            
    async def test_business_settings(self):
        """Test business settings retrieval"""
        success, data, status = await self.make_request('GET', '/business/settings/business_test_001')
        
        if success and 'settings' in data:
            settings = data['settings']
            verification = settings.get('verification', {})
            trust_score = verification.get('trust_score', 0)
            self.log_test(
                "Business Settings",
                True,
                f"Retrieved business settings, trust score: {trust_score}",
                data
            )
        else:
            self.log_test(
                "Business Settings",
                False,
                f"Business settings failed with status {status}: {data}",
                data
            )

    # ============================================================================
    # TIKTOK FEATURES SYSTEM TESTS
    # ============================================================================
    
    async def test_tiktok_health_check(self):
        """Test TikTok features system health check"""
        success, data, status = await self.make_request('GET', '/social/health')
        
        if success and 'service' in data:
            features = data.get('features', {})
            bluewave_integration = data.get('bluewave_integration')
            safety_first = data.get('safety_first')
            self.log_test(
                "TikTok Features Health Check",
                True,
                f"Service operational with {len(features)} features, BlueWave integration: {bluewave_integration}, Safety first: {safety_first}",
                data
            )
        else:
            self.log_test(
                "TikTok Features Health Check",
                False,
                f"Health check failed with status {status}: {data}",
                data
            )
            
    async def test_for_you_feed(self):
        """Test For You feed functionality"""
        success, data, status = await self.make_request('GET', '/social/feed/for-you', params={
            'user_id': 'test_user_001',
            'limit': 5,
            'family_safe_only': 'true'
        })
        
        if success and 'content' in data:
            content = data.get('content', [])
            recommendation_signals = data.get('recommendation_signals', {})
            family_safety_active = recommendation_signals.get('family_safety_active', False)
            
            # Check all content is family safe
            all_family_safe = all(item.get('safety', {}).get('family_safe', False) for item in content)
            
            self.log_test(
                "For You Feed",
                True,
                f"Retrieved {len(content)} family-safe content items, personalization strength: {recommendation_signals.get('personalization_strength', 0)}",
                {'content_count': len(content), 'all_family_safe': all_family_safe}
            )
        else:
            self.log_test(
                "For You Feed",
                False,
                f"For You feed failed with status {status}: {data}",
                data
            )
            
    async def test_following_feed(self):
        """Test Following feed functionality"""
        success, data, status = await self.make_request('GET', '/social/feed/following', params={
            'user_id': 'test_user_002',
            'limit': 5
        })
        
        if success and 'content' in data:
            content = data.get('content', [])
            self.log_test(
                "Following Feed",
                True,
                f"Retrieved {len(content)} content items from followed creators",
                {'content_count': len(content)}
            )
        else:
            self.log_test(
                "Following Feed",
                False,
                f"Following feed failed with status {status}: {data}",
                data
            )
            
    async def test_content_interaction(self):
        """Test content interaction (like)"""
        interaction_data = {
            "content_id": "fyp_001",
            "user_id": "test_user_003",
            "interaction_type": "like"
        }
        
        success, data, status = await self.make_request('POST', '/social/content/fyp_001/interact', interaction_data)
        
        if success and data.get('family_safety_check') == 'passed':
            self.log_test(
                "Content Interaction",
                True,
                f"Like interaction successful with family safety check passed",
                {'interaction_type': data.get('interaction_type')}
            )
        else:
            self.log_test(
                "Content Interaction",
                False,
                f"Content interaction failed with status {status}: {data}",
                data
            )
            
    async def test_content_comments(self):
        """Test content comments retrieval"""
        success, data, status = await self.make_request('GET', '/social/content/fyp_001/comments', params={'limit': 10})
        
        if success and 'comments' in data:
            comments = data.get('comments', [])
            family_safe_moderation = data.get('family_safe_moderation')
            all_family_safe = all(comment.get('family_safe', False) for comment in comments)
            
            self.log_test(
                "Content Comments",
                True,
                f"Retrieved {len(comments)} family-safe comments, moderation: {family_safe_moderation}",
                {'comment_count': len(comments), 'all_family_safe': all_family_safe}
            )
        else:
            self.log_test(
                "Content Comments",
                False,
                f"Content comments failed with status {status}: {data}",
                data
            )
            
    async def test_add_comment(self):
        """Test adding a comment with family-safe moderation"""
        comment_data = {
            'user_id': 'test_user_004',
            'text': 'This looks amazing! Perfect for my family!'
        }
        
        success, data, status = await self.make_request('POST', '/social/content/fyp_001/comment', data=comment_data)
        
        if success and data.get('moderation_passed') and data.get('family_safety_score', 0) > 0.8:
            comment = data.get('comment', {})
            self.log_test(
                "Add Comment",
                True,
                f"Comment added successfully with family safety score: {data.get('family_safety_score')}",
                {'comment_id': comment.get('id'), 'family_safety_score': data.get('family_safety_score')}
            )
        else:
            self.log_test(
                "Add Comment",
                False,
                f"Add comment failed with status {status}: {data}",
                data
            )
            
    async def test_start_live_stream(self):
        """Test starting a live stream"""
        live_data = {
            'creator_id': 'test_creator_001',
            'title': 'Family-Safe Fashion Show',
            'family_safe': 'true',
            'age_rating': 'all_ages'
        }
        
        success, data, status = await self.make_request('POST', '/social/live/start', params=live_data)
        
        if success and 'live_stream' in data:
            live_stream = data.get('live_stream', {})
            setup_instructions = data.get('setup_instructions', {})
            
            if (live_stream.get('is_active') and 
                live_stream.get('safety', {}).get('family_safe') and
                'rtmp_url' in setup_instructions):
                
                self.log_test(
                    "Start Live Stream",
                    True,
                    f"Live stream started successfully - ID: {live_stream.get('id')}, Family safe: {live_stream.get('safety', {}).get('family_safe')}",
                    {'live_id': live_stream.get('id')}
                )
            else:
                self.log_test(
                    "Start Live Stream",
                    False,
                    "Live stream setup incomplete or not family safe",
                    data
                )
        else:
            self.log_test(
                "Start Live Stream",
                False,
                f"Start live stream failed with status {status}: {data}",
                data
            )
            
    async def test_pin_product_to_live(self):
        """Test pinning a product to live stream"""
        product_data = {
            'product_id': 'prod_test_001',
            'title': 'Family-Safe Product',
            'price': 29.99,
            'currency': 'EUR',
            'family_approval_required': False
        }
        
        success, data, status = await self.make_request('POST', '/social/live/live_test_001/pin-product', product_data)
        
        if success and 'product' in data:
            product = data.get('product', {})
            self.log_test(
                "Pin Product to Live",
                True,
                f"Product pinned successfully - {product.get('title')} for {product.get('currency')} {product.get('price')}",
                {'product_id': product.get('id')}
            )
        else:
            self.log_test(
                "Pin Product to Live",
                False,
                f"Pin product to live failed with status {status}: {data}",
                data
            )
            
    async def test_live_stream_stats(self):
        """Test getting live stream statistics"""
        success, data, status = await self.make_request('GET', '/social/live/live_test_001/stats')
        
        if success and 'stats' in data:
            stats = data.get('stats', {})
            family_safety_score = stats.get('family_safety_score', 0)
            
            self.log_test(
                "Live Stream Stats",
                True,
                f"Live stats retrieved - Viewers: {stats.get('viewer_count')}, Sales: {stats.get('sales_count')}, Safety score: {family_safety_score}",
                {'viewer_count': stats.get('viewer_count'), 'family_safety_score': family_safety_score}
            )
        else:
            self.log_test(
                "Live Stream Stats",
                False,
                f"Live stream stats failed with status {status}: {data}",
                data
            )
            
    async def test_trending_content(self):
        """Test trending content discovery"""
        success, data, status = await self.make_request('GET', '/social/explore/trending', params={
            'family_safe_only': True,
            'limit': 10
        })
        
        if success and 'trending' in data:
            trending = data.get('trending', [])
            all_family_safe = all(item.get('family_safe', False) for item in trending)
            
            self.log_test(
                "Trending Content",
                True,
                f"Retrieved {len(trending)} family-safe trending items",
                {'trending_count': len(trending), 'all_family_safe': all_family_safe}
            )
        else:
            self.log_test(
                "Trending Content",
                False,
                f"Trending content failed with status {status}: {data}",
                data
            )
            
    async def test_search_content(self):
        """Test content search functionality"""
        success, data, status = await self.make_request('GET', '/social/search', params={
            'query': 'family',
            'family_safe_only': True,
            'limit': 10
        })
        
        if success and 'search_results' in data:
            search_results = data.get('search_results', {})
            total_results = search_results.get('total_results', 0)
            family_safe_filter = search_results.get('family_safe_filter', False)
            
            self.log_test(
                "Search Content",
                True,
                f"Search completed with {total_results} family-safe results for query 'family'",
                {'total_results': total_results, 'family_safe_filter': family_safe_filter}
            )
        else:
            self.log_test(
                "Search Content",
                False,
                f"Search content failed with status {status}: {data}",
                data
            )
            
    async def test_report_content(self):
        """Test content reporting for family safety"""
        report_data = {
            'content_id': 'fyp_001',
            'user_id': 'test_user_005',
            'reason': 'inappropriate content',
            'description': 'This content may not be suitable for children'
        }
        
        success, data, status = await self.make_request('POST', '/social/content/report', params=report_data)
        
        if success and 'report' in data:
            report = data.get('report', {})
            self.log_test(
                "Report Content",
                True,
                f"Content reported successfully - Report ID: {report.get('id')}, Priority: {report.get('priority')}",
                {'report_id': report.get('id'), 'priority': report.get('priority')}
            )
        else:
            self.log_test(
                "Report Content",
                False,
                f"Report content failed with status {status}: {data}",
                data
            )
            
    async def test_family_controls(self):
        """Test family control settings retrieval"""
        success, data, status = await self.make_request('GET', '/social/moderation/family-controls/test_user_006')
        
        if success and 'family_controls' in data:
            family_controls = data.get('family_controls', {})
            parental_supervision = family_controls.get('parental_supervision', {})
            content_filtering = family_controls.get('content_filtering', {})
            bluewave_protection = data.get('bluewave_protection')
            
            self.log_test(
                "Family Controls",
                True,
                f"Family controls retrieved - Parental supervision: {parental_supervision.get('enabled')}, Family safe only: {content_filtering.get('family_safe_only')}, BlueWave protection: {bluewave_protection}",
                {'parental_supervision': parental_supervision.get('enabled'), 'bluewave_protection': bluewave_protection}
            )
        else:
            self.log_test(
                "Family Controls",
                False,
                f"Family controls failed with status {status}: {data}",
                data
            )

    # ============================================================================
    # ERROR HANDLING & EDGE CASES TESTS
    # ============================================================================
    
    async def test_invalid_endpoints(self):
        """Test error handling for invalid endpoints"""
        invalid_endpoints = [
            '/family/nonexistent',
            '/business/invalid',
            '/family/screen-time/invalid_user',
            '/business/analytics/nonexistent_business'
        ]
        
        for endpoint in invalid_endpoints:
            success, data, status = await self.make_request('GET', endpoint)
            
            # We expect these to fail (404 or similar)
            if not success and status >= 400:
                self.log_test(
                    f"Error Handling - {endpoint}",
                    True,
                    f"Correctly returned error status {status}",
                    data
                )
            else:
                self.log_test(
                    f"Error Handling - {endpoint}",
                    False,
                    f"Expected error but got success or unexpected status {status}",
                    data
                )
                
    async def test_invalid_data_validation(self):
        """Test data validation for invalid inputs"""
        # Test invalid screen time tracking data
        invalid_data = {
            "user_id": "",  # Empty user_id
            "app_name": "AisleMarts",
            "minutes": -10,  # Negative minutes
            "category": "invalid_category"  # Invalid category
        }
        
        success, data, status = await self.make_request('POST', '/family/screen-time/track', invalid_data)
        
        if not success and status >= 400:
            self.log_test(
                "Data Validation - Invalid Screen Time",
                True,
                f"Correctly rejected invalid data with status {status}",
                data
            )
        else:
            self.log_test(
                "Data Validation - Invalid Screen Time",
                False,
                f"Should have rejected invalid data but got status {status}",
                data
            )

    # ============================================================================
    # PERFORMANCE & CONCURRENT TESTING
    # ============================================================================
    
    async def test_concurrent_requests(self):
        """Test system performance under concurrent load"""
        start_time = time.time()
        
        # Create 10 concurrent requests to health endpoints
        tasks = []
        for i in range(10):
            tasks.append(self.make_request('GET', '/family/health'))
            tasks.append(self.make_request('GET', '/business/health'))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        end_time = time.time()
        duration = end_time - start_time
        
        successful_requests = sum(1 for result in results if not isinstance(result, Exception) and result[0])
        total_requests = len(results)
        
        if successful_requests >= total_requests * 0.8:  # 80% success rate
            self.log_test(
                "Concurrent Requests Performance",
                True,
                f"{successful_requests}/{total_requests} requests successful in {duration:.2f}s",
                {"duration": duration, "success_rate": successful_requests/total_requests}
            )
        else:
            self.log_test(
                "Concurrent Requests Performance",
                False,
                f"Only {successful_requests}/{total_requests} requests successful in {duration:.2f}s",
                {"duration": duration, "success_rate": successful_requests/total_requests}
            )

    # ============================================================================
    # MAIN TEST EXECUTION
    # ============================================================================
    
    async def run_all_tests(self):
        """Execute all test suites"""
        print("🚀 Starting BlueWave Backend Systems Comprehensive Test Suite")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 80)
        
        await self.setup()
        
        try:
            # Family Safety System Tests
            print("\n📱 FAMILY SAFETY SYSTEM TESTS")
            print("-" * 40)
            await self.test_family_safety_health()
            await self.test_screen_time_tracking()
            await self.test_screen_time_summary()
            await self.test_screen_time_limit_setting()
            await self.test_family_creation()
            await self.test_family_invite_generation()
            await self.test_family_join()
            await self.test_family_dashboard()
            await self.test_purchase_approval_check()
            await self.test_purchase_approval_request()
            await self.test_safety_insights()
            await self.test_user_badges()
            await self.test_user_missions()
            await self.test_family_notifications()
            
            # Business Console System Tests
            print("\n💼 BUSINESS CONSOLE SYSTEM TESTS")
            print("-" * 40)
            await self.test_business_console_health()
            await self.test_business_analytics()
            await self.test_business_alerts()
            await self.test_business_products()
            await self.test_create_business_product()
            await self.test_business_orders()
            await self.test_update_order_status()
            await self.test_business_customers()
            await self.test_business_campaigns()
            await self.test_create_campaign()
            await self.test_business_settings()
            
            # TikTok Features System Tests
            print("\n🎬 TIKTOK FEATURES SYSTEM TESTS")
            print("-" * 40)
            await self.test_tiktok_health_check()
            await self.test_for_you_feed()
            await self.test_following_feed()
            await self.test_content_interaction()
            await self.test_content_comments()
            await self.test_add_comment()
            await self.test_start_live_stream()
            await self.test_pin_product_to_live()
            await self.test_live_stream_stats()
            await self.test_trending_content()
            await self.test_search_content()
            await self.test_report_content()
            await self.test_family_controls()
            
            # Error Handling & Edge Cases
            print("\n⚠️ ERROR HANDLING & VALIDATION TESTS")
            print("-" * 40)
            await self.test_invalid_endpoints()
            await self.test_invalid_data_validation()
            
            # Performance Tests
            print("\n⚡ PERFORMANCE & CONCURRENT TESTS")
            print("-" * 40)
            await self.test_concurrent_requests()
            
        finally:
            await self.teardown()
            
        # Print final results
        self.print_summary()
        
    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🏁 BLUEWAVE BACKEND SYSTEMS TEST SUMMARY")
        print("=" * 80)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL RESULTS:")
        print(f"   Total Tests: {self.total_tests}")
        print(f"   ✅ Passed: {self.passed_tests}")
        print(f"   ❌ Failed: {self.failed_tests}")
        print(f"   📈 Success Rate: {success_rate:.1f}%")
        
        # Categorize results
        family_tests = [r for r in self.test_results if 'Family' in r['test'] or 'Screen Time' in r['test'] or 'Safety' in r['test'] or 'Purchase' in r['test'] or 'User' in r['test']]
        business_tests = [r for r in self.test_results if 'Business' in r['test'] or 'Campaign' in r['test'] or 'Order' in r['test'] or 'Customer' in r['test']]
        tiktok_tests = [r for r in self.test_results if 'TikTok' in r['test'] or 'For You' in r['test'] or 'Following' in r['test'] or 'Content' in r['test'] or 'Live Stream' in r['test'] or 'Trending' in r['test'] or 'Search' in r['test'] or 'Report' in r['test'] or 'Controls' in r['test']]
        system_tests = [r for r in self.test_results if 'Error' in r['test'] or 'Performance' in r['test'] or 'Concurrent' in r['test'] or 'Validation' in r['test']]
        
        print(f"\n📱 FAMILY SAFETY SYSTEM:")
        family_passed = sum(1 for t in family_tests if t['success'])
        print(f"   {family_passed}/{len(family_tests)} tests passed ({family_passed/len(family_tests)*100:.1f}%)" if family_tests else "   No tests found")
        
        print(f"\n💼 BUSINESS CONSOLE SYSTEM:")
        business_passed = sum(1 for t in business_tests if t['success'])
        print(f"   {business_passed}/{len(business_tests)} tests passed ({business_passed/len(business_tests)*100:.1f}%)" if business_tests else "   No tests found")
        
        print(f"\n🎬 TIKTOK FEATURES SYSTEM:")
        tiktok_passed = sum(1 for t in tiktok_tests if t['success'])
        print(f"   {tiktok_passed}/{len(tiktok_tests)} tests passed ({tiktok_passed/len(tiktok_tests)*100:.1f}%)" if tiktok_tests else "   No tests found")
        
        print(f"\n🔧 SYSTEM INTEGRATION:")
        system_passed = sum(1 for t in system_tests if t['success'])
        print(f"   {system_passed}/{len(system_tests)} tests passed ({system_passed/len(system_tests)*100:.1f}%)" if system_tests else "   No tests found")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        # Production readiness assessment
        print(f"\n🎯 PRODUCTION READINESS ASSESSMENT:")
        if success_rate >= 95:
            print("   🟢 EXCELLENT - Production ready with outstanding performance")
        elif success_rate >= 85:
            print("   🟡 GOOD - Production ready with minor issues to address")
        elif success_rate >= 70:
            print("   🟠 FAIR - Needs improvement before production deployment")
        else:
            print("   🔴 POOR - Significant issues require immediate attention")
            
        print("\n" + "=" * 80)

async def main():
    """Main test execution function"""
    test_suite = BlueWaveTestSuite()
    await test_suite.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())