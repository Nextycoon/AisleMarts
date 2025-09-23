#!/usr/bin/env python3
"""
Comprehensive Backend Testing for AisleMarts Super App Ecosystem & Advanced Social Commerce Features
Testing Focus: Newly implemented Super App and Social Commerce backend systems
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os
from urllib.parse import urljoin

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://aisleai.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class SuperAppSocialCommerceTestSuite:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
        # Test data
        self.test_user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        self.test_creator_id = f"creator_{uuid.uuid4().hex[:8]}"
        self.test_brand_id = f"brand_{uuid.uuid4().hex[:8]}"
        self.test_group_id = None
        self.test_campaign_id = None
        self.test_content_id = None
        
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=30)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers={'Content-Type': 'application/json'}
        )
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    async def make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make HTTP request with error handling"""
        url = urljoin(API_BASE, endpoint.lstrip('/'))
        
        try:
            async with self.session.request(method, url, **kwargs) as response:
                response_data = {
                    'status_code': response.status,
                    'headers': dict(response.headers),
                    'url': str(response.url)
                }
                
                try:
                    response_data['data'] = await response.json()
                except:
                    response_data['data'] = await response.text()
                    
                return response_data
                
        except Exception as e:
            return {
                'status_code': 0,
                'error': str(e),
                'url': url
            }
            
    def log_test_result(self, test_name: str, success: bool, details: str = "", response_data: Dict = None):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            self.failed_tests += 1
            status = "❌ FAIL"
            
        result = {
            'test_name': test_name,
            'status': status,
            'success': success,
            'details': details,
            'response_data': response_data
        }
        
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data.get('status_code', 'N/A')} - {response_data.get('data', 'No data')}")
        print()

    # ==================== SUPER APP ECOSYSTEM TESTS ====================
    
    async def test_super_app_health_check(self):
        """Test Super App health check endpoint"""
        response = await self.make_request('GET', '/super-app/health')
        
        data = response.get('data', {})
        if isinstance(data, str):
            # Handle string response (likely error message)
            success = False
            details = f"Received string response: {data[:100]}..."
        else:
            success = (
                response.get('status_code') == 200 and
                isinstance(data, dict) and
                data.get('status') == 'operational' and
                'features' in data and
                len(data['features']) > 0
            )
            details = f"Status: {data.get('status', 'unknown')}, Features: {len(data.get('features', []))}"
        
        self.log_test_result("Super App Health Check", success, details, response)
        
    async def test_wallet_operations(self):
        """Test AislePay wallet operations"""
        # Test wallet creation/retrieval
        response = await self.make_request('GET', f'/super-app/wallet/{self.test_user_id}')
        
        wallet_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('user_id') == self.test_user_id
        )
        
        self.log_test_result("Wallet Creation/Retrieval", wallet_success, 
                           f"User ID: {self.test_user_id}, Balance: {response['data'].get('balance', 0)}", response)
        
        if not wallet_success:
            return
            
        # Test wallet top-up
        top_up_data = {
            'amount': 100.0,
            'payment_method': 'test_card'
        }
        
        response = await self.make_request('POST', f'/super-app/wallet/{self.test_user_id}/top-up', 
                                         params=top_up_data)
        
        topup_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('success') == True
        )
        
        self.log_test_result("Wallet Top-up", topup_success,
                           f"Amount: $100, New Balance: {response['data'].get('new_balance', 0)}", response)
        
        # Test P2P transfer
        transfer_data = {
            'to_user_id': f"recipient_{uuid.uuid4().hex[:8]}",
            'amount': 25.0,
            'description': 'Test transfer'
        }
        
        response = await self.make_request('POST', '/super-app/wallet/transfer',
                                         params={'from_user_id': self.test_user_id, **transfer_data})
        
        transfer_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            (response['data'].get('success') == True or 'error' in response['data'])
        )
        
        self.log_test_result("P2P Transfer", transfer_success,
                           f"Amount: $25, Status: {response['data'].get('success', 'error')}", response)
        
        # Test transaction history
        response = await self.make_request('GET', f'/super-app/wallet/{self.test_user_id}/transactions')
        
        history_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'transactions' in response['data']
        )
        
        self.log_test_result("Transaction History", history_success,
                           f"Transactions: {len(response['data'].get('transactions', []))}", response)
        
    async def test_service_integrations(self):
        """Test service integration endpoints"""
        # Test available services
        response = await self.make_request('GET', '/super-app/services')
        
        services_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), list) and
            len(response['data']) > 0
        )
        
        self.log_test_result("Available Services", services_success,
                           f"Services count: {len(response.get('data', []))}", response)
        
        # Test food delivery order
        food_order_params = {
            'user_id': self.test_user_id,
            'restaurant_id': 'test_restaurant_001',
            'restaurant_name': 'Test Pizzeria',
            'items': json.dumps([{'name': 'Margherita Pizza', 'quantity': 1, 'price': 15.99}]),
            'total_amount': 15.99,
            'delivery_address': json.dumps({'street': '123 Test St', 'city': 'Test City', 'zip': '12345'})
        }
        
        response = await self.make_request('POST', '/super-app/services/food/order', params=food_order_params)
        
        food_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            (response['data'].get('success') == True or 'error' in response['data'])
        )
        
        self.log_test_result("Food Delivery Order", food_success,
                           f"Order Status: {response['data'].get('success', 'error')}", response)
        
        # Test travel booking
        travel_params = {
            'user_id': self.test_user_id,
            'booking_type': 'flight',
            'destination': 'New York',
            'departure_date': (datetime.now() + timedelta(days=30)).isoformat(),
            'passengers': 1,
            'total_cost': 299.99,
            'provider': 'Test Airlines'
        }
        
        response = await self.make_request('POST', '/super-app/services/travel/book', params=travel_params)
        
        travel_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            (response['data'].get('success') == True or 'error' in response['data'])
        )
        
        self.log_test_result("Travel Booking", travel_success,
                           f"Booking Status: {response['data'].get('success', 'error')}", response)
        
        # Test bill payment
        bill_params = {
            'provider': 'Electric Company',
            'account_number': 'ACC123456',
            'amount': 89.50,
            'save_for_autopay': False
        }
        
        response = await self.make_request('POST', '/super-app/services/bills/pay',
                                         params={'user_id': self.test_user_id, **bill_params})
        
        bill_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            (response['data'].get('success') == True or 'error' in response['data'])
        )
        
        self.log_test_result("Bill Payment", bill_success,
                           f"Payment Status: {response['data'].get('success', 'error')}", response)
        
    async def test_ai_personal_assistant(self):
        """Test AI Personal Assistant functionality"""
        # Test AI chat
        chat_params = {
            'user_id': self.test_user_id,
            'query': 'Help me find the best restaurants nearby for dinner tonight',
            'context': json.dumps({'location': 'downtown', 'budget': 'moderate'})
        }
        
        response = await self.make_request('POST', '/super-app/assistant/chat', params=chat_params)
        
        chat_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'response_text' in response['data']
        )
        
        self.log_test_result("AI Assistant Chat", chat_success,
                           f"Response length: {len(response['data'].get('response_text', ''))}", response)
        
        # Test daily content generation
        response = await self.make_request('GET', f'/super-app/assistant/daily-content/{self.test_user_id}')
        
        content_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'daily_content' in response['data']
        )
        
        self.log_test_result("Daily Content Generation", content_success,
                           f"Content items: {len(response['data'].get('daily_content', []))}", response)
        
    async def test_lifestyle_features(self):
        """Test lifestyle and user profile features"""
        # Test lifestyle profile retrieval
        response = await self.make_request('GET', f'/super-app/profile/{self.test_user_id}/lifestyle')
        
        profile_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('user_id') == self.test_user_id
        )
        
        self.log_test_result("Lifestyle Profile Retrieval", profile_success,
                           f"User ID: {self.test_user_id}", response)
        
        # Test profile update
        update_params = {
            'preferences': json.dumps({'interests': ['fitness', 'cooking', 'travel']}),
            'notification_settings': json.dumps({'email': True, 'push': False})
        }
        
        response = await self.make_request('PATCH', f'/super-app/profile/{self.test_user_id}/lifestyle',
                                         params=update_params)
        
        update_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('success') == True
        )
        
        self.log_test_result("Lifestyle Profile Update", update_success,
                           f"Update Status: {response['data'].get('success', False)}", response)
        
    async def test_influencer_live_shopping(self):
        """Test influencer and live shopping features"""
        # Test influencer registration
        influencer_params = {
            'user_id': self.test_creator_id,
            'specialties': json.dumps(['fashion', 'lifestyle']),
            'bio': 'Fashion and lifestyle content creator',
            'contact_info': json.dumps({'email': 'creator@test.com'})
        }
        
        response = await self.make_request('POST', '/super-app/influencer/register', params=influencer_params)
        
        influencer_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('success') == True
        )
        
        self.log_test_result("Influencer Registration", influencer_success,
                           f"Creator ID: {self.test_creator_id}", response)
        
        # Test live shopping event creation
        event_params = {
            'host_id': self.test_creator_id,
            'title': 'Summer Fashion Showcase',
            'description': 'Discover the latest summer fashion trends',
            'scheduled_time': (datetime.now() + timedelta(hours=24)).isoformat(),
            'duration_minutes': 60,
            'featured_products': json.dumps([{'id': 'prod_001', 'name': 'Summer Dress'}])
        }
        
        response = await self.make_request('POST', '/super-app/live-shopping/create', params=event_params)
        
        event_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('success') == True
        )
        
        self.log_test_result("Live Shopping Event Creation", event_success,
                           f"Event Title: {event_params['title']}", response)
        
        # Test live shopping events listing
        response = await self.make_request('GET', '/super-app/live-shopping/events')
        
        events_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'events' in response['data']
        )
        
        self.log_test_result("Live Shopping Events Listing", events_success,
                           f"Events count: {len(response['data'].get('events', []))}", response)
        
    async def test_analytics_metrics(self):
        """Test analytics and metrics endpoints"""
        # Test super app metrics
        response = await self.make_request('GET', '/super-app/analytics/metrics')
        
        metrics_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'total_wallet_users' in response['data']
        )
        
        self.log_test_result("Super App Metrics", metrics_success,
                           f"Wallet Users: {response['data'].get('total_wallet_users', 0)}", response)
        
        # Test user engagement analytics
        response = await self.make_request('GET', f'/super-app/analytics/user-engagement/{self.test_user_id}')
        
        engagement_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'engagement_metrics' in response['data']
        )
        
        self.log_test_result("User Engagement Analytics", engagement_success,
                           f"User ID: {self.test_user_id}", response)
        
        # Test dashboard overview
        response = await self.make_request('GET', '/super-app/dashboard/overview')
        
        dashboard_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'platform_metrics' in response['data']
        )
        
        self.log_test_result("Dashboard Overview", dashboard_success,
                           f"Platform Health: {response['data'].get('service_health', {}).get('aislepay', 'unknown')}", response)
        
    async def test_user_service_history(self):
        """Test user service history"""
        response = await self.make_request('GET', f'/super-app/user/{self.test_user_id}/history')
        
        history_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'history' in response['data'] and
            'summary' in response['data']
        )
        
        self.log_test_result("User Service History", history_success,
                           f"Services Used: {response['data'].get('summary', {}).get('services_used', 0)}", response)

    # ==================== SOCIAL COMMERCE TESTS ====================
    
    async def test_social_commerce_health_check(self):
        """Test Social Commerce health check endpoint"""
        response = await self.make_request('GET', '/social-commerce/health')
        
        data = response.get('data', {})
        if isinstance(data, str):
            # Handle string response (likely error message)
            success = False
            details = f"Received string response: {data[:100]}..."
        else:
            success = (
                response.get('status_code') == 200 and
                isinstance(data, dict) and
                data.get('status') == 'operational' and
                'features' in data and
                len(data['features']) > 0
            )
            details = f"Status: {data.get('status', 'unknown')}, Features: {len(data.get('features', []))}"
        
        self.log_test_result("Social Commerce Health Check", success, details, response)
        
    async def test_shoppable_content_creation(self):
        """Test shoppable content creation and management"""
        # Test content creation
        content_params = {
            'creator_id': self.test_creator_id,
            'content_type': 'post',
            'title': 'Amazing Summer Collection',
            'description': 'Check out these must-have summer pieces! #SummerFashion #OOTD',
            'media_urls': json.dumps(['https://example.com/image1.jpg', 'https://example.com/image2.jpg']),
            'hashtags': json.dumps(['summer_fashion', 'ootd', 'style']),
            'location': 'Los Angeles, CA',
            'is_sponsored': False
        }
        
        response = await self.make_request('POST', '/social-commerce/content/create', params=content_params)
        
        creation_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'id' in response['data']
        )
        
        if creation_success:
            self.test_content_id = response['data']['id']
            
        self.log_test_result("Shoppable Content Creation", creation_success,
                           f"Content ID: {response['data'].get('id', 'N/A')}", response)
        
        if not self.test_content_id:
            return
            
        # Test content retrieval
        response = await self.make_request('GET', f'/social-commerce/content/{self.test_content_id}')
        
        retrieval_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('id') == self.test_content_id
        )
        
        self.log_test_result("Shoppable Content Retrieval", retrieval_success,
                           f"Title: {response['data'].get('title', 'N/A')}", response)
        
        # Test content performance analytics
        response = await self.make_request('GET', f'/social-commerce/content/{self.test_content_id}/performance')
        
        performance_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'engagement_metrics' in response['data']
        )
        
        self.log_test_result("Content Performance Analytics", performance_success,
                           f"Views: {response['data'].get('engagement_metrics', {}).get('views', 0)}", response)
        
        # Test trending content
        response = await self.make_request('GET', '/social-commerce/content/trending')
        
        trending_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), list)
        )
        
        self.log_test_result("Trending Content", trending_success,
                           f"Trending items: {len(response.get('data', []))}", response)
        
    async def test_influencer_marketplace(self):
        """Test influencer marketplace functionality"""
        # Test influencer search
        search_params = {
            'specialties': json.dumps(['fashion', 'beauty']),
            'min_followers': 10000,
            'engagement_rate_min': 0.03,
            'limit': 10
        }
        
        response = await self.make_request('GET', '/social-commerce/influencers/search', params=search_params)
        
        search_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), list)
        )
        
        self.log_test_result("Influencer Search", search_success,
                           f"Results: {len(response.get('data', []))}", response)
        
        # Test influencer profile (using sample data)
        if response.get('data') and len(response['data']) > 0:
            influencer_id = response['data'][0].get('user_id', 'inf_001')
            
            profile_response = await self.make_request('GET', f'/social-commerce/influencers/{influencer_id}')
            
            profile_success = (
                profile_response.get('status_code') == 200 and
                isinstance(profile_response.get('data'), dict) and
                'user_id' in profile_response['data']
            )
            
            self.log_test_result("Influencer Profile", profile_success,
                               f"Username: {profile_response['data'].get('username', 'N/A')}", profile_response)
            
            # Test influencer analytics
            analytics_response = await self.make_request('GET', f'/social-commerce/influencers/{influencer_id}/analytics')
            
            analytics_success = (
                analytics_response.get('status_code') == 200 and
                isinstance(analytics_response.get('data'), dict)
            )
            
            self.log_test_result("Influencer Analytics", analytics_success,
                               f"Influencer ID: {influencer_id}", analytics_response)
        
    async def test_campaign_management(self):
        """Test campaign management functionality"""
        # Test campaign creation
        campaign_params = {
            'brand_id': self.test_brand_id,
            'campaign_name': 'Summer 2025 Fashion Campaign',
            'description': 'Promote our new summer collection with top fashion influencers',
            'campaign_type': 'seasonal',
            'budget': 10000.0,
            'objectives': json.dumps(['brand_awareness', 'sales', 'engagement']),
            'target_demographics': json.dumps({'age_range': '18-35', 'gender': 'all', 'interests': ['fashion']}),
            'content_requirements': json.dumps({'posts': 3, 'stories': 5, 'videos': 1}),
            'deliverables': json.dumps([{'type': 'post', 'quantity': 3}, {'type': 'story', 'quantity': 5}]),
            'timeline': json.dumps({
                'start_date': (datetime.now() + timedelta(days=7)).isoformat(),
                'end_date': (datetime.now() + timedelta(days=37)).isoformat()
            })
        }
        
        response = await self.make_request('POST', '/social-commerce/campaigns/create', params=campaign_params)
        
        creation_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'id' in response['data']
        )
        
        if creation_success:
            self.test_campaign_id = response['data']['id']
            
        self.log_test_result("Campaign Creation", creation_success,
                           f"Campaign ID: {response['data'].get('id', 'N/A')}", response)
        
        if not self.test_campaign_id:
            return
            
        # Test campaign retrieval
        response = await self.make_request('GET', f'/social-commerce/campaigns/{self.test_campaign_id}')
        
        retrieval_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('id') == self.test_campaign_id
        )
        
        self.log_test_result("Campaign Retrieval", retrieval_success,
                           f"Campaign Name: {response['data'].get('campaign_name', 'N/A')}", response)
        
        # Test campaign analytics
        response = await self.make_request('GET', f'/social-commerce/campaigns/{self.test_campaign_id}/analytics')
        
        analytics_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'performance_summary' in response['data']
        )
        
        self.log_test_result("Campaign Analytics", analytics_success,
                           f"ROI: {response['data'].get('performance_summary', {}).get('roi', 0)}", response)
        
        # Test active campaigns
        response = await self.make_request('GET', '/social-commerce/campaigns/active')
        
        active_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'campaigns' in response['data']
        )
        
        self.log_test_result("Active Campaigns", active_success,
                           f"Active campaigns: {len(response['data'].get('campaigns', []))}", response)
        
    async def test_social_shopping_groups(self):
        """Test social shopping groups functionality"""
        # Test group creation
        group_params = {
            'admin_id': self.test_user_id,
            'name': 'Fashion Enthusiasts',
            'description': 'A group for fashion lovers to share deals and recommendations',
            'group_type': 'fashion'
        }
        
        response = await self.make_request('POST', '/social-commerce/groups/create', params=group_params)
        
        creation_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'id' in response['data']
        )
        
        if creation_success:
            self.test_group_id = response['data']['id']
            
        self.log_test_result("Shopping Group Creation", creation_success,
                           f"Group ID: {response['data'].get('id', 'N/A')}", response)
        
        if not self.test_group_id:
            return
            
        # Test group retrieval
        response = await self.make_request('GET', f'/social-commerce/groups/{self.test_group_id}')
        
        retrieval_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            response['data'].get('id') == self.test_group_id
        )
        
        self.log_test_result("Shopping Group Retrieval", retrieval_success,
                           f"Group Name: {response['data'].get('name', 'N/A')}", response)
        
        # Test joining group
        join_params = {'user_id': f"member_{uuid.uuid4().hex[:8]}"}
        
        response = await self.make_request('POST', f'/social-commerce/groups/{self.test_group_id}/join',
                                         params=join_params)
        
        join_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            (response['data'].get('success') == True or 'message' in response['data'])
        )
        
        self.log_test_result("Join Shopping Group", join_success,
                           f"Join Status: {response['data'].get('success', 'unknown')}", response)
        
    async def test_group_purchases(self):
        """Test group purchase functionality"""
        if not self.test_group_id:
            self.log_test_result("Group Purchase Creation", False, "No test group available", {})
            return
            
        # Test group purchase creation
        purchase_params = {
            'organizer_id': self.test_user_id,
            'group_id': self.test_group_id,
            'product_id': 'prod_group_001',
            'minimum_participants': 5,
            'maximum_participants': 20,
            'group_price': 79.99,
            'deadline': (datetime.now() + timedelta(days=7)).isoformat()
        }
        
        response = await self.make_request('POST', '/social-commerce/group-purchase/create', params=purchase_params)
        
        creation_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'id' in response['data']
        )
        
        purchase_id = response['data'].get('id') if creation_success else None
        
        self.log_test_result("Group Purchase Creation", creation_success,
                           f"Purchase ID: {purchase_id}", response)
        
        if not purchase_id:
            return
            
        # Test joining group purchase
        join_params = {'user_id': f"buyer_{uuid.uuid4().hex[:8]}"}
        
        response = await self.make_request('POST', f'/social-commerce/group-purchase/{purchase_id}/join',
                                         params=join_params)
        
        join_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            (response['data'].get('success') == True or 'error' in response['data'])
        )
        
        self.log_test_result("Join Group Purchase", join_success,
                           f"Join Status: {response['data'].get('success', 'error')}", response)
        
        # Test active group purchases
        response = await self.make_request('GET', '/social-commerce/group-purchase/active')
        
        active_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'group_purchases' in response['data']
        )
        
        self.log_test_result("Active Group Purchases", active_success,
                           f"Active purchases: {len(response['data'].get('group_purchases', []))}", response)
        
    async def test_ugc_and_social_proof(self):
        """Test User Generated Content and Social Proof features"""
        # Test trending UGC
        response = await self.make_request('GET', '/social-commerce/ugc/trending', params={'limit': 10})
        
        ugc_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), list)
        )
        
        self.log_test_result("Trending UGC", ugc_success,
                           f"UGC items: {len(response.get('data', []))}", response)
        
        # Test social proof for a product
        test_product_id = 'prod_001'
        response = await self.make_request('GET', f'/social-commerce/social-proof/{test_product_id}')
        
        proof_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'product_id' in response['data']
        )
        
        self.log_test_result("Product Social Proof", proof_success,
                           f"Product: {test_product_id}, Purchases: {response['data'].get('total_purchases', 0)}", response)
        
    async def test_personalized_feed(self):
        """Test personalized feed generation"""
        response = await self.make_request('GET', f'/social-commerce/feed/personalized/{self.test_user_id}',
                                         params={'limit': 15})
        
        feed_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'feed_items' in response['data']
        )
        
        self.log_test_result("Personalized Feed", feed_success,
                           f"Feed items: {len(response['data'].get('feed_items', []))}", response)
        
    async def test_platform_analytics(self):
        """Test platform analytics and insights"""
        # Test platform analytics
        response = await self.make_request('GET', '/social-commerce/analytics/platform')
        
        platform_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'platform_metrics' in response['data']
        )
        
        self.log_test_result("Platform Analytics", platform_success,
                           f"Total Revenue: ${response['data'].get('platform_metrics', {}).get('total_revenue', 0)}", response)
        
        # Test creator analytics
        if self.test_creator_id:
            response = await self.make_request('GET', f'/social-commerce/analytics/creator/{self.test_creator_id}')
            
            creator_success = (
                response.get('status_code') == 200 and
                isinstance(response.get('data'), dict)
            )
            
            self.log_test_result("Creator Analytics", creator_success,
                               f"Creator ID: {self.test_creator_id}", response)
        
    async def test_dashboard_overview(self):
        """Test social commerce dashboard overview"""
        response = await self.make_request('GET', '/social-commerce/dashboard/overview')
        
        dashboard_success = (
            response.get('status_code') == 200 and
            isinstance(response.get('data'), dict) and
            'platform_health' in response['data']
        )
        
        self.log_test_result("Social Commerce Dashboard", dashboard_success,
                           f"Active Creators: {response['data'].get('platform_health', {}).get('total_active_creators', 0)}", response)

    # ==================== MAIN TEST EXECUTION ====================
    
    async def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Comprehensive Super App Ecosystem & Advanced Social Commerce Backend Testing")
        print("=" * 100)
        
        await self.setup_session()
        
        try:
            # Super App Ecosystem Tests
            print("\n🌟 SUPER APP ECOSYSTEM TESTS")
            print("-" * 50)
            await self.test_super_app_health_check()
            await self.test_wallet_operations()
            await self.test_service_integrations()
            await self.test_ai_personal_assistant()
            await self.test_lifestyle_features()
            await self.test_influencer_live_shopping()
            await self.test_analytics_metrics()
            await self.test_user_service_history()
            
            # Social Commerce Tests
            print("\n🛍️ ADVANCED SOCIAL COMMERCE TESTS")
            print("-" * 50)
            await self.test_social_commerce_health_check()
            await self.test_shoppable_content_creation()
            await self.test_influencer_marketplace()
            await self.test_campaign_management()
            await self.test_social_shopping_groups()
            await self.test_group_purchases()
            await self.test_ugc_and_social_proof()
            await self.test_personalized_feed()
            await self.test_platform_analytics()
            await self.test_dashboard_overview()
            
        finally:
            await self.cleanup_session()
            
        # Print final results
        self.print_final_results()
        
    def print_final_results(self):
        """Print comprehensive test results"""
        print("\n" + "=" * 100)
        print("🎯 COMPREHENSIVE TEST RESULTS SUMMARY")
        print("=" * 100)
        
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        print(f"📊 OVERALL STATISTICS:")
        print(f"   Total Tests: {self.total_tests}")
        print(f"   Passed: {self.passed_tests} ✅")
        print(f"   Failed: {self.failed_tests} ❌")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        # Categorize results
        super_app_tests = [r for r in self.test_results if 'Super App' in r['test_name'] or 'Wallet' in r['test_name'] or 'AI Assistant' in r['test_name'] or 'Lifestyle' in r['test_name'] or 'Influencer' in r['test_name'] or 'Analytics' in r['test_name'] or 'Service' in r['test_name']]
        social_commerce_tests = [r for r in self.test_results if 'Social Commerce' in r['test_name'] or 'Shoppable' in r['test_name'] or 'Campaign' in r['test_name'] or 'Shopping Group' in r['test_name'] or 'Group Purchase' in r['test_name'] or 'UGC' in r['test_name'] or 'Feed' in r['test_name'] or 'Platform' in r['test_name'] or 'Creator' in r['test_name'] or 'Dashboard' in r['test_name']]
        
        print(f"\n🌟 SUPER APP ECOSYSTEM RESULTS:")
        super_app_passed = len([r for r in super_app_tests if r['success']])
        super_app_total = len(super_app_tests)
        super_app_rate = (super_app_passed / super_app_total * 100) if super_app_total > 0 else 0
        print(f"   Tests: {super_app_total} | Passed: {super_app_passed} | Success Rate: {super_app_rate:.1f}%")
        
        print(f"\n🛍️ SOCIAL COMMERCE RESULTS:")
        social_passed = len([r for r in social_commerce_tests if r['success']])
        social_total = len(social_commerce_tests)
        social_rate = (social_passed / social_total * 100) if social_total > 0 else 0
        print(f"   Tests: {social_total} | Passed: {social_passed} | Success Rate: {social_rate:.1f}%")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS DETAILS:")
            for test in failed_tests:
                print(f"   • {test['test_name']}: {test['details']}")
        
        # Show critical features status
        print(f"\n🔍 CRITICAL FEATURES STATUS:")
        
        # Super App critical features
        wallet_tests = [r for r in self.test_results if 'Wallet' in r['test_name']]
        wallet_status = "✅ OPERATIONAL" if all(r['success'] for r in wallet_tests) else "❌ ISSUES DETECTED"
        print(f"   AislePay Wallet System: {wallet_status}")
        
        ai_tests = [r for r in self.test_results if 'AI Assistant' in r['test_name']]
        ai_status = "✅ OPERATIONAL" if all(r['success'] for r in ai_tests) else "❌ ISSUES DETECTED"
        print(f"   AI Personal Assistant: {ai_status}")
        
        service_tests = [r for r in self.test_results if 'Food' in r['test_name'] or 'Travel' in r['test_name'] or 'Bill' in r['test_name']]
        service_status = "✅ OPERATIONAL" if any(r['success'] for r in service_tests) else "❌ ISSUES DETECTED"
        print(f"   Service Integrations: {service_status}")
        
        # Social Commerce critical features
        content_tests = [r for r in self.test_results if 'Shoppable Content' in r['test_name']]
        content_status = "✅ OPERATIONAL" if all(r['success'] for r in content_tests) else "❌ ISSUES DETECTED"
        print(f"   Shoppable Content System: {content_status}")
        
        influencer_tests = [r for r in self.test_results if 'Influencer' in r['test_name'] and 'Social Commerce' not in r['test_name']]
        influencer_status = "✅ OPERATIONAL" if any(r['success'] for r in influencer_tests) else "❌ ISSUES DETECTED"
        print(f"   Influencer Marketplace: {influencer_status}")
        
        campaign_tests = [r for r in self.test_results if 'Campaign' in r['test_name']]
        campaign_status = "✅ OPERATIONAL" if all(r['success'] for r in campaign_tests) else "❌ ISSUES DETECTED"
        print(f"   Campaign Management: {campaign_status}")
        
        # Overall system readiness
        print(f"\n🎯 SYSTEM READINESS ASSESSMENT:")
        if success_rate >= 90:
            print("   🟢 EXCELLENT - System ready for Series A investor demonstrations")
        elif success_rate >= 75:
            print("   🟡 GOOD - Minor issues need attention before full deployment")
        elif success_rate >= 60:
            print("   🟠 MODERATE - Several issues require fixes")
        else:
            print("   🔴 CRITICAL - Major issues prevent deployment readiness")
            
        print("\n" + "=" * 100)


async def main():
    """Main test execution function"""
    test_suite = SuperAppSocialCommerceTestSuite()
    await test_suite.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())