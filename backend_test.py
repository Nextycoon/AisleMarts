#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Legal Document Hosting Endpoints
Testing Focus: App Store compliance, ETag caching, security headers, performance
"""

import requests
import time
import json
from datetime import datetime
import hashlib
import os
from urllib.parse import urljoin

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://market-launch-4.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class LegalDocumentTester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_result(self, test_name, success, details="", response_time=None):
        """Log test result with details"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        time_info = f" ({response_time:.3f}s)" if response_time else ""
        print(f"{status}: {test_name}{time_info}")
        if details:
            print(f"    Details: {details}")
    
    def test_health_endpoint(self):
        """Test legal service health check endpoint"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/legal/health", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["service", "status", "documents", "features"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Legal Health Check", False, 
                                  f"Missing fields: {missing_fields}", response_time)
                else:
                    # Check document availability
                    docs = data.get("documents", {})
                    privacy_available = docs.get("privacy_policy", {}).get("available", False)
                    terms_available = docs.get("terms_of_service", {}).get("available", False)
                    
                    if privacy_available and terms_available:
                        features = data.get("features", [])
                        expected_features = ["html_rendering", "etag_caching", "version_tracking", 
                                           "app_store_headers", "mobile_responsive"]
                        
                        if all(feature in features for feature in expected_features):
                            self.log_result("Legal Health Check", True, 
                                          f"All documents available, {len(features)} features enabled", 
                                          response_time)
                        else:
                            missing_features = [f for f in expected_features if f not in features]
                            self.log_result("Legal Health Check", False, 
                                          f"Missing features: {missing_features}", response_time)
                    else:
                        self.log_result("Legal Health Check", False, 
                                      f"Documents not available - Privacy: {privacy_available}, Terms: {terms_available}", 
                                      response_time)
            else:
                self.log_result("Legal Health Check", False, 
                              f"HTTP {response.status_code}: {response.text}", response_time)
                
        except Exception as e:
            self.log_result("Legal Health Check", False, f"Exception: {str(e)}")
    
    def test_privacy_policy_endpoint(self):
        """Test privacy policy endpoint with App Store compliance validation"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/legal/privacy-policy", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                # Check content type
                content_type = response.headers.get('content-type', '')
                if 'text/html' not in content_type:
                    self.log_result("Privacy Policy Content Type", False, 
                                  f"Expected text/html, got {content_type}", response_time)
                    return
                
                # Check App Store compliance headers
                required_headers = {
                    'Cache-Control': 'public, max-age=3600',
                    'ETag': None,  # Should exist but value varies
                    'Last-Modified': None,  # Should exist but value varies
                    'X-Doc-Version': None,  # Should exist but value varies
                    'Content-Security-Policy': 'default-src \'none\'; style-src \'unsafe-inline\'; img-src data:;',
                    'X-Content-Type-Options': 'nosniff',
                    'Referrer-Policy': 'no-referrer',
                    'X-Frame-Options': 'DENY'
                }
                
                missing_headers = []
                incorrect_headers = []
                
                for header, expected_value in required_headers.items():
                    actual_value = response.headers.get(header)
                    if actual_value is None:
                        missing_headers.append(header)
                    elif expected_value is not None and actual_value != expected_value:
                        incorrect_headers.append(f"{header}: expected '{expected_value}', got '{actual_value}'")
                
                if missing_headers or incorrect_headers:
                    issues = []
                    if missing_headers:
                        issues.append(f"Missing: {missing_headers}")
                    if incorrect_headers:
                        issues.append(f"Incorrect: {incorrect_headers}")
                    
                    self.log_result("Privacy Policy App Store Headers", False, 
                                  "; ".join(issues), response_time)
                else:
                    # Check HTML content structure
                    content = response.text
                    required_elements = [
                        '<!doctype html>',
                        '<title>Privacy Policy - AisleMarts Legal</title>',
                        'AisleMarts Privacy Policy',
                        'privacy@aislemarts.com'
                    ]
                    
                    missing_elements = [elem for elem in required_elements if elem not in content]
                    
                    if missing_elements:
                        self.log_result("Privacy Policy HTML Structure", False, 
                                      f"Missing elements: {missing_elements}", response_time)
                    else:
                        # Check document size (should be substantial)
                        size_kb = len(content) / 1024
                        if size_kb < 5:  # Less than 5KB seems too small for a privacy policy
                            self.log_result("Privacy Policy Content Size", False, 
                                          f"Document too small: {size_kb:.1f}KB", response_time)
                        else:
                            self.log_result("Privacy Policy Endpoint", True, 
                                          f"Valid HTML document ({size_kb:.1f}KB) with all required headers", 
                                          response_time)
            else:
                self.log_result("Privacy Policy Endpoint", False, 
                              f"HTTP {response.status_code}: {response.text}", response_time)
                
        except Exception as e:
            self.log_result("Privacy Policy Endpoint", False, f"Exception: {str(e)}")
    
    def test_terms_of_service_endpoint(self):
        """Test terms of service endpoint with App Store compliance validation"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/legal/terms-of-service", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                # Check content type
                content_type = response.headers.get('content-type', '')
                if 'text/html' not in content_type:
                    self.log_result("Terms of Service Content Type", False, 
                                  f"Expected text/html, got {content_type}", response_time)
                    return
                
                # Check App Store compliance headers (same as privacy policy)
                required_headers = {
                    'Cache-Control': 'public, max-age=3600',
                    'ETag': None,
                    'Last-Modified': None,
                    'X-Doc-Version': None,
                    'Content-Security-Policy': 'default-src \'none\'; style-src \'unsafe-inline\'; img-src data:;',
                    'X-Content-Type-Options': 'nosniff',
                    'Referrer-Policy': 'no-referrer',
                    'X-Frame-Options': 'DENY'
                }
                
                missing_headers = []
                for header, expected_value in required_headers.items():
                    actual_value = response.headers.get(header)
                    if actual_value is None:
                        missing_headers.append(header)
                    elif expected_value is not None and actual_value != expected_value:
                        missing_headers.append(f"{header} (incorrect value)")
                
                if missing_headers:
                    self.log_result("Terms of Service App Store Headers", False, 
                                  f"Issues with headers: {missing_headers}", response_time)
                else:
                    # Check HTML content structure
                    content = response.text
                    required_elements = [
                        '<!doctype html>',
                        '<title>Terms of Service - AisleMarts Legal</title>',
                        'AisleMarts Terms of Service',
                        'legal@aislemarts.com'
                    ]
                    
                    missing_elements = [elem for elem in required_elements if elem not in content]
                    
                    if missing_elements:
                        self.log_result("Terms of Service HTML Structure", False, 
                                      f"Missing elements: {missing_elements}", response_time)
                    else:
                        size_kb = len(content) / 1024
                        if size_kb < 5:
                            self.log_result("Terms of Service Content Size", False, 
                                          f"Document too small: {size_kb:.1f}KB", response_time)
                        else:
                            self.log_result("Terms of Service Endpoint", True, 
                                          f"Valid HTML document ({size_kb:.1f}KB) with all required headers", 
                                          response_time)
            else:
                self.log_result("Terms of Service Endpoint", False, 
                              f"HTTP {response.status_code}: {response.text}", response_time)
                
        except Exception as e:
            self.log_result("Terms of Service Endpoint", False, f"Exception: {str(e)}")
    
    def test_etag_caching_privacy_policy(self):
        """Test ETag caching functionality for privacy policy"""
        try:
            # First request to get ETag
            start_time = time.time()
            response1 = requests.get(f"{BASE_URL}/legal/privacy-policy", timeout=10)
            response_time1 = time.time() - start_time
            
            if response1.status_code != 200:
                self.log_result("ETag Caching - Privacy Policy", False, 
                              f"First request failed: HTTP {response1.status_code}", response_time1)
                return
            
            etag = response1.headers.get('ETag')
            if not etag:
                self.log_result("ETag Caching - Privacy Policy", False, 
                              "No ETag header in first response", response_time1)
                return
            
            # Second request with If-None-Match header
            start_time = time.time()
            headers = {'If-None-Match': etag}
            response2 = requests.get(f"{BASE_URL}/legal/privacy-policy", headers=headers, timeout=10)
            response_time2 = time.time() - start_time
            
            if response2.status_code == 304:
                self.log_result("ETag Caching - Privacy Policy", True, 
                              f"304 Not Modified returned correctly (ETag: {etag})", 
                              response_time1 + response_time2)
            else:
                self.log_result("ETag Caching - Privacy Policy", False, 
                              f"Expected 304, got {response2.status_code}", 
                              response_time1 + response_time2)
                
        except Exception as e:
            self.log_result("ETag Caching - Privacy Policy", False, f"Exception: {str(e)}")
    
    def test_etag_caching_terms_of_service(self):
        """Test ETag caching functionality for terms of service"""
        try:
            # First request to get ETag
            start_time = time.time()
            response1 = requests.get(f"{BASE_URL}/legal/terms-of-service", timeout=10)
            response_time1 = time.time() - start_time
            
            if response1.status_code != 200:
                self.log_result("ETag Caching - Terms of Service", False, 
                              f"First request failed: HTTP {response1.status_code}", response_time1)
                return
            
            etag = response1.headers.get('ETag')
            if not etag:
                self.log_result("ETag Caching - Terms of Service", False, 
                              "No ETag header in first response", response_time1)
                return
            
            # Second request with If-None-Match header
            start_time = time.time()
            headers = {'If-None-Match': etag}
            response2 = requests.get(f"{BASE_URL}/legal/terms-of-service", headers=headers, timeout=10)
            response_time2 = time.time() - start_time
            
            if response2.status_code == 304:
                self.log_result("ETag Caching - Terms of Service", True, 
                              f"304 Not Modified returned correctly (ETag: {etag})", 
                              response_time1 + response_time2)
            else:
                self.log_result("ETag Caching - Terms of Service", False, 
                              f"Expected 304, got {response2.status_code}", 
                              response_time1 + response_time2)
                
        except Exception as e:
            self.log_result("ETag Caching - Terms of Service", False, f"Exception: {str(e)}")
    
    def test_version_endpoints(self):
        """Test version tracking endpoints"""
        endpoints = [
            ("Privacy Policy Version", "/legal/privacy-policy/version"),
            ("Terms of Service Version", "/legal/terms-of-service/version")
        ]
        
        for test_name, endpoint in endpoints:
            try:
                start_time = time.time()
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ["document", "version", "last_modified", "url"]
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_result(test_name, False, 
                                      f"Missing fields: {missing_fields}", response_time)
                    else:
                        # Validate version format (should be a hash)
                        version = data.get("version", "")
                        if len(version) < 8:  # ETags should be at least 8 characters
                            self.log_result(test_name, False, 
                                          f"Version too short: {version}", response_time)
                        else:
                            self.log_result(test_name, True, 
                                          f"Version: {version}, Last Modified: {data.get('last_modified')}", 
                                          response_time)
                else:
                    self.log_result(test_name, False, 
                                  f"HTTP {response.status_code}: {response.text}", response_time)
                    
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
    
    def test_error_handling(self):
        """Test error handling for missing documents"""
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/legal/nonexistent-document", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 404:
                self.log_result("Error Handling - 404 for Missing Document", True, 
                              "Correctly returns 404 for nonexistent document", response_time)
            else:
                self.log_result("Error Handling - 404 for Missing Document", False, 
                              f"Expected 404, got {response.status_code}", response_time)
                
        except Exception as e:
            self.log_result("Error Handling - 404 for Missing Document", False, f"Exception: {str(e)}")
    
    def test_performance_benchmarks(self):
        """Test performance requirements (under 2 seconds)"""
        endpoints = [
            ("Privacy Policy Performance", "/legal/privacy-policy"),
            ("Terms of Service Performance", "/legal/terms-of-service"),
            ("Health Check Performance", "/legal/health")
        ]
        
        for test_name, endpoint in endpoints:
            try:
                start_time = time.time()
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    if response_time < 2.0:
                        self.log_result(test_name, True, 
                                      f"Response time: {response_time:.3f}s (under 2s requirement)", 
                                      response_time)
                    else:
                        self.log_result(test_name, False, 
                                      f"Response time: {response_time:.3f}s (exceeds 2s requirement)", 
                                      response_time)
                else:
                    self.log_result(test_name, False, 
                                  f"HTTP {response.status_code} (performance test failed)", response_time)
                    
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
    
    def test_mobile_responsiveness(self):
        """Test mobile viewport and responsive design"""
        try:
            start_time = time.time()
            headers = {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
            }
            response = requests.get(f"{BASE_URL}/legal/privacy-policy", headers=headers, timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                content = response.text
                mobile_indicators = [
                    'viewport" content="width=device-width,initial-scale=1"',
                    '@media (max-width: 768px)',
                    'font-family: system-ui'
                ]
                
                found_indicators = [indicator for indicator in mobile_indicators if indicator in content]
                
                if len(found_indicators) >= 2:  # At least 2 mobile indicators should be present
                    self.log_result("Mobile Responsiveness", True, 
                                  f"Found {len(found_indicators)}/3 mobile design indicators", 
                                  response_time)
                else:
                    self.log_result("Mobile Responsiveness", False, 
                                  f"Only found {len(found_indicators)}/3 mobile design indicators", 
                                  response_time)
            else:
                self.log_result("Mobile Responsiveness", False, 
                              f"HTTP {response.status_code}", response_time)
                
        except Exception as e:
            self.log_result("Mobile Responsiveness", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run comprehensive legal document endpoint testing"""
        print("🚀 Starting Comprehensive Legal Document Backend Testing")
        print(f"Backend URL: {BASE_URL}")
        print("=" * 80)
        
        # Core endpoint tests
        self.test_health_endpoint()
        self.test_privacy_policy_endpoint()
        self.test_terms_of_service_endpoint()
        
        # ETag caching tests
        self.test_etag_caching_privacy_policy()
        self.test_etag_caching_terms_of_service()
        
        # Version tracking tests
        self.test_version_endpoints()
        
        # Error handling tests
        self.test_error_handling()
        
        # Performance tests
        self.test_performance_benchmarks()
        
        # Mobile responsiveness test
        self.test_mobile_responsiveness()
        
        # Summary
        print("=" * 80)
        print(f"🏆 TESTING COMPLETE: {self.passed_tests}/{self.total_tests} tests passed")
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("✅ SERIES A READY: Legal document endpoints meet App Store compliance requirements")
        elif success_rate >= 75:
            print("⚠️  NEEDS ATTENTION: Some issues found, but core functionality working")
        else:
            print("❌ CRITICAL ISSUES: Major problems found, not ready for App Store submission")
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "success_rate": success_rate,
            "results": self.results
        }

if __name__ == "__main__":
    tester = LegalDocumentTester()
    results = tester.run_all_tests()
    
    # Save detailed results to file
    with open('/app/legal_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/legal_test_results.json")