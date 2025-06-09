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

      <div class="select-placeholder-wrapper" style="position: relative">
        <label for="cv" class="select-label">Select or upload CV:</label>
        <p v-if="selectPlaceholder" class="select-placeholder">
          Select a recent CV or upload new
        </p>
        <select id="cv" v-model="selectedCVUrl" class="input">
          <option
            v-for="cvItem in recentCVs"
            :key="cvItem.url"
            :value="cvItem.url"
          >
            {{
              cvItem.name
                ? cvItem.name
                : new Date(cvItem.used_at).toLocaleDateString()
            }}
          </option>
          <option value="__upload_new__">Upload new CV...</option>
        </select>
      </div>

      <input
        v-if="selectedCVUrl === '__upload_new__'"
        type="file"
        id="cv-upload"
        @change="handleFileUpload"
        accept=".pdf"
        class="input"
        style="margin-top: 0.5rem"
      />

      <div class="cv-analysis-row">
        <div class="cv-upload-btn-wrapper">
          <button class="cv-upload-btn" @click="getCVAnalysis">
            Obtain CV analysis
          </button>
          <span
            class="info-icon"
            @click="showScoringInfo = true"
            title="How scoring works"
            >ℹ️</span
          >
        </div>

        <div class="cv-result-area">
          <div v-if="loadingAnalyisis" class="spinner-container-inline">
            <div class="spinner small-spinner"></div>
            <p>Analyzing...</p>
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
      <div v-if="cvScore !== null && cvScore > 75">
        <p><strong>CV Suitability:</strong> {{ cvScore }} %</p>
        <p>
          <strong>{{ cvAnalysisMessage }}</strong>
        </p>
      </div>
      <div v-else-if="cvScore !== null">
        <p>
          Your CV analysis score is below 75%. We recommend reviewing the
          analysis report to identify areas for improvement.
        </p>
        <button class="modal-btn" @click="openReport">View Report</button>
      </div>
      <button class="modal-close-btn" @click="closeModal">Close</button>
    </div>
  </div>

  <div v-if="showScoringInfo" class="modal-overlay">
    <div class="modal">
      <h2>How CV Scoring Works</h2>
      <p>
        CVs are scored based on how well they match the job description,
        including relevant programming languages, certifications, frameworks,
        tools, and experience level.
      </p>
      <ul class="scoring-info-list">
        <li><strong>Certifications</strong>: Most valued (4x weight)</li>
        <li>
          <strong>Programming Languages</strong>: High importance (3x weight)
        </li>
        <li><strong>Frameworks</strong>: Moderate importance (2x weight)</li>
        <li><strong>Tools</strong>: Least weight (1x)</li>
      </ul>
      <p>
        Your CV is scanned for relevant skills in each category and scored based
        on how many of the job's required skills it matches, with different
        importance weights per category.
      </p>
      <p>
        Additionally, your <strong>years of experience</strong> are compared to
        the job's requirements. If your experience is lower than expected, the
        score may be reduced.
      </p>
      <p>
        If your final score is under 75%, we’ll generate a personalized report
        with suggestions to improve your CV for this role.
      </p>
      <button class="modal-close-btn" @click="showScoringInfo = false">
        Close
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useUserStore } from "../stores/user";
import Snackbar from "./Snackbar.vue";
import { getErrorType, RETURN_TYPES } from "../utils/error-codes";
import { validateEmail, validateName } from "../utils/validation-rules";
import type { JobApplicationForm } from "../models/job-application";
import {
  addRecentCVToUser,
  getRecentCVsOfUser,
  setJobApplicationDocument,
} from "../api/firestore";
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
  telephone: "",
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
const showScoringInfo = ref(false);
const recentCVs = ref<{ url: string; used_at: string; name: string }[]>([]);
const selectedCVUrl = ref<string | null>(null);
const selectedCVName = ref<string | null>(null);
const selectPlaceholder = ref<boolean>(true);

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
  let fileToAnalyze: File | null = null;

  if (selectedCVUrl.value && selectedCVUrl.value !== "__upload_new__") {
    try {
      const response = await fetch(selectedCVUrl.value);
      const blob = await response.blob();
      const cvItem = recentCVs.value.find(
        (cv) => cv.url === selectedCVUrl.value
      );
      const fileName = cvItem?.name || "cv.pdf";
      fileToAnalyze = new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.log("Error fetching CV:", error);
      displayError(RETURN_TYPES.APPLICATION_CV_REQUIRED);
      return false;
    }
  } else if (cv.value) {
    fileToAnalyze = cv.value;
  }

  if (!fileToAnalyze) {
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
      fileToAnalyze,
      jobSkills,
      job_experience || "",
      job_title || ""
    );
    cvScore.value = score.score;
    cvAnalysisMessage.value = score.message;
    cvAnalysisReportUrl.value = score.cv_report_url;

    showAnalysisModal.value = true;

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
  if (!validateForm()) return;

  let cvToUse: File | string | null = null;
  let cvNameToUse: string | null = null;
  if (selectedCVUrl.value && selectedCVUrl.value !== "__upload_new__") {
    cvToUse = selectedCVUrl.value;
    cvNameToUse = selectedCVName.value;
  } else if (cv.value) {
    cvToUse = cv.value;
    cvNameToUse = cv.value.name;
  }

  if (!cvToUse) {
    displayError(RETURN_TYPES.APPLICATION_CV_REQUIRED);
    return;
  }

  console.log(cvNameToUse);

  const JobApplicationForm: JobApplicationForm = {
    applicant_id: user.google_uid,
    firm_id: firm_id,
    job_id: job_id,
    name: name.value,
    email: email.value,
    telephone: user.telephone,
    experience: experience.value || 0,
    cv: cvToUse,
    suitability: suitability.value,
    applicant_profile_pic: user.profile_pic,
    analysis_score: includeCVAnalysis.value ? cvScore.value : null,
  };

  const downloadCVUrl: string | null = await setJobApplicationDocument(
    JobApplicationForm
  );

  if (downloadCVUrl) {
    await addRecentCVToUser(user.google_uid, downloadCVUrl, cvNameToUse || "");

    console.log("Application sent successfully!");
    snackbarRef.value?.showSnackbar(
      "Job application successfully sent!",
      "success"
    );

    setTimeout(() => {
      emit("applicationSubmitted");
    }, 2000);
  } else {
    displayError(RETURN_TYPES.JOB_APPLICATION_FAILED);
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

  if (
    (!selectedCVUrl.value || selectedCVUrl.value === "__upload_new__") &&
    !cv.value
  ) {
    displayError(RETURN_TYPES.APPLICATION_CV_REQUIRED);
    return false;
  }

  return true;
};

