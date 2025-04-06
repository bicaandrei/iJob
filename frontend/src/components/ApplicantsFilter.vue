<template>
  <h2 class="filter-applicants-title">Filter Applicants</h2>
  <div class="filters-container">
    <!-- Experience Filter -->
    <div class="filter-group">
      <h3>Experience</h3>
      <input
        type="text"
        v-model="selectedFilters.experience"
        placeholder="Enter min experience (e.g., 2 years)"
      />
    </div>

    <!-- Date Submitted Filter -->
    <div class="filter-group">
      <h3>Date Submitted</h3>
      <div v-for="(label, key) in dateOptions" :key="key" class="radio-group">
        <input
          type="radio"
          :id="key"
          :value="key"
          v-model="selectedFilters.dateSubmitted"
        />
        <label :for="key">{{ label }}</label>
      </div>
    </div>
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
  experience: "",
  dateSubmitted: "",
});

const dateOptions = {
  "24h": "Last 24 Hours",
  "7days": "Last 7 Days",
  "1month": "Last Month",
  "3months": "Last 3 Months",
};

const removeFilters = () => {
  selectedFilters.value = {
    experience: "",
    dateSubmitted: "",
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

.filter-applicants-title {
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

.radio-group {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

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
</style>
