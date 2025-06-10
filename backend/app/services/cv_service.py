import spacy
import pdfplumber
from app.services.firestore_service import get_programming_languages, get_frameworks, get_tools, get_certifications, get_types_of_skill
import re
from dateutil import parser
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.legends import Legend
from app.services.storage_service import upload_to_google_storage
import uuid
import os
import json

def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text

from spacy.matcher import PhraseMatcher
import spacy

def extract_skills(text):
    programming_languages = get_programming_languages()
    frameworks = get_frameworks()
    tools = get_tools()
    certifications = get_certifications()

    nlp = spacy.load("en_core_web_sm")
    doc = nlp(text.lower())  

    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

    matcher.add("PROGRAMMING_LANGUAGES", [nlp(pl) for pl in programming_languages])
    matcher.add("FRAMEWORKS", [nlp(fw) for fw in frameworks])
    matcher.add("TOOLS", [nlp(tl) for tl in tools])
    matcher.add("CERTIFICATIONS", [nlp(cert) for cert in certifications])

    matches = matcher(doc)

    extracted_programming_languages = set()
    extracted_frameworks = set()
    extracted_tools = set()
    extracted_certifications = set()

    for match_id, start, end in matches:
        span = doc[start:end]
        label = nlp.vocab.strings[match_id]

        if label == "PROGRAMMING_LANGUAGES":
            extracted_programming_languages.add(span.text)
        elif label == "FRAMEWORKS":
            extracted_frameworks.add(span.text)
        elif label == "TOOLS":
            extracted_tools.add(span.text)
        elif label == "CERTIFICATIONS":
            extracted_certifications.add(span.text)

    return {
        "programming_languages": list(extracted_programming_languages),
        "frameworks": list(extracted_frameworks),
        "tools": list(extracted_tools),
        "certifications": list(extracted_certifications),
    }

def extract_experience(text):
    
    sections = re.split(r'\n(?=\w)', text)
    work_experience_text = ""
    capture = False
    for section in sections:
        if "work experience" in section.lower() or "experience" in section.lower() or "employment" in section.lower() or "work" in section.lower(): 
            capture = True
        elif capture and ("education" in section.lower() or "projects" in section.lower()):
            break
        elif capture:
            work_experience_text += section + "\n"

    month_regex = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|" \
                r"Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"

    date_range_pattern = re.compile(
        fr"{month_regex}\.?\s+\d{{4}}\s+[–-]\s+(?:Present|{month_regex}\.?\s+\d{{4}})",
        re.IGNORECASE
    )

    matches = date_range_pattern.findall(work_experience_text)
    print(matches)
    return matches

def extract_candidate_name(text):
    lines = text.strip().split('\n')
    for line in lines:
        clean_line = line.strip()
        if clean_line:
            return clean_line
    return "Unknown"

def parse_experience_range(text):
    match = re.match(r"^\s*(\d+)(?:\s*[-–]\s*(\d+))?", text)
    if match:
        min_years = int(match.group(1))
        max_years = int(match.group(2)) if match.group(2) else None
        return min_years, max_years
    return None, None

def calculate_experience_years(date_ranges):
    parsed_periods = []

    for period in date_ranges:
        parts = re.split(r"\s+[–-]\s+", period)
        if len(parts) != 2:
            continue 

        start_str, end_str = parts
        try:
            start_date = parser.parse(start_str, fuzzy=True)
        except Exception:
            continue  

        if "present" in end_str.lower():
            end_date = datetime.today()
        else:
            try:
                end_date = parser.parse(end_str, fuzzy=True)
            except Exception:
                continue 

        if end_date < start_date:
            continue

        parsed_periods.append((start_date, end_date))

    parsed_periods.sort()
    merged_periods = []
    for start, end in parsed_periods:
        if not merged_periods:
            merged_periods.append((start, end))
        else:
            last_start, last_end = merged_periods[-1]
            if start <= last_end:
                merged_periods[-1] = (last_start, max(last_end, end))
            else:
                merged_periods.append((start, end))

    total_months = 0
    for start, end in merged_periods:
        months = (end.year - start.year) * 12 + (end.month - start.month)
        total_months += months

    total_years = round(total_months / 12, 2)
    return total_years

