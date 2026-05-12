import sqlite3
conn = sqlite3.connect("inventory.db")
conn.row_factory = sqlite3.Row
users = conn.execute("SELECT * FROM users").fetchall()
for u in users:
    print(f"ID: {u['id']}, Email: {u['email']}, Role: {u['role']}, Name: {u['name']}")
conn.close()
