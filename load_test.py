#!/usr/bin/env python3
"""
AisleMarts Load Testing - Python-based Performance Validation
Tests RFQ creation and affiliate click ingestion under load
"""

import asyncio
import aiohttp
import time
import json
import random
import statistics
from datetime import datetime
from typing import List, Dict, Any

# Test configuration
API_BASE = "https://market-launch-4.preview.emergentagent.com"
MOCK_BUYER_TOKEN = "mock-token-for-testing"  # We'll test without auth first

class LoadTestResults:
    def __init__(self, test_name: str):
        self.test_name = test_name
        self.request_times: List[float] = []
        self.success_count = 0
        self.error_count = 0
        self.errors: List[str] = []
        self.start_time = time.time()
        
    def add_result(self, response_time: float, success: bool, error: str = None):
        self.request_times.append(response_time)
        if success:
            self.success_count += 1
        else:
            self.error_count += 1
            if error:
                self.errors.append(error)
    
    def get_summary(self) -> Dict[str, Any]:
        total_time = time.time() - self.start_time
        total_requests = len(self.request_times)
        
        if self.request_times:
            avg_time = statistics.mean(self.request_times)
            p95_time = statistics.quantiles(self.request_times, n=20)[18] if len(self.request_times) > 20 else max(self.request_times)
            p99_time = statistics.quantiles(self.request_times, n=100)[98] if len(self.request_times) > 100 else max(self.request_times)
        else:
            avg_time = p95_time = p99_time = 0
            
        error_rate = (self.error_count / total_requests) * 100 if total_requests > 0 else 0
        rps = total_requests / total_time if total_time > 0 else 0
        
        return {
            "test_name": self.test_name,
            "total_requests": total_requests,
            "success_count": self.success_count,
            "error_count": self.error_count,
            "error_rate_percent": error_rate,
            "requests_per_second": rps,
            "avg_response_time_ms": avg_time * 1000,
            "p95_response_time_ms": p95_time * 1000,
            "p99_response_time_ms": p99_time * 1000,
            "total_duration_seconds": total_time,
            "sample_errors": self.errors[:5]  # First 5 errors
        }

def generate_test_rfq() -> Dict[str, Any]:
    """Generate realistic RFQ test data"""
    categories = ['electronics', 'fashion', 'home_garden', 'machinery']
    destinations = ['Los Angeles, CA, USA', 'New York, NY, USA', 'Chicago, IL, USA']
    
    return {
        "title": f"Load Test RFQ - {random.choice(categories).title()} Order {random.randint(1000, 9999)}",
        "category": random.choice(categories),
        "description": f"Bulk procurement for {random.randint(100, 5000)} units. Load testing scenario.",
        "specifications": {
            "material": random.choice(["Plastic", "Metal", "Fabric"]),
            "color": random.choice(["Black", "White", "Blue"]),
            "certifications": ["CE", "FCC"],
            "sample_required": random.choice([True, False])
        },
        "quantity": random.randint(100, 2000),
        "target_price": round(random.uniform(10, 100), 2),
        "currency": "USD",
        "shipping_destination": random.choice(destinations),
        "attachments": []
    }

def generate_affiliate_event() -> Dict[str, Any]:
    """Generate affiliate click event"""
    return {
        "name": "affiliate_click",
        "props": {
            "link_id": f"test_link_{random.randint(1, 100)}",
            "product_id": f"prod_{random.randint(1, 50)}",
            "campaign_id": f"camp_{random.randint(1, 10)}",
            "referrer": random.choice(["instagram", "tiktok", "youtube"]),
            "click_timestamp": int(time.time() * 1000)
        },
        "source": "load_test"
    }

async def test_health_endpoint(session: aiohttp.ClientSession) -> bool:
    """Test basic connectivity"""
    try:
        async with session.get(f"{API_BASE}/health", timeout=aiohttp.ClientTimeout(total=5)) as response:
            return response.status == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

async def test_rfq_creation(session: aiohttp.ClientSession, results: LoadTestResults):
    """Test single RFQ creation"""
    rfq_data = generate_test_rfq()
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "AisleMarts-LoadTest/1.0"
    }
    
    start_time = time.time()
    try:
        async with session.post(
            f"{API_BASE}/api/b2b/rfq",
            json=rfq_data,
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=10)
        ) as response:
            response_time = time.time() - start_time
            
            if response.status in [200, 201, 202]:
                results.add_result(response_time, True)
                return True
            else:
                error_text = await response.text()
                results.add_result(response_time, False, f"Status {response.status}: {error_text[:100]}")
                return False
                
    except asyncio.TimeoutError:
        response_time = time.time() - start_time
        results.add_result(response_time, False, "Request timeout")
        return False
    except Exception as e:
        response_time = time.time() - start_time
        results.add_result(response_time, False, f"Exception: {str(e)}")
        return False

