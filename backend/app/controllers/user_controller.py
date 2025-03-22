from flask import request, jsonify, session, redirect, url_for
from app.db.models import db, User

def home():
    return "Welcome Home"
