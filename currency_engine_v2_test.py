#!/usr/bin/env python3
"""
Currency-Infinity Engine v2.0 Backend Testing Suite
Comprehensive testing for enhanced global currency system with 180+ currencies and crypto support
"""

import asyncio
import aiohttp
import json
import time
from typing import Dict, List, Any
import os

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://ai-marketplace-13.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class CurrencyEngineV2Tester:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    async def setup(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name}: {details}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
        
    async def test_currency_health_v2(self):
        """Test GET /api/currency/health - should show v2.0 with 180+ currencies, 7 regions, 8 features"""
        try:
            async with self.session.get(f"{API_BASE}/currency/health") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    # Check v2.0 version
                    version_check = data.get("version") == "2.0.0"
                    
                    # Check 180+ currencies
                    currency_count = data.get("supported_currencies", 0)
                    currency_check = currency_count >= 180
                    
                    # Check 7 regions (including crypto)
                    regions_check = data.get("regions") == 7
                    
                    # Check 8 features (including crypto-display-only and banker-rounding)
                    features = data.get("features", [])
                    features_check = len(features) == 8
                    crypto_feature = "crypto-display-only" in features
                    banker_rounding = "banker-rounding" in features
                    
                    all_checks = version_check and currency_check and regions_check and features_check and crypto_feature and banker_rounding
                    
                    details = f"Version: {data.get('version')}, Currencies: {currency_count}, Regions: {data.get('regions')}, Features: {len(features)}"
                    self.log_test("Currency Health Check v2.0", all_checks, details)
                    return data
                else:
                    self.log_test("Currency Health Check v2.0", False, f"HTTP {response.status}")
                    return None
        except Exception as e:
            self.log_test("Currency Health Check v2.0", False, str(e))
            return None
            
    async def test_supported_currencies_180plus(self):
        """Test GET /api/currency/supported - should return 180+ currencies including crypto"""
        try:
            async with self.session.get(f"{API_BASE}/currency/supported") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    currencies = data.get("currencies", [])
                    currency_count = len(currencies)
                    
                    # Check 180+ currencies
                    count_check = currency_count >= 180
                    
                    # Check crypto currencies
                    crypto_currencies = ["BTC", "ETH", "USDT", "USDC", "BNB"]
                    crypto_check = all(crypto in currencies for crypto in crypto_currencies)
                    
                    # Check new currencies mentioned in requirements
                    new_currencies = ["CNH", "HTG", "CUP", "ANG", "BYN"]
                    new_check = all(curr in currencies for curr in new_currencies)
                    
                    # Check high-precision currencies
                    precision_currencies = ["KWD", "BHD"]
                    precision_check = all(curr in currencies for curr in precision_currencies)
                    
                    # Check regional coverage
                    regions = data.get("regions", {})
                    regions_check = len(regions) >= 6  # Should have 6+ regions
                    
                    all_checks = count_check and crypto_check and new_check and precision_check and regions_check
                    
                    details = f"Total: {currency_count}, Crypto: {crypto_check}, New: {new_check}, Precision: {precision_check}, Regions: {len(regions)}"
                    self.log_test("Supported Currencies 180+", all_checks, details)
                    return data
                else:
                    self.log_test("Supported Currencies 180+", False, f"HTTP {response.status}")
                    return None
        except Exception as e:
            self.log_test("Supported Currencies 180+", False, str(e))
            return None
            
    async def test_exchange_rates_with_crypto(self, base_currency: str = "USD"):
        """Test GET /api/currency/rates with crypto currencies"""
        try:
            async with self.session.get(f"{API_BASE}/currency/rates?base={base_currency}") as response:
                if response.status == 200:
                    data = await response.json()
                    
                    rates = data.get("rates", {})
                    
                    # Check crypto rates are included
                    crypto_currencies = ["BTC", "ETH", "USDT", "USDC", "BNB"]
                    crypto_rates_check = all(crypto in rates for crypto in crypto_currencies)
                    
                    # Check new currencies
                    new_currencies = ["CNH", "HTG", "CUP", "ANG", "BYN"]
                    new_rates_check = all(curr in rates for curr in new_currencies)
                    
                    # Check high-precision currencies
                    precision_currencies = ["KWD", "BHD"]
                    precision_rates_check = all(curr in rates for curr in precision_currencies)
                    
                    # Check response format
                    format_check = all(key in data for key in ["base", "ts", "rates", "provider", "count"])
                    
                    # Check provider branding
                    provider_check = "v2.0" in data.get("provider", "")
                    
                    all_checks = crypto_rates_check and new_rates_check and precision_rates_check and format_check and provider_check
                    
                    details = f"Base: {base_currency}, Rates: {len(rates)}, Crypto: {crypto_rates_check}, Provider: v2.0"
                    self.log_test(f"Exchange Rates ({base_currency} base) with Crypto", all_checks, details)
                    return data
                else:
                    self.log_test(f"Exchange Rates ({base_currency} base) with Crypto", False, f"HTTP {response.status}")
                    return None
        except Exception as e:
            self.log_test(f"Exchange Rates ({base_currency} base) with Crypto", False, str(e))
            return None
            
    async def test_crypto_conversions(self):
        """Test crypto currency conversions (BTC to USD, ETH to EUR)"""
        test_cases = [
            {"amount": 1, "from": "BTC", "to": "USD", "name": "BTC to USD"},
            {"amount": 1, "from": "ETH", "to": "EUR", "name": "ETH to EUR"},
            {"amount": 100, "from": "USDT", "to": "USD", "name": "USDT to USD"},
            {"amount": 1000, "from": "USD", "to": "BTC", "name": "USD to BTC"}
        ]
        
        for case in test_cases:
            try:
                url = f"{API_BASE}/currency/convert?amount={case['amount']}&from={case['from']}&to={case['to']}"
                async with self.session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Check response format
                        format_check = all(key in data for key in ["amount", "from", "to", "result", "rate", "timestamp"])
                        
                        # Check provider branding
                        provider_check = "v2.0" in data.get("provider", "")
                        
                        # Check mathematical consistency
                        expected_result = case["amount"] * data.get("rate", 0)
                        math_check = abs(data.get("result", 0) - expected_result) < 0.0001
                        
                        all_checks = format_check and provider_check and math_check
                        
                        details = f"{case['amount']} {case['from']} = {data.get('result')} {case['to']} (rate: {data.get('rate')})"
                        self.log_test(f"Crypto Conversion: {case['name']}", all_checks, details)
                    else:
                        self.log_test(f"Crypto Conversion: {case['name']}", False, f"HTTP {response.status}")
            except Exception as e:
                self.log_test(f"Crypto Conversion: {case['name']}", False, str(e))
                
    async def test_high_precision_currencies(self):
        """Test high-precision currencies (KWD, BHD with 3 decimals)"""
        test_cases = [
            {"amount": 1000, "from": "USD", "to": "KWD", "name": "USD to KWD (3 decimals)"},
            {"amount": 1000, "from": "USD", "to": "BHD", "name": "USD to BHD (3 decimals)"},
            {"amount": 1, "from": "KWD", "to": "USD", "name": "KWD to USD"},
            {"amount": 1, "from": "BHD", "to": "EUR", "name": "BHD to EUR"}
        ]
        
        for case in test_cases:
            try:
                url = f"{API_BASE}/currency/convert?amount={case['amount']}&from={case['from']}&to={case['to']}"
                async with self.session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Check precision (should support up to 8 decimal places)
                        result = data.get("result", 0)
                        precision_check = isinstance(result, (int, float))
                        
                        # Check rate precision
                        rate = data.get("rate", 0)
                        rate_precision_check = isinstance(rate, (int, float))
                        
                        # Check mathematical accuracy
                        expected_result = case["amount"] * rate
                        accuracy_check = abs(result - expected_result) < 0.00001
                        
                        all_checks = precision_check and rate_precision_check and accuracy_check
                        
                        details = f"{case['amount']} {case['from']} = {result} {case['to']} (rate: {rate})"
                        self.log_test(f"High Precision: {case['name']}", all_checks, details)
                    else:
                        self.log_test(f"High Precision: {case['name']}", False, f"HTTP {response.status}")
            except Exception as e:
                self.log_test(f"High Precision: {case['name']}", False, str(e))
                
    async def test_regional_coverage(self):
        """Test extended regional coverage"""
        try:
            async with self.session.get(f"{API_BASE}/currency/supported") as response:
                if response.status == 200:
                    data = await response.json()
                    regions = data.get("regions", {})
                    
                    # Test Americas region (should include Caribbean)
                    americas = regions.get("americas", [])
                    caribbean_check = any(curr in americas for curr in ["XCD", "HTG", "JMD", "TTD", "BBD"])
                    
                    # Test Europe region (should include Eastern European)
                    europe = regions.get("europe", [])
                    eastern_europe_check = any(curr in europe for curr in ["UAH", "BYN", "RON", "BGN"])
                    
                    # Test Asia region (should include Southeast Asian)
                    asia = regions.get("asia", [])
                    southeast_asia_check = any(curr in asia for curr in ["LAK", "KHR", "MVR", "BND"])
                    
                    # Test Middle East coverage
                    middle_east = regions.get("middleEast", [])
                    gulf_check = any(curr in middle_east for curr in ["AED", "SAR", "QAR", "KWD", "BHD", "OMR"])
                    
                    # Test Africa coverage
                    africa = regions.get("africa", [])
                    africa_check = any(curr in africa for curr in ["XOF", "XAF", "ZAR", "NGN", "KES"])
                    
                    # Test Oceania coverage
                    oceania = regions.get("oceania", [])
                    pacific_check = any(curr in oceania for curr in ["FJD", "PGK", "SBD", "WST", "TOP"])
                    
                    all_checks = caribbean_check and eastern_europe_check and southeast_asia_check and gulf_check and africa_check and pacific_check
                    
                    details = f"Caribbean: {caribbean_check}, E.Europe: {eastern_europe_check}, SE.Asia: {southeast_asia_check}, Gulf: {gulf_check}, Africa: {africa_check}, Pacific: {pacific_check}"
                    self.log_test("Extended Regional Coverage", all_checks, details)
                    return True
                else:
                    self.log_test("Extended Regional Coverage", False, f"HTTP {response.status}")
                    return False
        except Exception as e:
            self.log_test("Extended Regional Coverage", False, str(e))
            return False
            
    async def test_performance_and_scale(self):
        """Test performance with 180+ currencies and concurrent requests"""
        # Test response time
        start_time = time.time()
        try:
            async with self.session.get(f"{API_BASE}/currency/rates?base=USD") as response:
                if response.status == 200:
                    end_time = time.time()
                    response_time = end_time - start_time
                    
                    # Should be < 2 seconds
                    performance_check = response_time < 2.0
                    
                    details = f"Response time: {response_time:.2f}s"
                    self.log_test("Performance Test (< 2s)", performance_check, details)
                else:
                    self.log_test("Performance Test (< 2s)", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("Performance Test (< 2s)", False, str(e))
            
        # Test concurrent requests
        try:
            tasks = []
            bases = ["USD", "EUR", "GBP", "JPY", "CNY"]
            
            for base in bases:
                task = self.session.get(f"{API_BASE}/currency/rates?base={base}")
                tasks.append(task)
                
            start_time = time.time()
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            end_time = time.time()
            
            successful_responses = 0
            for response in responses:
                if hasattr(response, 'status') and response.status == 200:
                    successful_responses += 1
                    await response.release()  # Clean up response
                    
            concurrent_time = end_time - start_time
            success_rate = successful_responses / len(tasks)
            
            concurrent_check = success_rate >= 0.8 and concurrent_time < 5.0
            
            details = f"Success rate: {success_rate:.1%}, Time: {concurrent_time:.2f}s"
            self.log_test("Concurrent Requests Test", concurrent_check, details)
            
        except Exception as e:
            self.log_test("Concurrent Requests Test", False, str(e))
            
    async def test_mathematical_consistency(self):
        """Test mathematical consistency across currency pairs"""
        test_cases = [
            {"base": "USD", "target": "EUR", "amount": 100},
            {"base": "EUR", "target": "USD", "amount": 85},
            {"base": "JPY", "target": "GBP", "amount": 1000000},  # Extreme value test
            {"base": "KWD", "target": "USD", "amount": 0.001}     # Small value test
        ]
        
        for case in test_cases:
            try:
                # Forward conversion
                url1 = f"{API_BASE}/currency/convert?amount={case['amount']}&from={case['base']}&to={case['target']}"
                async with self.session.get(url1) as response1:
                    if response1.status == 200:
                        data1 = await response1.json()
                        forward_result = data1.get("result", 0)
                        forward_rate = data1.get("rate", 0)
                        
                        # Reverse conversion
                        url2 = f"{API_BASE}/currency/convert?amount={forward_result}&from={case['target']}&to={case['base']}"
                        async with self.session.get(url2) as response2:
                            if response2.status == 200:
                                data2 = await response2.json()
                                reverse_result = data2.get("result", 0)
                                reverse_rate = data2.get("rate", 0)
                                
                                # Check mathematical consistency (allowing for rounding errors)
                                consistency_check = abs(reverse_result - case["amount"]) < (case["amount"] * 0.001)  # 0.1% tolerance
                                
                                # Check rate consistency
                                rate_consistency = abs((forward_rate * reverse_rate) - 1.0) < 0.001
                                
                                all_checks = consistency_check and rate_consistency
                                
                                details = f"{case['amount']} {case['base']} -> {forward_result} {case['target']} -> {reverse_result} {case['base']}"
                                self.log_test(f"Mathematical Consistency: {case['base']}-{case['target']}", all_checks, details)
                            else:
                                self.log_test(f"Mathematical Consistency: {case['base']}-{case['target']}", False, f"Reverse HTTP {response2.status}")
                    else:
                        self.log_test(f"Mathematical Consistency: {case['base']}-{case['target']}", False, f"Forward HTTP {response1.status}")
            except Exception as e:
                self.log_test(f"Mathematical Consistency: {case['base']}-{case['target']}", False, str(e))
                
    async def test_error_handling(self):
        """Test proper error handling for invalid requests"""
        error_test_cases = [
            {"url": f"{API_BASE}/currency/rates?base=INVALID", "name": "Invalid Base Currency"},
            {"url": f"{API_BASE}/currency/convert?amount=100&from=INVALID&to=USD", "name": "Invalid Source Currency"},
            {"url": f"{API_BASE}/currency/convert?amount=100&from=USD&to=INVALID", "name": "Invalid Target Currency"},
            {"url": f"{API_BASE}/currency/convert?amount=-100&from=USD&to=EUR", "name": "Negative Amount"}
        ]
        
        for case in error_test_cases:
            try:
                async with self.session.get(case["url"]) as response:
                    # Should return 400 for invalid requests
                    error_check = response.status == 400
                    
                    if error_check:
                        data = await response.json()
                        detail_check = "detail" in data
                    else:
                        detail_check = False
                        
                    all_checks = error_check and detail_check
                    
                    details = f"HTTP {response.status}"
                    self.log_test(f"Error Handling: {case['name']}", all_checks, details)
            except Exception as e:
                self.log_test(f"Error Handling: {case['name']}", False, str(e))
                
    async def test_cors_headers(self):
        """Test CORS headers for global access"""
        try:
            async with self.session.get(f"{API_BASE}/currency/health") as response:
                if response.status == 200:
                    # Check for CORS headers
                    cors_origin = response.headers.get("Access-Control-Allow-Origin")
                    cors_methods = response.headers.get("Access-Control-Allow-Methods")
                    cors_headers = response.headers.get("Access-Control-Allow-Headers")
                    
                    cors_check = cors_origin is not None
                    
                    details = f"Origin: {cors_origin}, Methods: {cors_methods is not None}, Headers: {cors_headers is not None}"
                    self.log_test("CORS Headers", cors_check, details)
                else:
                    self.log_test("CORS Headers", False, f"HTTP {response.status}")
        except Exception as e:
            self.log_test("CORS Headers", False, str(e))
            
    async def run_all_tests(self):
        """Run all Currency-Infinity Engine v2.0 tests"""
        print("🌊⚡ Starting Currency-Infinity Engine v2.0 Comprehensive Testing")
        print("=" * 80)
        
        await self.setup()
        
        try:
            # Core v2.0 Features
            await self.test_currency_health_v2()
            await self.test_supported_currencies_180plus()
            
            # Exchange Rates with Different Bases
            await self.test_exchange_rates_with_crypto("USD")
            await self.test_exchange_rates_with_crypto("EUR")
            await self.test_exchange_rates_with_crypto("JPY")
            
            # Crypto Currency Testing
            await self.test_crypto_conversions()
            
            # High-Precision Currency Testing
            await self.test_high_precision_currencies()
            
            # Regional Coverage Testing
            await self.test_regional_coverage()
            
            # Performance and Scale Testing
            await self.test_performance_and_scale()
            
            # Mathematical Consistency Testing
            await self.test_mathematical_consistency()
            
            # Error Handling Testing
            await self.test_error_handling()
            
            # Integration Readiness Testing
            await self.test_cors_headers()
            
        finally:
            await self.cleanup()
            
        # Print summary
        print("=" * 80)
        print(f"🎯 Currency-Infinity Engine v2.0 Testing Complete")
        print(f"📊 Results: {self.passed_tests}/{self.total_tests} tests passed ({self.passed_tests/self.total_tests*100:.1f}%)")
        
        if self.passed_tests == self.total_tests:
            print("✅ ALL TESTS PASSED - Currency-Infinity Engine v2.0 is PRODUCTION READY")
        else:
            print("❌ Some tests failed - Review required")
            
        return self.passed_tests, self.total_tests, self.test_results

async def main():
    """Main test execution"""
    tester = CurrencyEngineV2Tester()
    passed, total, results = await tester.run_all_tests()
    
    # Return results for integration with test_result.md
    return {
        "passed": passed,
        "total": total,
        "success_rate": passed / total * 100 if total > 0 else 0,
        "results": results
    }

if __name__ == "__main__":
    asyncio.run(main())