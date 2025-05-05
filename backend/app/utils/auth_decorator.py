from functools import wraps
from flask import request, jsonify, g
from firebase_admin import auth

def firebase_auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if request.method == "OPTIONS":
            return f(*args, **kwargs)

        auth_header = request.headers.get("Authorization", None)

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized: Missing or malformed token."}), 401

        id_token = auth_header.split("Bearer ")[1]

        try:
            decoded_token = auth.verify_id_token(id_token)
            g.firebase_user = decoded_token  
        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "details": str(e)}), 401

        return f(*args, **kwargs)

    return decorated_function
