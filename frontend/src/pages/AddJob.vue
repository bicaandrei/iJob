<template>
  <Snackbar ref="snackbarRef" />
  <div class="form-container">
    <h1 class="page-title">Add New Job</h1>

    <div class="form-group">
      <input
        v-model="job.title"
        type="text"
        placeholder="Job Title*"
        class="input"
      />
      <textarea
        v-model="job.description"
        type="text"
        placeholder="Description*"
        class="textarea"
      ></textarea>

      <select v-model="job.position" class="input">
        <option disabled value="">Select position*</option>
        <option>Intern</option>
        <option>Junior</option>
        <option>Middle</option>
        <option>Senior</option>
      </select>
      <input
        v-model="job.requiredExperience"
        type="text"
        placeholder="Required Experience (e.g., 2-3 years)*"
        class="input"
      />

      <input
        v-model="job.location"
        type="text"
        placeholder="Location*"
        class="input"
      />

      <div class="skill-search-wrapper">
        <input
          v-model="searchedProgrammingLanguage"
          @input="debouncedSearch('programming_language')"
          type="text"
          placeholder="Search required programming languages"
          class="input"
        />
        <ul v-if="programmingLanguageResults.length" class="search-results">
          <li
            v-for="(result, index) in programmingLanguageResults"
            :key="index"
            @click="addSkill(result, 'programming_languages')"
          >
            {{ result }}
          </li>
        </ul>
      </div>

      <ul v-if="job.programming_languages.length" class="selected-skills-list">
        <li v-for="(language, index) in job.programming_languages" :key="index">
          {{ language }}
          <button @click="removeSkill(index, 'programming_languages')">
            Remove
          </button>
        </li>
      </ul>

      <div class="skill-search-wrapper">
        <input
          v-model="searchedFramework"
          @input="debouncedSearch('framework')"
          type="text"
          placeholder="Search required frameworks"
          class="input"
        />
        <ul v-if="frameworkResults.length" class="search-results">
          <li
            v-for="(result, index) in frameworkResults"
            :key="index"
            @click="addSkill(result, 'frameworks')"
          >
            {{ result }}
          </li>
        </ul>
      </div>

      <ul v-if="job.frameworks.length" class="selected-skills-list">
        <li v-for="(framework, index) in job.frameworks" :key="index">
          {{ framework }}
          <button @click="removeSkill(index, 'frameworks')">Remove</button>
        </li>
      </ul>

      <div class="skill-search-wrapper">
        <input
          v-model="searchedCertification"
          @input="debouncedSearch('certification')"
          type="text"
          placeholder="Search required certifications"
          class="input"
        />
        <ul v-if="certificationResults.length" class="search-results">
          <li
            v-for="(result, index) in certificationResults"
            :key="index"
            @click="addSkill(result, 'certifications')"
          >
            {{ result }}
          </li>
        </ul>
      </div>

      <ul v-if="job.certifications.length" class="selected-skills-list">
        <li v-for="(certification, index) in job.certifications" :key="index">
          {{ certification }}
          <button @click="removeSkill(index, 'certifications')">Remove</button>
        </li>
      </ul>

      <div class="skill-search-wrapper">
        <input
          v-model="searchedTool"
          @input="debouncedSearch('tool')"
          type="text"
          placeholder="Search required tools"
          class="input"
        />
        <ul v-if="toolResults.length" class="search-results">
          <li
            v-for="(result, index) in toolResults"
            :key="index"
            @click="addSkill(result, 'tools')"
          >
            {{ result }}
          </li>
        </ul>
      </div>

      <ul v-if="job.tools.length" class="selected-skills-list">
        <li v-for="(tool, index) in job.tools" :key="index">
          {{ tool }}
          <button @click="removeSkill(index, 'tools')">Remove</button>
        </li>
      </ul>

      <label for="remoteCheckbox" class="remote-checkbox-container">
        Includes remote work:
        <input
          type="checkbox"
          id="remoteCheckbox"
          v-model="job.is_remote"
          class="remote-checkbox"
        />
      </label>

      <button class="btn primary" @click="submitJob">Submit Job</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { type JobForm } from "../models/job";
