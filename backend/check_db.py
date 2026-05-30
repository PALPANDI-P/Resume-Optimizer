import os
import sqlite3

db_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(db_dir, 'instance', 'resume_optimizer.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List all tables
tables = [t[0] for t in cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("=== Tables in your database ===")
for t in tables:
    count = cursor.execute(f"SELECT COUNT(*) FROM [{t}]").fetchone()[0]
    print(f"  {t}: {count} rows")

# Show users
print("\n=== Users ===")
rows = cursor.execute("SELECT id, name, email, mobile, created_at FROM user").fetchall()
if rows:
    for r in rows:
        print(f"  ID={r[0]}, Name={r[1]}, Email={r[2]}, Mobile={r[3]}, Created={r[4]}")
else:
    print("  (no users yet)")

# Show resumes
print("\n=== Resumes ===")
rows = cursor.execute("SELECT id, title, user_id, template_id, created_at FROM resume").fetchall()
if rows:
    for r in rows:
        print(f"  ID={r[0]}, Title={r[1]}, UserID={r[2]}, Template={r[3]}, Created={r[4]}")
else:
    print("  (no resumes yet)")

# Show downloads
print("\n=== Download History ===")
rows = cursor.execute("SELECT id, resume_title, format, user_id, created_at FROM download_history").fetchall()
if rows:
    for r in rows:
        print(f"  ID={r[0]}, Title={r[1]}, Format={r[2]}, UserID={r[3]}, Created={r[4]}")
else:
    print("  (no downloads yet)")

conn.close()
