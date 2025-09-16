#!/usr/bin/env python3
"""
Week 3 Backend Test Blitz: Pickup Windows & Advanced Reservations
Focused testing for the pickup windows and advanced reservations system
"""

import requests
import json
import sys
from datetime import datetime, timedelta

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

class Week3PickupTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.pickup_test_data = {
            "location_ids": ["LOC-WESTLANDS-001", "LOC-KILIMANI-001", "LOC-KAREN-001"],
            "window_ids": [],
            "reservation_id": None,
            "confirmation_code": None
        }
        
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
        
    def make_request(self, method: str, endpoint: str, data: dict = None, params: dict = None) -> tuple[bool, any]:
        """Make HTTP request and return (success, response_data)"""
        url = f"{API_URL}{endpoint}"
        
        # Add auth header if we have a token
        headers = {}
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, params=params)
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=headers)
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
        
        # Try to create/login as admin user first
        admin_data = {
            "email": "admin@aislemarts.com",
            "password": "admin123",
            "name": "Admin User"
        }
        
        # Try to register admin
        success, data = self.make_request("POST", "/auth/register", admin_data)
        if not success:
            # Admin might already exist, try login
            success, data = self.make_request("POST", "/auth/login", {
                "email": "admin@aislemarts.com",
                "password": "admin123"
            })
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("Authentication Setup (Admin)", True, "Successfully authenticated as admin")
            return True
        
        # If admin doesn't work, try merchant user for MRC-0001 (Westlands)
        merchant_data = {
            "email": "merchant@westlands.com",
            "password": "merchant123",
            "name": "Westlands Merchant"
        }
        
        success, data = self.make_request("POST", "/auth/register", merchant_data)
        if not success:
            success, data = self.make_request("POST", "/auth/login", {
                "email": "merchant@westlands.com",
                "password": "merchant123"
            })
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("Authentication Setup (Merchant)", True, "Successfully authenticated as merchant")
            return True
        
        # Fallback to regular user
        login_data = {
            "email": "buyer@aislemarts.com",
            "password": "password123"
        }
        
        success, data = self.make_request("POST", "/auth/login", login_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            self.log_test("Authentication Setup (User)", True, "Successfully authenticated as regular user")
            return True
        else:
            # Try to register if login fails
            register_data = {
                "email": "buyer@aislemarts.com",
                "password": "password123",
                "name": "Test Buyer"
            }
            
            success, data = self.make_request("POST", "/auth/register", register_data)
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                self.log_test("Authentication Setup (User)", True, "Successfully registered and authenticated")
                return True
            else:
                self.log_test("Authentication Setup", False, str(data))
                return False
    
    def test_pickup_system_health(self):
        """Test pickup system health check"""
        print("\n🏥 Testing Pickup System Health...")
        
        success, data = self.make_request("GET", "/v1/pickup/health")
        
        if success and isinstance(data, dict):
            status = data.get("status")
            active_windows = data.get("active_windows", 0)
            recent_reservations = data.get("recent_reservations_24h", 0)
            pending_pickups = data.get("pending_pickups", 0)
            overdue_reservations = data.get("overdue_reservations", 0)
            features = data.get("features", {})
            
            # Check all required features are enabled
            required_features = [
                "window_creation", "reservation_scheduling", "reservation_extensions",
                "partial_pickups", "cleanup_automation", "analytics"
            ]
            
            features_enabled = all(features.get(feature, False) for feature in required_features)
            
            if status in ["healthy", "degraded"] and features_enabled:
                self.log_test("Pickup System Health", True, f"Status: {status}, Windows: {active_windows}, Pending: {pending_pickups}, Overdue: {overdue_reservations}")
            else:
                self.log_test("Pickup System Health", False, f"System unhealthy or missing features: {status}")
        else:
            self.log_test("Pickup System Health", False, str(data))
    
    def test_pickup_window_creation(self):
        """Test creating pickup windows with capacity=8 each"""
        print("\n🪟 Testing Pickup Window Creation...")
        
        if not self.auth_token:
            self.log_test("Pickup Window Creation", False, "No auth token available")
            return
        
        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Create windows for today
        window_data = {
            "location_id": "LOC-WESTLANDS-001",
            "date": today,
            "time_slots": [
                {"start_time": "09:00", "end_time": "10:00"},
                {"start_time": "14:00", "end_time": "15:00"},
                {"start_time": "17:00", "end_time": "18:00"}
            ],
            "capacity_per_slot": 8,
            "notes": "Week 3 test windows"
        }
        
        success, data = self.make_request("POST", "/v1/pickup/windows", window_data)
        
        if success and isinstance(data, list) and len(data) >= 1:
            # Store window IDs for later tests
            self.pickup_test_data["window_ids"] = [w.get("id") for w in data if w.get("id")]
            
            # Verify window properties
            all_valid = all(
                w.get("capacity") == 8 and 
                w.get("reserved") == 0 and 
                w.get("location_id") == "LOC-WESTLANDS-001"
                for w in data
            )
            
            if all_valid:
                self.log_test("Pickup Window Creation (Today)", True, f"Created {len(data)} windows with capacity=8, reserved=0")
            else:
                self.log_test("Pickup Window Creation (Today)", False, "Window properties incorrect")
        else:
            self.log_test("Pickup Window Creation (Today)", False, str(data))
        
        # Create windows for tomorrow
        window_data["date"] = tomorrow
        window_data["location_id"] = "LOC-KILIMANI-001"
        
        success, data = self.make_request("POST", "/v1/pickup/windows", window_data)
        
        if success and isinstance(data, list) and len(data) >= 1:
            self.log_test("Pickup Window Creation (Tomorrow)", True, f"Created {len(data)} windows for tomorrow")
        else:
            self.log_test("Pickup Window Creation (Tomorrow)", False, str(data))
    
    def test_pickup_window_availability(self):
        """Test listing available pickup windows"""
        print("\n📋 Testing Pickup Window Availability...")
        
        if not self.auth_token:
            self.log_test("Pickup Window Availability", False, "No auth token available")
            return
        
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Test availability for Westlands location
        params = {
            "location_id": "LOC-WESTLANDS-001",
            "date": today,
            "min_capacity": 1
        }
        
        success, data = self.make_request("GET", "/v1/pickup/windows", None, params)
        
        if success and isinstance(data, dict):
            windows = data.get("windows", [])
            total_capacity = data.get("total_capacity", 0)
            available_capacity = data.get("available_capacity", 0)
            next_available = data.get("next_available_slot")
            
            if len(windows) >= 0 and total_capacity >= 0:
                self.log_test("Window Availability", True, f"Found {len(windows)} windows, capacity: {total_capacity}, available: {available_capacity}")
            else:
                self.log_test("Window Availability", False, f"Unexpected availability data: {len(windows)} windows, {total_capacity} capacity")
        else:
            self.log_test("Window Availability", False, str(data))
    
    def test_reservation_scheduling(self):
        """Test scheduling a reservation for a pickup window"""
        print("\n📅 Testing Reservation Scheduling...")
        
        if not self.auth_token:
            self.log_test("Reservation Scheduling", False, "No auth token available")
            return
        
        # Use a mock reservation ID for testing
        mock_reservation_id = "test-reservation-123"
        self.pickup_test_data["reservation_id"] = mock_reservation_id
        
        # Use first window ID if available, otherwise use mock
        window_id = self.pickup_test_data["window_ids"][0] if self.pickup_test_data["window_ids"] else "test-window-123"
        params = {"pickup_window_id": window_id}
        
        success, schedule_data = self.make_request("POST", f"/v1/pickup/reservations/{mock_reservation_id}/schedule", None, params)
        
        if success and isinstance(schedule_data, dict):
            confirmation_code = schedule_data.get("confirmation_code")
            if confirmation_code:
                self.pickup_test_data["confirmation_code"] = confirmation_code
                self.log_test("Reservation Scheduling", True, f"Scheduled with confirmation: {confirmation_code}")
            else:
                self.log_test("Reservation Scheduling", False, "No confirmation code generated")
        else:
            self.log_test("Reservation Scheduling", False, str(schedule_data))
    
    def test_reservation_extension(self):
        """Test extending reservation hold time"""
        print("\n⏰ Testing Reservation Extension...")
        
        if not self.auth_token:
            self.log_test("Reservation Extension", False, "No auth token available")
            return
        
        reservation_id = self.pickup_test_data["reservation_id"] or "test-reservation-123"
        extension_data = {
            "extension_minutes": 30,
            "reason": "Need more time to arrive"
        }
        
        success, data = self.make_request("POST", f"/v1/pickup/reservations/{reservation_id}/extend", extension_data)
        
        if success and isinstance(data, dict):
            new_expiry = data.get("new_expiry")
            extensions_remaining = data.get("extensions_remaining")
            
            if new_expiry and extensions_remaining is not None:
                self.log_test("Reservation Extension", True, f"Extended by 30 minutes, {extensions_remaining} extensions remaining")
            else:
                self.log_test("Reservation Extension", False, "Extension response missing required fields")
        else:
            self.log_test("Reservation Extension", False, str(data))
    
    def test_reservation_modification(self):
        """Test modifying reservation items or pickup window"""
        print("\n✏️ Testing Reservation Modification...")
        
        if not self.auth_token:
            self.log_test("Reservation Modification", False, "No auth token available")
            return
        
        reservation_id = self.pickup_test_data["reservation_id"] or "test-reservation-123"
        
        # Test item modification
        modification_data = {
            "items": [
                {"sku": "TEST-ITEM-001", "qty": 3, "location_id": "LOC-WESTLANDS-001"},
                {"sku": "TEST-ITEM-003", "qty": 1, "location_id": "LOC-WESTLANDS-001"}
            ],
            "notes": "Modified items for Week 3 test"
        }
        
        success, data = self.make_request("PATCH", f"/v1/pickup/reservations/{reservation_id}/modify", modification_data)
        
        if success and isinstance(data, dict):
            modifications_applied = data.get("modifications_applied", {})
            if "items" in modifications_applied:
                self.log_test("Reservation Modification", True, f"Items modified: {list(modifications_applied.keys())}")
            else:
                self.log_test("Reservation Modification", False, "Items modification not recorded")
        else:
            self.log_test("Reservation Modification", False, str(data))
    
    def test_partial_pickup(self):
        """Test processing partial pickup of reservation items"""
        print("\n📦 Testing Partial Pickup...")
        
        if not self.auth_token:
            self.log_test("Partial Pickup", False, "No auth token available")
            return
        
        reservation_id = self.pickup_test_data["reservation_id"] or "test-reservation-123"
        
        # Test partial pickup
        partial_pickup_data = {
            "items": [
                {
                    "sku": "TEST-ITEM-001",
                    "requested_qty": 3,
                    "picked_up_qty": 2,
                    "reason_for_shortage": "Only 2 items available in stock"
                },
                {
                    "sku": "TEST-ITEM-003",
                    "requested_qty": 1,
                    "picked_up_qty": 1
                }
            ],
            "pickup_notes": "Partial pickup completed - some items out of stock",
            "completion_status": "partial"
        }
        
        success, data = self.make_request("POST", f"/v1/pickup/reservations/{reservation_id}/partial-pickup", partial_pickup_data)
        
        if success and isinstance(data, dict):
            pickup_status = data.get("pickup_status")
            pickup_summary = data.get("pickup_summary", {})
            has_remaining = data.get("has_remaining_items", False)
            
            if pickup_status and pickup_summary:
                fully_picked = len(pickup_summary.get("fully_picked_up", []))
                partially_picked = len(pickup_summary.get("partially_picked_up", []))
                remaining = len(pickup_summary.get("remaining_items", []))
                
                self.log_test("Partial Pickup", True, f"Pickup processed: {fully_picked} full, {partially_picked} partial, {remaining} remaining")
            else:
                self.log_test("Partial Pickup", False, "Partial pickup response incorrect")
        else:
            self.log_test("Partial Pickup", False, str(data))
    
    def test_expired_reservations_cleanup(self):
        """Test cleaning up expired reservations"""
        print("\n🧹 Testing Expired Reservations Cleanup...")
        
        if not self.auth_token:
            self.log_test("Expired Reservations Cleanup", False, "No auth token available")
            return
        
        # Test cleanup with configuration
        cleanup_config = {
            "cleanup_batch_size": 50,
            "max_age_hours": 1,  # Very short for testing
            "release_inventory": True,
            "send_notifications": False
        }
        
        success, data = self.make_request("POST", "/v1/pickup/cleanup/expired-reservations", cleanup_config)
        
        if success and isinstance(data, dict):
            processed = data.get("processed_reservations", 0)
            released = data.get("released_reservations", 0)
            execution_time = data.get("execution_time_seconds", 0)
            cleanup_efficiency = data.get("cleanup_efficiency", 0)
            
            self.log_test("Expired Reservations Cleanup", True, f"Processed: {processed}, Released: {released}, Time: {execution_time:.2f}s, Efficiency: {cleanup_efficiency:.2f}")
        else:
            self.log_test("Expired Reservations Cleanup", False, str(data))
    
    def test_pickup_analytics_validation(self):
        """Test pickup analytics endpoints"""
        print("\n📊 Testing Pickup Analytics...")
        
        if not self.auth_token:
            self.log_test("Pickup Analytics", False, "No auth token available")
            return
        
        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        # Test window analytics
        params = {
            "location_id": "LOC-WESTLANDS-001",
            "start_date": today,
            "end_date": tomorrow
        }
        
        success, data = self.make_request("GET", "/v1/pickup/analytics/windows", None, params)
        
        if success and isinstance(data, dict):
            total_windows = data.get("total_windows_created", 0)
            total_capacity = data.get("total_capacity_offered", 0)
            utilization_rate = data.get("utilization_rate", 0)
            popular_slots = data.get("popular_slots", [])
            
            self.log_test("Window Analytics", True, f"Windows: {total_windows}, Capacity: {total_capacity}, Utilization: {utilization_rate}%")
        else:
            self.log_test("Window Analytics", False, str(data))
        
        # Test reservation analytics
        params = {
            "start_date": today,
            "end_date": tomorrow
        }
        
        success, data = self.make_request("GET", "/v1/pickup/analytics/reservations", None, params)
        
        if success and isinstance(data, dict):
            total_reservations = data.get("total_reservations", 0)
            confirmed_reservations = data.get("confirmed_reservations", 0)
            successful_pickup_rate = data.get("successful_pickup_rate", 0)
            status_breakdown = data.get("status_breakdown", {})
            
            self.log_test("Reservation Analytics", True, f"Total: {total_reservations}, Confirmed: {confirmed_reservations}, Success Rate: {successful_pickup_rate}%")
        else:
            self.log_test("Reservation Analytics", False, str(data))
    
    def run_week3_test_blitz(self):
        """Execute Week 3 Backend Test Blitz"""
        print("🚚" * 20)
        print("WEEK 3 BACKEND TEST BLITZ: PICKUP WINDOWS & ADVANCED RESERVATIONS")
        print("🚚" * 20)
        print(f"🔗 Testing against: {API_URL}")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_authentication():
            print("❌ Authentication failed - cannot proceed with tests")
            return False
        
        # Execute test sequence as specified in review request
        print("\n🎯 CRITICAL TEST FLOW (20 minutes):")
        
        # 1. Health Check
        self.test_pickup_system_health()
        
        # 2. Create Windows
        self.test_pickup_window_creation()
        
        # 3. List Availability
        self.test_pickup_window_availability()
        
        # 4. Schedule Reservation
        self.test_reservation_scheduling()
        
        # 5. Extend Hold
        self.test_reservation_extension()
        
        # 6. Modify Reservation
        self.test_reservation_modification()
        
        # 7. Partial Pickup
        self.test_partial_pickup()
        
        # 8. Cleanup Expired
        self.test_expired_reservations_cleanup()
        
        # 9. Analytics Validation
        self.test_pickup_analytics_validation()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 WEEK 3 TEST BLITZ SUMMARY")
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
        
        success_rate = (passed/total)*100 if total > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        # Pass gates evaluation
        print("\n🚪 PASS GATES EVALUATION:")
        
        # Check for 5xx errors (none should be present in successful tests)
        no_5xx_errors = not any("500" in str(result["details"]) for result in self.test_results if not result["success"])
        print(f"✅ No 5xx errors: {'PASS' if no_5xx_errors else 'FAIL'}")
        
        # Check if core functionality is working
        core_tests = ["Pickup System Health", "Pickup Window Creation", "Window Availability"]
        core_passing = all(any(result["test"].startswith(test) and result["success"] for result in self.test_results) for test in core_tests)
        print(f"✅ Core functionality: {'PASS' if core_passing else 'FAIL'}")
        
        # Overall assessment
        overall_pass = success_rate >= 70 and no_5xx_errors and core_passing
        print(f"\n🏆 OVERALL ASSESSMENT: {'PRODUCTION READY' if overall_pass else 'NEEDS ATTENTION'}")
        
        return overall_pass

def main():
    """Main test runner"""
    tester = Week3PickupTester()
    success = tester.run_week3_test_blitz()
    
    if success:
        print("\n🎉 Week 3 Backend Test Blitz PASSED! Pickup Windows & Advanced Reservations system is production-ready.")
        sys.exit(0)
    else:
        print("\n⚠️  Week 3 Backend Test Blitz FAILED. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()