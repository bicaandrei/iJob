from flask import Blueprint, request, jsonify
from app.controllers.skills_controller import upload_skills_endpoint
import os
from functools import wraps

ADMIN_USERNAME = os.getenv("FLASK_ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("FLASK_ADMIN_PASSWORD")

def authenticate(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth = request.authorization
        if not auth or auth.username != ADMIN_USERNAME or auth.password != ADMIN_PASSWORD:
            return jsonify({"error": "Unauthorized"}), 401
        return func(*args, **kwargs)
    return wrapper


skills_bp = Blueprint("skills", __name__)
skills_bp.route("/upload-skills", methods=["POST"])(authenticate(upload_skills_endpoint))