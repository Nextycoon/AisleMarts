#!/usr/bin/env python3
"""
AisleMarts Backend Testing Suite - B2B RFQ & Affiliate Systems Validation
Comprehensive testing for Series A investor demonstration readiness
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any
import sys

# Configuration
BACKEND_URL = "https://aislemart-shop.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.results = {
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "errors": [],
            "test_details": []
        }
        self.start_time = time.time()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_time: float = 0):
        """Log test result"""
        self.results["total_tests"] += 1
        if success:
            self.results["passed"] += 1
            status = "✅ PASS"
        else:
            self.results["failed"] += 1
            status = "❌ FAIL"
            self.results["errors"].append(f"{test_name}: {details}")
        
        self.results["test_details"].append({
            "test": test_name,
            "status": status,
            "details": details,
            "response_time_ms": round(response_time * 1000, 2)
        })
        
        print(f"{status} | {test_name} | {details} | {round(response_time * 1000, 2)}ms")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request and return response, success, time"""
        start_time = time.time()
        try:
            url = f"{API_BASE}{endpoint}"
            if method.upper() == "GET":
                response = requests.get(url, params=params, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, params=params, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, params=params, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response_time = time.time() - start_time
            return response, True, response_time
        except Exception as e:
            response_time = time.time() - start_time
            return str(e), False, response_time

    def test_rfq_system(self):
        """Test B2B RFQ System Endpoints"""
        print("\n🏭 TESTING B2B RFQ SYSTEM")
        print("=" * 50)
        
        # 1. RFQ Health Check
        response, success, response_time = self.make_request("GET", "/b2b/health")
        if success and response.status_code == 200:
            data = response.json()
            self.log_test("RFQ Health Check", True, 
                         f"Service: {data.get('service', 'Unknown')}, RFQs: {data.get('stats', {}).get('rfqs', 0)}", 
                         response_time)
        else:
            self.log_test("RFQ Health Check", False, f"Failed: {response}", response_time)
        
        # 2. List RFQs
        response, success, response_time = self.make_request("GET", "/b2b/rfq", params={"limit": 10})
        if success and response.status_code == 200:
            data = response.json()
            rfq_count = len(data.get("rfqs", []))
            self.log_test("List RFQs", True, f"Retrieved {rfq_count} RFQs", response_time)
            
            # Store first RFQ ID for further testing
            if rfq_count > 0:
                self.first_rfq_id = data["rfqs"][0]["id"]
        else:
            self.log_test("List RFQs", False, f"Failed: {response}", response_time)
            self.first_rfq_id = None
        
        # 3. Get specific RFQ details
        if hasattr(self, 'first_rfq_id') and self.first_rfq_id:
            response, success, response_time = self.make_request("GET", f"/b2b/rfq/{self.first_rfq_id}")
            if success and response.status_code == 200:
                data = response.json()
                quote_count = data.get("quote_count", 0)
                self.log_test("Get RFQ Details", True, f"RFQ loaded with {quote_count} quotes", response_time)
            else:
                self.log_test("Get RFQ Details", False, f"Failed: {response}", response_time)
        
        # 4. Create new RFQ
        new_rfq_data = {
            "title": "Test RFQ - Bluetooth Headphones",
            "category": "electronics",
            "description": "Testing RFQ creation for Series A demo",
            "specifications": {
                "material": "Plastic + Metal",
                "color": "Black",
                "certifications": ["FCC", "CE"],
                "sample_required": True
            },
            "quantity": 1000,
            "target_price": 25.00,
            "currency": "USD",
            "shipping_destination": "San Francisco, CA, USA"
        }
        
        response, success, response_time = self.make_request("POST", "/b2b/rfq", data=new_rfq_data)
        if success and response.status_code == 200:
            data = response.json()
            if data.get("success"):
                new_rfq_id = data["rfq"]["id"]
                self.log_test("Create RFQ", True, f"Created RFQ: {new_rfq_id}", response_time)
                self.new_rfq_id = new_rfq_id
            else:
                self.log_test("Create RFQ", False, "Success flag false", response_time)
        else:
            self.log_test("Create RFQ", False, f"Failed: {response}", response_time)
            self.new_rfq_id = None
        
        # 5. Submit quote for RFQ
        if hasattr(self, 'new_rfq_id') and self.new_rfq_id:
            quote_data = {
                "supplier_message": "We can provide high-quality Bluetooth headphones with competitive pricing.",
                "items": [
                    {
                        "description": "Bluetooth Headphones - Custom Design",
                        "unit_price": 23.50,
                        "quantity": 1000,
                        "total_price": 23500.00,
                        "lead_time_days": 30,
                        "notes": "Includes custom packaging"
                    }
                ],
                "total_amount": 23500.00,
                "currency": "USD",
                "lead_time_days": 30,
                "payment_terms": "30% T/T deposit, 70% before shipment",
                "shipping_terms": "FOB Shanghai",
                "validity_days": 15,
                "certifications": ["FCC", "CE", "RoHS"],
                "sample_available": True,
                "sample_cost": 100.00
            }
            
            response, success, response_time = self.make_request("POST", f"/b2b/rfq/{self.new_rfq_id}/quote", data=quote_data)
            if success and response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    quote_id = data["quote"]["id"]
                    self.log_test("Submit Quote", True, f"Quote submitted: {quote_id}", response_time)
                    self.new_quote_id = quote_id
                else:
                    self.log_test("Submit Quote", False, "Success flag false", response_time)
            else:
                self.log_test("Submit Quote", False, f"Failed: {response}", response_time)
        
        # 6. RFQ Analytics
        response, success, response_time = self.make_request("GET", "/b2b/analytics/rfq")
        if success and response.status_code == 200:
            data = response.json()
            total_rfqs = data.get("total_rfqs", 0)
            total_quotes = data.get("total_quotes", 0)
            self.log_test("RFQ Analytics", True, f"Analytics: {total_rfqs} RFQs, {total_quotes} quotes", response_time)
        else:
            self.log_test("RFQ Analytics", False, f"Failed: {response}", response_time)
        
        # 7. Filter RFQs by category
        response, success, response_time = self.make_request("GET", "/b2b/rfq", params={"category": "electronics", "limit": 5})
        if success and response.status_code == 200:
            data = response.json()
            electronics_count = len(data.get("rfqs", []))
            self.log_test("Filter RFQs by Category", True, f"Found {electronics_count} electronics RFQs", response_time)
        else:
            self.log_test("Filter RFQs by Category", False, f"Failed: {response}", response_time)

    def test_affiliate_system(self):
        """Test Affiliate Marketing System Endpoints"""
        print("\n🎯 TESTING AFFILIATE SYSTEM")
        print("=" * 50)
        
        # 1. Affiliate Health Check
        response, success, response_time = self.make_request("GET", "/affiliate/health")
        if success and response.status_code == 200:
            data = response.json()
            self.log_test("Affiliate Health Check", True, 
                         f"Service: {data.get('service', 'Unknown')}, Campaigns: {data.get('stats', {}).get('campaigns', 0)}", 
                         response_time)
        else:
            self.log_test("Affiliate Health Check", False, f"Failed: {response}", response_time)
        
        # 2. List Campaigns
        response, success, response_time = self.make_request("GET", "/affiliate/campaigns", params={"limit": 10})
        if success and response.status_code == 200:
            data = response.json()
            campaign_count = len(data.get("campaigns", []))
            self.log_test("List Campaigns", True, f"Retrieved {campaign_count} campaigns", response_time)
            
            # Store first campaign ID for further testing
            if campaign_count > 0:
                self.first_campaign_id = data["campaigns"][0]["id"]
        else:
            self.log_test("List Campaigns", False, f"Failed: {response}", response_time)
            self.first_campaign_id = None
        
        # 3. Get specific campaign details
        if hasattr(self, 'first_campaign_id') and self.first_campaign_id:
            response, success, response_time = self.make_request("GET", f"/affiliate/campaigns/{self.first_campaign_id}")
            if success and response.status_code == 200:
                data = response.json()
                total_creators = data.get("performance", {}).get("total_creators", 0)
                self.log_test("Get Campaign Details", True, f"Campaign loaded with {total_creators} creators", response_time)
            else:
                self.log_test("Get Campaign Details", False, f"Failed: {response}", response_time)
        
        # 4. Create new campaign
        new_campaign_data = {
            "name": "Test Campaign - Series A Demo",
            "description": "Testing campaign creation for investor demonstration",
            "base_rate_bps": 2000,  # 20%
            "open_collaboration": True,
            "invited_creators": [],
            "product_ids": ["test_product_001"]
        }
        
        response, success, response_time = self.make_request("POST", "/affiliate/campaigns", data=new_campaign_data)
        if success and response.status_code == 200:
            data = response.json()
            if data.get("success"):
                new_campaign_id = data["campaign"]["id"]
                self.log_test("Create Campaign", True, f"Created campaign: {new_campaign_id}", response_time)
                self.new_campaign_id = new_campaign_id
            else:
                self.log_test("Create Campaign", False, "Success flag false", response_time)
        else:
            self.log_test("Create Campaign", False, f"Failed: {response}", response_time)
            self.new_campaign_id = None
        
        # 5. Create affiliate link
        if hasattr(self, 'new_campaign_id') and self.new_campaign_id:
            link_data = {
                "campaign_id": self.new_campaign_id,
                "custom_code": "TESTDEMO"
            }
            
            response, success, response_time = self.make_request("POST", "/affiliate/links", data=link_data)
            if success and response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    link_id = data["link"]["id"]
                    tracking_code = data["link"]["code"]
                    self.log_test("Create Affiliate Link", True, f"Link created: {tracking_code}", response_time)
                    self.new_link_code = tracking_code
                else:
                    self.log_test("Create Affiliate Link", False, "Success flag false", response_time)
            else:
                self.log_test("Create Affiliate Link", False, f"Failed: {response}", response_time)
        
        # 6. Track affiliate click
        if hasattr(self, 'new_link_code') and self.new_link_code:
            response, success, response_time = self.make_request("GET", f"/affiliate/track/{self.new_link_code}")
            if success and response.status_code == 200:
                data = response.json()
                redirect_url = data.get("redirect_to", "")
                self.log_test("Track Affiliate Click", True, f"Click tracked, redirect: {redirect_url}", response_time)
            else:
                self.log_test("Track Affiliate Click", False, f"Failed: {response}", response_time)
        
        # 7. Track affiliate purchase
        if hasattr(self, 'new_link_code') and self.new_link_code:
            purchase_data = {
                "order_id": "test_order_001",
                "tracking_code": self.new_link_code,
                "amount": 150.00,
                "product_ids": ["test_product_001"]
            }
            
            response, success, response_time = self.make_request("POST", "/affiliate/track/purchase", data=purchase_data)
            if success and response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    commission = data.get("commission_earned", 0)
                    self.log_test("Track Purchase", True, f"Purchase tracked, commission: ${commission}", response_time)
                else:
                    self.log_test("Track Purchase", False, "Success flag false", response_time)
            else:
                self.log_test("Track Purchase", False, f"Failed: {response}", response_time)
        
        # 8. Get creator links
        response, success, response_time = self.make_request("GET", "/affiliate/creators/demo_creator/links")
        if success and response.status_code == 200:
            data = response.json()
            total_links = data.get("total_links", 0)
            total_commissions = data.get("stats", {}).get("total_commissions", 0)
            self.log_test("Get Creator Links", True, f"Creator has {total_links} links, ${total_commissions} commissions", response_time)
        else:
            self.log_test("Get Creator Links", False, f"Failed: {response}", response_time)
        
        # 9. Creators leaderboard
        response, success, response_time = self.make_request("GET", "/affiliate/analytics/creators", params={"limit": 5})
        if success and response.status_code == 200:
            data = response.json()
            total_creators = data.get("total_creators", 0)
            self.log_test("Creators Leaderboard", True, f"Leaderboard with {total_creators} creators", response_time)
        else:
            self.log_test("Creators Leaderboard", False, f"Failed: {response}", response_time)
        
        # 10. Performance analytics
        response, success, response_time = self.make_request("GET", "/affiliate/analytics/performance", params={"days": 30})
        if success and response.status_code == 200:
            data = response.json()
            metrics = data.get("metrics", {})
            total_clicks = metrics.get("total_clicks", 0)
            conversion_rate = metrics.get("conversion_rate_percent", 0)
            self.log_test("Performance Analytics", True, f"{total_clicks} clicks, {conversion_rate}% conversion", response_time)
        else:
            self.log_test("Performance Analytics", False, f"Failed: {response}", response_time)

    def test_performance_benchmarks(self):
        """Test performance benchmarks for Series A readiness"""
        print("\n⚡ TESTING PERFORMANCE BENCHMARKS")
        print("=" * 50)
        
        # Test concurrent requests
        import threading
        import queue
        
        def make_concurrent_request(endpoint, result_queue):
            start_time = time.time()
            response, success, _ = self.make_request("GET", endpoint)
            response_time = time.time() - start_time
            result_queue.put((success and response.status_code == 200, response_time))
        
        # Test 5 concurrent health checks
        result_queue = queue.Queue()
        threads = []
        
        for _ in range(5):
            thread = threading.Thread(target=make_concurrent_request, args=("/b2b/health", result_queue))
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # Collect results
        concurrent_results = []
        while not result_queue.empty():
            concurrent_results.append(result_queue.get())
        
        successful_requests = sum(1 for success, _ in concurrent_results if success)
        avg_response_time = sum(rt for _, rt in concurrent_results) / len(concurrent_results)
        
        if successful_requests == 5 and avg_response_time < 0.5:  # 500ms target
            self.log_test("Concurrent Load Test", True, 
                         f"{successful_requests}/5 success, avg {round(avg_response_time*1000, 2)}ms", 
                         avg_response_time)
        else:
            self.log_test("Concurrent Load Test", False, 
                         f"{successful_requests}/5 success, avg {round(avg_response_time*1000, 2)}ms", 
                         avg_response_time)

    def test_sample_data_integrity(self):
        """Test sample data integrity for demo scenarios"""
        print("\n📊 TESTING SAMPLE DATA INTEGRITY")
        print("=" * 50)
        
        # Check RFQ sample data
        response, success, response_time = self.make_request("GET", "/b2b/rfq")
        if success and response.status_code == 200:
            data = response.json()
            rfqs = data.get("rfqs", [])
            
            # Verify we have at least 3 RFQs as specified
            if len(rfqs) >= 3:
                categories = set(rfq.get("category") for rfq in rfqs)
                self.log_test("RFQ Sample Data", True, 
                             f"{len(rfqs)} RFQs across {len(categories)} categories", response_time)
            else:
                self.log_test("RFQ Sample Data", False, f"Only {len(rfqs)} RFQs found, need 3+", response_time)
        else:
            self.log_test("RFQ Sample Data", False, f"Failed to retrieve RFQs: {response}", response_time)
        
        # Check Affiliate sample data
        response, success, response_time = self.make_request("GET", "/affiliate/campaigns")
        if success and response.status_code == 200:
            data = response.json()
            campaigns = data.get("campaigns", [])
            
            # Verify we have at least 3 campaigns as specified
            if len(campaigns) >= 3:
                active_campaigns = sum(1 for c in campaigns if c.get("status") == "active")
                self.log_test("Affiliate Sample Data", True, 
                             f"{len(campaigns)} campaigns, {active_campaigns} active", response_time)
            else:
                self.log_test("Affiliate Sample Data", False, f"Only {len(campaigns)} campaigns found, need 3+", response_time)
        else:
            self.log_test("Affiliate Sample Data", False, f"Failed to retrieve campaigns: {response}", response_time)
        
        # Check affiliate links
        response, success, response_time = self.make_request("GET", "/affiliate/creators/creator_fashion_001/links")
        if success and response.status_code == 200:
            data = response.json()
            total_links = data.get("total_links", 0)
            
            if total_links >= 1:
                self.log_test("Affiliate Links Data", True, f"Creator has {total_links} links", response_time)
            else:
                self.log_test("Affiliate Links Data", False, f"Creator has no links", response_time)
        else:
            self.log_test("Affiliate Links Data", False, f"Failed to retrieve creator links: {response}", response_time)

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀💎 AISLEMARTS B2B RFQ & AFFILIATE BACKEND TESTING")
        print("Series A Investor Demo Validation")
        print("=" * 60)
        
        # Run test suites
        self.test_rfq_system()
        self.test_affiliate_system()
        self.test_performance_benchmarks()
        self.test_sample_data_integrity()
        
        # Calculate final results
        total_time = time.time() - self.start_time
        success_rate = (self.results["passed"] / self.results["total_tests"]) * 100 if self.results["total_tests"] > 0 else 0
        
        print("\n" + "=" * 60)
        print("🏆 FINAL RESULTS")
        print("=" * 60)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed']} ✅")
        print(f"Failed: {self.results['failed']} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        print(f"Total Time: {total_time:.2f}s")
        
        # Series A readiness assessment
        if success_rate >= 95:
            print(f"\n🎯 SERIES A READINESS: ✅ READY ({success_rate:.1f}% success rate)")
        elif success_rate >= 90:
            print(f"\n🎯 SERIES A READINESS: ⚠️ MOSTLY READY ({success_rate:.1f}% success rate)")
        else:
            print(f"\n🎯 SERIES A READINESS: ❌ NOT READY ({success_rate:.1f}% success rate)")
        
        # Show errors if any
        if self.results["errors"]:
            print("\n❌ ERRORS ENCOUNTERED:")
            for error in self.results["errors"]:
                print(f"  • {error}")
        
        return self.results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results["failed"] == 0:
        sys.exit(0)
    else:
        sys.exit(1)