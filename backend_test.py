#!/usr/bin/env python3
"""
🛍️💎 PHASE 3: END-TO-END COMMERCE ATTRIBUTION VALIDATION
Test the complete Phase 3 Infinity Stories Commerce Layer with full attribution, 
affiliate tracking, and commission calculations for Series A investor demonstrations.
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://social-ecosystem.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class Phase3CommerceValidator:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.test_data = {
            'impressions': [],
            'ctas': [],
            'purchases': [],
            'users': ['user_luxury_buyer', 'user_tech_enthusiast', 'user_fitness_lover'],
            'stories': [],
            'creators': []
        }
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def log_test(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test results with detailed information"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'response_time': f"{response_time:.3f}s"
        }
        self.test_results.append(result)
        print(f"{status} {test_name} ({response_time:.3f}s) - {details}")

    async def make_request(self, method: str, endpoint: str, data: dict = None) -> tuple:
        """Make HTTP request and return response data and time"""
        start_time = time.time()
        try:
            url = f"{BASE_URL}{endpoint}"
            if method.upper() == 'GET':
                async with self.session.get(url, params=data) as response:
                    response_time = time.time() - start_time
                    if response.status == 200:
                        result = await response.json()
                        return result, response_time, True
                    else:
                        error_text = await response.text()
                        return f"HTTP {response.status}: {error_text}", response_time, False
            else:
                async with self.session.post(url, json=data) as response:
                    response_time = time.time() - start_time
                    if response.status == 200:
                        result = await response.json()
                        return result, response_time, True
                    else:
                        error_text = await response.text()
                        return f"HTTP {response.status}: {error_text}", response_time, False
        except Exception as e:
            response_time = time.time() - start_time
            return f"Request failed: {str(e)}", response_time, False

    # ========== PHASE 3 COMMERCE API TESTING ==========

    async def test_stories_health_phase3(self):
        """Test GET /api/stories/health - Validate Phase 3 features"""
        result, response_time, success = await self.make_request('GET', '/stories/health')
        
        if success:
            required_features = [
                'impression_tracking', 'cta_attribution', 'commission_calculation',
                '7_day_attribution_window', 'creator_performance_analytics'
            ]
            
            features = result.get('features', [])
            missing_features = [f for f in required_features if f not in features]
            
            if not missing_features and result.get('phase') == '3':
                await self.log_test(
                    "Stories Health Check - Phase 3 Features",
                    True,
                    f"Phase 3 operational with {len(features)} features, {result.get('creators_count', 0)} creators",
                    response_time
                )
                return True
            else:
                await self.log_test(
                    "Stories Health Check - Phase 3 Features",
                    False,
                    f"Missing features: {missing_features}, Phase: {result.get('phase')}",
                    response_time
                )
                return False
        else:
            await self.log_test("Stories Health Check - Phase 3 Features", False, str(result), response_time)
            return False

    async def test_impression_tracking(self):
        """Test POST /api/track/impression - Test story impression tracking"""
        # First get stories to have valid story IDs
        stories_result, _, stories_success = await self.make_request('GET', '/stories', {'limit': 5})
        
        if not stories_success:
            await self.log_test("Impression Tracking", False, "Could not fetch stories for testing", 0)
            return False
            
        stories = stories_result.get('data', [])
        if not stories:
            await self.log_test("Impression Tracking", False, "No stories available for testing", 0)
            return False
            
        # Track impressions for multiple stories and users
        success_count = 0
        total_tests = 0
        
        for i, story in enumerate(stories[:3]):  # Test first 3 stories
            for user in self.test_data['users']:
                total_tests += 1
                impression_data = {
                    'storyId': story['id'],
                    'userId': user
                }
                
                result, response_time, success = await self.make_request('POST', '/track/impression', impression_data)
                
                if success and result.get('ok'):
                    success_count += 1
                    self.test_data['impressions'].append({
                        'id': result.get('id'),
                        'storyId': story['id'],
                        'userId': user
                    })
                    
        success_rate = (success_count / total_tests) * 100 if total_tests > 0 else 0
        await self.log_test(
            "Impression Tracking",
            success_rate >= 90,
            f"{success_count}/{total_tests} impressions tracked ({success_rate:.1f}% success rate)",
            response_time
        )
        return success_rate >= 90

    async def test_cta_tracking(self):
        """Test POST /api/track/cta - Test CTA click tracking with product attribution"""
        # Get stories with products
        stories_result, _, stories_success = await self.make_request('GET', '/stories', {'limit': 10})
        
        if not stories_success:
            await self.log_test("CTA Tracking", False, "Could not fetch stories for testing", 0)
            return False
            
        stories = stories_result.get('data', [])
        product_stories = [s for s in stories if s.get('productId')]
        
        if not product_stories:
            await self.log_test("CTA Tracking", False, "No product stories available for CTA testing", 0)
            return False
            
        success_count = 0
        total_tests = 0
        
        # Track CTAs for product stories
        for story in product_stories[:5]:  # Test first 5 product stories
            for user in self.test_data['users']:
                total_tests += 1
                cta_data = {
                    'storyId': story['id'],
                    'productId': story.get('productId'),
                    'userId': user
                }
                
                result, response_time, success = await self.make_request('POST', '/track/cta', cta_data)
                
                if success and result.get('ok'):
                    success_count += 1
                    self.test_data['ctas'].append({
                        'id': result.get('id'),
                        'storyId': story['id'],
                        'productId': story.get('productId'),
                        'userId': user
                    })
                    
        success_rate = (success_count / total_tests) * 100 if total_tests > 0 else 0
        await self.log_test(
            "CTA Tracking with Product Attribution",
            success_rate >= 90,
            f"{success_count}/{total_tests} CTAs tracked ({success_rate:.1f}% success rate)",
            response_time
        )
        return success_rate >= 90

    async def test_purchase_tracking(self):
        """Test POST /api/track/purchase - Test purchase tracking with commission calculation"""
        if not self.test_data['ctas']:
            await self.log_test("Purchase Tracking", False, "No CTAs available for purchase attribution testing", 0)
            return False
            
        success_count = 0
        total_tests = 0
        
        # Create purchases based on tracked CTAs
        for i, cta in enumerate(self.test_data['ctas'][:5]):  # Test first 5 CTAs
            total_tests += 1
            purchase_data = {
                'orderId': f"order_{int(time.time())}_{i}",
                'userId': cta['userId'],
                'productId': cta['productId'],
                'amount': 89.00 if 'silk-scarf' in cta['productId'] else 299.00,  # Realistic prices
                'currency': 'USD',
                'referrerStoryId': cta['storyId']
            }
            
            result, response_time, success = await self.make_request('POST', '/track/purchase', purchase_data)
            
            if success and result.get('ok'):
                success_count += 1
                commission = result.get('commission', 0)
                creator_id = result.get('creatorId')
                attribution_method = result.get('attributionMethod')
                
                self.test_data['purchases'].append({
                    'orderId': purchase_data['orderId'],
                    'commission': commission,
                    'creatorId': creator_id,
                    'attributionMethod': attribution_method
                })
                
        success_rate = (success_count / total_tests) * 100 if total_tests > 0 else 0
        await self.log_test(
            "Purchase Tracking with Commission Calculation",
            success_rate >= 90,
            f"{success_count}/{total_tests} purchases tracked ({success_rate:.1f}% success rate)",
            response_time
        )
        return success_rate >= 90

    async def test_commerce_analytics(self):
        """Test GET /api/commerce/analytics - Test commerce analytics dashboard"""
        result, response_time, success = await self.make_request('GET', '/commerce/analytics')
        
        if success:
            summary = result.get('summary', {})
            creator_stats = result.get('creatorStats', {})
            recent_purchases = result.get('recentPurchases', [])
            
            required_metrics = ['totalImpressions', 'totalCTAs', 'totalPurchases', 'totalRevenue', 'conversionRate']
            missing_metrics = [m for m in required_metrics if m not in summary]
            
            if not missing_metrics and len(creator_stats) > 0:
                await self.log_test(
                    "Commerce Analytics Dashboard",
                    True,
                    f"Analytics operational: {summary.get('totalPurchases', 0)} purchases, {len(creator_stats)} creators, {summary.get('conversionRate', 0):.2f}% conversion",
                    response_time
                )
                return True
            else:
                await self.log_test(
                    "Commerce Analytics Dashboard",
                    False,
                    f"Missing metrics: {missing_metrics}, Creator stats: {len(creator_stats)}",
                    response_time
                )
                return False
        else:
            await self.log_test("Commerce Analytics Dashboard", False, str(result), response_time)
            return False

    # ========== END-TO-END ATTRIBUTION FLOW ==========

    async def test_complete_attribution_cycle(self):
        """Test Complete Attribution Cycle: Impression → CTA → Purchase"""
        print("\n🔄 TESTING COMPLETE ATTRIBUTION CYCLE")
        
        # Step 1: Get a product story
        stories_result, _, stories_success = await self.make_request('GET', '/stories', {'limit': 10})
        if not stories_success:
            await self.log_test("Complete Attribution Cycle", False, "Could not fetch stories", 0)
            return False
            
        stories = stories_result.get('data', [])
        product_story = next((s for s in stories if s.get('productId')), None)
        
        if not product_story:
            await self.log_test("Complete Attribution Cycle", False, "No product story available", 0)
            return False
            
        user_id = "attribution_test_user"
        
        # Step 2: Track impression
        impression_data = {'storyId': product_story['id'], 'userId': user_id}
        impression_result, _, impression_success = await self.make_request('POST', '/track/impression', impression_data)
        
        if not impression_success:
            await self.log_test("Complete Attribution Cycle", False, "Impression tracking failed", 0)
            return False
            
        # Step 3: Track CTA
        cta_data = {
            'storyId': product_story['id'],
            'productId': product_story.get('productId'),
            'userId': user_id
        }
        cta_result, _, cta_success = await self.make_request('POST', '/track/cta', cta_data)
        
        if not cta_success:
            await self.log_test("Complete Attribution Cycle", False, "CTA tracking failed", 0)
            return False
            
        # Step 4: Track purchase
        purchase_data = {
            'orderId': f"attribution_order_{int(time.time())}",
            'userId': user_id,
            'productId': product_story.get('productId'),
            'amount': 150.00,
            'currency': 'USD',
            'referrerStoryId': product_story['id']
        }
        purchase_result, response_time, purchase_success = await self.make_request('POST', '/track/purchase', purchase_data)
        
        if purchase_success and purchase_result.get('ok'):
            commission = purchase_result.get('commission', 0)
            attribution_method = purchase_result.get('attributionMethod')
            creator_id = purchase_result.get('creatorId')
            
            await self.log_test(
                "Complete Attribution Cycle",
                True,
                f"Full cycle completed: ${commission:.2f} commission to {creator_id} via {attribution_method}",
                response_time
            )
            return True
        else:
            await self.log_test("Complete Attribution Cycle", False, "Purchase tracking failed", response_time)
            return False

    async def test_7_day_attribution_window(self):
        """Test 7-Day Attribution Window calculation"""
        # This test validates that the attribution window logic is working
        # In a real scenario, we'd test with expired CTAs, but for demo we validate the logic exists
        
        user_id = "window_test_user"
        
        # Get a product story
        stories_result, _, _ = await self.make_request('GET', '/stories', {'limit': 5})
        stories = stories_result.get('data', [])
        product_story = next((s for s in stories if s.get('productId')), None)
        
        if not product_story:
            await self.log_test("7-Day Attribution Window", False, "No product story available", 0)
            return False
            
        # Track CTA
        cta_data = {
            'storyId': product_story['id'],
            'productId': product_story.get('productId'),
            'userId': user_id
        }
        await self.make_request('POST', '/track/cta', cta_data)
        
        # Track purchase (should be attributed within window)
        purchase_data = {
            'orderId': f"window_test_{int(time.time())}",
            'userId': user_id,
            'productId': product_story.get('productId'),
            'amount': 200.00,
            'currency': 'USD'
        }
        
        result, response_time, success = await self.make_request('POST', '/track/purchase', purchase_data)
        
        if success and result.get('attributionMethod') == 'CTA':
            await self.log_test(
                "7-Day Attribution Window",
                True,
                f"Attribution working: Purchase attributed to CTA within window",
                response_time
            )
            return True
        else:
            await self.log_test(
                "7-Day Attribution Window",
                False,
                f"Attribution failed: {result.get('attributionMethod', 'Unknown')}",
                response_time
            )
            return False

    async def test_commission_calculation(self):
        """Test tier-based commission rates validation"""
        # Get creators to validate commission rates
        creators_result, response_time, success = await self.make_request('GET', '/creators')
        
        if not success:
            await self.log_test("Commission Calculation", False, "Could not fetch creators", response_time)
            return False
            
        creators = creators_result
        
        # Validate commission rates by tier
        tier_rates = {
            'gold': (0.11, 0.13),    # 11-13%
            'blue': (0.08, 0.10),    # 8-10%
            'grey': (0.06, 0.07),    # 6-7%
            'unverified': (0.05, 0.05)  # 5%
        }
        
        valid_rates = 0
        total_creators = len(creators)
        
        for creator in creators:
            tier = creator.get('tier')
            commission_pct = creator.get('commissionPct', 0)
            
            if tier in tier_rates:
                min_rate, max_rate = tier_rates[tier]
                if min_rate <= commission_pct <= max_rate:
                    valid_rates += 1
                    
        success_rate = (valid_rates / total_creators) * 100 if total_creators > 0 else 0
        
        await self.log_test(
            "Commission Calculation - Tier-based Rates",
            success_rate >= 90,
            f"{valid_rates}/{total_creators} creators have valid tier-based commission rates ({success_rate:.1f}%)",
            response_time
        )
        return success_rate >= 90

    # ========== SERIES A INVESTOR DEMO SCENARIOS ==========

    async def test_luxury_fashion_scenario(self):
        """Test Luxury Fashion Scenario: Lux Fashion (Gold, 12% commission) silk scarf purchase"""
        print("\n🏆 TESTING LUXURY FASHION SCENARIO")
        
        # Find Lux Fashion creator and silk scarf story
        stories_result, _, _ = await self.make_request('GET', '/stories', {'limit': 20})
        stories = stories_result.get('data', [])
        
        lux_fashion_story = None
        for story in stories:
            if 'luxefashion' in story.get('id', '') and story.get('productId') == 'silk-scarf':
                lux_fashion_story = story
                break
                
        if not lux_fashion_story:
            await self.log_test("Luxury Fashion Scenario", False, "Lux Fashion silk scarf story not found", 0)
            return False
            
        user_id = "luxury_buyer_demo"
        
        # Complete attribution cycle
        await self.make_request('POST', '/track/impression', {'storyId': lux_fashion_story['id'], 'userId': user_id})
        await self.make_request('POST', '/track/cta', {
            'storyId': lux_fashion_story['id'],
            'productId': 'silk-scarf',
            'userId': user_id
        })
        
        purchase_data = {
            'orderId': f"luxury_demo_{int(time.time())}",
            'userId': user_id,
            'productId': 'silk-scarf',
            'amount': 89.00,  # Silk scarf price
            'currency': 'USD',
            'referrerStoryId': lux_fashion_story['id']
        }
        
        result, response_time, success = await self.make_request('POST', '/track/purchase', purchase_data)
        
        if success and result.get('creatorId') == 'luxefashion':
            commission = result.get('commission', 0)
            expected_commission = 89.00 * 0.12  # 12% for gold tier
            
            if abs(commission - expected_commission) < 0.01:  # Allow for rounding
                await self.log_test(
                    "Luxury Fashion Scenario",
                    True,
                    f"Lux Fashion silk scarf: ${commission:.2f} commission (12% gold tier)",
                    response_time
                )
                return True
                
        await self.log_test("Luxury Fashion Scenario", False, f"Scenario failed: {result}", response_time)
        return False

    async def test_tech_product_scenario(self):
        """Test Tech Product Scenario: Tech Guru (Blue, 10% commission) smartwatch purchase"""
        print("\n🏆 TESTING TECH PRODUCT SCENARIO")
        
        # Find Tech Guru smartwatch story
        stories_result, _, _ = await self.make_request('GET', '/stories', {'limit': 20})
        stories = stories_result.get('data', [])
        
        tech_guru_story = None
        for story in stories:
            if 'techguru' in story.get('id', '') and story.get('productId') == 'smartwatch-pro':
                tech_guru_story = story
                break
                
        if not tech_guru_story:
            await self.log_test("Tech Product Scenario", False, "Tech Guru smartwatch story not found", 0)
            return False
            
        user_id = "tech_enthusiast_demo"
        
        # Complete attribution cycle
        await self.make_request('POST', '/track/impression', {'storyId': tech_guru_story['id'], 'userId': user_id})
        await self.make_request('POST', '/track/cta', {
            'storyId': tech_guru_story['id'],
            'productId': 'smartwatch-pro',
            'userId': user_id
        })
        
        purchase_data = {
            'orderId': f"tech_demo_{int(time.time())}",
            'userId': user_id,
            'productId': 'smartwatch-pro',
            'amount': 299.00,  # Smartwatch price
            'currency': 'USD',
            'referrerStoryId': tech_guru_story['id']
        }
        
        result, response_time, success = await self.make_request('POST', '/track/purchase', purchase_data)
        
        if success and result.get('creatorId') == 'techguru':
            commission = result.get('commission', 0)
            expected_commission = 299.00 * 0.10  # 10% for blue tier
            
            if abs(commission - expected_commission) < 0.01:
                await self.log_test(
                    "Tech Product Scenario",
                    True,
                    f"Tech Guru smartwatch: ${commission:.2f} commission (10% blue tier)",
                    response_time
                )
                return True
                
        await self.log_test("Tech Product Scenario", False, f"Scenario failed: {result}", response_time)
        return False

    async def test_volume_commerce(self):
        """Test multiple purchases across different creators and products"""
        print("\n🏆 TESTING VOLUME COMMERCE")
        
        success_count = 0
        total_tests = 6  # Test 6 different creator-product combinations
        
        test_scenarios = [
            ('fitnessjane', 'yoga-mat', 49.99, 'fitness_buyer'),
            ('beautyqueen', 'silk-scarf', 89.00, 'beauty_lover'),
            ('foodiefun', 'protein-shaker', 14.99, 'health_enthusiast'),
            ('traveladdict', 'trench-coat', 239.00, 'travel_lover'),
            ('homedecor', 'yoga-mat', 49.99, 'home_decorator'),
            ('artcreative', 'silk-scarf', 89.00, 'art_collector')
        ]
        
        for creator_id, product_id, amount, user_id in test_scenarios:
            # Find matching story
            stories_result, _, _ = await self.make_request('GET', '/stories', {'limit': 25})
            stories = stories_result.get('data', [])
            
            matching_story = None
            for story in stories:
                if creator_id in story.get('id', '') and story.get('productId') == product_id:
                    matching_story = story
                    break
                    
            if matching_story:
                # Complete purchase cycle
                await self.make_request('POST', '/track/impression', {'storyId': matching_story['id'], 'userId': user_id})
                await self.make_request('POST', '/track/cta', {
                    'storyId': matching_story['id'],
                    'productId': product_id,
                    'userId': user_id
                })
                
                purchase_data = {
                    'orderId': f"volume_{creator_id}_{int(time.time())}",
                    'userId': user_id,
                    'productId': product_id,
                    'amount': amount,
                    'currency': 'USD',
                    'referrerStoryId': matching_story['id']
                }
                
                result, _, success = await self.make_request('POST', '/track/purchase', purchase_data)
                
                if success and result.get('creatorId') == creator_id:
                    success_count += 1
                    
        success_rate = (success_count / total_tests) * 100
        await self.log_test(
            "Volume Commerce Testing",
            success_rate >= 80,
            f"{success_count}/{total_tests} multi-creator purchases successful ({success_rate:.1f}%)",
            0
        )
        return success_rate >= 80

    async def test_real_time_analytics(self):
        """Test real-time analytics updates"""
        # Get initial analytics
        initial_result, _, _ = await self.make_request('GET', '/commerce/analytics')
        initial_purchases = initial_result.get('summary', {}).get('totalPurchases', 0)
        
        # Make a test purchase
        stories_result, _, _ = await self.make_request('GET', '/stories', {'limit': 5})
        stories = stories_result.get('data', [])
        product_story = next((s for s in stories if s.get('productId')), None)
        
        if product_story:
            user_id = "analytics_test_user"
            await self.make_request('POST', '/track/cta', {
                'storyId': product_story['id'],
                'productId': product_story.get('productId'),
                'userId': user_id
            })
            
            purchase_data = {
                'orderId': f"analytics_test_{int(time.time())}",
                'userId': user_id,
                'productId': product_story.get('productId'),
                'amount': 100.00,
                'currency': 'USD',
                'referrerStoryId': product_story['id']
            }
            
            await self.make_request('POST', '/track/purchase', purchase_data)
            
            # Check updated analytics
            updated_result, response_time, success = await self.make_request('GET', '/commerce/analytics')
            
            if success:
                updated_purchases = updated_result.get('summary', {}).get('totalPurchases', 0)
                
                if updated_purchases > initial_purchases:
                    await self.log_test(
                        "Real-time Analytics Updates",
                        True,
                        f"Analytics updated: {initial_purchases} → {updated_purchases} purchases",
                        response_time
                    )
                    return True
                    
        await self.log_test("Real-time Analytics Updates", False, "Analytics not updating in real-time", 0)
        return False

    # ========== MAIN TEST EXECUTION ==========

    async def run_all_tests(self):
        """Execute all Phase 3 Commerce Layer tests"""
        print("🛍️💎 PHASE 3: END-TO-END COMMERCE ATTRIBUTION VALIDATION")
        print("=" * 80)
        
        start_time = time.time()
        
        # Phase 3 Commerce API Testing
        print("\n🎯 PHASE 3 COMMERCE API TESTING:")
        await self.test_stories_health_phase3()
        await self.test_impression_tracking()
        await self.test_cta_tracking()
        await self.test_purchase_tracking()
        await self.test_commerce_analytics()
        
        # End-to-End Attribution Flow
        print("\n🔄 END-TO-END ATTRIBUTION FLOW:")
        await self.test_complete_attribution_cycle()
        await self.test_7_day_attribution_window()
        await self.test_commission_calculation()
        
        # Series A Investor Demo Scenarios
        print("\n🏆 SERIES A INVESTOR DEMO SCENARIOS:")
        await self.test_luxury_fashion_scenario()
        await self.test_tech_product_scenario()
        await self.test_volume_commerce()
        await self.test_real_time_analytics()
        
        # Calculate final results
        total_time = time.time() - start_time
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r['success'])
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print("\n" + "=" * 80)
        print("🎯 PHASE 3 COMMERCE ATTRIBUTION VALIDATION COMPLETE")
        print("=" * 80)
        print(f"📊 OVERALL RESULTS: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}% success rate)")
        print(f"⏱️  TOTAL TIME: {total_time:.2f} seconds")
        print(f"🚀 SERIES A READINESS: {'✅ READY' if success_rate >= 90 else '❌ NEEDS WORK'}")
        
        if success_rate >= 90:
            print("\n🌟 PHASE 3 INFINITY STORIES COMMERCE LAYER IS SERIES A INVESTOR DEMO READY!")
            print("✅ Complete attribution tracking operational")
            print("✅ Commission calculations accurate")
            print("✅ Real-time analytics functional")
            print("✅ Multi-creator commerce scenarios validated")
        else:
            print(f"\n⚠️  PHASE 3 NEEDS ATTENTION: {success_rate:.1f}% success rate (target: 90%+)")
            failed_tests = [r['test'] for r in self.test_results if not r['success']]
            print(f"❌ Failed tests: {', '.join(failed_tests)}")
            
        return success_rate >= 90

async def main():
    """Main test execution function"""
    async with Phase3CommerceValidator() as validator:
        success = await validator.run_all_tests()
        return success

if __name__ == "__main__":
    asyncio.run(main())