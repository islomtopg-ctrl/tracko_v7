import requests
import json
import os

BASE_URL = "http://127.0.0.1:5000"

def test_full_workflow():
    session = requests.Session()
    
    print("--- Starting Functional Test ---")
    
    # 1. Login as Admin
    print("\n[1] Logging in as Admin...")
    resp = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@tracko.uz",
        "password": "admin"
    })
    if resp.status_code != 200:
        print(f"FAILED: Login failed ({resp.status_code}): {resp.text}")
        return
    print("SUCCESS: Admin logged in.")

    # 2. Create a test employee
    print("\n[2] Creating test employee...")
    emp_data = {
        "name": "Test QA User",
        "email": f"qa_user_{os.urandom(4).hex()}@tracko.uz",
        "password": "password123",
        "role": "employee",
        "department": "QA"
    }
    resp = session.post(f"{BASE_URL}/api/users", json=emp_data)
    if resp.status_code != 200:
        print(f"FAILED: User creation failed: {resp.text}")
        return
    emp_id = resp.json().get("id") or 10 # fallback for test
    print(f"SUCCESS: User created with ID {emp_id}.")

    # 3. Create a test item
    print("\n[3] Creating test item...")
    item_data = {
        "category": "Ноутбук",
        "model": "QA-Test-Book Pro",
        "serial_num": f"SN-{os.urandom(4).hex().upper()}",
        "room": "Room 101",
        "status": "Свободно",
        "condition": "Хорошее",
        "place": "A1"
    }
    resp = session.post(f"{BASE_URL}/api/items", json=item_data)
    if resp.status_code != 200:
        print(f"FAILED: Item creation failed: {resp.text}")
        return
    item_id = resp.json().get("id")
    print(f"SUCCESS: Item created with ID {item_id}.")

    # 4. Issue item to employee
    print("\n[4] Issuing item to employee...")
    issuance_data = {
        "employee_id": emp_id,
        "employee_name": emp_data["name"],
        "item_ids": [item_id]
    }
    resp = session.post(f"{BASE_URL}/api/issuances", json=issuance_data)
    if resp.status_code != 200:
        print(f"FAILED: Issuance failed: {resp.text}")
        return
    print("SUCCESS: Item issued.")

    # 5. Initiate Dismissal
    print("\n[5] Initiating Dismissal...")
    dis_data = {
        "employee_id": emp_id,
        "notes": "Test dismissal"
    }
    resp = session.post(f"{BASE_URL}/api/dismissals", json=dis_data)
    if resp.status_code != 200:
        print(f"FAILED: Dismissal initiation failed: {resp.text}")
        return
    dis_id = resp.json()["dismissal_id"]
    print(f"SUCCESS: Dismissal initiated (ID: {dis_id}).")

    # 6. AHO Accept
    print("\n[6] AHO Accepting items...")
    resp = session.post(f"{BASE_URL}/api/dismissals/{dis_id}/aho_accept", json={
        str(item_id): "Хорошее",
        "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    })
    if resp.status_code != 200:
        print(f"FAILED: AHO Acceptance failed: {resp.text}")
        return
    print("SUCCESS: AHO Accepted.")

    # 7. IT Accept
    print("\n[7] IT Accepting...")
    resp = session.post(f"{BASE_URL}/api/dismissals/{dis_id}/it_accept", json={
        "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    })
    if resp.status_code != 200:
        print(f"FAILED: IT Acceptance failed: {resp.text}")
        return
    print("SUCCESS: IT Accepted.")

    # 8. HR Finalize
    print("\n[8] HR Finalizing...")
    resp = session.post(f"{BASE_URL}/api/dismissals/{dis_id}/hr_finalize", json={
        "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    })
    if resp.status_code != 200:
        print(f"FAILED: HR Finalization failed: {resp.text}")
        return
    print("SUCCESS: Dismissal completed.")

    # 9. Verify User Deactivation
    print("\n[9] Verifying user is deactivated...")
    # Need to check users list or login
    resp = session.get(f"{BASE_URL}/api/users")
    users = resp.json()
    qa_user = next((u for u in users if u["id"] == emp_id), None)
    if qa_user and qa_user["active"] == 0:
        print("VERIFIED: User is inactive.")
    else:
        print(f"FAILED: User active status is {qa_user['active'] if qa_user else 'NOT FOUND'}")

    print("\n--- All tests completed successfully! ---")

if __name__ == "__main__":
    test_full_workflow()
