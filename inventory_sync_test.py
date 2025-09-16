#!/usr/bin/env python3
"""
Inventory Sync Service Test Suite
Tests Phase 3 Week 2: Inventory Sync Service APIs
"""

import requests
import json
import sys
import os
from typing import Dict, Any, Optional

# Get the backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        pass
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

class InventorySyncTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple[bool, Any]:
        """Make HTTP request and return (success, response_data)"""
        url = f"{API_URL}{endpoint}"
        
        # Add auth header if we have a token
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=data)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                return False, f"Unsupported method: {method}"
                
            if response.status_code < 400:
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                try:
                    error_data = response.json()
                    return False, f"HTTP {response.status_code}: {error_data}"
                except:
                    return False, f"HTTP {response.status_code}: {response.text}"
                    
        except requests.exceptions.ConnectionError:
            return False, "Connection failed - backend server may not be running"
        except Exception as e:
            return False, f"Request failed: {str(e)}"
    
    def setup_authentication(self):
        """Setup authentication for testing"""
        print("🔐 Setting up authentication...")
        
        # Try to login with test user
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            print("✅ Authentication successful")
            return True
        else:
            # Try to register user
            register_data = {
                "email": "buyer@aislemarts.com",
                "password": "password123",
                "name": "Test Buyer"
            }
            
            success, data = self.make_request("POST", "/auth/register", register_data)
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                print("✅ User registered and authenticated")
                return True
            else:
                print("❌ Authentication failed")
                return False
    
    def test_inventory_sync_health_check(self):
        """Test inventory sync system health check"""
        print("\n📦 Testing Inventory Sync Health Check...")
        
        success, data = self.make_request("GET", "/v1/inventory/health")
        
        if success and isinstance(data, dict) and data.get("status") in ["healthy", "degraded"]:
            status = data.get("status")
            recent_syncs = data.get("recent_syncs", 0)
            features = data.get("features", {})
            sync_success_rate = data.get("sync_success_rate", 0)
            self.log_test("Inventory Sync Health Check", True, f"Status: {status}, Recent syncs: {recent_syncs}, Success rate: {sync_success_rate}%, Features: {len(features)}")
        else:
            self.log_test("Inventory Sync Health Check", False, str(data))
    
    def test_inventory_csv_template(self):
        """Test CSV template download"""
        print("\n📦 Testing CSV Template Download...")
        
        success, data = self.make_request("GET", "/v1/inventory/csv/template")
        
        if success and isinstance(data, dict) and "template" in data and "instructions" in data:
            template = data.get("template", "")
            instructions = data.get("instructions", {})
            required_columns = instructions.get("required_columns", [])
            self.log_test("CSV Template Download", True, f"Template provided with {len(required_columns)} required columns")
        else:
            self.log_test("CSV Template Download", False, str(data))
    
    def test_inventory_bulk_sync(self):
        """Test bulk inventory synchronization"""
        print("\n📦 Testing Bulk Inventory Sync...")
        
        if not self.auth_token:
            self.log_test("Bulk Inventory Sync", False, "No auth token available")
            return
        
        # Test bulk sync with sample inventory items
        sync_data = {
            "merchant_id": "merchant_001",
            "location_id": "location_001",
            "sync_type": "delta",
            "items": [
                {
                    "sku": "SKU-TEST-SYNC-001",
                    "qty": 25,
                    "price": {"amount": 5000, "currency": "KES"},
                    "updated_at": "2024-01-15T10:00:00Z",
                    "source": "manual"
                },
                {
                    "sku": "SKU-TEST-SYNC-002", 
                    "qty": 10,
                    "price": {"amount": 12500, "currency": "KES"},
                    "updated_at": "2024-01-15T10:00:00Z",
                    "source": "manual"
                },
                {
                    "sku": "SKU-TEST-SYNC-003",
                    "qty": 0,
                    "price": {"amount": 8999, "currency": "KES"},
                    "updated_at": "2024-01-15T10:00:00Z",
                    "source": "manual"
                }
            ]
        }
        
        success, data = self.make_request("POST", "/v1/inventory/sync", sync_data)
        
        if success and isinstance(data, dict) and "sync_reference" in data:
            sync_ref = data.get("sync_reference")
            status = data.get("status")
            processed_items = data.get("processed_items", 0)
            total_items = data.get("total_items", 0)
            self.test_sync_reference = sync_ref  # Store for status check
            self.log_test("Bulk Inventory Sync", True, f"Sync {sync_ref}: {status}, {processed_items}/{total_items} items processed")
        else:
            self.log_test("Bulk Inventory Sync", False, str(data))
    
    def test_inventory_sync_status(self):
        """Test sync status tracking"""
        print("\n📦 Testing Sync Status Tracking...")
        
        if not self.auth_token:
            self.log_test("Sync Status Tracking", False, "No auth token available")
            return
        
        if not hasattr(self, 'test_sync_reference'):
            self.log_test("Sync Status Tracking", False, "No sync reference available")
            return
        
        success, data = self.make_request("GET", f"/v1/inventory/sync/{self.test_sync_reference}/status")
        
        if success and isinstance(data, dict) and "sync_reference" in data:
            sync_ref = data.get("sync_reference")
            status = data.get("status")
            processing_time = data.get("processing_time_ms", 0)
            self.log_test("Sync Status Tracking", True, f"Sync {sync_ref}: {status}, Processing time: {processing_time}ms")
        elif not success and "403" in str(data):
            self.log_test("Sync Status Tracking", True, "Access control working correctly (403 expected for non-merchant user)")
        else:
            self.log_test("Sync Status Tracking", False, str(data))
    
    def test_inventory_sync_history(self):
        """Test sync history retrieval"""
        print("\n📦 Testing Sync History...")
        
        if not self.auth_token:
            self.log_test("Sync History", False, "No auth token available")
            return
        
        success, data = self.make_request("GET", "/v1/inventory/sync/history", {"limit": 10})
        
        if success and isinstance(data, dict) and "results" in data:
            results = data.get("results", [])
            total_count = data.get("total_count", 0)
            self.log_test("Sync History", True, f"Found {len(results)} sync results (total: {total_count})")
        else:
            self.log_test("Sync History", False, str(data))
    
    def test_inventory_statistics(self):
        """Test inventory statistics for locations"""
        print("\n📦 Testing Inventory Statistics...")
        
        if not self.auth_token:
            self.log_test("Inventory Statistics", False, "No auth token available")
            return
        
        # Test with sample merchant and location
        merchant_id = "merchant_001"
        location_id = "location_001"
        
        success, data = self.make_request("GET", f"/v1/inventory/stats/{merchant_id}/{location_id}")
        
        if success and isinstance(data, dict) and "merchant_id" in data:
            total_skus = data.get("total_skus", 0)
            total_quantity = data.get("total_quantity", 0)
            total_value = data.get("total_value", 0)
            currency = data.get("currency", "KES")
            sync_success_rate = data.get("sync_success_rate", 0)
            self.log_test("Inventory Statistics", True, f"SKUs: {total_skus}, Qty: {total_quantity}, Value: {currency} {total_value}, Success rate: {sync_success_rate}%")
        else:
            self.log_test("Inventory Statistics", False, str(data))
    
    def test_inventory_merchant_dashboard(self):
        """Test merchant inventory dashboard"""
        print("\n📦 Testing Merchant Dashboard...")
        
        if not self.auth_token:
            self.log_test("Merchant Dashboard", False, "No auth token available")
            return
        
        # Test with sample merchant
        merchant_id = "merchant_001"
        
        success, data = self.make_request("GET", f"/v1/inventory/dashboard/{merchant_id}")
        
        if success and isinstance(data, dict) and "merchant_id" in data:
            merchant_name = data.get("merchant_name")
            total_locations = data.get("total_locations", 0)
            total_skus = data.get("total_skus_across_locations", 0)
            total_value = data.get("total_inventory_value", 0)
            sync_health = data.get("overall_sync_health")
            self.log_test("Merchant Dashboard", True, f"Merchant: {merchant_name}, Locations: {total_locations}, SKUs: {total_skus}, Value: {total_value}, Health: {sync_health}")
        else:
            self.log_test("Merchant Dashboard", False, str(data))
    
    def test_inventory_sync_authentication(self):
        """Test authentication requirements for inventory sync endpoints"""
        print("\n📦 Testing Inventory Sync Authentication...")
        
        # Test without authentication
        old_token = self.auth_token
        self.auth_token = None
        
        # Test bulk sync without auth
        sync_data = {
            "merchant_id": "merchant_001",
            "location_id": "location_001",
            "items": [{"sku": "TEST", "qty": 1, "price": {"amount": 1000, "currency": "KES"}, "updated_at": "2024-01-15T10:00:00Z"}]
        }
        
        success, data = self.make_request("POST", "/v1/inventory/sync", sync_data)
        
        if not success and "401" in str(data):
            self.log_test("Inventory Sync Authentication (Bulk Sync)", True, "Correctly requires authentication")
        else:
            self.log_test("Inventory Sync Authentication (Bulk Sync)", False, "Should require authentication")
        
        # Test dashboard without auth
        success, data = self.make_request("GET", "/v1/inventory/dashboard/merchant_001")
        
        if not success and "401" in str(data):
            self.log_test("Inventory Sync Authentication (Dashboard)", True, "Correctly requires authentication")
        else:
            self.log_test("Inventory Sync Authentication (Dashboard)", False, "Should require authentication")
        
        # Restore token
        self.auth_token = old_token
    
    def test_inventory_sync_error_handling(self):
        """Test error handling in inventory sync endpoints"""
        print("\n📦 Testing Inventory Sync Error Handling...")
        
        if not self.auth_token:
            self.log_test("Inventory Sync Error Handling", False, "No auth token available")
            return
        
        # Test invalid sync reference
        success, data = self.make_request("GET", "/v1/inventory/sync/INVALID-SYNC-REF/status")
        
        if not success and "404" in str(data):
            self.log_test("Inventory Sync Error (Invalid Reference)", True, "Correctly returned 404 for invalid sync reference")
        else:
            self.log_test("Inventory Sync Error (Invalid Reference)", False, "Should return 404 for invalid sync reference")
    
    def run_all_tests(self):
        """Run all inventory sync tests"""
        print("🚀 Starting Inventory Sync Service Tests")
        print(f"📍 Testing against: {API_URL}")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_authentication():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Run all tests
        self.test_inventory_sync_health_check()
        self.test_inventory_csv_template()
        self.test_inventory_bulk_sync()
        self.test_inventory_sync_status()
        self.test_inventory_sync_history()
        self.test_inventory_statistics()
        self.test_inventory_merchant_dashboard()
        self.test_inventory_sync_authentication()
        self.test_inventory_sync_error_handling()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['details']}")
        
        print(f"\n🎯 Success Rate: {(passed/total)*100:.1f}%")
        
        return passed == total

def main():
    """Main test runner"""
    tester = InventorySyncTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All inventory sync tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()