def calculate_cv_score(cv, job_requirements, job_required_experience, job_title):
    extracted_skills = extract_skills(cv)
    extracted_experience_years = calculate_experience_years(extract_experience(cv))

    min_required_years, max_required_years = parse_experience_range(job_required_experience)
    min_required_years = min_required_years or 0

    category_weights = {
        "certifications": 4,
        "programming_languages": 3,
        "frameworks": 2,
        "tools": 1,
    }

    total_weighted_required_skills = 0
    total_weighted_matched_skills = 0
    for category, required_skills in job_requirements.items():
        if category in extracted_skills:
            category_weight = category_weights.get(category, 1)
            total_required_skills = len(required_skills)
            matched_skills = len(set(extracted_skills[category]) & set(required_skills))
            total_weighted_required_skills += total_required_skills * category_weight
            total_weighted_matched_skills += matched_skills * category_weight

    if total_weighted_required_skills == 0:
        skill_score = 100
    else:
        skill_score = (total_weighted_matched_skills / total_weighted_required_skills) * 100

    message = ""

    if skill_score >= 80:
        message = "Excellent match"
    elif skill_score >= 60:
        message = "Good match"
    elif skill_score >= 40:
        message = "Average match"
    elif skill_score >= 20:
        message = "Below average match"

    experience_multiplier = 1.0
    if extracted_experience_years is not None:
        if extracted_experience_years < min_required_years:
            experience_multiplier = max(0.5, extracted_experience_years / min_required_years)
        elif max_required_years is None or extracted_experience_years <= max_required_years:
            experience_multiplier = 1.0
        else:
            experience_multiplier = 1.0

    if experience_multiplier <= 0.5:
        message += ", but insufficient experience!"

    final_score = round(skill_score * experience_multiplier, 2)
    if final_score <= 75:

        try:
            generate_cv_report(final_score, job_title, extract_candidate_name(cv), extracted_skills, job_requirements, extracted_experience_years, min_required_years, max_required_years)
            unique_id = str(uuid.uuid4())
            bucket_name = os.getenv("FLASK_FIREBASE_STORAGE_BUCKET")
            folder_name = os.getenv("FLASK_FIREBASE_STORAGE_REPORTS_FOLDER", "cv_reports")
            blob_name = f"{folder_name}/{unique_id}.pdf"
            url = upload_to_google_storage("cv_report.pdf", bucket_name, blob_name)
            return final_score, message, url
        except Exception as e:
            print(f"Error uploading CV report to GCS: {e}")

    return final_score, message, None

def draw_wrapped_text(canvas, text, x, y, max_width, line_height=16):
    """
    Draw text that automatically wraps within max_width.
    Returns updated y position after drawing.
    """
    from reportlab.pdfbase.pdfmetrics import stringWidth

    words = text.split()
    line = ""
    for word in words:
        test_line = f"{line} {word}".strip()
        if stringWidth(test_line, "Helvetica", 13) <= max_width:
            line = test_line
        else:
            canvas.drawString(x, y, line)
            y -= line_height
            line = word
    if line:
        canvas.drawString(x, y, line)
        y -= line_height
    return y

