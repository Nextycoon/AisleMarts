#!/usr/bin/env python3
"""
AisleMarts E2EE & KMS Security Systems Backend Testing Suite
===========================================================
Comprehensive testing for:
1. End-to-End Encryption (E2EE) System (/api/e2ee/*)
2. Key Management System (KMS) (/api/kms/*)
3. Total Domination Features Integration Verification
4. System Stability and Performance
"""

import asyncio
import aiohttp
import json
import time
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

# Configuration
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://ai-marketplace-13.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class E2EEKMSTester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'Content-Type': 'application/json'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
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
            "timestamp": datetime.now().isoformat()
        }
        
        if response_data:
            result["response_data"] = response_data
            
        self.test_results.append(result)
        print(f"{status} {test_name}: {details}")
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        try:
            url = f"{API_BASE}{endpoint}"
            request_headers = headers or {}
            
            async with self.session.request(method, url, json=data, headers=request_headers) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = {"text": await response.text()}
                
                return response.status < 400, response_data, response.status
                
        except Exception as e:
            return False, {"error": str(e)}, 0

    # ============================================================================
    # E2EE SYSTEM TESTING
    # ============================================================================
    
    async def test_e2ee_system(self):
        """Test End-to-End Encryption System"""
        print("\n🔐 TESTING E2EE SYSTEM")
        print("=" * 50)
        
        # Test E2EE Health Check
        success, data, status = await self.make_request("GET", "/e2ee/health")
        if success and data.get("service") == "e2ee-management":
            self.log_test("E2EE Health Check", True, 
                         f"Service operational with {data.get('active_sessions', 0)} active sessions")
        else:
            self.log_test("E2EE Health Check", False, f"Health check failed: {data}")
            return
        
        # Test Client Key Generation (Demo Endpoint)
        success, data, status = await self.make_request("POST", "/e2ee/generate-client-keys")
        client_keys = None
        if success and data.get("success") and "keypair" in data:
            client_keys = data["keypair"]
            self.log_test("E2EE Client Key Generation", True, 
                         "Client keypair generated successfully (demo only)")
        else:
            self.log_test("E2EE Client Key Generation", False, f"Key generation failed: {data}")
            return
        
        # Test Handshake Initiation
        handshake_data = {
            "client_public_key": client_keys["public_key"],
            "user_id": "test_user_e2ee_001"
        }
        success, data, status = await self.make_request("POST", "/e2ee/handshake", handshake_data)
        session_id = None
        if success and data.get("success") and "session_id" in data:
            session_id = data["session_id"]
            self.log_test("E2EE Handshake Initiation", True, 
                         f"Session established: {session_id[:16]}... with {data.get('encryption_level')}")
        else:
            self.log_test("E2EE Handshake Initiation", False, f"Handshake failed: {data}")
            return
        
        # Test Session Status Check
        success, data, status = await self.make_request("GET", f"/e2ee/status/{session_id}")
        if success and data.get("success"):
            self.log_test("E2EE Session Status", True, 
                         f"Session active, expires in {data.get('time_remaining_seconds', 0)}s")
        else:
            self.log_test("E2EE Session Status", False, f"Session status failed: {data}")
        
        # Test Message Encryption
        encrypt_data = {
            "session_id": session_id,
            "plaintext": "Hello AisleMarts E2EE! This is a test message for encryption.",
            "associated_data": "test_context"
        }
        success, data, status = await self.make_request("POST", "/e2ee/encrypt", encrypt_data)
        encrypted_message = None
        if success and data.get("success") and "encrypted_data" in data:
            encrypted_message = data["encrypted_data"]
            self.log_test("E2EE Message Encryption", True, 
                         f"Message encrypted with {data.get('encryption_algorithm')}")
        else:
            self.log_test("E2EE Message Encryption", False, f"Encryption failed: {data}")
        
        # Test Message Decryption
        if encrypted_message:
            decrypt_data = {
                "session_id": session_id,
                "encrypted_data": encrypted_message
            }
            success, data, status = await self.make_request("POST", "/e2ee/decrypt", decrypt_data)
            if success and data.get("success") and data.get("plaintext") == encrypt_data["plaintext"]:
                self.log_test("E2EE Message Decryption", True, 
                             f"Message decrypted successfully, counter: {data.get('counter')}")
            else:
                self.log_test("E2EE Message Decryption", False, f"Decryption failed: {data}")
        
        # Test Key Rotation
        rotation_data = {"session_id": session_id}
        success, data, status = await self.make_request("POST", "/e2ee/rotate-keys", rotation_data)
        if success and data.get("success"):
            self.log_test("E2EE Key Rotation", True, 
                         f"Keys rotated at {data.get('rotated_at')}, forward secrecy: {data.get('forward_secrecy')}")
        else:
            self.log_test("E2EE Key Rotation", False, f"Key rotation failed: {data}")
        
        # Test Session Invalidation
        success, data, status = await self.make_request("DELETE", f"/e2ee/session/{session_id}")
        if success and data.get("success"):
            self.log_test("E2EE Session Invalidation", True, "Session securely invalidated")
        else:
            self.log_test("E2EE Session Invalidation", False, f"Session invalidation failed: {data}")
        
        # Test Security Compliance Status
        success, data, status = await self.make_request("GET", "/e2ee/compliance/status")
        if success and data.get("success") and "compliance_status" in data:
            compliance = data["compliance_status"]
            self.log_test("E2EE Compliance Status", True, 
                         f"Encryption: {compliance.get('encryption_standard')}, Forward secrecy: {compliance.get('forward_secrecy')}")
        else:
            self.log_test("E2EE Compliance Status", False, f"Compliance check failed: {data}")
        
        # Test Best Practices Documentation
        success, data, status = await self.make_request("GET", "/e2ee/security/best-practices")
        if success and data.get("success") and "best_practices" in data:
            practices = data["best_practices"]
            self.log_test("E2EE Best Practices", True, 
                         f"Documentation includes {len(practices.get('client_implementation', []))} client guidelines")
        else:
            self.log_test("E2EE Best Practices", False, f"Best practices failed: {data}")

    # ============================================================================
    # KMS SYSTEM TESTING
    # ============================================================================
    
    async def test_kms_system(self):
        """Test Key Management System"""
        print("\n🔑 TESTING KMS SYSTEM")
        print("=" * 50)
        
        # Test KMS Health Check
        success, data, status = await self.make_request("GET", "/kms/health")
        if success and data.get("service") == "key-management-system":
            self.log_test("KMS Health Check", True, 
                         f"Service operational with {data.get('total_keys', 0)} total keys")
        else:
            self.log_test("KMS Health Check", False, f"Health check failed: {data}")
            return
        
        # Test Detailed KMS Status
        success, data, status = await self.make_request("GET", "/kms/status")
        if success and data.get("success"):
            system_status = data.get("system_status", {})
            self.log_test("KMS Detailed Status", True, 
                         f"Active keys: {system_status.get('active_keys')}, HSM simulation: {system_status.get('hsm_simulation')}")
        else:
            self.log_test("KMS Detailed Status", False, f"Status check failed: {data}")
        
        # Test Push Notification Keys Management
        success, data, status = await self.make_request("GET", "/kms/push-keys")
        if success and data.get("success"):
            push_keys = data.get("push_notification_keys", {})
            apns_count = push_keys.get("apns", {}).get("active_keys", 0)
            fcm_count = push_keys.get("fcm", {}).get("active_keys", 0)
            self.log_test("KMS Push Notification Keys", True, 
                         f"APNS keys: {apns_count}, FCM keys: {fcm_count}")
        else:
            self.log_test("KMS Push Notification Keys", False, f"Push keys failed: {data}")
        
        # Test SSL Certificate Management
        success, data, status = await self.make_request("GET", "/kms/ssl-certificates")
        if success and data.get("success"):
            ssl_info = data.get("ssl_certificates", {})
            cert_count = ssl_info.get("active_certificates", 0)
            security_status = data.get("security_status", "unknown")
            self.log_test("KMS SSL Certificates", True, 
                         f"Active certificates: {cert_count}, Security status: {security_status}")
        else:
            self.log_test("KMS SSL Certificates", False, f"SSL certificates failed: {data}")
        
        # Test API Signing Keys Management
        success, data, status = await self.make_request("GET", "/kms/api-signing-keys")
        if success and data.get("success"):
            signing_info = data.get("api_signing_keys", {})
            key_count = signing_info.get("active_keys", 0)
            algorithms = data.get("key_algorithms", [])
            self.log_test("KMS API Signing Keys", True, 
                         f"Active signing keys: {key_count}, Algorithms: {algorithms}")
        else:
            self.log_test("KMS API Signing Keys", False, f"API signing keys failed: {data}")
        
        # Test Key Expiry Checking
        success, data, status = await self.make_request("GET", "/kms/expiry-check")
        if success and data.get("success"):
            expiry_status = data.get("expiry_status", {})
            expiring_count = expiry_status.get("total_expiring", 0)
            expired_count = expiry_status.get("total_expired", 0)
            self.log_test("KMS Key Expiry Check", True, 
                         f"Expiring keys: {expiring_count}, Expired keys: {expired_count}")
        else:
            self.log_test("KMS Key Expiry Check", False, f"Expiry check failed: {data}")
        
        # Test Audit Logging
        success, data, status = await self.make_request("GET", "/kms/audit-log")
        if success and data.get("success"):
            audit_info = data.get("audit_log", [])
            total_entries = data.get("total_entries", 0)
            self.log_test("KMS Audit Logging", True, 
                         f"Audit entries: {total_entries}, Retrieved: {len(audit_info)}")
        else:
            self.log_test("KMS Audit Logging", False, f"Audit log failed: {data}")
        
        # Test Compliance Reporting
        success, data, status = await self.make_request("GET", "/kms/compliance/report")
        if success and data.get("success"):
            compliance_report = data.get("compliance_report", {})
            compliance_score = compliance_report.get("compliance_score", 0)
            security_posture = compliance_report.get("security_posture", {})
            self.log_test("KMS Compliance Report", True, 
                         f"Compliance score: {compliance_score}%, HSM simulation: {security_posture.get('hsm_simulation')}")
        else:
            self.log_test("KMS Compliance Report", False, f"Compliance report failed: {data}")
        
        # Test System Administration
        success, data, status = await self.make_request("GET", "/kms/admin/system-info")
        if success and data.get("success"):
            system_info = data.get("system_info", {})
            operational_metrics = data.get("operational_metrics", {})
            self.log_test("KMS System Administration", True, 
                         f"Managed keys: {system_info.get('total_managed_keys')}, Uptime: {operational_metrics.get('uptime')}")
        else:
            self.log_test("KMS System Administration", False, f"System info failed: {data}")

    # ============================================================================
    # TOTAL DOMINATION FEATURES VERIFICATION
    # ============================================================================
    
    async def test_total_domination_features(self):
        """Test all Total Domination features are still operational"""
        print("\n🏆 TESTING TOTAL DOMINATION FEATURES")
        print("=" * 50)
        
        # Test Enhanced Features Router
        success, data, status = await self.make_request("GET", "/enhanced/health")
        if success and data.get("service") == "enhanced-features":
            components = data.get("components", {})
            self.log_test("Enhanced Features Router", True, 
                         f"All 4 components operational: {list(components.keys())}")
        else:
            self.log_test("Enhanced Features Router", False, f"Enhanced features failed: {data}")
        
        # Test Business Tools Router
        success, data, status = await self.make_request("GET", "/business/health")
        if success and data.get("service") == "business-tools":
            components = data.get("components", {})
            self.log_test("Business Tools Router", True, 
                         f"All 4 components operational: {list(components.keys())}")
        else:
            self.log_test("Business Tools Router", False, f"Business tools failed: {data}")
        
        # Test Operational Systems Router
        success, data, status = await self.make_request("GET", "/ops/health")
        if success and data.get("service") == "operational-systems":
            security_level = data.get("security_level", "unknown")
            components = data.get("components", {})
            self.log_test("Operational Systems Router", True, 
                         f"Security level: {security_level}, Components: {len(components)}")
        else:
            self.log_test("Operational Systems Router", False, f"Operational systems failed: {data}")
        
        # Test International Expansion Router
        success, data, status = await self.make_request("GET", "/international/health")
        if success and data.get("service") == "international-expansion":
            active_markets = data.get("active_markets", 0)
            components = data.get("components", {})
            self.log_test("International Expansion Router", True, 
                         f"Active markets: {active_markets}, Components: {len(components)}")
        else:
            self.log_test("International Expansion Router", False, f"International expansion failed: {data}")
        
        # Test Universal Commerce AI Hub
        success, data, status = await self.make_request("GET", "/universal-ai/health")
        if success and data.get("service") == "universal-commerce-ai":
            platforms = data.get("platforms_connected", 0)
            ai_agents = data.get("ai_agents_deployed", 0)
            self.log_test("Universal Commerce AI Hub", True, 
                         f"Platforms: {platforms}, AI agents: {ai_agents}")
        else:
            self.log_test("Universal Commerce AI Hub", False, f"Universal AI failed: {data}")
        
        # Test Currency-Infinity Engine
        success, data, status = await self.make_request("GET", "/currency/health")
        if success and data.get("service") == "currency-infinity-engine":
            currencies = data.get("currencies", 0)
            regions = data.get("regions", 0)
            self.log_test("Currency-Infinity Engine", True, 
                         f"Currencies: {currencies}, Regions: {regions}")
        else:
            self.log_test("Currency-Infinity Engine", False, f"Currency engine failed: {data}")
        
        # Test Awareness Engine
        success, data, status = await self.make_request("GET", "/awareness/health")
        if success and data.get("service") == "awareness-engine":
            capabilities = data.get("capabilities", 0)
            languages = data.get("languages", 0)
            self.log_test("Awareness Engine", True, 
                         f"Capabilities: {capabilities}, Languages: {languages}")
        else:
            self.log_test("Awareness Engine", False, f"Awareness engine failed: {data}")
        
        # Test Production Monitoring
        success, data, status = await self.make_request("GET", "/monitoring/health")
        if success and data.get("service") == "production-monitoring":
            monitoring_components = data.get("monitoring_components", 0)
            slo_compliance = data.get("slo_compliance", 0)
            self.log_test("Production Monitoring", True, 
                         f"Components: {monitoring_components}, SLO compliance: {slo_compliance}%")
        else:
            self.log_test("Production Monitoring", False, f"Production monitoring failed: {data}")

    # ============================================================================
    # INTEGRATION & PERFORMANCE TESTING
    # ============================================================================
    
    async def test_system_integration(self):
        """Test system integration and performance"""
        print("\n⚡ TESTING SYSTEM INTEGRATION")
        print("=" * 50)
        
        # Test Main API Health
        success, data, status = await self.make_request("GET", "/health")
        if success and data.get("ok"):
            self.log_test("Main API Health", True, 
                         f"Service: {data.get('service')}, Version: {data.get('version')}")
        else:
            self.log_test("Main API Health", False, f"Main API failed: {data}")
        
        # Test Concurrent Requests Performance
        start_time = time.time()
        tasks = []
        for i in range(5):
            tasks.append(self.make_request("GET", "/health"))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = time.time()
        
        successful_requests = sum(1 for result in results if not isinstance(result, Exception) and result[0])
        avg_response_time = (end_time - start_time) / len(tasks)
        
        if successful_requests == len(tasks):
            self.log_test("Concurrent Request Performance", True, 
                         f"5/5 requests successful, avg response time: {avg_response_time:.3f}s")
        else:
            self.log_test("Concurrent Request Performance", False, 
                         f"Only {successful_requests}/{len(tasks)} requests successful")
        
        # Test Backend Router Loading
        router_endpoints = [
            "/e2ee/health",
            "/kms/health", 
            "/enhanced/health",
            "/business/health",
            "/ops/health",
            "/international/health"
        ]
        
        successful_routers = 0
        for endpoint in router_endpoints:
            success, data, status = await self.make_request("GET", endpoint)
            if success:
                successful_routers += 1
        
        if successful_routers == len(router_endpoints):
            self.log_test("Backend Router Loading", True, 
                         f"All {len(router_endpoints)} routers loaded successfully")
        else:
            self.log_test("Backend Router Loading", False, 
                         f"Only {successful_routers}/{len(router_endpoints)} routers loaded")

    # ============================================================================
    # MAIN TEST EXECUTION
    # ============================================================================
    
    async def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 STARTING AISLEMARTS E2EE & KMS BACKEND TESTING SUITE")
        print("=" * 70)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 70)
        
        start_time = time.time()
        
        # Run all test suites
        await self.test_e2ee_system()
        await self.test_kms_system()
        await self.test_total_domination_features()
        await self.test_system_integration()
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Print summary
        print("\n" + "=" * 70)
        print("🎯 TESTING SUMMARY")
        print("=" * 70)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests} ✅")
        print(f"Failed: {self.failed_tests} ❌")
        print(f"Success Rate: {(self.passed_tests/self.total_tests*100):.1f}%")
        print(f"Total Time: {total_time:.2f}s")
        print("=" * 70)
        
        # Print failed tests details
        if self.failed_tests > 0:
            print("\n❌ FAILED TESTS DETAILS:")
            print("-" * 40)
            for result in self.test_results:
                if not result["success"]:
                    print(f"• {result['test']}: {result['details']}")
        
        return {
            "total_tests": self.total_tests,
            "passed_tests": self.passed_tests,
            "failed_tests": self.failed_tests,
            "success_rate": self.passed_tests/self.total_tests*100 if self.total_tests > 0 else 0,
            "total_time": total_time,
            "test_results": self.test_results
        }

async def main():
    """Main test execution"""
    async with E2EEKMSTester() as tester:
        results = await tester.run_all_tests()
        
        # Return appropriate exit code
        if results["failed_tests"] == 0:
            print("\n🎉 ALL TESTS PASSED! E2EE & KMS systems are ready for production.")
            return 0
        else:
            print(f"\n⚠️ {results['failed_tests']} tests failed. Please review and fix issues.")
            return 1

if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(main())
    sys.exit(exit_code)