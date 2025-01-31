from flask import Flask
from dotenv import load_dotenv
import os

env_path = '.env.dev' if os.getenv('FLASK_ENV') == 'development' else '.env.prod'
load_dotenv(dotenv_path=env_path)
app = Flask(__name__)

@app.route("/")
def hello():
    return "<p>Hello, iJob!</p>"