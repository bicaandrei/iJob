from flask import request, jsonify, session, redirect, url_for, Response
from app.services.cv_service import extract_text_from_pdf, extract_skills, calculate_cv_score, extract_experience, calculate_experience_years, generate_cv_report
import json
from app.utils.auth_decorator import firebase_auth_required

@firebase_auth_required
def upload_cv():

    if request.method == 'OPTIONS':
        response = Response(status=200)
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        return response

    file = request.files['file']
    job_requirements = request.form.get('job_requirements')
    job_required_experience = request.form.get('job_required_experience')
    job_title = request.form.get('job_title')

    job_requirements = json.loads(job_requirements) if job_requirements else {
        "programming_languages": [],
        "frameworks": [],
        "certifications": [],
        "tools": [],
    }

    job_requirements = {
        key: [item.lower() for item in value]
        for key, value in job_requirements.items()
    }

    if file.filename.endswith('.pdf'):
        text = extract_text_from_pdf(file)
    else:
        return jsonify({"error": "Invalid file format. Only PDF files are allowed."}), 400

    score, message, report_url = calculate_cv_score(text, job_requirements, job_required_experience, job_title)
    return jsonify({"score": score, "message": message, "cv_report_url": report_url}), 200
