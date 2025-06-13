# iJob - Intelligent Job Search Platform

iJob is a modern, responsive web application designed to streamline the recruitment process in the IT industry. It serves as an intelligent bridge between tech professionals seeking new opportunities and companies looking to hire skilled candidates. The platform offers a suite of features for both applicants and recruiters, including AI-powered CV analysis to objectively score and rank candidates based on job requirements.

## Key Features

### For Job Seekers (Users)

- **Account Management**: Secure user registration and login (Email/Password & Google OAuth).
- **Profile Customization**: Users can edit their personal details and upload a profile picture.
- **Dynamic Job Search & Filtering**: Browse and search for jobs with advanced filters for location, position, experience, skills, and posting date.
- **Infinite Scroll**: Job listings are loaded dynamically as the user scrolls, ensuring a fast and smooth experience.
- **AI-Powered CV Analysis**: Before applying, users can get an objective analysis of their CV against the job's requirements, receiving a suitability score and a detailed report with suggestions for improvement if the score is low.
- **Application Tracking**: Users can view the status of all their job applications in one place.

### For Recruiters (Firms)

- **Firm Account System**: Separate registration and profile management for companies.
- **Job Posting Management**: Recruiters can create, edit, and delete job postings with detailed requirements, including skills, experience, and location.
- **Applicant Tracking System (ATS)**: View all applicants for a specific job, with their CVs, contact details, and the AI-generated suitability score.
- **Advanced Applicant Filtering**: Filter candidates by experience, submission date, and CV analysis score to quickly identify the most promising applicants.

## Tech Stack

The application is built with a modern, decoupled architecture, separating the frontend and backend for better scalability and maintainability.

### Frontend

- **Framework**: [Vue.js 3](https://vuejs.org/) with the Composition API and `<script setup>`.
- **Build Tool**: [Vite](https://vitejs.dev/).
- **Language**: [TypeScript](https://www.typescriptlang.org/).
- **Routing**: [Vue Router](https://router.vuejs.org/).
- **State Management**: [Pinia](https://pinia.vuejs.org/) for centralized and persistent state.
- **Styling**: Plain CSS with a responsive design approach.
- **Deployment**: [Firebase Hosting](https://firebase.google.com/docs/hosting) for fast, global delivery of static assets.

### Backend

- **Framework**: [Flask](https://flask.palletsprojects.com/) (a Python WSGI framework).
- **Language**: Python.
- **CV Analysis Engine**:
  - PDF text extraction using `pdfplumber`.
  - Natural Language Processing (NLP) for skill extraction using `spaCy`.
  - Report generation with `reportlab`.
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL) for storing user, firm, job, and application data.
- **File Storage**: [Google Cloud Storage](https://cloud.google.com/storage) for storing uploaded CVs and generated reports.
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) for secure user management.
- **Deployment**: Containerized with **Docker** and deployed on [Google Cloud Run](https://cloud.google.com/run) for a serverless, scalable, and cost-efficient architecture.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Python (v3.11 or higher)
- Docker
- Google Cloud SDK (`gcloud`)

### Setup and Run Frontend (Local)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server (usually on localhost:5173)
npm run dev

### Setup and Run Backend (Local)

# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask development server
flask run
```