async def test_affiliate_event(session: aiohttp.ClientSession, results: LoadTestResults):
    """Test affiliate event ingestion"""
    event_data = generate_affiliate_event()
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "AisleMarts-LoadTest/1.0"
    }
    
    start_time = time.time()
    try:
        async with session.post(
            f"{API_BASE}/v1/events",
            json=event_data,
            headers=headers,
            timeout=aiohttp.ClientTimeout(total=5)
        ) as response:
            response_time = time.time() - start_time
            
            if response.status in [200, 201, 202, 204]:
                results.add_result(response_time, True)
                return True
            else:
                error_text = await response.text()
                results.add_result(response_time, False, f"Status {response.status}: {error_text[:100]}")
                return False
                
    except Exception as e:
        response_time = time.time() - start_time
        results.add_result(response_time, False, f"Exception: {str(e)}")
        return False

async def run_concurrent_load_test(test_func, concurrent_users: int, duration_seconds: int, test_name: str):
    """Run concurrent load test"""
    results = LoadTestResults(test_name)
    
    connector = aiohttp.TCPConnector(limit=100, limit_per_host=50)
    timeout = aiohttp.ClientTimeout(total=30)
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        # Health check first
        if not await test_health_endpoint(session):
            print(f"❌ Health check failed for {test_name}")
            return results.get_summary()
        
        print(f"🚀 Starting {test_name}: {concurrent_users} concurrent users for {duration_seconds}s")
        
        async def worker():
            end_time = time.time() + duration_seconds
            while time.time() < end_time:
                await test_func(session, results)
                await asyncio.sleep(random.uniform(0.1, 1.0))  # Random delay
        
        # Start concurrent workers
        tasks = [asyncio.create_task(worker()) for _ in range(concurrent_users)]
        await asyncio.gather(*tasks, return_exceptions=True)
    
    return results.get_summary()

def print_test_results(summary: Dict[str, Any]):
    """Print formatted test results"""
    print(f"\n📊 {summary['test_name'].upper()} RESULTS")
    print("=" * 50)
    print(f"📈 Performance:")
    print(f"   • Total Requests: {summary['total_requests']}")
    print(f"   • Requests/sec: {summary['requests_per_second']:.2f}")
    print(f"   • Success Rate: {((summary['success_count']/summary['total_requests'])*100):.1f}%")
    print(f"   • Error Rate: {summary['error_rate_percent']:.2f}%")
    print(f"   • Duration: {summary['total_duration_seconds']:.1f}s")
    
    print(f"\n⏱️ Response Times:")
    print(f"   • Average: {summary['avg_response_time_ms']:.0f}ms")
    print(f"   • P95: {summary['p95_response_time_ms']:.0f}ms")
    print(f"   • P99: {summary['p99_response_time_ms']:.0f}ms")
    
    # SLO checks
    print(f"\n🎯 SLO Compliance:")
    p95_pass = summary['p95_response_time_ms'] < 400
    error_pass = summary['error_rate_percent'] < 0.5
    throughput_pass = summary['requests_per_second'] > 10  # Lower threshold for testing
    
    print(f"   • P95 < 400ms: {'✅ PASS' if p95_pass else '❌ FAIL'} ({summary['p95_response_time_ms']:.0f}ms)")
    print(f"   • Error Rate < 0.5%: {'✅ PASS' if error_pass else '❌ FAIL'} ({summary['error_rate_percent']:.2f}%)")
    print(f"   • Throughput > 10 RPS: {'✅ PASS' if throughput_pass else '❌ FAIL'} ({summary['requests_per_second']:.1f} RPS)")
    
    overall_pass = p95_pass and error_pass and throughput_pass
    print(f"\n🏆 Overall: {'✅ PRODUCTION READY' if overall_pass else '❌ NEEDS OPTIMIZATION'}")
    
    if summary['sample_errors']:
        print(f"\n⚠️ Sample Errors:")
        for error in summary['sample_errors']:
            print(f"   • {error}")

async def main():
    """Run comprehensive load tests"""
    print("🔥 AisleMarts Load Testing Suite")
    print("================================")
    
    # Test 1: RFQ Creation Load Test (smaller scale for our environment)
    print("\n1️⃣ Testing RFQ Creation under load...")
    rfq_results = await run_concurrent_load_test(
        test_rfq_creation, 
        concurrent_users=20, 
        duration_seconds=60,  # 1 minute
        test_name="RFQ Creation Load Test"
    )
    print_test_results(rfq_results)
    
    # Wait between tests
    print("\n⏳ Waiting 10 seconds between tests...")
    await asyncio.sleep(10)
    
    # Test 2: Affiliate Event Ingestion
    print("\n2️⃣ Testing Affiliate Event ingestion...")
    affiliate_results = await run_concurrent_load_test(
        test_affiliate_event,
        concurrent_users=50,
        duration_seconds=60,  # 1 minute 
        test_name="Affiliate Event Ingestion Test"
    )
    print_test_results(affiliate_results)
    
    # Summary
    print(f"\n🎯 LOAD TESTING COMPLETE")
    print("=" * 50)
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"load_test_results_{timestamp}.json"
    
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": timestamp,
            "rfq_test": rfq_results,
            "affiliate_test": affiliate_results
        }, f, indent=2)
    
    print(f"📁 Results saved to: {results_file}")

if __name__ == "__main__":
    asyncio.run(main())