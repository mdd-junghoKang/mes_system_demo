import os
import secrets

from dotenv import load_dotenv

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file = os.path.join(root, 'config')
secret_key = secrets.token_hex(32)
session_max_age = 60 * 60 * 24 * 90

load_dotenv(os.path.join(file, '.env'))

IMAGE_SERVER_BASE = os.getenv("IMAGE_SERVER_BASE")
NAS_USER_NAME = os.getenv('NAS_USER_NAME')
NAS_USER_PASSWORD = os.getenv('NAS_USER_PASSWORD')