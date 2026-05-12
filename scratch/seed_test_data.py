import sqlite3, bcrypt, os

DB_PATH = 'inventory.db'

ROLES = [
    ("Администратор", "admin@tracko.uz", "superadmin"),
    ("АХО Менеджер", "aho@tracko.uz", "aho"),
    ("HR Директор", "hr@tracko.uz", "hr"),
    ("Ген. Директор", "director@tracko.uz", "director"),
    ("Зам. Директора", "deputy@tracko.uz", "deputy"),
    ("Главный Бухгалтер", "acc@tracko.uz", "accountant"),
    ("Аудитор", "audit@tracko.uz", "auditor"),
    ("Наблюдатель", "view@tracko.uz", "viewer"),
    ("Обычный Сотрудник", "emp@tracko.uz", "employee")
]

PASSWORD = "admin"

def seed():
    conn = sqlite3.connect(DB_PATH)
    db = conn.cursor()
    
    pw_hash = bcrypt.hashpw(PASSWORD.encode(), bcrypt.gensalt()).decode()
    
    print("Seeding users...")
    for name, email, role in ROLES:
        # Check if user exists
        db.execute("SELECT id FROM users WHERE email=?", (email,))
        row = db.fetchone()
        if row:
            print(f"Updating user {email}...")
            db.execute("UPDATE users SET name=?, role=?, password_hash=?, active=1 WHERE id=?", 
                       (name, role, pw_hash, row[0]))
        else:
            print(f"Creating user {email}...")
            db.execute("INSERT INTO users (name, email, role, password_hash, active, force_password_change) VALUES (?, ?, ?, ?, 1, 0)",
                       (name, email, role, pw_hash))
    
    conn.commit()
    print("\nAll test users created/updated successfully!")
    print(f"Password for all users: {PASSWORD}")
    print("\nCredentials:")
    for name, email, role in ROLES:
        print(f"- {name} ({role}): {email}")
    
    conn.close()

if __name__ == "__main__":
    seed()
