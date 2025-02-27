from flask import Flask
from dotenv import load_dotenv
import os
from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.config.settings import *

def create_app():
    """Initialize Flask app with configurations"""

    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY")

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)

    return app
