"""
Tracko — SQLite backup script
Run manually or via cron every 6 hours:
  Linux:   0 */6 * * * /usr/bin/python3 /path/to/tracko/backup.py
  Windows: Task Scheduler → python backup.py
"""
import os, shutil, sqlite3, time
from datetime import datetime

BASE_DIR   = os.path.dirname(__file__)
DB_PATH    = os.path.join(BASE_DIR, "inventory.db")
BACKUP_DIR = os.path.join(BASE_DIR, "backups")
KEEP_DAYS  = 7

os.makedirs(BACKUP_DIR, exist_ok=True)

def backup():
    ts   = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = os.path.join(BACKUP_DIR, f"inventory_{ts}.db")

    src_conn = sqlite3.connect(DB_PATH)
    dst_conn = sqlite3.connect(dest)
    src_conn.backup(dst_conn)
    dst_conn.close()
    src_conn.close()

    print(f"[backup] Saved → {dest}")
    _cleanup()

def _cleanup():
    cutoff = time.time() - KEEP_DAYS * 86400
    for fname in os.listdir(BACKUP_DIR):
        if not fname.startswith("inventory_") or not fname.endswith(".db"):
            continue
        fpath = os.path.join(BACKUP_DIR, fname)
        if os.path.getmtime(fpath) < cutoff:
            os.remove(fpath)
            print(f"[backup] Removed old backup: {fname}")

if __name__ == "__main__":
    backup()
