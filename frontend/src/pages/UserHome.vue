<template>
  <div class="user-home-container">
    <h1 class="page-title">Available Jobs</h1>

    <div v-if="isLoading && jobs.length === 0" class="loading-state">
      Loading jobs...
    </div>
    <div v-else-if="jobs?.length === 0" class="empty-state">
      No jobs posted yet.
    </div>
    <div v-else class="jobs-grid">
      <div
        v-for="job in jobs"
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
            <p class="job-description">{{ job.description }}</p>
            <p class="job-experience">{{ job.requiredExperience }}</p>
            <p class="tech-stack">
              Tech Stack: <span>{{ job.techStack.join(", ") }}</span>
            </p>
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { getAllJobsWithPagination } from "../api/firestore";
import type { JobFirm } from "../models/job";
import { QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import router from "../router";

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
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.job-created-at {
  text-align: right;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.jobs-grid {
  display: grid;
  gap: 1rem;
}

.job-card {
  padding: 1rem;
  max-width: 100%;
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
.job-tech-stack {
  font-size: 1rem;
  margin-bottom: 0.25rem;
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
</style>
