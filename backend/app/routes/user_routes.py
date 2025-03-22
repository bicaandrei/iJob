from flask import Blueprint, redirect, url_for
from app.controllers.user_controller import home

user_bp = Blueprint('user', __name__)

user_bp.route("/home", methods=["GET"])(home)