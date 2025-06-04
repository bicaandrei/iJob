<template>
  <div class="user-home-container">
    <div class="filters-wrapper">
      <button class="toggle-filters-btn" @click="showFilters = !showFilters">
        {{ showFilters ? "Hide Filters ▲" : "Show Filters ▼" }}
      </button>

      <transition @before-enter="beforeEnter" @enter="enter" @leave="leave">
        <div v-show="showFilters" ref="filtersContainer" class="filters-panel">
          <JobFilters
            @filter-change="applyFilters"
            @remove-filters="removeFilters"
          />
        </div>
      </transition>
    </div>

    <div v-if="isLoading && jobs.length === 0" class="loading-state">
      Loading jobs...
    </div>
    <div v-else-if="filteredJobs.length === 0" class="empty-state">
      No jobs match the selected filters.
    </div>

    <div class="jobs-grid">
      <div
        v-for="job in filteredJobs"
        :key="job.id"
        @click="goToJob(job.id)"
        class="job-card"
      >
        <div class="card-header">
          <img
            :src="job.firm_profile_pic || defaultProfilePicture"
            alt="Company Logo"
            class="company-logo"
          />
          <h3 class="company-name">{{ job.company_name }}</h3>
        </div>

        <h2 class="job-title">{{ job.title }} ({{ job.position }})</h2>
        <p class="job-description">{{ job.description }}</p>

        <div class="job-details">
          <p>
            <span class="label">Experience:</span> {{ job.requiredExperience }}
          </p>
          <p><span class="label">Location:</span> {{ job.location }}</p>
          <p>
            <span class="label">Remote:</span>
            {{ job.is_remote ? "Yes" : "No" }}
          </p>
        </div>

        <div class="tech-stack">
          <h4>Required Skills:</h4>
          <ul>
            <li
              v-for="skill in getRequiredSkills(job).split(', ')"
              :key="skill"
            >
              {{ skill }}
            </li>
          </ul>
        </div>

        <div class="job-created-at">Posted {{ timeSince(job.created_at) }}</div>
      </div>
    </div>
  </div>

  <div ref="loadMoreTrigger" class="load-more-trigger"></div>

  <div v-if="isLoading && jobs.length > 0" class="loading-state">
    Loading more jobs...
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { getAllJobsWithPagination } from "../api/firestore";
import type { JobFirm } from "../models/job";
import { QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import router from "../router";
import JobFilters from "../components/JobFilters.vue";
import defaultProfilePicture from "../assets/default_profile_picture.png";

const jobs = ref<JobFirm[]>([]);
const lastVisible = ref<QueryDocumentSnapshot | null>(null);
const pageSize = 10;
const isLoading = ref(false);
const hasMoreJobs = ref(true);
const loadMoreTrigger = ref<HTMLDivElement | null>(null);
const showFilters = ref(false);

const filters = ref({
  jobTitle: "",
  jobLocation: "",
  jobIsRemote: false,
  positions: [] as string[],
  experience: "",
  skill: "",
  datePosted: "",
});

const applyFilters = (selectedFilters: {
  jobTitle: string;
  jobLocation: string;
  jobIsRemote: boolean;
  positions: string[];
  experience: string;
  skill: string;
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
    skill: "",
    datePosted: "",
  };
};

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

const getRequiredSkills = (job: JobFirm): string => {
  const skills = [
    ...(job.programming_languages || []),
    ...(job.frameworks || []),
    ...(job.certifications || []),
    ...(job.tools || []),
  ];
  return skills.length > 0 ? skills.join(", ") : "None";
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

    if (filters.value.skill) {
      const skills = [
        ...(job.programming_languages || []),
        ...(job.frameworks || []),
        ...(job.certifications || []),
        ...(job.tools || []),
      ];
      if (!skills.some((skill) => skill.includes(filters.value.skill))) {
        return false;
      }
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

const filtersContainer = ref<HTMLElement | null>(null);

const beforeEnter = (el: Element) => {
  (el as HTMLElement).style.height = "0";
  (el as HTMLElement).style.opacity = "0";
};

const enter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.transition = "all 0.3s ease";
  element.style.height = element.scrollHeight + "px";
  element.style.opacity = "1";

  const cleanup = () => {
    element.style.height = "auto";
    done();
  };
  element.addEventListener("transitionend", cleanup, { once: true });
};

const leave = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.transition = "all 0.3s ease";
  element.style.height = element.scrollHeight + "px";
  requestAnimationFrame(() => {
    element.style.height = "0";
    element.style.opacity = "0";
  });

  element.addEventListener("transitionend", done, { once: true });
};
</script>

<style scoped>
.user-home-container {
  min-height: calc(100vh - 4rem);
  padding: 2rem;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center all content horizontally */
  background-color: #ffffff;
}

.page-title {
  text-align: center;
  margin-bottom: 1rem;
}

.filters-section {
  width: 60%;
  max-width: 600px;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  padding: 1rem;
  margin-bottom: 2rem;
}

.filters-wrapper {
  width: 85%;
  max-width: 700px;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.toggle-filters-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #00c49a;
  color: white;
  border: none;
  border-radius: 0.5rem 0.5rem 0 0;
  cursor: pointer;
  font-weight: bold;
}

.filters-panel {
  padding: 1rem;
}

.jobs-section {
  width: 100%;
  max-width: 800px;
  z-index: 10;
}

.jobs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 2rem;
  box-sizing: border-box;
  justify-content: flex-start;
  width: 100%;
}

.job-card {
  position: relative; /* Make the job card a positioned container */
  flex: 1 1 calc(33.333% - 1rem); /* Default: 3 per row */
  max-width: calc(33.333% - 1rem);
  min-width: 300px;
  min-height: 350px;
  box-sizing: border-box;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  transition: box-shadow 0.3s, transform 0.2s;
}

.job-card:hover {
  box-shadow: 0 4px 16px #00c49a; /* Updated box shadow color */
  transform: translateY(-5px);
}

.job-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #00c49a; /* Highlight the job title */
  margin-bottom: 0.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.company-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}

.company-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.label {
  font-weight: bold;
  color: black;
  display: inline-block;
}

.value {
  color: #555;
}

.job-description {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
}

.job-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.job-details p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.job-details .label {
  font-weight: bold;
  color: #333;
}

.tech-stack {
  margin-top: 1rem;
}

.tech-stack h4 {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.tech-stack ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-stack ul li {
  background: #f0f4f8;
  color: #00c49a;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.job-created-at {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.875rem;
  color: #777;
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

.empty-state {
  text-align: center;
  font-size: 1.25rem;
  margin-top: 1rem;
}

@media (max-width: 1300px) {
  .filters-section {
    width: calc(50% - 1rem); /* Match the width of job cards (2 per row) */
    max-width: calc(50% - 1rem);
  }

  .job-card {
    flex: 1 1 calc(50% - 1rem); /* 2 per row on medium screens */
    max-width: calc(50% - 1rem);
  }
}

@media (max-width: 900px) {
  .filters-section {
    width: 100%; /* Match the width of job cards (1 per row) */
    max-width: 100%;
  }

  .jobs-grid {
    justify-content: center;
  }

  .job-card {
    flex: 1 1 100%; /* 1 per row on small screens */
    max-width: 100%;
  }
}
</style>
