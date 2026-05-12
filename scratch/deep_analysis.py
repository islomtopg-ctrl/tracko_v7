import sqlite3
import os
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

db_path = r"c:\Users\islom\OneDrive\Рабочий стол\final_v8\inventory.db"

def analyze_db():
    if not os.path.exists(db_path):
        print("ERROR: inventory.db NOT FOUND")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get all table names
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in cur.fetchall()]
    
    print(f"Analysis of inventory.db ({os.path.getsize(db_path)} bytes)")
    print("-" * 50)
    
    for table in tables:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        print(f"Table: {table:20} | Rows: {count}")
        
        if count > 0 and table in ['items', 'users', 'history']:
            # Peek at first row
            cur.execute(f"SELECT * FROM {table} LIMIT 1")
            col_names = [description[0] for description in cur.description]
            row = cur.fetchone()
            print(f"  Example: {dict(zip(col_names, row))}")
    
    conn.close()

analyze_db()
