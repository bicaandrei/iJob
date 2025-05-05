from flask import Flask, Blueprint
from dotenv import load_dotenv
import os
from app.routes.cv_routes import cv_bp
from app.routes.skills_routes import skills_bp
from flask_cors import CORS

def create_app():

    load_dotenv()

    app = Flask(__name__)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

    main_bp = Blueprint('main', __name__, url_prefix='/api')
    main_bp.register_blueprint(cv_bp)
    main_bp.register_blueprint(skills_bp)
    app.register_blueprint(main_bp)

    return app
