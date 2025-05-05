<template>
  <Snackbar ref="snackbarRef" />
  <div class="job-application-container">
    <h1 class="application-title">Job Application</h1>

    <div class="form-group">
      <label for="name">Name:</label>
      <input
        type="text"
        id="name"
        v-model="name"
        placeholder="Enter your name"
        class="input"
      />

      <label for="email">Email:</label>
      <input
        type="email"
        id="email"
        v-model="email"
        placeholder="Enter your email"
        class="input"
      />

      <label for="experience">Relevant Experience (in years):</label>
      <input
        type="number"
        id="experience"
        v-model="experience"
        placeholder="Enter your experience"
        min="0"
        max="30"
        class="input"
      />

      <label for="suitability"
        >Why do you think you are suitable for this job?</label
      >
      <textarea
        id="suitability"
        v-model="suitability"
        placeholder="Explain why you are suitable for this job"
        rows="5"
        required
      ></textarea>

      <label for="cv">Upload CV:</label>
      <input
        type="file"
        id="cv"
        @change="handleFileUpload"
        accept=".pdf"
        class="input"
      />

      <div class="cv-analysis-row">
        <button class="cv-upload-btn" @click="getCVAnalysis">
          Obtain a CV analysis
        </button>

        <div class="cv-result-area">
          <div v-if="loadingAnalyisis" class="spinner-container-inline">
            <div class="spinner small-spinner"></div>
            <p>Analyzing...</p>
          </div>
          <div v-else-if="cvScore !== null">
            <p>
              <strong>CV Suitability: {{ cvScore }} %</strong>
            </p>
            <p>
              <strong>{{ cvAnalysisMessage }}</strong>
            </p>
          </div>
        </div>
      </div>

      <label
        v-if="cvScore"
        for="remoteCheckbox"
        class="remote-checkbox-container"
      >
        Include CV analysis in application:
        <input
          type="checkbox"
          id="remoteCheckbox"
          class="remote-checkbox"
          v-model="includeCVAnalysis"
        />
      </label>
    </div>

    <button type="submit" class="send-btn" @click="sendApplication">
      Send Application
    </button>
  </div>

  <div v-if="showAnalysisModal" class="modal-overlay">
    <div class="modal">
      <h2>CV Analysis Report</h2>
      <p>
        Your CV analysis score is below 75 %. We recommend reviewing the
        analysis report to identify areas for improvement.
      </p>
      <button class="modal-btn" @click="openReport">View Report</button>
      <button class="modal-close-btn" @click="closeModal">Close</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useUserStore } from "../stores/user";
import Snackbar from "./Snackbar.vue";
import { getErrorType, RETURN_TYPES } from "../utils/error-codes";
import { validateEmail, validateName } from "../utils/validation-rules";
import type { JobApplicationForm } from "../models/job-application";
import { setJobApplicationDocument } from "../api/firestore";
import { analyzeCV } from "../api/cv_analysis";

const {
  firm_id,
  job_id,
  job_programming_languages,
  job_certifications,
  job_frameworks,
  job_tools,
  job_experience,
  job_title,
} = defineProps<{
  firm_id: string | undefined;
  job_id: string | undefined;
  job_programming_languages: string[] | undefined;
  job_certifications: string[] | undefined;
  job_frameworks: string[] | undefined;
  job_tools: string[] | undefined;
  job_experience: string | undefined;
  job_title: string | undefined;
}>();

const userStore = useUserStore();
const user = userStore.userInfo || {
  google_uid: "",
  name: "",
  email: "",
  profile_pic: "",
};
const name = ref(user.name);
const email = ref(user.email);
const experience = ref<number | null>(null);
const cv = ref<File | null>(null);
const suitability = ref("");
const snackbarRef = ref<InstanceType<typeof Snackbar> | null>(null);
const loadingAnalyisis = ref(false);
const cvScore = ref<number | null>(null);
const cvAnalysisMessage = ref<string | null>(null);
const cvAnalysisReportUrl = ref<string | null>(null);
const includeCVAnalysis = ref(false);
const showAnalysisModal = ref(false);

const emit = defineEmits(["applicationSubmitted"]);

const openReport = () => {
  console.log("Opening CV analysis report URL:", cvAnalysisReportUrl.value);
  if (cvAnalysisReportUrl.value) {
    window.open(cvAnalysisReportUrl.value, "_blank");
  }
  showAnalysisModal.value = false;
};

const closeModal = () => {
  showAnalysisModal.value = false;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    cv.value = target.files[0];
    cvScore.value = null;
  }
};