import { validateRequiredExperience } from "../utils/validation-rules";
import { RETURN_TYPES, getErrorType } from "../utils/error-codes";
import Snackbar from "../components/Snackbar.vue";
import { searchSkills, setJobAdDocument } from "../api/firestore";
import { useAuth } from "../api/authentication";
import { useJobStore } from "../stores/job";
import { debounce } from "../utils/debounce";

const router = useRouter();
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
  programming_languages: [],
  frameworks: [],
  certifications: [],
  tools: [],
});

const searchedProgrammingLanguage = ref("");
const searchedFramework = ref("");
const searchedCertification = ref("");
const searchedTool = ref("");
const programmingLanguageResults = ref<string[]>([]);
const frameworkResults = ref<string[]>([]);
const certificationResults = ref<string[]>([]);
const toolResults = ref<string[]>([]);

const debouncedSearch = debounce(async (category: string) => {
  let query = "";
  if (category === "programming_language") {
    query = searchedProgrammingLanguage.value;
    if (query.trim()) {
      programmingLanguageResults.value = await searchSkills(query, category);
    } else {
      programmingLanguageResults.value = [];
    }
  }
  if (category === "framework") {
    query = searchedFramework.value;
    if (query.trim()) {
      frameworkResults.value = await searchSkills(query, category);
    } else {
      frameworkResults.value = [];
    }
  }
  if (category === "certification") {
    query = searchedCertification.value;
    if (query.trim()) {
      certificationResults.value = await searchSkills(query, category);
    } else {
      certificationResults.value = [];
    }
  }
  if (category === "tool") {
    query = searchedTool.value;
    if (query.trim()) {
      toolResults.value = await searchSkills(query, category);
    } else {
      toolResults.value = [];
    }
  }
}, 300);

const addSkill = (
  skill: string,
  category: "programming_languages" | "frameworks" | "certifications" | "tools"
) => {
  if (!job.value[category].includes(skill)) {
    job.value[category].push(skill);
  }
  if (category == "programming_languages") {
    searchedProgrammingLanguage.value = "";
    programmingLanguageResults.value = [];
  }
  if (category == "frameworks") {
    searchedFramework.value = "";
    frameworkResults.value = [];
  }
  if (category == "certifications") {
    searchedCertification.value = "";
    certificationResults.value = [];
  }
  if (category == "tools") {
    searchedTool.value = "";
    toolResults.value = [];
  }
};

const removeSkill = (
  index: number,
  category: "programming_languages" | "frameworks" | "certifications" | "tools"
) => {
  job.value[category].splice(index, 1);
};

const submitJob = async () => {
  if (validateForm()) {
    const return_type: RETURN_TYPES = await setJobAdDocument(
      job.value,
      user.value?.uid || ""
    );
    if (return_type === RETURN_TYPES.SUCCESS) {
      snackbarRef.value?.showSnackbar("Job was added successfully!", "success");
      jobStore.addJob(user.value?.uid || "");
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
    !job.value.requiredExperience ||
    !job.value.location
  ) {
    displayError(RETURN_TYPES.JOB_INFORMATION_REQUIRED);
    return false;
  }

  if (!validateRequiredExperience(job.value.requiredExperience)) {
    displayError(RETURN_TYPES.INVALID_REQUIRED_EXPERIENCE_FORMAT);
    return false;
  }

  return true;
};

const displayError = (error_type: RETURN_TYPES) => {
  snackbarRef.value?.showSnackbar(getErrorType(error_type), "error");
};
</script>

<style scoped>
.skill-search-wrapper {
  position: relative;
  width: 100%;
}

.skill-search-wrapper .input {
  width: 95%;
  padding: 0.75rem 0.65rem;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 10;

  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  max-height: 150px;
  overflow-y: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.search-results li {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.search-results li:hover {
  background-color: #f0f0f0;
}

.selected-skills-list {
  list-style: none;
  padding: 0;
  margin-top: 0.75rem;
}

.selected-skills-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.selected-skills-list li:last-child {
  border-bottom: none;
}

.selected-skills-list li button {
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.selected-skills-list li button:hover {
  background: #b91c1c;
}

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
.textarea {
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
  font-family: Arial, sans-serif;
  resize: vertical;
  min-height: 100px;
}

.textarea:focus {
  border-color: #007bff;
  outline: none;
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
