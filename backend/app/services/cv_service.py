import spacy
import pdfplumber
from app.services.firestore_service import get_programming_languages, get_frameworks, get_tools, get_certifications

def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text

from spacy.matcher import PhraseMatcher
import spacy

def extract_skills(text):
    """
    Extract skills from the CV text and return them categorized in a dictionary.
    """
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