const getCVAnalysis = async () => {
  if (!cv.value) {
    displayError(RETURN_TYPES.APPLICATION_CV_REQUIRED);
    return false;
  }

  loadingAnalyisis.value = true;

  const jobSkills = {
    programming_languages: job_programming_languages || [],
    certifications: job_certifications || [],
    frameworks: job_frameworks || [],
    tools: job_tools || [],
  };

  try {
    const score = await analyzeCV(
      cv.value,
      jobSkills,
      job_experience || "",
      job_title || ""
    );
    cvScore.value = score.score;
    cvAnalysisMessage.value = score.message;
    cvAnalysisReportUrl.value = score.cv_report_url;

    if (cvAnalysisReportUrl.value) {
      showAnalysisModal.value = true;
    }

    console.log("CV Analysis Score:", score);
  } catch (error) {
    snackbarRef.value?.showSnackbar(
      "Error analyzing CV. Please try again.",
      "error"
    );
  } finally {
    loadingAnalyisis.value = false;
  }
};

const sendApplication = async () => {
  console.log(includeCVAnalysis.value);

  if (!validateForm()) return;

  const JobApplicationForm: JobApplicationForm = {
    applicant_id: user.google_uid,
    firm_id: firm_id,
    job_id: job_id,
    name: name.value,
    email: email.value,
    experience: experience.value || 0,
    cv: cv.value,
    suitability: suitability.value,
    applicant_profile_pic: user.profile_pic,
    analysis_score: includeCVAnalysis.value ? cvScore.value : null,
  };

  const return_type: RETURN_TYPES = await setJobApplicationDocument(
    JobApplicationForm
  );

  if (return_type === RETURN_TYPES.SUCCESS) {
    snackbarRef.value?.showSnackbar(
      "Job application successfully sent!",
      "success"
    );

    emit("applicationSubmitted");
  } else {
    displayError(return_type);
  }
};

const validateForm = (): boolean => {
  if (
    !name.value.trim() ||
    !email.value.trim() ||
    !experience.value ||
    !suitability.value.trim()
  ) {
    displayError(RETURN_TYPES.JOB_INFORMATION_REQUIRED);
    return false;
  }

  if (!validateName(name.value)) {
    displayError(RETURN_TYPES.INVALID_USER_NAME_FORMAT);
    return false;
  }

  if (!validateEmail(email.value)) {
    displayError(RETURN_TYPES.INVALID_EMAIL_FORMAT);
    return false;
  }

  if (!cv.value) {
    displayError(RETURN_TYPES.APPLICATION_CV_REQUIRED);
    return false;
  }

  return true;
};

const displayError = (error_type: RETURN_TYPES) => {
  snackbarRef.value?.showSnackbar(getErrorType(error_type), "error");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 90%;
  max-width: 400px;
}

.modal h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.modal p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.modal-btn {
  background-color: #007bff;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 1rem;
}

.modal-btn:hover {
  background-color: #0056b3;
}

.modal-close-btn {
  background-color: #ccc;
  color: #333;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

.modal-close-btn:hover {
  background-color: #aaa;
}

.spinner-container {
  margin-top: 1rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3; /* Light gray */
  border-top: 4px solid #007bff; /* Blue */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-container p {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: #555;
}

.cv-analysis-row {
  display: flex;
  align-items: center;
  gap: 53%;
}

.cv-result-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #333;
}

.spinner-container-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.small-spinner {
  width: 20px;
  height: 20px;
  border-width: 3px;
}

.cv-upload-container {
  text-align: center;
  margin-top: 2rem;
}

.cv-upload-container p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.cv-upload-btn {
  width: 30%;
  display: inline-block;
  padding: 0.75rem 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.cv-upload-btn:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.job-application-container {
  width: 60%;
  margin: 20px auto;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: Arial, sans-serif;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.application-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #333;
}

input[type="text"],
input[type="email"],
input[type="number"],
input[type="file"],
textarea {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="number"]:focus,
input[type="file"]:focus,
textarea:focus {
  border-color: #007bff;
  outline: none;
}

input::placeholder,
textarea::placeholder {
  font-family: Arial, sans-serif;
  font-size: 1 rem;
  color: #aaa;
  font-style: normal;
}

.send-btn {
  display: block;
  width: 35%;
  padding: 0.75rem;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 auto;
  color: #fff;
  background: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.send-btn:hover {
  background: #0056b3;
}

.input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
}
.input:focus {
  border-color: #007bff;
  outline: none;
}

.remote-checkbox-container {
  display: flex;
  align-items: center; /* Vertically align the checkbox and label */
  gap: 0.5rem; /* Add spacing between the checkbox and the label */
  font-size: 1rem; /* Adjust font size for the label */
  cursor: pointer; /* Make the label clickable */
}

.remote-checkbox {
  width: 1.2rem; /* Adjust the size of the checkbox */
  height: 1.2rem;
  cursor: pointer; /* Add pointer cursor for better UX */
}
</style>
