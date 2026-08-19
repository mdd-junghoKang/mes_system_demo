import os

from dotenv import load_dotenv

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(root, 'config', '.env')

load_dotenv(env_path)

DB = os.getenv('DB')
DRIVER = os.getenv('DRIVER')
SYNC_DRIVER = os.getenv('SYNC_DRIVER')
HOST = os.getenv('HOST')
PORT = os.getenv('PORT')
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
PASSWORD = os.getenv('PASSWORD')
DB_OPTIONS = '?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes'
DB_URI = f'{DB}+{DRIVER}://{os.getenv("DB_USER")}:{os.getenv("PASSWORD")}@{HOST}:{PORT}/{DB_NAME}{DB_OPTIONS}'
SYNC_DB_URL = f'{DB}+{SYNC_DRIVER}://{os.getenv("DB_USER")}:{os.getenv("PASSWORD")}@{HOST}:{PORT}/{DB_NAME}{DB_OPTIONS}'
