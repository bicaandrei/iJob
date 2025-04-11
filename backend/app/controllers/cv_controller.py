from flask import request, jsonify, session, redirect, url_for, Response
from app.services.cv_service import extract_text_from_pdf, extract_skills
import json

def home():
    return "Welcome Home"

def upload_cv():
    file = request.files['file']
    if file.filename.endswith('.pdf'):
        text = extract_text_from_pdf(file)
    else:
        return jsonify({"error": "Invalid file format. Only PDF files are allowed."}), 400

    skills = extract_skills(text)

    skills_json = json.dumps(skills, indent=4)

    response = Response(
        skills_json,
        mimetype="application/json",
        headers={
            "Content-Disposition": "attachment;filename=extracted_skills.json"
        }
    )

    return response