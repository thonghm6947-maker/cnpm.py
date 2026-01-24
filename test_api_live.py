
import urllib.request
import urllib.error
import json
import sys

# Configuration
BASE_URL = "http://127.0.0.1:9999"
ADMIN_EMAIL = "admin@careermate.com"
ADMIN_PASSWORD = "admin123"
OUTPUT_FILE = "verify_result.txt"

def log(msg):
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")
    print(msg)

def make_request(url, method="GET", data=None, headers=None):
    if headers is None: headers = {}
    if data:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        return e.code, json.loads(content) if content else {}
    except urllib.error.URLError as e:
        return None, {"error": str(e.reason)}

def run_test():
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("Starting Verification...\n")
        
    log(f"Connecting to {BASE_URL}...")
    
    # Login
    status, res = make_request(f"{BASE_URL}/api/auth/login", "POST", {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if status != 200:
        log(f"Login failed: {status} - {res}")
        return
        
    token = res.get('access_token')
    log("Login success!")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 1: Query param
    status, res = make_request(f"{BASE_URL}/api/admin/jobs?status=pending", headers=headers)
    if status == 200:
        jobs = res.get('jobs', [])
        log(f"GET /jobs?status=pending -> Found {len(jobs)} jobs")
        for j in jobs:
            log(f"  - [{j.get('status')}] {j.get('title')}")
    else:
        log(f"GET /jobs?status=pending FAILED: {status} - {res}")

    # Test 2: New Endpoint
    status, res = make_request(f"{BASE_URL}/api/admin/jobs/pending", headers=headers)
    if status == 200:
        jobs = res.get('jobs', [])
        log(f"GET /jobs/pending -> Found {len(jobs)} jobs")
    else:
        log(f"GET /jobs/pending FAILED: {status} - {res}")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        log(f"CRITICAL ERROR: {e}")
