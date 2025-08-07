#!/usr/bin/env python3
"""
H1B Explorer Backend API Test Script
Tests all API endpoints to ensure they're working correctly
"""

import requests
import json
import sys
from datetime import datetime

def test_endpoint(url, endpoint, description):
    """Test a specific API endpoint"""
    full_url = f"{url}{endpoint}"
    print(f"\n🔍 Testing {description}...")
    print(f"   URL: {full_url}")
    
    try:
        response = requests.get(full_url, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Success: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"   ❌ Failed: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 H1B Explorer Backend API Test")
    print("=" * 50)
    
    # Get backend URL from command line or use default
    if len(sys.argv) > 1:
        backend_url = sys.argv[1].rstrip('/')
    else:
        backend_url = "http://localhost:5000"
    
    print(f"Backend URL: {backend_url}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test endpoints
    tests = [
        ("/", "Root endpoint"),
        ("/api/test", "Backend connectivity test"),
        ("/api/db-status", "Database connection test"),
        ("/api/health", "Comprehensive health check")
    ]
    
    passed = 0
    total = len(tests)
    
    for endpoint, description in tests:
        if test_endpoint(backend_url, endpoint, description):
            passed += 1
    
    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the backend configuration.")
        sys.exit(1)

if __name__ == "__main__":
    main()
