from flask import redirect, url_for, session, request, jsonify
from requests_oauthlib import OAuth2Session
import os
from . import app

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_AUTHORIZATION_BASE_URL = os.getenv("GOOGLE_AUTHORIZATION_BASE_URL")
GOOGLE_TOKEN_URL = os.getenv("GOOGLE_TOKEN_URL")
GOOGLE_USER_INFO_URL = os.getenv("GOOGLE_USER_INFO_URL")

REDIRECT_URI = os.getenv("REDIRECT_URI")

def get_google_oauth_session(state=None, token=None):
    return OAuth2Session(
        GOOGLE_CLIENT_ID,
        redirect_uri=REDIRECT_URI,
        state=state,
        token=token,
        scope=["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "openid"]
    )

@app.route("/")
def index():
    return redirect(url_for("home"))

@app.route("/home")
def home():
    return "Home"

@app.route("/login")
def login():
    google = get_google_oauth_session()
    authorization_url, state = google.authorization_url(GOOGLE_AUTHORIZATION_BASE_URL, access_type="offline", prompt="select_account")
    print(authorization_url)
    session["oauth_state"] = state
    return redirect(authorization_url)

@app.route("/login/callback")
def callback():
    google = get_google_oauth_session(state=session.get("oauth_state"))
    token = google.fetch_token(
        GOOGLE_TOKEN_URL,
        client_secret=GOOGLE_CLIENT_SECRET,
        authorization_response=request.url
    )

    session["oauth_token"] = token

    return redirect(url_for("profile"))

@app.route("/profile")
def profile():
    google = get_google_oauth_session(token=session.get("oauth_token"))
    response = google.get(GOOGLE_USER_INFO_URL)
    
    if response.status_code == 200:
        user_info = response.json()
        return jsonify(user_info)
    else:
        return "Eroare la obținerea datelor utilizatorului", 400

@app.route("/logout")
def logout():
    session.pop("oauth_token", None)
    return redirect(url_for("home"))