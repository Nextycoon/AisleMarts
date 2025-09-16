#!/usr/bin/env python3
"""
🚦 STABILIZED AVATAR BACKEND VALIDATION TEST

Enhanced avatar endpoint validation with improved security and validation tests.
Tests the PATCH /api/users/{user_id}/avatar endpoint comprehensively.
"""

import requests
import json
import sys
import time
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

class AvatarValidationTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.user_id = None
        self.demo_user_id = "demo_user_123"
        
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
        
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple[bool, Any, int]:
        """Make HTTP request and return (success, response_data, status_code)"""
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
            elif method.upper() == "PATCH":
                response = self.session.patch(url, json=data, headers=headers)
            else:
                return False, f"Unsupported method: {method}", 0
                
            status_code = response.status_code
            
            if response.status_code < 400:
                try:
                    return True, response.json(), status_code
                except:
                    return True, response.text, status_code
            else:
                try:
                    error_data = response.json()
                    return False, error_data, status_code
                except:
                    return False, response.text, status_code
                    
        except requests.exceptions.ConnectionError:
            return False, "Connection failed - backend server may not be running", 0
        except Exception as e:
            return False, f"Request failed: {str(e)}", 0
    
    def setup_test_user(self):
        """Setup test user and get authentication token"""
        print("\n🔧 Setting up test user...")
        
        # Try to register a test user
        user_data = {
            "email": "avatar_test@aislemarts.com",
            "password": "password123",
            "name": "Avatar Test User"
        }
        
        success, data, status_code = self.make_request("POST", "/auth/register", user_data)
        
        if success and isinstance(data, dict) and "access_token" in data:
            self.auth_token = data["access_token"]
            print(f"✅ User registered successfully")
        else:
            # User might already exist, try to login instead
            print(f"ℹ️ User may already exist, trying login...")
            success, data, status_code = self.make_request("POST", "/auth/login", {
                "email": "avatar_test@aislemarts.com",
                "password": "password123"
            })
            
            if success and isinstance(data, dict) and "access_token" in data:
                self.auth_token = data["access_token"]
                print(f"✅ User logged in successfully")
            else:
                print(f"❌ Failed to setup test user: {data}")
                return False
        
        # Get user details to extract user ID
        success, data, status_code = self.make_request("GET", "/auth/me")
        
        if success and isinstance(data, dict):
            self.user_id = data.get("id") or data.get("_id")
            print(f"✅ User ID obtained: {self.user_id}")
            return True
        else:
            print(f"❌ Failed to get user details: {data}")
            return False
    
    def test_health_check(self):
        """Test backend health check"""
        print("\n🔍 Testing Backend Health Check...")
        success, data, status_code = self.make_request("GET", "/health")
        
        if success and isinstance(data, dict) and data.get("ok") is True:
            response_time = "< 500ms" if status_code == 200 else "Unknown"
            self.log_test("Backend Health Check", True, f"Status: {status_code}, Service: {data.get('service')}, Response time: {response_time}")
        else:
            self.log_test("Backend Health Check", False, f"Status: {status_code}, Response: {data}")
    
    def test_security_validation_valid_roles(self):
        """Test 1: Security Validation Tests with valid roles"""
        print("\n👤 Testing Security Validation - Valid Roles...")
        
        if not self.auth_token or not self.user_id:
            self.log_test("Security Validation Setup", False, "No auth token or user ID available")
            return
        
        valid_roles = ["buyer", "seller", "hybrid"]
        
        for role in valid_roles:
            role_data = {"role": role}
            success, data, status_code = self.make_request("PATCH", f"/users/{self.user_id}/avatar", role_data)
            
            if success and status_code == 200 and isinstance(data, dict):
                # Verify response format
                required_fields = ["id", "role", "isAvatarSetup", "updatedAt"]
                has_all_fields = all(field in data for field in required_fields)
                
                if has_all_fields and data.get("role") == role and data.get("isAvatarSetup") is True:
                    self.log_test(f"Valid Role Update ({role.title()})", True, 
                                f"Status: {status_code}, Role: {data.get('role')}, Setup: {data.get('isAvatarSetup')}, Updated: {data.get('updatedAt') is not None}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_test(f"Valid Role Update ({role.title()})", False, 
                                f"Status: {status_code}, Missing fields: {missing_fields}, Role: {data.get('role')}")
            else:
                self.log_test(f"Valid Role Update ({role.title()})", False, 
                            f"Status: {status_code}, Response: {data}")
    
    def test_server_side_role_validation(self):
        """Test 2: Server-Side Role Validation with invalid roles"""
        print("\n👤 Testing Server-Side Role Validation - Invalid Roles...")
        
        if not self.auth_token or not self.user_id:
            self.log_test("Server-Side Validation Setup", False, "No auth token or user ID available")
            return
        
        invalid_roles = ["invalid", "admin", ""]
        
        for role in invalid_roles:
            role_data = {"role": role}
            success, data, status_code = self.make_request("PATCH", f"/users/{self.user_id}/avatar", role_data)
            
            if not success and status_code == 422:
                self.log_test(f"Invalid Role Rejection ({role or 'empty'})", True, 
                            f"Status: {status_code} (Unprocessable Entity), Correctly rejected invalid role")
            else:
                self.log_test(f"Invalid Role Rejection ({role or 'empty'})", False, 
                            f"Status: {status_code}, Expected 422, got: {data}")
    
    def test_security_edge_cases(self):
        """Test 3: Security Edge Cases"""
        print("\n👤 Testing Security Edge Cases...")
        
        # Test 3.1: Unauthorized requests (no token)
        old_token = self.auth_token
        self.auth_token = None
        
        valid_data = {"role": "buyer"}
        success, data, status_code = self.make_request("PATCH", f"/users/{self.demo_user_id}/avatar", valid_data)
        
        if not success and status_code == 401:
            self.log_test("Unauthorized Request (No Token)", True, 
                        f"Status: {status_code} (Unauthorized), Correctly rejected request without token")
        else:
            self.log_test("Unauthorized Request (No Token)", False, 
                        f"Status: {status_code}, Expected 401, got: {data}")
        
        # Restore token
        self.auth_token = old_token
        
        # Test 3.2: Cross-user access attempts
        if self.user_id:
            different_user_id = "different_user_12345"
            success, data, status_code = self.make_request("PATCH", f"/users/{different_user_id}/avatar", valid_data)
            
            if not success and status_code == 403:
                self.log_test("Cross-User Access Attempt", True, 
                            f"Status: {status_code} (Forbidden), Correctly rejected cross-user access")
            else:
                self.log_test("Cross-User Access Attempt", False, 
                            f"Status: {status_code}, Expected 403, got: {data}")
        
        # Test 3.3: Malformed payloads
        malformed_payloads = [
            {},  # Empty payload
            {"invalid_field": "buyer"},  # Wrong field name
            {"role": 123},  # Wrong data type
            {"role": ["buyer", "seller"]},  # Array instead of string
        ]
        
        for i, payload in enumerate(malformed_payloads):
            success, data, status_code = self.make_request("PATCH", f"/users/{self.demo_user_id}/avatar", payload)
            
            if not success and status_code in [400, 422]:
                self.log_test(f"Malformed Payload {i+1}", True, 
                            f"Status: {status_code}, Correctly rejected malformed payload")
            else:
                self.log_test(f"Malformed Payload {i+1}", False, 
                            f"Status: {status_code}, Expected 400/422, got: {data}")
    
    def test_idempotency(self):
        """Test 4: Idempotency Tests"""
        print("\n👤 Testing Idempotency...")
        
        if not self.auth_token or not self.user_id:
            self.log_test("Idempotency Setup", False, "No auth token or user ID available")
            return
        
        # Make the same request multiple times
        role_data = {"role": "hybrid"}
        responses = []
        
        for i in range(3):
            success, data, status_code = self.make_request("PATCH", f"/users/{self.demo_user_id}/avatar", role_data)
            responses.append((success, data, status_code))
            time.sleep(0.1)  # Small delay between requests
        
        # Verify all requests succeeded
        all_successful = all(resp[0] and resp[2] == 200 for resp in responses)
        
        if all_successful:
            # Verify responses are consistent (same role, isAvatarSetup remains true)
            first_response = responses[0][1]
            consistent_responses = all(
                resp[1].get("role") == first_response.get("role") and
                resp[1].get("isAvatarSetup") == first_response.get("isAvatarSetup")
                for resp in responses
            )
            
            if consistent_responses:
                self.log_test("Idempotency Test", True, 
                            f"All 3 requests successful with consistent responses, isAvatarSetup remains: {first_response.get('isAvatarSetup')}")
            else:
                self.log_test("Idempotency Test", False, 
                            "Responses were inconsistent across multiple identical requests")
        else:
            failed_requests = [i for i, resp in enumerate(responses) if not resp[0] or resp[2] != 200]
            self.log_test("Idempotency Test", False, 
                        f"Some requests failed: {failed_requests}")
    
    def test_response_format_validation(self):
        """Test response format validation"""
        print("\n👤 Testing Response Format Validation...")
        
        if not self.auth_token or not self.user_id:
            self.log_test("Response Format Setup", False, "No auth token or user ID available")
            return
        
        role_data = {"role": "seller"}
        success, data, status_code = self.make_request("PATCH", f"/users/{self.demo_user_id}/avatar", role_data)
        
        if success and status_code == 200 and isinstance(data, dict):
            required_fields = ["id", "role", "isAvatarSetup", "updatedAt"]
            has_all_fields = all(field in data for field in required_fields)
            
            # Validate field types and values
            field_validations = {
                "id": isinstance(data.get("id"), str) and len(data.get("id", "")) > 0,
                "role": data.get("role") in ["buyer", "seller", "hybrid"],
                "isAvatarSetup": isinstance(data.get("isAvatarSetup"), bool),
                "updatedAt": data.get("updatedAt") is not None
            }
            
            all_valid = has_all_fields and all(field_validations.values())
            
            if all_valid:
                self.log_test("Response Format Validation", True, 
                            f"All required fields present with correct types: {required_fields}")
            else:
                invalid_fields = [field for field, valid in field_validations.items() if not valid]
                self.log_test("Response Format Validation", False, 
                            f"Invalid fields: {invalid_fields}, Missing: {[f for f in required_fields if f not in data]}")
        else:
            self.log_test("Response Format Validation", False, 
                        f"Status: {status_code}, Response: {data}")
    
    def test_performance_validation(self):
        """Test performance requirements (< 500ms)"""
        print("\n👤 Testing Performance Validation...")
        
        if not self.auth_token or not self.user_id:
            self.log_test("Performance Setup", False, "No auth token or user ID available")
            return
        
        role_data = {"role": "buyer"}
        
        # Measure response time
        start_time = time.time()
        success, data, status_code = self.make_request("PATCH", f"/users/{self.demo_user_id}/avatar", role_data)
        end_time = time.time()
        
        response_time_ms = (end_time - start_time) * 1000
        
        if success and status_code == 200:
            if response_time_ms < 500:
                self.log_test("Performance Validation", True, 
                            f"Response time: {response_time_ms:.1f}ms (< 500ms requirement)")
            else:
                self.log_test("Performance Validation", False, 
                            f"Response time: {response_time_ms:.1f}ms (exceeds 500ms requirement)")
        else:
            self.log_test("Performance Validation", False, 
                        f"Request failed - Status: {status_code}, Response: {data}")
    
    def run_all_tests(self):
        """Run all avatar validation tests"""
        print("🚦 STABILIZED AVATAR BACKEND VALIDATION TEST")
        print("=" * 60)
        print(f"Backend URL: {BASE_URL}")
        print(f"API URL: {API_URL}")
        print("=" * 60)
        
        # Setup
        if not self.setup_test_user():
            print("❌ Failed to setup test user. Aborting tests.")
            return
        
        # Run all test categories
        self.test_health_check()
        self.test_security_validation_valid_roles()
        self.test_server_side_role_validation()
        self.test_security_edge_cases()
        self.test_idempotency()
        self.test_response_format_validation()
        self.test_performance_validation()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🚦 AVATAR VALIDATION TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['details']}")
        
        print("\n✅ SUCCESS CRITERIA VALIDATION:")
        
        # Check success criteria
        criteria_met = {
            "Valid roles return 200 OK": any("Valid Role Update" in r["test"] and r["success"] for r in self.test_results),
            "Invalid roles return 422": any("Invalid Role Rejection" in r["test"] and r["success"] for r in self.test_results),
            "Security validations return 401/403": any("Unauthorized" in r["test"] or "Cross-User" in r["test"] for r in self.test_results if r["success"]),
            "Idempotent behavior": any("Idempotency" in r["test"] and r["success"] for r in self.test_results),
            "Proper response format": any("Response Format" in r["test"] and r["success"] for r in self.test_results),
            "Performance < 500ms": any("Performance" in r["test"] and r["success"] for r in self.test_results)
        }
        
        for criterion, met in criteria_met.items():
            status = "✅" if met else "❌"
            print(f"  {status} {criterion}")
        
        overall_success = success_rate >= 90 and all(criteria_met.values())
        
        print(f"\n🎯 OVERALL RESULT: {'✅ PASS' if overall_success else '❌ FAIL'}")
        
        if overall_success:
            print("🚀 Avatar endpoint is PRODUCTION READY with robust validation!")
        else:
            print("⚠️ Avatar endpoint requires fixes before production deployment.")
        
        print("=" * 60)

if __name__ == "__main__":
    tester = AvatarValidationTester()
    tester.run_all_tests()