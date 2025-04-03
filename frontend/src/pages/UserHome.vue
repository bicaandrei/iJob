<template>
  <div class="user-home-container">
    <h1 class="page-title">Available Jobs</h1>

    <div class="filters-section">
      <JobFilters
        @filter-change="applyFilters"
        @remove-filters="removeFilters"
      />
    </div>

    <div class="jobs-section">
      <div v-if="isLoading && jobs.length === 0" class="loading-state">
        Loading jobs...
      </div>
      <div v-else-if="filteredJobs.length === 0" class="empty-state">
        No jobs match the selected filters.
      </div>
      <div v-else class="jobs-grid">
        <div
          v-for="job in filteredJobs"
          :key="job.id"
          @click="goToJob(job.id)"
          class="job-card"
        >
          <div class="card-header">
            <div class="company-info">
              <img
                :src="job.firm_profile_pic"
                alt="Company Logo"
                class="company-logo"
              />
              <h3 class="company-name">{{ job.company_name }}</h3>
            </div>

            <div>
              <h2 class="job-title">{{ job.title }} ({{ job.position }})</h2>
              <p class="job-description">
                <span class="label">Job description: </span>
                <span class="value">{{ job.description }}</span>
              </p>
              <p class="job-experience">
                <span class="label">Required experience: </span>
                <span class="value">{{ job.requiredExperience }}</span>
              </p>
              <p class="job-location">
                <span class="label">Location: </span>
                <span class="value">{{ job.location }}</span>
              </p>
              <p class="tech-stack">
                <span class="label">Tech Stack: </span>
                <span class="value">{{ job.techStack.join(", ") }}</span>
              </p>
              <p class="job-is-remote">
                <span class="label">Includes remote work: </span>
                <span class="value">{{ job.is_remote }}</span>
              </p>
            </div>
          </div>
          <div class="job-created-at">
            Posted {{ timeSince(job.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <div ref="loadMoreTrigger" class="load-more-trigger"></div>

    <div v-if="isLoading && jobs.length > 0" class="loading-state">
      Loading more jobs...
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { getAllJobsWithPagination } from "../api/firestore";
import type { JobFirm } from "../models/job";
import { QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import router from "../router";
import JobFilters from "../components/JobFilters.vue";

const jobs = ref<JobFirm[]>([]);
const lastVisible = ref<QueryDocumentSnapshot | null>(null);
const pageSize = 10;
const isLoading = ref(false);
const hasMoreJobs = ref(true);
const loadMoreTrigger = ref<HTMLDivElement | null>(null);

const goToJob = (id: string) => {
  router.push({ name: "user-job-details-route", params: { id } });
};

const fetchJobs = async () => {
  if (isLoading.value || !hasMoreJobs.value) return;

  isLoading.value = true;
  const result = await getAllJobsWithPagination(pageSize, lastVisible.value);

  if (result.jobs.length > 0) {
    jobs.value = [...jobs.value, ...result.jobs];
    lastVisible.value = result.lastVisible;
  } else {
    hasMoreJobs.value = false;
  }

  isLoading.value = false;
};

const observer = new IntersectionObserver(
  (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && hasMoreJobs.value) {
      fetchJobs();
    }
  },
  { root: null, rootMargin: "0px", threshold: 1.0 }
);

const timeSince = (
  fromDate: Date | Timestamp,
  toTimestamp: number = Date.now()
): string => {
  let fromTimestamp: number;

  if (fromDate instanceof Date) {
    fromTimestamp = fromDate.getTime();
  } else {
    fromTimestamp = fromDate.seconds * 1000;
  }

  const seconds = Math.floor((toTimestamp - fromTimestamp) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};

const filteredJobs = computed(() => {
  return jobs.value.filter((job) => {
    if (filters.value.jobTitle && !job.title.includes(filters.value.jobTitle)) {
      return false;
    }

    if (
      filters.value.positions.length > 0 &&
      !filters.value.positions.includes(job.position)
    ) {
      return false;
    }

    if (
      filters.value.jobLocation &&
      !job.location.includes(filters.value.jobLocation)
    ) {
      return false;
    }

    if (filters.value.jobIsRemote && !job.is_remote) {
      return false;
    }

    if (
      filters.value.experience &&
      parseInt(job.requiredExperience) < parseInt(filters.value.experience)
    ) {
      return false;
    }

    if (filters.value.datePosted) {
      const now = new Date();
      const jobDate =
        job.created_at instanceof Timestamp
          ? job.created_at.toDate()
          : job.created_at;
      const diffInDays =
        (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);

      if (filters.value.datePosted === "24h" && diffInDays > 1) return false;
      if (filters.value.datePosted === "3days" && diffInDays > 3) return false;
      if (filters.value.datePosted === "7days" && diffInDays > 7) return false;
      if (filters.value.datePosted === "1month" && diffInDays > 30)
        return false;
    }

    return true;
  });
});

const filters = ref({
  jobTitle: "",
  jobLocation: "",
  jobIsRemote: false,
  positions: [] as string[],
  experience: "",
  datePosted: "",
});

const applyFilters = (selectedFilters: {
  jobTitle: string;
  jobLocation: string;
  jobIsRemote: boolean;
  positions: string[];
  experience: string;
  datePosted: string;
}) => {
  filters.value = selectedFilters;
};

const removeFilters = () => {
  filters.value = {
    jobTitle: "",
    jobLocation: "",
    jobIsRemote: false,
    positions: [] as string[],
    experience: "",
    datePosted: "",
  };
};

onMounted(() => {
  fetchJobs();

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }
});

onBeforeUnmount(() => {
  if (loadMoreTrigger.value) {
    observer.unobserve(loadMoreTrigger.value);
  }
});
</script>

<style scoped>
.user-home-container {
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

.toggle-filters-btn {
  padding: 0.5rem 1rem;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.3s;
}

.toggle-filters-btn:hover {
  background-color: #357abd;
}

.filters-section {
  width: 100%;
  max-width: 800px;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: #fff;
  margin-bottom: 2rem;
}

.jobs-section {
  width: 100%;
  max-width: 800px;
}

.jobs-grid {
  display: grid;
  gap: 1rem;
  width: 100%;
}

.job-card {
  position: relative;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: #fff;
  transition: box-shadow 0.2s;
}

.job-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.job-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.job-description,
.job-position,
.job-experience,
.job-locations,
.job-is-remote,
.job-tech-stack {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.label {
  font-weight: bold;
  color: black;
}

.value {
  color: #555;
}

.loading-state {
  text-align: center;
  font-size: 1.25rem;
  margin-top: 1rem;
}

.load-more-trigger {
  height: 1px;
  visibility: hidden;
}

.company-info {
  text-align: center;
  margin-bottom: 1rem;
}

.company-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.company-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
}

.job-created-at {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.875rem;

  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
</style>
