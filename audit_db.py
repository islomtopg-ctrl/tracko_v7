import sqlite3

def audit_db():
    conn = sqlite3.connect('inventory.db')
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row['name'] for row in cur.fetchall() if not row['name'].startswith('sqlite_')]
    
    print("--- Database Schema Audit ---")
    for table in tables:
        print(f"\nTable: {table}")
        cur.execute(f"PRAGMA table_info({table})")
        cols = [dict(row) for row in cur.fetchall()]
        for col in cols:
            print(f"  - {col['name']} ({col['type']})")
            
    conn.close()

if __name__ == "__main__":
    audit_db()
