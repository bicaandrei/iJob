from flask import redirect, url_for, session, request, jsonify
from app.utils.oauth import get_google_oauth_session
from app.config.settings import GOOGLE_CLIENT_SECRET, REDIRECT_URI, GOOGLE_AUTHORIZATION_BASE_URL, GOOGLE_TOKEN_URL, GOOGLE_USER_INFO_URL
from app.db.models import db, User
import os

def login():
    """Redirects user to Google OAuth login."""
    google = get_google_oauth_session()
    authorization_url, state = google.authorization_url(
        GOOGLE_AUTHORIZATION_BASE_URL,
        access_type="offline",
        prompt="select_account"
    )
    session["oauth_state"] = state
    return redirect(authorization_url)

def callback():
    """Handles OAuth callback and stores token in session."""
    google = get_google_oauth_session(state=session.get("oauth_state"))
    token = google.fetch_token(
        GOOGLE_TOKEN_URL,
        client_secret=GOOGLE_CLIENT_SECRET,
        authorization_response=request.url
    )
    session["oauth_token"] = token

    response = google.get(GOOGLE_USER_INFO_URL)
    if response.status_code == 200:
        user_info = response.json()
        google_id = user_info.get("id")
        email = user_info.get("email")
        username = user_info.get("name")

        user = User.query.filter_by(email=email).first()
        if not user:
            new_user = User(google_id=google_id, name=username, email=email)
            db.session.add(new_user)
            db.session.commit()
            return redirect(url_for("user.profile")) 

    return redirect(url_for("user.home"))
    
def logout():
    """Logs out user by removing OAuth token from session."""
    session.pop("oauth_token", None)
    return redirect(url_for("user.home"))
