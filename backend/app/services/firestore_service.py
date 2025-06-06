import json
import firebase_admin
from firebase_admin import credentials, firestore
from app.db.firebase_init import FirestoreClient
import os

_cached_skills = None
db = FirestoreClient.get_instance()
FIRESTORE_SKILLS_COLLECTION = os.getenv("FIRESTORE_SKILLS_COLLECTION", "skills")

def upload_skills(file):
    skills = json.loads(file)
    for skill in skills:
        skill_name = skill['name']
        doc_ref = db.collection(FIRESTORE_SKILLS_COLLECTION).document(skill_name)
        
        if doc_ref.get().exists:
            print(f"Skill '{skill_name}' already exists, skipping.")
        else:
            doc_ref.set(skill)
            print(f"Added skill: {skill_name}")

def get_programming_languages():
    programming_languages = []
    skills_ref = db.collection(FIRESTORE_SKILLS_COLLECTION)
    docs = skills_ref.where("category", "==", "programming_language").get()
    
    for doc in docs:
        programming_language = doc.to_dict()
        programming_languages.append(programming_language.get("name", "").lower())
    
    return programming_languages

def get_frameworks():
    frameworks = []
    skills_ref = db.collection(FIRESTORE_SKILLS_COLLECTION)
    docs = skills_ref.where("category", "==", "framework").get()
    
    for doc in docs:
        framework = doc.to_dict()
        frameworks.append(framework.get("name", "").lower())
    
    return frameworks

def get_tools():
    tools = []
    skills_ref = db.collection(FIRESTORE_SKILLS_COLLECTION)
    docs = skills_ref.where("category", "==", "tool").get()
    
    for doc in docs:
        tool = doc.to_dict()
        tools.append(tool.get("name", "").lower())
    
    return tools

def get_certifications():
    certifications = []
    skills_ref = db.collection(FIRESTORE_SKILLS_COLLECTION)
    docs = skills_ref.where("category", "==", "certification").get()
    
    for doc in docs:
        certification = doc.to_dict()
        certifications.append(certification.get("name", "").lower())
    
    return certifications

def get_all_skills():

    skills = {}
    skills_ref = db.collection(FIRESTORE_SKILLS_COLLECTION)
    docs = skills_ref.stream() 

    for doc in docs:
        skill = doc.to_dict()
        skill_name = skill.get("name", "").lower() 
        skill_types = skill.get("type", []) 
        skills[skill_name] = skill_types

    return skills

def get_all_skills():
    skills = {}
    skills_ref = db.collection(FIRESTORE_SKILLS_COLLECTION)
    docs = skills_ref.stream() 

    for doc in docs:
        skill = doc.to_dict()
        skill_name = skill.get("name", "").lower()
        skill_types = skill.get("type", [])  
        skills[skill_name] = skill_types

    return skills

def get_all_skills_cached():
    global _cached_skills
    if _cached_skills is None:
        _cached_skills = get_all_skills()
    return _cached_skills

def get_types_of_skill(skill_name):
    all_skills = get_all_skills_cached()
    return all_skills.get(skill_name, [])