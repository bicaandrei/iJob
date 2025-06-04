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

    <div class="filter-group location-search-wrapper">
      <h3>Job Location</h3>
      <div class="location-input-wrapper">
        <template v-if="selectedFilters.jobLocation">
          <div class="selected-location-row">
            <div class="input-with-clear">
              <input
                type="text"
                :value="selectedFilters.jobLocation"
                readonly
                class="selected-location"
              />
              <button
                type="button"
                class="clear-location-btn"
                @click="clearLocation"
                aria-label="Clear location"
              >
                &times;
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <input
            type="text"
            @input="debouncedLocationSearch"
            v-model="searchedLocation"
            placeholder="Enter desired location"
            autocomplete="off"
            style="flex: 1"
          />
          <ul v-if="locationResults.length" class="search-results">
            <li
              v-for="(result, index) in locationResults"
              :key="index"
              @click="selectLocation(result)"
            >
              {{ result }}
            </li>
          </ul>
        </template>
      </div>
    </div>

    <div class="filter-group location-search-wrapper">
      <h3>Desired skill</h3>
      <div class="location-input-wrapper">
        <template v-if="selectedFilters.skill">
          <div class="selected-location-row">
            <div class="input-with-clear">
              <input
                type="text"
                :value="selectedFilters.skill"
                readonly
                class="selected-location"
              />
              <button
                type="button"
                class="clear-location-btn"
                @click="clearSkill"
                aria-label="Clear skill"
              >
                &times;
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <input
            type="text"
            @input="debouncedSkillSearch"
            v-model="searchedSkill"
            placeholder="Enter desired skill"
            autocomplete="off"
          />
          <ul v-if="skillResults.length" class="search-results">
            <li
              v-for="(result, index) in skillResults"
              :key="index"
              @click="selectSkill(result)"
            >
              {{ result }}
            </li>
          </ul>
        </template>
      </div>
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
import { debounce } from "../utils/debounce";
import { searchLocation, searchSkill } from "../api/firestore";

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

const searchedLocation = ref("");
const searchedSkill = ref("");

const locationResults = ref<string[]>([]);
const skillResults = ref<string[]>([]);

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
  searchedLocation.value = "";
  searchedSkill.value = "";
  emit("remove-filters");
};

const debouncedLocationSearch = debounce(async () => {
  const query = searchedLocation.value;
  if (query.trim()) {
    locationResults.value = await searchLocation(query);
  } else {
    locationResults.value = [];
  }
}, 300);

const selectLocation = (location: string) => {
  selectedFilters.value.jobLocation = location;
  searchedLocation.value = location;
  locationResults.value = [];
};

const clearLocation = () => {
  selectedFilters.value.jobLocation = "";
  searchedLocation.value = "";
  locationResults.value = [];
};

const clearSkill = () => {
  selectedFilters.value.skill = "";
  searchedSkill.value = "";
  skillResults.value = [];
};

const debouncedSkillSearch = debounce(async () => {
  const query = searchedSkill.value;
  if (query.trim()) {
    skillResults.value = await searchSkill(query);
  } else {
    skillResults.value = [];
  }
}, 300);

const selectSkill = (skill: string) => {
  selectedFilters.value.skill = skill;
  searchedSkill.value = skill;
  skillResults.value = [];
};

watch(
  searchedLocation,
  (newLocation) => {
    if (!newLocation) {
      selectedFilters.value.jobLocation = "";
    }
  },
  { immediate: true }
);

watch(
  searchedSkill,
  (newSkill) => {
    if (!newSkill) {
      selectedFilters.value.skill = "";
    }
  },
  { immediate: true }
);

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

.location-search-wrapper {
  position: relative;
}

.location-input-wrapper {
  position: relative;
  width: 100%;
}

.location-input-wrapper input {
  width: 90%;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 90%;
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

.clear-location-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
}
.selected-location-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.25rem;
}
.input-with-clear {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.selected-location {
  width: 100%;
  padding-right: 2rem; /* Space for the clear button */
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
