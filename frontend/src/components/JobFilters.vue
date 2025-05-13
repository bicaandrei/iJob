<template>
  <h2 class="filter-jobs-title">Filter Jobs</h2>
  <div class="filters-container">
    <div class="filter-group">
      <h3>Job Title</h3>
      <input
        type="text"
        v-model="selectedFilters.jobTitle"
        placeholder="Enter job title"
      />
    </div>

    <div class="filter-group">
      <h3>Experience</h3>
      <input
        type="text"
        v-model="selectedFilters.experience"
        placeholder="Enter min experience (e.g., 2 years)"
      />
    </div>

    <div class="filter-group">
      <h3>Position</h3>
      <div v-for="pos in positions" :key="pos" class="checkbox-group">
        <input
          type="checkbox"
          :id="pos"
          :value="pos"
          v-model="selectedFilters.positions"
        />
        <label :for="pos">{{ pos }}</label>
      </div>
    </div>

    <div class="filter-group">
      <h3>Posted Within</h3>
      <div v-for="(label, key) in dateOptions" :key="key" class="radio-group">
        <input
          type="radio"
          :id="key"
          :value="key"
          v-model="selectedFilters.datePosted"
        />
        <label :for="key">{{ label }}</label>
      </div>
    </div>

    <div class="filter-group">
      <h3>Job Location</h3>
      <input
        type="text"
        v-model="selectedFilters.jobLocation"
        placeholder="Enter desired location"
      />
    </div>

    <div class="filter-group">
      <h3>Desired skill</h3>
      <input
        type="text"
        v-model="selectedFilters.skill"
        placeholder="Enter desired skill"
      />
    </div>

    <label for="remoteCheckbox" class="remote-checkbox-container">
      Includes remote work:
      <input
        type="checkbox"
        id="remoteCheckbox"
        v-model="selectedFilters.jobIsRemote"
        class="remote-checkbox"
      />
    </label>
  </div>
  <div class="button-container">
    <button class="remove-filters-button" @click="removeFilters">
      Remove all filters
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits(["filter-change", "remove-filters"]);

const selectedFilters = ref({
  jobTitle: "",
  jobLocation: "",
  jobIsRemote: false,
  positions: [] as string[],
  experience: "",
  datePosted: "",
  skill: "",
});

const positions = ["Intern", "Junior", "Middle", "Senior"];
const dateOptions = {
  "24h": "Last 24 Hours",
  "3days": "Last 3 Days",
  "7days": "Last 7 Days",
  "1month": "Last Month",
};

const removeFilters = () => {
  selectedFilters.value = {
    jobTitle: "",
    jobLocation: "",
    jobIsRemote: false,
    positions: [],
    experience: "",
    datePosted: "",
    skill: "",
  };
  emit("remove-filters");
};

watch(
  selectedFilters,
  (newFilters) => {
    emit("filter-change", newFilters);
  },
  { deep: true }
);
</script>

<style scoped>
.filters-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 1rem;
  background: transparent; /* Remove white background */
  border-radius: 0; /* Remove inner rounding */
  box-shadow: none; /* Remove the inner shadow */
}

.filter-jobs-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #00c49a;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

input[type="text"],
input[type="radio"],
input[type="checkbox"] {
  accent-color: #00a880;
}

input[type="text"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: #f9f9f9;
  transition: border 0.2s ease;
}

input[type="text"]:focus {
  border-color: #00c49a;
  outline: none;
  background-color: #fff;
}

.checkbox-group,
.radio-group {
  display: flex;
  align-items: center;
}

.checkbox-group label,
.radio-group label {
  margin-left: 0.5rem;
  font-size: 0.95rem;
  color: #444;
}

.button-container {
  grid-column: span 2;
  text-align: center;
  margin-top: 1rem;
}

.remove-filters-button {
  padding: 0.75rem 1.5rem;
  background-color: #00c49a;
  color: #fff;
  border: none;
  border-radius: 2rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.remove-filters-button:hover {
  background-color: #00a880;
}

.remote-checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  justify-content: left;
  margin-top: 2.5rem;
  color: #444;
}

.remote-checkbox {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
  accent-color: #00a880;
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr; /* Single column layout */
  }

  .button-container {
    grid-column: span 1;
  }
}
</style>
