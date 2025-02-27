from flask import Blueprint, redirect, url_for
from app.controllers.user_controller import home, profile, index

user_bp = Blueprint('user', __name__)

user_bp.route("/", methods=["GET"])(index)
user_bp.route("/home", methods=["GET"])(home)
user_bp.route("/profile", methods=["GET"])(profile)