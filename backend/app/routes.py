from . import app

@app.route("/")
def hello():
    return "<p>Hello, iJob!</p>"