from flask import Blueprint
from app.controllers.auth_controller import login, callback, logout

auth_bp = Blueprint('auth', __name__)

auth_bp.route("/login", methods=["GET"])(login)
auth_bp.route("/login/callback", methods=["GET"])(callback)
auth_bp.route("/logout", methods=["GET"])(logout)
