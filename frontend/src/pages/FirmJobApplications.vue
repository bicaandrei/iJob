<template>
  <div class="applications-container">
    <h1 class="page-title">Job Applications ({{ applications?.length }})</h1>

    <div class="filters-section">
      <ApplicantsFilter
        @filter-change="applyFilters"
        @remove-filters="removeFilters"
      />
    </div>

    <div v-if="isLoading" class="loading-state">Loading applications...</div>
    <div v-else-if="filteredApplications?.length === 0" class="empty-state">
      No applications found for this job.
    </div>
    <div v-else class="applications-grid">
      <div
        v-for="application in filteredApplications"
        :key="application.id"
        class="application-card"
      >
        <div class="card-header">
          <!-- Applicant Profile Picture -->
          <div class="applicant-profile-pic-container">
            <img
              :src="application.applicant_profile_pic || defaultProfilePicture"
              alt="Applicant Profile Picture"
              class="applicant-profile-pic"
            />
          </div>

          <!-- Applicant Details -->
          <h2 class="applicant-name">{{ application.name }}</h2>
          <p class="applicant-email">
            <span class="label">Email: </span>
            <span class="value">{{ application.email }}</span>
          </p>
          <p class="applicant-experience">
            <span class="label">Experience: </span>
            <span class="value">{{ application.experience }} years</span>
          </p>
          <p class="applicant-suitability">
            <span class="label">Suitability: </span>
            <span class="value">{{ application.suitability }}</span>
          </p>
          <p class="application-date">
            <span class="label">Applied on: </span>
            <span class="value">{{ formatDate(application.created_at) }}</span>
          </p>
          <p class="application-analysis-score">
            <span class="label">CV Analysis Score: </span>
            <span
              class="value"
              :class="{
                'score-high':
                  application.analysis_score != null &&
                  application.analysis_score > 50,
                'score-low':
                  application.analysis_score != null &&
                  application.analysis_score <= 50,
              }"
            >
              {{ application.analysis_score || "Not available" }}
            </span>
          </p>
        </div>
        <button
          v-if="application.cv"
          class="download-cv-btn"
          @click="downloadCV(application.id, application.cv)"
        >
          View CV
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  getJobApplicationsByJobId,
  setJobApplicationStatusToSeen,
} from "../api/firestore"; // Replace with the actual path to your API function
import type { JobApplication } from "../models/job-application";
import { Timestamp } from "firebase/firestore";
import ApplicantsFilter from "../components/ApplicantsFilter.vue";
import defaultProfilePicture from "../assets/default_profile_picture.png";

const route = useRoute();
const jobId = route.params.id as string;

const applications = ref<JobApplication[] | null>([]);
const isLoading = ref(true);

const fetchApplications = async () => {
  try {
    applications.value = await getJobApplicationsByJobId(jobId);
  } catch (error) {
    console.error("Error fetching job applications:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date: Date | Timestamp): string => {
  const jsDate = date instanceof Timestamp ? date.toDate() : date;
  return jsDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const downloadCV = async (application_id: string, cvUrl: string) => {
  await setJobApplicationStatusToSeen(application_id);
  window.open(cvUrl, "_blank");
};

const filters = ref({
  experience: "",
  dateSubmitted: "",
  score: "",
});

const applyFilters = (selectedFilters: {
  experience: string;
  dateSubmitted: string;
  score: string;
}) => {
  filters.value = selectedFilters;
};

const removeFilters = () => {
  filters.value = {
    experience: "",
    dateSubmitted: "",
    score: "",
  };
};

const filteredApplications = computed(() => {
  return applications.value?.filter((application) => {
    if (
      filters.value.experience &&
      application.experience < parseInt(filters.value.experience)
    ) {
      return false;
    }

    if (filters.value.dateSubmitted) {
      const now = new Date();
      const jobDate =
        application.created_at instanceof Timestamp
          ? application.created_at.toDate()
          : application.created_at;
      const diffInDays =
        (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      if (filters.value.dateSubmitted === "24h" && diffInDays > 1) return false;
      if (filters.value.dateSubmitted === "7days" && diffInDays > 7)
        return false;
      if (filters.value.dateSubmitted === "1month" && diffInDays > 30)
        return false;
      if (filters.value.dateSubmitted === "3months" && diffInDays > 90)
        return false;
    }

    if (
      filters.value.score &&
      application.analysis_score &&
      application.analysis_score < parseInt(filters.value.score)
    ) {
      return false;
    }

    if (filters.value.score && !application.analysis_score) {
      return false;
    }

    return true;
  });
});

onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.applications-container {
  min-height: calc(100vh - 4rem);
  padding: 2rem;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center all content horizontally */
}

.page-title {
  text-align: center;
  margin-bottom: 1rem;
}

.filters-section {
  width: 100%;
  max-width: 800px;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: #fff;
  margin-bottom: 2rem;
}

.loading-state,
.empty-state {
  text-align: center;
  font-size: 1.25rem;
  color: #555;
}

.applications-grid {
  display: grid;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
}

.application-card {
  position: relative;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: #fff;
  transition: box-shadow 0.2s;
}

.application-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.card-header {
  margin-bottom: 1rem;
}

.applicant-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.label {
  font-weight: bold;
  color: black;
}

.value {
  color: #555;
}

.download-cv-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.download-cv-btn:hover {
  background-color: #0056b3;
}

.applicant-profile-pic-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.applicant-profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%; /* Make the image round */
  object-fit: cover; /* Ensure the image fits within the circle */
  border: 2px solid #ccc; /* Optional: Add a border around the image */
}
.score-high {
  color: green;
  font-weight: bold;
}

.score-low {
  color: red;
  font-weight: bold;
}
</style>
