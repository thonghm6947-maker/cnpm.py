
import urllib.request
import urllib.error
import json
import time
import sys

BASE_URL = "http://127.0.0.1:9999"
LOG_FILE = "verify_flow_log.txt"

# Clear log file
with open(LOG_FILE, "w", encoding="utf-8") as f:
    f.write("=== START LOG ===\n")

def log(msg):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

def make_request(url, method="GET", data=None, headers=None):
    if headers is None: headers = {}
    if data:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            status = r.status
            content = r.read().decode('utf-8')
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        return e.code, json.loads(content) if content else {}
    except urllib.error.URLError as e:
        return None, {"error": str(e.reason)}

def run():
    log("Starting verification flow...")
    
    # 1. Login Recruiter
    log("\n[1] Login Recruiter...")
    status, res = make_request(f"{BASE_URL}/api/auth/login", "POST", {
        "email": "recruiter_test_flow@careermate.com", "password": "password123"
    })
    
    token = None
    if status != 200:
        log("    Recruiter login failed. Registering...")
        status, res = make_request(f"{BASE_URL}/api/auth/register", "POST", {
            "email": "recruiter_test_flow@careermate.com",
            "password": "password123", "password_confirm": "password123",
            "role": "recruiter", "full_name": "Test Recruiter", "phone": "123"
        })
        if status == 201:
            log("    Registered. Logging in...")
            status, res = make_request(f"{BASE_URL}/api/auth/login", "POST", {
                "email": "recruiter_test_flow@careermate.com", "password": "password123"
            })
    
    if status == 200:
        token = res.get('access_token')
        log("    Recruiter Login SUCCESS.")
    else:
        log(f"    Recruiter Login FAILED: {res}")
        return

    rec_headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Job
    log("\n[2] Creating Job...")
    status, res = make_request(f"{BASE_URL}/api/recruiter/jobs", "POST", {
        "title": "Test Job For Admin View",
        "description": "Desc",
        "salary_min": 1000, "salary_max": 2000,
        "location": "Hanoi"
    }, headers=rec_headers)
    
    if status == 201:
        job_id = res.get('job_id')
        log(f"    Job Created. ID: {job_id}. Status: {res.get('status')}")
    else:
        log(f"    Create Job FAILED: {res}")
        return

    # 3. Submit Job
    log("\n[3] Submitting Job...")
    status, res = make_request(f"{BASE_URL}/api/recruiter/jobs/{job_id}/submit", "POST", {}, headers=rec_headers)
    if status == 200:
        log(f"    Job Submitted. New Status: {res.get('job', {}).get('status')}")
    else:
        log(f"    Submit Job FAILED: {res}")
        return

    # 4. Login Admin
    log("\n[4] Login Admin...")
    status, res = make_request(f"{BASE_URL}/api/auth/login", "POST", {
        "email": "admin@careermate.com", "password": "admin123"
    })
    
    if status == 200:
        admin_token = res.get('access_token')
        log("    Admin Login SUCCESS.")
    else:
        log(f"    Admin Login FAILED: {res}")
        return

    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 5. Check Pending Jobs
    log("\n[5] Checking Admin Pending Jobs List...")
    status, res = make_request(f"{BASE_URL}/api/admin/jobs?status=pending", headers=admin_headers)
    
    if status == 200:
        jobs = res.get('jobs', [])
        found = any(j.get('job_id') == job_id for j in jobs)
        log(f"    GET /jobs?status=pending -> Found {len(jobs)} jobs.")
        if found:
            log("    SUCCESS: Our submitted job is visible!")
        else:
            log("    FAILURE: Our submitted job is NOT visible.")
            log(f"    Jobs found: {[j.get('job_id') for j in jobs]}")
    else:
        log(f"    GET /jobs?status=pending FAILED: {res}")

if __name__ == "__main__":
    run()
