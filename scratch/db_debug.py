import sqlite3
import os

db_path = "inventory.db"
if not os.path.exists(db_path):
    print("DB not found")
else:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    docs = conn.execute("SELECT id, doc_number, status, current_role, created_by_id, created_by_name FROM documents").fetchall()
    print(f"Total docs: {len(docs)}")
    for d in docs:
        print(dict(d))
    
    users = conn.execute("SELECT id, name, email, role FROM users").fetchall()
    print("\nUsers:")
    for u in users:
        print(dict(u))
    conn.close()
