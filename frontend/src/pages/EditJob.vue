<template>
  <Snackbar ref="snackbarRef" />
  <div class="form-container">
    <h1 class="page-title">Edit Job</h1>

    <div class="form-group">
      <input
        v-model="job.title"
        type="text"
        placeholder="Job Title"
        class="input"
      />
      <input
        v-model="job.description"
        type="text"
        placeholder="Description"
        class="input"
      />
      <select v-model="job.position" class="input">
        <option disabled value="">Select position</option>
        <option>Intern</option>
        <option>Junior</option>
        <option>Middle</option>
        <option>Senior</option>
      </select>
      <input
        v-model="job.requiredExperience"
        type="text"
        placeholder="Required Experience (e.g., 2-3 years)"
        class="input"
      />

      <input
        v-model="job.location"
        type="text"
        placeholder="Location"
        class="input"
      />

      <div
        v-for="(_, index) in job.techStack"
        :key="index"
        class="tech-stack-container"
      >
        <input
          v-model="job.techStack[index]"
          type="text"
          placeholder="Enter technology"
          class="tech-input"
        />
        <button
          type="button"
          class="remove-tech-btn"
          @click="removeTech(index)"
        >
          Remove
        </button>
      </div>
      <button type="button" class="add-tech-btn" @click="addTechInput">
        Add Technology
      </button>

      <label for="remoteCheckbox" class="remote-checkbox-container">
        Includes remote work:
        <input
          type="checkbox"
          id="remoteCheckbox"
          v-model="job.is_remote"
          class="remote-checkbox"
        />
      </label>

      <button class="btn primary" @click="editJob">Edit Job</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { JobForm } from "../models/job";
import { validateRequiredExperience } from "../utils/validation-rules";
import { RETURN_TYPES, getErrorType } from "../utils/error-codes";
import Snackbar from "../components/Snackbar.vue";
import { editJobDocument, getJobById } from "../api/firestore";
import { useAuth } from "../api/authentication";
import { useJobStore } from "../stores/job";

const router = useRouter();
const route = useRoute();
const snackbarRef = ref<InstanceType<typeof Snackbar> | null>(null);
const { user } = useAuth();
const jobStore = useJobStore();

const job = ref<JobForm>({
  title: "",
  description: "",
  position: "",
  requiredExperience: "",
  location: "",
  is_remote: false,
  techStack: [""],
});

const addTechInput = () => {
  job.value.techStack.push("");
};

const removeTech = (index: number) => {
  job.value.techStack.splice(index, 1);
};

const editJob = async () => {
  if (validateForm()) {
    const jobId = route.params.id as string;
    const return_type: RETURN_TYPES = await editJobDocument(jobId, job.value);
    if (return_type === RETURN_TYPES.SUCCESS) {
      snackbarRef.value?.showSnackbar(
        "Job was edited successfully!",
        "success"
      );
      jobStore.editJob(user.value?.uid || "");
      setTimeout(() => {
        router.push({ name: "home-route" });
      }, 2000);
    } else {
      displayError(return_type);
    }
  }
};

const validateForm = (): Boolean => {
  if (
    !job.value.title ||
    !job.value.description ||
    !job.value.position ||
    !job.value.requiredExperience
  ) {
    displayError(RETURN_TYPES.JOB_INFORMATION_REQUIRED);
    return false;
  }

  if (!validateRequiredExperience(job.value.requiredExperience)) {
    displayError(RETURN_TYPES.INVALID_REQUIRED_EXPERIENCE_FORMAT);
    return false;
  }

  const hasEmptyTech = job.value.techStack.some(
    (technology) => technology.trim() === ""
  );

  if (hasEmptyTech) {
    displayError(RETURN_TYPES.EMPTY_TECH_STACK_INPUTS);
    return false;
  }

  return true;
};

const displayError = (error_type: RETURN_TYPES) => {
  snackbarRef.value?.showSnackbar(getErrorType(error_type), "error");
};

onMounted(() => {
  const jobId = route.params.id as string;
  console.log(jobId);
  if (jobId) {
    getJobById(jobId).then((jobData) => {
      if (jobData) {
        if (jobData.techStack.length === 1 && jobData.techStack[0] === "Any") {
          jobData.techStack = [];
        }
        job.value = jobData;
      }
    });
  }
});
</script>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: Arial, sans-serif;
}
.page-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
.tech-stack-container {
  display: grid;
  grid-template-columns: 1fr 0.2fr; /* Two columns: input takes most space, button takes minimal space */
  gap: 2rem; /* Small gap between the input and the button */
  align-items: center; /* Vertically align items */
}
.tech-input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
  width: 100%; /* Ensure the input takes full width of its column */
}
.error-message {
  color: red;
  font-size: 0.9rem;
  text-align: center;
}
.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}
.primary {
  background: #007bff;
  color: #fff;
}
.primary:hover {
  background: #0056b3;
}
.add-tech-btn {
  background: #4caf50;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
  margin-top: 0.5rem;
  width: 50%;
}
.add-tech-btn:hover {
  background: #388e3c;
}
.remove-tech-btn {
  background: #dc2626;
  color: #fff;
  padding: 0.75rem; /* Match the input height */
  border-radius: 8px;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  height: 100%; /* Ensure it matches the input height */
}
.remove-tech-btn:hover {
  background: #b91c1c;
}
.remote-checkbox-container {
  display: flex;
  align-items: center; /* Vertically align the checkbox and label */
  gap: 0.5rem; /* Add spacing between the checkbox and the label */
  font-size: 1rem; /* Adjust font size for the label */
  cursor: pointer; /* Make the label clickable */
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.remote-checkbox {
  width: 1.2rem; /* Adjust the size of the checkbox */
  height: 1.2rem;
  cursor: pointer; /* Add pointer cursor for better UX */
}
</style>