def generate_cv_report(score, job_title, candidate_name, extracted_skills, job_requirements, extracted_years=None, min_required_years=None, max_required_years=None):

    c = canvas.Canvas("cv_report.pdf", pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 20)
    c.drawString(100, height - 50, "CV Analysis Report")

    c.setFont("Helvetica", 14)
    c.drawString(100, height - 100, f"Candidate Name: {candidate_name}")
    c.drawString(100, height - 130, f"Applied Job Title: {job_title}")
    c.drawString(100, height - 160, f"CV Score: {score} / 100")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 210, "Skill Match Summary")

    categories = []
    required = []
    matched = []
    missing_skills_text = []

    for category, required_skills in job_requirements.items():
        required_count = len(required_skills)
        matched_count = len(set(required_skills) & set(extracted_skills.get(category, [])))
        if required_count > 0 or matched_count > 0:
            categories.append(category.replace("_", " ").title())
            required.append(required_count)
            matched.append(matched_count)
            missing = set(required_skills) - set(extracted_skills.get(category, []))
            if missing:
                missing_skills_text.append(f"❌ Missing {category.replace('_', ' ').title()}: {', '.join(missing)}")

    drawing = Drawing(500, 250)
    chart = VerticalBarChart()
    chart.x = 50
    chart.y = 60
    chart.height = 150
    chart.width = 350
    chart.data = [required, matched]
    chart.categoryAxis.categoryNames = categories

    chart.bars[0].fillColor = colors.lightblue  # Required
    chart.bars[1].fillColor = colors.green      # Matched
    chart.barWidth = 10
    chart.groupSpacing = 20
    chart.categoryAxis.labels.boxAnchor = 'n'
    chart.categoryAxis.labels.angle = 30
    chart.categoryAxis.labels.dy = -15

    chart.valueAxis.valueMin = 0
    all_values = required + matched
    all_values = required + matched
    chart.valueAxis.valueMax = (max(all_values) + 1) if all_values else 1
    chart.valueAxis.valueStep = 1

    drawing.add(chart)

    legend = Legend()
    legend.x = 420
    legend.y = 180
    legend.alignment = 'right'
    legend.colorNamePairs = [
        (colors.lightblue, "Required Skills"),
        (colors.green, "Matched Skills")
    ]
    drawing.add(legend)

    drawing.drawOn(c, 50, height - 430)

    c.setFont("Helvetica-Bold", 14)
    y_skills_text = height - 440
    c.drawString(100, y_skills_text, "Required Skills:")
    y_skills_text -= 20

    c.setFont("Helvetica", 12)
    all_required_skills = [skill.title() for skills in job_requirements.values() for skill in skills]
    if sum(required) != 0:
        chunk_size = 6
        for i in range(0, len(all_required_skills), chunk_size):
            skills_chunk = all_required_skills[i:i+chunk_size]
            c.drawString(110, y_skills_text, f"• {', '.join(skills_chunk)}")
            y_skills_text -= 18  # Move to next line for each chunk
    else:
        c.drawString(110, y_skills_text, "• No required skills specified for this job.")
    y_skills_text -= 20

    # Print Matched Skills
    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, y_skills_text, "Matched Skills:")
    y_skills_text -= 20

    c.setFont("Helvetica", 12)
    matched_skills = set()
    for category, skills in extracted_skills.items():
        matched_skills.update(set(skills) & set(job_requirements.get(category, [])))

    if len(matched_skills) != 0:
        capitalized_matched_skills = [skill.title() for skill in matched_skills]
        chunk_size = 6
        for i in range(0, len(capitalized_matched_skills), chunk_size):
            skills_chunk = capitalized_matched_skills[i:i+chunk_size]
            c.drawString(110, y_skills_text, f"• {', '.join(skills_chunk)}")
            y_skills_text -= 18  # Move to next line for each chunk
    else:
        c.drawString(110, y_skills_text, "• No skills matched with the job requirements.")
    y_skills_text -= 20

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, y_skills_text, "Experience Match Summary")

    experience_max = max(extracted_years or 0, min_required_years or 0, max_required_years or 0)
    experience_chart_height = 130 + (experience_max * 5)  
    experience_y_offset = height - 630 - experience_chart_height  

    draw_experience_comparison(
        c,
        extracted_years,
        min_required_years,
        max_required_years,
        y_offset=experience_y_offset,
        chart_height=experience_chart_height
    )

    c.showPage()

    c.setFont("Helvetica-Bold", 18)
    c.drawString(100, height - 50, "Skill Gap Analysis")

    c.setFont("Helvetica", 14)
    y = height - 80
    for line in missing_skills_text:
        c.setFont("Helvetica", 14)
        category, skills = line.split(": ", 1)
        c.drawString(100, y, category) 
        y -= 20

        for skill in skills.split(", "):
            c.setFont("Helvetica", 12)
            c.drawString(120, y, f"- {skill.strip().title()}")
            y -= 20

            coursera_link = f"https://www.coursera.org/search?query={skill.strip().replace(' ', '%20')}"
            c.setFont("Helvetica-Oblique", 10)
            c.setFillColor(colors.blue)
            c.drawString(140, y, coursera_link)
            c.setFillColor(colors.black)
            y -= 20

        y -= 10

    if missing_skills_text == []:
        c.drawString(100, y, "✅ No missing skills found. You need more professional experience!")
    else:
        c.setFont("Helvetica-Oblique", 12)
        if y <= 100:
            y = 100
        c.drawString(100, y, "📌 Suggestion: Focus on the missing skills using online platforms like Coursera, Udemy,")
        y -= 20
        c.drawString(100, y, "freeCodeCamp or GeeksForGeeks. Many of these platforms offer free or affordable")
        y -= 20
        c.drawString(100, y, "resources to help you upskill and bridge the gaps in your knowledge.")

    y = y - 30
    c.setFont("Helvetica-Bold", 14)
    c.drawString(100, y, "Based on your level of experience, here are some suggestions for")
    c.drawString(100, y - 20, "career improvement:")

    c.setFont("Helvetica-Bold", 18)
    y = y - 50
    if extracted_years <= 2:
        c.drawString(100, y, "Career Path Suggestions")
    else:
        c.drawString(100, y, "Career Improvement Suggestions")

    c.setFont("Helvetica", 13)
    y = y - 30

    career_paths = suggest_career_paths(extracted_skills, extracted_years)

    for suggestion in career_paths:
        y = draw_wrapped_text(c, f"• {suggestion}", 100, y, max_width=400)
        y -= 10

    c.save()

