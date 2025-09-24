#!/usr/bin/env python3
"""
Simplified Backend Testing for Super App Ecosystem & Advanced Social Commerce Features
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime, timedelta
import os

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://stories-marketplace.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class SimpleTestSuite:
    def __init__(self):
        self.session = None
        self.passed = 0
        self.failed = 0
        self.test_user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        self.test_creator_id = f"creator_{uuid.uuid4().hex[:8]}"
        
    async def setup_session(self):
        """Setup HTTP session"""
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(timeout=timeout)
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    async def test_endpoint(self, method: str, endpoint: str, test_name: str, **kwargs):
        """Test an endpoint"""
        try:
            url = f"{API_BASE}{endpoint}"
            async with self.session.request(method, url, **kwargs) as response:
                data = await response.json() if response.content_type == 'application/json' else await response.text()
                
                success = response.status == 200
                status = "✅ PASS" if success else "❌ FAIL"
                
                if success:
                    self.passed += 1
                else:
                    self.failed += 1
                    
                print(f"{status}: {test_name} - Status: {response.status}")
                if not success:
                    print(f"    Error: {str(data)[:200]}...")
                    
                return success, data
                
        except Exception as e:
            self.failed += 1
            print(f"❌ FAIL: {test_name} - Exception: {str(e)}")
            return False, str(e)
    
    async def run_tests(self):
        """Run all tests"""
        print("🚀 Starting Super App Ecosystem & Advanced Social Commerce Backend Testing")
        print("=" * 80)
        
        await self.setup_session()
        
        try:
            # Super App Ecosystem Tests
            print("\n🌟 SUPER APP ECOSYSTEM TESTS")
            print("-" * 50)
            
            # Health check
            await self.test_endpoint('GET', '/super-app/health', 'Super App Health Check')
            
            # Wallet operations
            await self.test_endpoint('GET', f'/super-app/wallet/{self.test_user_id}', 'Wallet Creation/Retrieval')
            
            # Available services
            await self.test_endpoint('GET', '/super-app/services', 'Available Services')
            
            # AI Assistant chat
            await self.test_endpoint('POST', '/super-app/assistant/chat', 'AI Assistant Chat',
                                   params={
                                       'user_id': self.test_user_id,
                                       'query': 'Help me find restaurants nearby',
                                       'context': json.dumps({'location': 'downtown'})
                                   })
            
            # Daily content generation
            await self.test_endpoint('GET', f'/super-app/assistant/daily-content/{self.test_user_id}', 'Daily Content Generation')
            
            # Lifestyle profile
            await self.test_endpoint('GET', f'/super-app/profile/{self.test_user_id}/lifestyle', 'Lifestyle Profile Retrieval')
            
            # Analytics metrics
            await self.test_endpoint('GET', '/super-app/analytics/metrics', 'Super App Metrics')
            
            # Dashboard overview
            await self.test_endpoint('GET', '/super-app/dashboard/overview', 'Dashboard Overview')
            
            # Social Commerce Tests
            print("\n🛍️ ADVANCED SOCIAL COMMERCE TESTS")
            print("-" * 50)
            
            # Health check
            await self.test_endpoint('GET', '/social-commerce/health', 'Social Commerce Health Check')
            
            # Shoppable content creation
            await self.test_endpoint('POST', '/social-commerce/content/create', 'Shoppable Content Creation',
                                   params={
                                       'creator_id': self.test_creator_id,
                                       'content_type': 'post',
                                       'title': 'Amazing Summer Collection',
                                       'description': 'Check out these must-have summer pieces!',
                                       'media_urls': json.dumps(['https://example.com/image1.jpg']),
                                       'hashtags': json.dumps(['summer_fashion', 'ootd']),
                                       'is_sponsored': False
                                   })
            
            # Trending content
            await self.test_endpoint('GET', '/social-commerce/content/trending', 'Trending Content')
            
            # Influencer search
            await self.test_endpoint('GET', '/social-commerce/influencers/search', 'Influencer Search',
                                   params={
                                       'specialties': json.dumps(['fashion', 'beauty']),
                                       'min_followers': 10000,
                                       'limit': 10
                                   })
            
            # Campaign creation
            await self.test_endpoint('POST', '/social-commerce/campaigns/create', 'Campaign Creation',
                                   params={
                                       'brand_id': f"brand_{uuid.uuid4().hex[:8]}",
                                       'campaign_name': 'Summer 2025 Fashion Campaign',
                                       'description': 'Promote our new summer collection',
                                       'campaign_type': 'seasonal',
                                       'budget': 10000.0,
                                       'objectives': json.dumps(['brand_awareness', 'sales']),
                                       'target_demographics': json.dumps({'age_range': '18-35'}),
                                       'content_requirements': json.dumps({'posts': 3}),
                                       'deliverables': json.dumps([{'type': 'post', 'quantity': 3}]),
                                       'timeline': json.dumps({
                                           'start_date': (datetime.now() + timedelta(days=7)).isoformat(),
                                           'end_date': (datetime.now() + timedelta(days=37)).isoformat()
                                       })
                                   })
            
            # Shopping group creation
            await self.test_endpoint('POST', '/social-commerce/groups/create', 'Shopping Group Creation',
                                   params={
                                       'admin_id': self.test_user_id,
                                       'name': 'Fashion Enthusiasts',
                                       'description': 'A group for fashion lovers',
                                       'group_type': 'fashion'
                                   })
            
            # Trending UGC
            await self.test_endpoint('GET', '/social-commerce/ugc/trending', 'Trending UGC',
                                   params={'limit': 10})
            
            # Social proof
            await self.test_endpoint('GET', '/social-commerce/social-proof/prod_001', 'Product Social Proof')
            
            # Personalized feed
            await self.test_endpoint('GET', f'/social-commerce/feed/personalized/{self.test_user_id}', 'Personalized Feed',
                                   params={'limit': 15})
            
            # Platform analytics
            await self.test_endpoint('GET', '/social-commerce/analytics/platform', 'Platform Analytics')
            
            # Dashboard overview
            await self.test_endpoint('GET', '/social-commerce/dashboard/overview', 'Social Commerce Dashboard')
            
        finally:
            await self.cleanup_session()
            
        # Print results
        total = self.passed + self.failed
        success_rate = (self.passed / total * 100) if total > 0 else 0
        
        print("\n" + "=" * 80)
        print("🎯 TEST RESULTS SUMMARY")
        print("=" * 80)
        print(f"📊 Total Tests: {total}")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🟢 EXCELLENT - System ready for Series A investor demonstrations")
        elif success_rate >= 75:
            print("🟡 GOOD - Minor issues need attention")
        elif success_rate >= 60:
            print("🟠 MODERATE - Several issues require fixes")
        else:
            print("🔴 CRITICAL - Major issues prevent deployment readiness")
            
        print("=" * 80)

async def main():
    """Main test execution function"""
    test_suite = SimpleTestSuite()
    await test_suite.run_tests()

if __name__ == "__main__":
    asyncio.run(main())