import sqlite3

def migrate_dismissals():
    conn = sqlite3.connect('inventory.db')
    try:
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(dismissals)")
        cols = [row[1] for row in cur.fetchall()]
        
        needed = [
            ("aho_cleared", "INTEGER DEFAULT 0"),
            ("aho_at", "TIMESTAMP"),
            ("aho_by_id", "INTEGER"),
            ("aho_by_name", "TEXT"),
            ("it_cleared", "INTEGER DEFAULT 0"),
            ("it_at", "TIMESTAMP"),
            ("it_by_id", "INTEGER"),
            ("it_by_name", "TEXT")
        ]
        
        for col, typ in needed:
            if col not in cols:
                print(f"Adding column {col} to dismissals...")
                conn.execute(f"ALTER TABLE dismissals ADD COLUMN {col} {typ}")
        
        conn.commit()
        print("Migration for 'dismissals' completed.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_dismissals()