def draw_experience_comparison(c, extracted_years, min_required_years, max_required_years, y_offset=80, chart_height=150):
    from reportlab.graphics.charts.textlabels import Label

    # Prepare data
    extracted_years = extracted_years or 0
    min_required_years = min_required_years or 0
    max_required_years = max_required_years or 0

    all_values = [min_required_years, extracted_years, max_required_years]
    max_display_val = max(all_values) + 1  # Pad to prevent clipping

    # Create chart
    drawing = Drawing(400, 200)
    chart = VerticalBarChart()
    chart.x = 50
    chart.y = 50
    chart.height = chart_height
    chart.width = 300

    chart.data = [[min_required_years], [extracted_years], [max_required_years]]
    chart.categoryAxis.categoryNames = ['Work Experience (Years)']

    # Normalize and set value axis
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max_display_val
    chart.valueAxis.valueStep = 1

    chart.barWidth = 20
    chart.groupSpacing = 10

    # Bar colors
    chart.bars[0].fillColor = colors.lightblue      # Required Min
    chart.bars[1].fillColor = colors.green          # Actual
    chart.bars[2].fillColor = colors.grey           # Required Max

    drawing.add(chart)

    # Add a legend
    legend = Legend()
    legend.x = 370
    legend.y = 160
    legend.alignment = 'right'
    legend.colorNamePairs = [
        (colors.lightblue, "Min Required"),
        (colors.green, "Your Experience"),
        (colors.grey, "Max Required")
    ]
    drawing.add(legend)

    drawing.drawOn(c, 100, y_offset)

    c.setFont("Helvetica", 12)
    if extracted_years >= min_required_years and (max_required_years == 0 or extracted_years <= max_required_years):
        c.drawString(100, y_offset, "✅ Your experience matches the job requirement.")
    elif extracted_years < min_required_years:
        missing = round(min_required_years - extracted_years, 1)
        c.drawString(100, y_offset, f"❌ You are missing {missing} years of experience. Consider gaining more industry exposure.")
    else:
        c.drawString(100, y_offset, "✅ You exceed the maximum experience requirement. Well done!")

def format_career_path_message(career_paths):

    if not career_paths:
        return "No career path suggestions available based on the extracted skills."

    top_suggestions = career_paths[:3]

    message = "Based on your skills and experience, here are the top career paths for you:\n"
    for i, (career_path, score) in enumerate(top_suggestions, start=1):
        message += f"{i}. {career_path} (Match Score: {score})\n"

    return message

import json

def suggest_career_paths(extracted_skills, extracted_years):
    file_path = (
        "skills/career_paths_suggestions.json"
        if extracted_years <= 2
        else "skills/improvement_suggestions.json"
    )

    with open(file_path, "r") as file:
        suggestions_data = json.load(file)

    type_counts = {}
    for category in extracted_skills:
        for skill in extracted_skills[category]:
            types_of_skill = get_types_of_skill(skill)
            for skill_type in types_of_skill:
                type_counts[skill_type] = type_counts.get(skill_type, 0) + 1

    suggestions = []
    for suggestion_title, info in suggestions_data.items():
        required_types = info.get("types", [])
        message = info.get("message", "")
        match_score = sum(type_counts.get(skill_type, 0) for skill_type in required_types)
        if match_score > 0 or "any" in required_types:
            explanation = (
                f"Match Score: {match_score} (we found {match_score} relevant signals in your CV). "
                f"{message}"
            )
            suggestions.append((suggestion_title, match_score, explanation))

    suggestions.sort(key=lambda x: x[1], reverse=True)
    top_suggestions = [f"{title}: {explanation}" for title, _, explanation in suggestions[:3]]
    return top_suggestions
