import sys
import os

# Ensure the backend directory is on the path so we can import main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: F401 — Vercel needs this exported

# Mangum adapter for AWS Lambda / Vercel serverless
from mangum import Mangum
handler = Mangum(app, lifespan="off")
