from app.services.cv_service import calculate_experience_years, extract_skills 
from unittest.mock import patch 

def test_calculate_single_period():
    date_ranges = ["Jan 2022 - Jan 2024"]
    experience = calculate_experience_years(date_ranges)
    assert experience == 2.0

# Test pentru un caz cu "Present"
def test_calculate_present_period():

    date_ranges = ["Jun 2023 - Present"]
    experience = calculate_experience_years(date_ranges)
    assert 1.9 < experience < 2.1

@patch('app.services.cv_service.get_certifications')
@patch('app.services.cv_service.get_tools')
@patch('app.services.cv_service.get_frameworks')
@patch('app.services.cv_service.get_programming_languages')
def test_extract_skills_with_mocks(mock_get_langs, mock_get_frameworks, mock_get_tools, mock_get_certs):
    # Configurează ce vor returna funcțiile simulate (mock-uite)
    mock_get_langs.return_value = ["python", "javascript"]
    mock_get_frameworks.return_value = ["vue.js", "flask"]
    mock_get_tools.return_value = ["git", "docker"]
    mock_get_certs.return_value = ["aws certified developer"]

    sample_cv_text = """
    Lucrez ca Python developer și am experiență cu JavaScript.
    Sunt familiar cu framework-urile Vue.js și Flask.
    Pentru versionare folosesc Git și pentru containere Docker.
    Dețin certificarea AWS Certified Developer. O altă competență este Java, dar nu e pe lista noastră.
    """

    extracted = extract_skills(sample_cv_text)

    assert "python" in extracted["programming_languages"]
    assert "javascript" in extracted["programming_languages"]
    assert "vue.js" in extracted["frameworks"] 
    assert "flask" in extracted["frameworks"]
    assert "git" in extracted["tools"]
    assert "docker" in extracted["tools"]
    assert "aws certified developer" in extracted["certifications"]

    assert "java" not in extracted["programming_languages"]
