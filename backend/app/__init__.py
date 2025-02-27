from flask import Flask, redirect, url_for, session
from dotenv import load_dotenv
import os
from requests_oauthlib import OAuth2Session

env_path = '.env.dev' if os.getenv('FLASK_ENV') == 'development' else '.env.prod'
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")

from . import routes 

if __name__ == "__main__":
    app.run(ssl_context=('cert.pem', 'key.pem'))