const displayError = (error_type: RETURN_TYPES) => {
  snackbarRef.value?.showSnackbar(getErrorType(error_type), "error");
};

watch(selectedCVUrl, (newVal) => {
  cvScore.value = null;
  selectPlaceholder.value = false;
  if (newVal && newVal !== "__upload_new__") {
    const cvItem = recentCVs.value.find((cv) => cv.url === newVal);
    selectedCVName.value = cvItem?.name || null;
  } else if (newVal === "__upload_new__") {
    selectedCVName.value = null;
  } else {
    selectedCVName.value = null;
  }
});

onMounted(async () => {
  if (user.google_uid) {
    recentCVs.value = await getRecentCVsOfUser(user.google_uid);
  }
});
</script>

<style scoped>
.job-application-container {
  width: 40%;
  margin: 20px auto;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: Arial, sans-serif;
}

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
  font-size: 0.97rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 300px;
  max-height: 90%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.modal h2 {
  font-size: 1.15rem;
  margin-bottom: 0.75rem;
  word-break: break-word;
}

.modal p {
  font-size: 0.97rem;
  margin-bottom: 1rem;
  word-break: break-word;
}

.scoring-info-list {
  margin: 0.5rem 0 0.5rem 1rem;
  padding-left: 1.1rem;
}

.scoring-info-list li {
  margin-bottom: 0.35rem;
  font-size: 0.97rem;
  word-break: break-word;
}

.modal-btn {
  background-color: #00c49a;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.modal-btn:hover {
  background-color: #00a880;
}

.modal-close-btn {
  background-color: #ccc;
  color: #333;
  padding: 0.75rem 1.5rem;
  width: 46%;
  margin: 0 auto;
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
  border-top: 4px solid #00c49a; /* Blue */
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
  flex-direction: column; /* Stack items vertically on smaller screens */
  align-items: center; /* Center align the spinner and button */
  gap: 1rem; /* Add spacing between elements */
  width: 100%; /* Ensure it takes the full width of the container */
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
  justify-content: center; /* Center the spinner horizontally */
  gap: 0.5rem;
  width: 100%; /* Ensure it stays within the container */
  text-align: center; /* Center-align the text */
}

.small-spinner {
  width: 20px;
  height: 20px;
  border-width: 3px;
  border: 3px solid #f3f3f3; /* Light gray */
  border-top: 3px solid #00c49a; /* Primary color */
  border-radius: 50%;
  animation: spin 1s linear infinite;
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
  width: 170px;
  display: inline-block;
  padding: 0.75rem 0.75rem;
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  background-color: #00c49a;
  margin-top: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.cv-upload-btn:hover {
  background-color: #00a880;
  transform: scale(1.05);
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
  color: #00c49a;
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
  border-color: #00c49a;
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
  width: 190px;
  padding: 0.75rem;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 auto;
  color: #fff;
  background: #00c49a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.send-btn:hover {
  background: #00a880;
}

.input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
}

.input:focus {
  border-color: #00c49a;
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
  accent-color: #00a880;
}

.cv-upload-btn-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 2rem;
}

.info-icon {
  cursor: pointer;
  font-size: 1.2rem;
  color: #00a880;
  transition: color 0.3s;
}

.info-icon:hover {
  color: #007f66;
}

.info-icon {
  font-size: 1.25rem;
  cursor: pointer;
  color: #00a880;
}

.info-icon:hover {
  color: #008b6d;
}

.scoring-info-list {
  text-align: left;
  margin: 1rem 0;
  padding-left: 1.25rem;
  list-style-type: disc;
}

.scoring-info-list li {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.select-placeholder-wrapper {
  position: relative;
  width: 100%;
  min-width: 200px;
}

.select-placeholder-wrapper .input,
.select-placeholder-wrapper select {
  width: 100%;
}

.select-placeholder {
  position: absolute;
  left: 16px;
  top: 27px;
  background: #fff;
  padding: 0 4px;
  color: #aaa;
  font-size: 0.95rem;
  pointer-events: none;
  z-index: 2;
  transition: 0.2s;
}

.select-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: bold;
  color: #333;
  font-size: 1rem;
}

.input:focus + .select-placeholder,
.input:not([value=""]):not(:placeholder-shown) + .select-placeholder {
  color: #00c49a;
}

@media (max-width: 1300px) {
  .job-application-container {
    width: 50%;
  }
}

@media (max-width: 900px) {
  .job-application-container {
    width: 70%;
  }
}
</style>
