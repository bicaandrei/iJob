from flask import Blueprint, redirect, url_for
from app.controllers.cv_controller import upload_cv

cv_bp = Blueprint('cv', __name__)

cv_bp.route("/upload_cv", methods=["POST", "OPTIONS"])(upload_cv)