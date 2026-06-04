import os
import sys

# Resolve directories relative to this file
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, 'backend')

# Add both root and backend to sys.path for import resolution
for d in [root_dir, backend_dir]:
    if d not in sys.path:
        sys.path.insert(0, d)

# Load backend .env before importing the app so env vars are available
from dotenv import load_dotenv
load_dotenv(os.path.join(backend_dir, '.env'))

# Import Flask app — Vercel's Python runtime natively supports WSGI.
# Use direct import since backend_dir is in sys.path.
from app import app