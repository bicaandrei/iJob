from flask import Blueprint, redirect, url_for
from app.controllers.cv_controller import home, upload_cv

cv_bp = Blueprint('cv', __name__)

cv_bp.route("/home", methods=["GET"])(home)
cv_bp.route("/upload-cv", methods=["POST"])(upload_cv)