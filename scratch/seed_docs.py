import sqlite3
import os

db_path = r"c:\Users\islom\OneDrive\Рабочий стол\final_v8\inventory.db"

def seed_docs():
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.execute("DELETE FROM documents")
    cur.execute("DELETE FROM doc_approvals")
    cur.execute("DELETE FROM doc_comments")
    cur.execute("DELETE FROM sqlite_sequence WHERE name IN ('documents', 'doc_approvals', 'doc_comments')")
    
    # Add a sample document
    cur.execute("""INSERT INTO documents 
    (doc_number, doc_type, title, description, priority, status, current_step, current_role, created_by_id, created_by_name)
    VALUES (?,?,?,?,?,?,?,?,?,?)""",
    ("ЗАЯ-2026-0001", "doc_request", "Закупка MacBook M3", "Для нового дизайнера", "high", "pending", 1, "aho", 1, "Администратор"))
    
    cur.execute("""INSERT INTO documents 
    (doc_number, doc_type, title, description, priority, status, current_step, current_role, created_by_id, created_by_name)
    VALUES (?,?,?,?,?,?,?,?,?,?)""",
    ("СПИ-2026-0002", "write_off", "Списание серверов Dell", "Устаревшее оборудование", "medium", "pending", 1, "aho", 1, "Администратор"))
    
    doc_id = cur.lastrowid
    
    # Add approvals
    approvals = [
        (doc_id, 1, "aho", "АХО / IT", None, None, None, None),
        (doc_id, 2, "deputy", "Зам. Директора", None, None, None, None),
        (doc_id, 3, "director", "Ген. Директор", None, None, None, None),
        (doc_id, 4, "accountant", "Бухгалтер", None, None, None, None)
    ]
    
    cur.executemany("INSERT INTO doc_approvals (doc_id, step, role, role_label, approver_id, approver_name, action, comment) VALUES (?,?,?,?,?,?,?,?)", approvals)
    
    # Add a comment
    cur.execute("INSERT INTO doc_comments (doc_id, user_id, user_name, user_role, text) VALUES (?,?,?,?,?)",
               (doc_id, 1, "Администратор", "superadmin", "Документ создан и ожидает проверки АХО."))
    
    conn.commit()
    conn.close()
    print("Sample document seeded.")

if __name__ == "__main__":
    seed_docs()
