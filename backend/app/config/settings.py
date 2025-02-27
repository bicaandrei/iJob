import os
from dotenv import load_dotenv

env_path = '.env.dev' if os.getenv('FLASK_ENV') == 'development' else '.env.prod'
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_AUTHORIZATION_BASE_URL = os.getenv("GOOGLE_AUTHORIZATION_BASE_URL")
GOOGLE_TOKEN_URL = os.getenv("GOOGLE_TOKEN_URL")
GOOGLE_USER_INFO_URL = os.getenv("GOOGLE_USER_INFO_URL")
REDIRECT_URI = os.getenv("REDIRECT_URI")
