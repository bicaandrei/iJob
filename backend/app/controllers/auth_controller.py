from flask import redirect, url_for, session, request, jsonify
from app.utils.oauth import get_google_oauth_session
from app.config.settings import GOOGLE_CLIENT_SECRET, REDIRECT_URI, GOOGLE_AUTHORIZATION_BASE_URL, GOOGLE_TOKEN_URL, GOOGLE_USER_INFO_URL
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
    return redirect(url_for("user.profile"))

def logout():
    """Logs out user by removing OAuth token from session."""
    session.pop("oauth_token", None)
    return redirect(url_for("user.home"))
