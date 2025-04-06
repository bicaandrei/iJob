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
    </div>

    <button type="submit" class="send-btn" @click="sendApplication">
      Send Application
    </button>
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

const { firm_id, job_id } = defineProps<{
  firm_id: string | undefined;
  job_id: string | undefined;
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

const emit = defineEmits(["applicationSubmitted"]);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    cv.value = target.files[0];
  }
};

const sendApplication = async () => {
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
</style>
