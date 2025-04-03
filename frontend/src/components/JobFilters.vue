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
  gap: 1.5rem;
  padding: 1.5rem;
}

.filter-jobs-title {
  text-align: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

h3 {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input[type="text"] {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.checkbox-group,
.radio-group {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.checkbox-group label,
.radio-group label {
  margin-left: 0.5rem;
  font-size: 0.9rem;
}

.button-container {
  grid-column: span 2;
  text-align: center;
  margin-bottom: 1rem;
}

.remove-filters-button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.remove-filters-button:hover {
  background-color: #0056b3;
}
.remote-checkbox-container {
  display: flex;
  align-items: center; /* Vertically align the checkbox and label */
  gap: 0.5rem; /* Add spacing between the checkbox and the label */
  font-size: 1rem; /* Adjust font size for the label */
  cursor: pointer; /* Make the label clickable */
  justify-content: left;
  margin-top: 2.5rem;
}

.remote-checkbox {
  width: 1.2rem; /* Adjust the size of the checkbox */
  height: 1.2rem;
  cursor: pointer;
}
</style>
