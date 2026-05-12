import os
import secrets
import sqlite3
import bcrypt

def setup():
    print("=== Tracko Cloud ERP: Установка Production Окружения ===")
    
    # 1. Generate secure .env
    env_path = ".env"
    if not os.path.exists(env_path):
        print("[*] Генерация файла .env с надежными ключами...")
        secret_key = secrets.token_hex(32)
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(f"SECRET_KEY={secret_key}\n")
            f.write("FLASK_ENV=production\n")
            f.write("SECURE_COOKIES=True\n")
            f.write("JWT_EXPIRY=43200\n")
        print("[+] .env успешно создан.")
    else:
        print("[!] .env уже существует. Пропускаем.")

    # 2. Setup Database and First Admin
    db_file = "inventory.db"
    if not os.path.exists(db_file):
        print("[*] Создание пустой базы данных inventory.db...")
        open(db_file, 'a').close()
    
    # Import init_db and migrate_db from app if possible to create tables
    try:
        from app import init_db, migrate_db
        print("[*] Инициализация таблиц базы данных...")
        init_db()
        migrate_db()
    except Exception as e:
        print(f"[!] Ошибка инициализации таблиц: {e}")
        return

    # 3. Create Super Admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@tracko.uz").strip()
    admin_pass = os.environ.get("ADMIN_PASS", "admin123").strip()

    try:
        conn = sqlite3.connect(db_file)
        cur = conn.cursor()
        
        # Check if admin already exists
        cur.execute("SELECT id FROM users WHERE email = ?", (admin_email,))
        if cur.fetchone():
            print(f"[!] Пользователь {admin_email} уже существует.")
        else:
            print(f"[*] Создание супер-админа {admin_email}...")
            hashed = bcrypt.hashpw(admin_pass.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cur.execute("""
                INSERT INTO users (name, email, password_hash, role, department, active) 
                VALUES (?, ?, ?, 'superadmin', 'IT', 1)
            """, ("Главный Администратор", admin_email, hashed))
            conn.commit()
            print(f"[+] Супер-админ {admin_email} успешно создан!")
        conn.close()
    except Exception as e:
        print(f"[!] Ошибка работы с БД: {e}")

    print("\n=== Установка завершена! ===")
    print("Теперь вы можете запустить сервер командой:")
    print("docker-compose up -d --build")
    print("Или локально: gunicorn -w 3 app:app")

if __name__ == "__main__":
    setup()
