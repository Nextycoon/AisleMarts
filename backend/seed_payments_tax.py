import asyncio
from datetime import datetime
import uuid
from payments_tax_service import payments_tax_service
from db import db

async def seed_payments_tax_data():
    """Seed payments and tax data with sample configurations"""
    print("💳 Seeding Payments & Tax Data...")
    
    try:
        # Initialize payment methods, tax rules, and currencies
        print("💰 Initializing payment methods, tax rules, and currencies...")
        result = await payments_tax_service.initialize_payments_tax_data()
        print(f"✅ Payment/Tax initialization: {result}")
        
        # Test payment method suggestions for different countries
        print("🌍 Testing payment method suggestions...")
        
        test_scenarios = [
            {"country": "US", "currency": "USD", "amount": 150.0, "user_type": "B2C"},
            {"country": "GB", "currency": "GBP", "amount": 120.0, "user_type": "B2C"},
            {"country": "TR", "currency": "TRY", "amount": 5000.0, "user_type": "B2C"},
            {"country": "DE", "currency": "EUR", "amount": 200.0, "user_type": "B2B"},
            {"country": "JP", "currency": "JPY", "amount": 15000.0, "user_type": "B2C"}
        ]
        
        for scenario in test_scenarios:
            methods = await payments_tax_service.suggest_payment_methods(
                scenario["country"],
                scenario["currency"],
                scenario["amount"],
                scenario["user_type"]
            )
            print(f"✅ Payment methods for {scenario['country']}: {len(methods['methods'])} options")
        
        # Test tax calculations
        print("📊 Testing tax calculations...")
        
        tax_test_scenarios = [
            {
                "country": "US",
                "items": [
                    {"sku": "PHONE001", "category": "electronics", "price": 800.0, "quantity": 1}
                ],
                "role": "B2C"
            },
            {
                "country": "GB", 
                "items": [
                    {"sku": "SHIRT001", "category": "clothing", "price": 50.0, "quantity": 2},
                    {"sku": "BOOK001", "category": "books", "price": 15.0, "quantity": 1}
                ],
                "role": "B2C"
            },
            {
                "country": "TR",
                "items": [
                    {"sku": "LAPTOP001", "category": "electronics", "price": 1200.0, "quantity": 1}
                ],
                "role": "B2B"
            },
            {
                "country": "DE",
                "items": [
                    {"sku": "WATCH001", "category": "electronics", "price": 300.0, "quantity": 1},
                    {"sku": "BAG001", "category": "clothing", "price": 80.0, "quantity": 1}
                ],
                "role": "B2C"
            }
        ]
        
        for scenario in tax_test_scenarios:
            tax_result = await payments_tax_service.compute_tax(
                scenario["country"],
                scenario["items"],
                scenario["role"]
            )
            total_price = sum(item["price"] * item["quantity"] for item in scenario["items"])
            print(f"✅ Tax for {scenario['country']} {scenario['role']}: ${tax_result['total_tax']:.2f} on ${total_price:.2f}")
        
        # Test currency conversions
        print("💱 Testing currency conversions...")
        
        conversion_tests = [
            {"from": "USD", "to": "EUR", "amount": 100.0},
            {"from": "GBP", "to": "USD", "amount": 80.0},
            {"from": "TRY", "to": "USD", "amount": 2500.0},
            {"from": "JPY", "to": "EUR", "amount": 10000.0}
        ]
        
        for test in conversion_tests:
            conversion = await payments_tax_service.get_currency_conversion(
                test["from"],
                test["to"],
                test["amount"]
            )
            if "error" not in conversion:
                print(f"✅ {test['amount']} {test['from']} = {conversion['converted_amount']} {test['to']} (rate: {conversion['rate']:.6f})")
            else:
                print(f"❌ Conversion error: {conversion['error']}")
        
        # Test fraud risk assessment
        print("🛡️ Testing fraud risk assessments...")
        
        fraud_test_scenarios = [
            {
                "country": "US",
                "amount": 50.0,
                "payment_method": "card",
                "user_history": {"account_age_days": 365, "previous_transactions": 12}
            },
            {
                "country": "TR",
                "amount": 1500.0,
                "payment_method": "card",
                "user_history": {"account_age_days": 15, "previous_transactions": 0}
            },
            {
                "country": "RU",
                "amount": 800.0,
                "payment_method": "crypto",
                "user_history": {"account_age_days": 5, "previous_transactions": 0, "transactions_last_24h": 3}
            }
        ]
        
        for scenario in fraud_test_scenarios:
            risk_assessment = await payments_tax_service.assess_fraud_risk(scenario)
            print(f"✅ Fraud risk for {scenario['country']} ${scenario['amount']}: {risk_assessment['risk_level']} ({risk_assessment['risk_score']}/100)")
        
        # Create sample payment recommendations for common scenarios
        print("🎯 Creating sample payment recommendations...")
        
        recommendation_scenarios = [
            {"country": "US", "currency": "USD", "amount_range": [0, 500], "user_type": "B2C"},
            {"country": "US", "currency": "USD", "amount_range": [500, 5000], "user_type": "B2B"},
            {"country": "GB", "currency": "GBP", "amount_range": [0, 1000], "user_type": "B2C"},
            {"country": "TR", "currency": "TRY", "amount_range": [0, 10000], "user_type": "B2C"},
            {"country": "DE", "currency": "EUR", "amount_range": [0, 2000], "user_type": "B2C"}
        ]
        
        for scenario in recommendation_scenarios:
            rec_id = f"rec_{scenario['country']}_{scenario['currency']}_{scenario['user_type']}"
            
            # Get payment methods for mid-range amount
            mid_amount = (scenario["amount_range"][0] + scenario["amount_range"][1]) / 2
            methods = await payments_tax_service.suggest_payment_methods(
                scenario["country"],
                scenario["currency"],
                mid_amount,
                scenario["user_type"]
            )
            
            recommendation_doc = {
                "_id": rec_id,
                "country_code": scenario["country"],
                "currency": scenario["currency"],
                "amount_range_min": scenario["amount_range"][0],
                "amount_range_max": scenario["amount_range"][1],
                "user_type": scenario["user_type"],
                "recommended_methods": methods["methods"][:3],  # Top 3 methods
                "last_updated": datetime.utcnow(),
                "ai_generated": True
            }
            
            await db().payment_recommendations.replace_one(
                {"_id": rec_id},
                recommendation_doc,
                upsert=True
            )
        
        print("✅ Sample payment recommendations created")
        
        print("\n🎉 Payments & Tax data seeding completed successfully!")
        print("\n📊 Summary:")
        
        # Print summary stats
        payment_methods_count = await db().payment_methods.count_documents({"active": True})
        tax_rules_count = await db().tax_rules.count_documents({"active": True})
        currencies_count = await db().currencies.count_documents({"active": True})
        recommendations_count = await db().payment_recommendations.count_documents({})
        
        print(f"   💳 Payment Methods: {payment_methods_count}")
        print(f"   📋 Tax Rules: {tax_rules_count}")
        print(f"   💱 Currencies: {currencies_count}")
        print(f"   🎯 Payment Recommendations: {recommendations_count}")
        
        # Show sample payment method recommendations
        print("\n💡 Sample Payment Recommendations:")
        sample_us = await payments_tax_service.suggest_payment_methods("US", "USD", 100.0, "B2C")
        if sample_us["methods"]:
            print(f"   🇺🇸 US ($100): {sample_us['methods'][0]['display_name']} (score: {sample_us['methods'][0]['score']})")
        
        sample_tr = await payments_tax_service.suggest_payment_methods("TR", "TRY", 2000.0, "B2C")
        if sample_tr["methods"]:
            print(f"   🇹🇷 TR (₺2000): {sample_tr['methods'][0]['display_name']} (score: {sample_tr['methods'][0]['score']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error seeding payments/tax data: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(seed_payments_tax_data())