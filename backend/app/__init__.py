from flask import Flask, Blueprint
from dotenv import load_dotenv
import os
from app.routes.user_routes import user_bp
from app.db.models import db
from flask_migrate import Migrate
from flask_cors import CORS

def create_app():
    """Initialize Flask app with configurations"""

    load_dotenv()

    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")

    db.init_app(app)
    migrate = Migrate(app, db)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    main_bp = Blueprint('main', __name__, url_prefix='/api')
    main_bp.register_blueprint(user_bp)
    app.register_blueprint(main_bp)

    return app
