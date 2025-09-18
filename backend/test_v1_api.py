"""
Simple test script for v1 API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8001"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_search():
    """Test search endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/v1/search")
        print(f"Search: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data.get('items', []))} products")
            return True
        else:
            print(f"Search failed: {response.text}")
            return False
    except Exception as e:
        print(f"Search test failed: {e}")
        return False

def test_trending():
    """Test trending endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/v1/trending?segment=luxury")
        print(f"Trending: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data.get('items', []))} trending products")
            return True
        else:
            print(f"Trending failed: {response.text}")
            return False
    except Exception as e:
        print(f"Trending test failed: {e}")
        return False

def test_agent_quick_actions():
    """Test agent quick actions"""
    try:
        response = requests.get(f"{BASE_URL}/v1/agent/quick-actions")
        print(f"Quick actions: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data.get('actions', []))} quick actions")
            return True
        else:
            print(f"Quick actions failed: {response.text}")
            return False
    except Exception as e:
        print(f"Quick actions test failed: {e}")
        return False

def test_media_locked():
    """Test media endpoints (should be locked)"""
    try:
        response = requests.get(f"{BASE_URL}/v1/media/feed")
        print(f"Media feed: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Media locked: {data.get('locked', False)}")
            return True
        else:
            print(f"Media feed failed: {response.text}")
            return False
    except Exception as e:
        print(f"Media test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing AisleMarts v1 API endpoints...")
    
    tests = [
        ("Health Check", test_health),
        ("Search Products", test_search),
        ("Trending Products", test_trending),
        ("Agent Quick Actions", test_agent_quick_actions),
        ("Media Feed (Locked)", test_media_locked)
    ]
    
    passed = 0
    total = len(tests)
    
    for name, test_func in tests:
        print(f"\n📋 Testing: {name}")
        if test_func():
            print(f"✅ {name} - PASSED")
            passed += 1
        else:
            print(f"❌ {name} - FAILED")
    
    print(f"\n🏁 Test Results: {passed}/{total} passed")
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed")