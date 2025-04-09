from flask import request, jsonify, session, redirect, url_for
from app.services.cv_service import extract_text_from_pdf, extract_skills, extract_experience, extract_projects

def home():
    return "Welcome Home"

def upload_cv():
    file = request.files['file']
    if file.filename.endswith('.pdf'):
        text = extract_text_from_pdf(file)
    else:
        return jsonify({"error": "Invalid file format. Only PDF files are allowed."}), 400

    skills = extract_skills(text)
    experience = extract_experience(text)
    projects = extract_projects(text)

    return jsonify({
        "skills": skills,
        "experience": experience,
        "projects": projects
    }), 200