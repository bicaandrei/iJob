from app.config.settings import GOOGLE_USER_INFO_URL
from flask import jsonify, session, redirect, url_for
from app.utils.oauth import get_google_oauth_session

def index():
    return redirect(url_for("user.home"))

def home():
    return "Welcome Home"

def profile():
    """Fetches user profile from Google OAuth."""
    google = get_google_oauth_session(token=session.get("oauth_token"))
    response = google.get(GOOGLE_USER_INFO_URL)
    
    if response.status_code == 200:
        return jsonify(response.json())
    return "Error fetching user data", 400