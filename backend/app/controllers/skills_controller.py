from flask import Blueprint, request, jsonify
from app.services.firestore_service import upload_skills
import json

def validate_skills_structure(skills):

    if not isinstance(skills, list):
        return False, "The JSON file must contain an array of skills."

    for skill in skills:
        if not isinstance(skill, dict):
            return False, "Each skill must be an object."
        if "name" not in skill or "category" not in skill:
            return False, "Each skill must have 'name' and 'category' keys."
        if not isinstance(skill["name"], str) or not isinstance(skill["category"], str):
            return False, "'name' and 'category' must be strings."

    return True, None

def upload_skills_endpoint():

    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.endswith(".json"):
        return jsonify({"error": "File must be a .json file"}), 400

    try:
        file_content = file.read().decode("utf-8")

        print(file_content)
        skills = json.loads(file_content)

        is_valid, error_message = validate_skills_structure(skills)
        if not is_valid:
            return jsonify({"error": error_message}), 400

        upload_skills(file_content)

        return jsonify({"message": "Skills uploaded successfully"}), 201
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON file"}), 400
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500