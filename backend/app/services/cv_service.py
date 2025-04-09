import spacy
import re
import pdfplumber

def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text

def extract_skills(text):
    nlp = spacy.load("en_core_web_sm")
    SKILL_LIST = ['python', 'java', 'docker', 'kubernetes', 'flask', 'react', 'aws', 'git', 'typescript']
    doc = nlp(text.lower())
    extracted = set()
    for token in doc:
        if token.text in SKILL_LIST:
            extracted.add(token.text)
    return list(extracted)

def extract_experience(text):
    pattern = r"(experience|work experience|work history|employment)[\s\S]{0,5000}"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group() if match else ""

def extract_projects(text):
    pattern = r"(projects|personal projects)[\s\S]{0,3000}"
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group() if match else ""