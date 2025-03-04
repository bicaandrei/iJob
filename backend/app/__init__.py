from flask import Flask
from dotenv import load_dotenv
import os
from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.config.settings import *
from app.db.models import db
from flask_migrate import Migrate

def create_app():
    """Initialize Flask app with configurations"""

    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY")
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:parola123@localhost:5432/iJob_db"

    db.init_app(app)
    migrate = Migrate(app, db)
  
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)

    return app
