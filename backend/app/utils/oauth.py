from requests_oauthlib import OAuth2Session
import os
from app.config.settings import GOOGLE_CLIENT_ID, REDIRECT_URI

def get_google_oauth_session(state=None, token=None):
    """Creates a Google OAuth session."""
    return OAuth2Session(
        GOOGLE_CLIENT_ID,
        redirect_uri=REDIRECT_URI,
        state=state,
        token=token,
        scope=[
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "openid"
        ]
    )
