<template>
  <div class="job-applications-container">
    <h1>My Job Applications</h1>

    <div v-if="jobApplications && jobApplications.length > 0">
      <div
        v-for="application in jobApplications"
        :key="application.id"
        class="job-application-card"
      >
        <h2 class="job-title">{{ application.job_title }}</h2>
        <p class="firm-name">
          <strong>Company:</strong> {{ application.firm_name }}
        </p>
        <p class="application-date">
          <strong>Applied On:</strong>
          {{ new Date(application.created_at).toLocaleDateString() }}
        </p>
        <p class="application-status">
          <strong>Status:</strong> {{ application.status || "Pending" }}
        </p>
      </div>
      <div ref="observer" class="observer"></div>
    </div>

    <p v-else-if="isLoading">Loading job applications...</p>
    <p v-else>No job applications found.</p>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { UserJobApplication } from "../models/job-application";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { getUserJobApplicationsById } from "../api/firestore";
import { useUserStore } from "../stores/user";

const jobApplications = ref<UserJobApplication[]>([]);
const lastVisibleApplication = ref<QueryDocumentSnapshot | null>(null);
const isLoading = ref(false);
const observer = ref<HTMLElement | null>(null);

const userStore = useUserStore();
const user = userStore.userInfo || { google_uid: "" };

const fetchUserApplications = async () => {
  if (isLoading.value) return; // Prevent multiple simultaneous fetches
  isLoading.value = true;

  const userId = user.google_uid;
  const pageSize = 10;

  const { applications, lastVisible } = await getUserJobApplicationsById(
    userId,
    pageSize,
    lastVisibleApplication.value
  );

  if (applications.length > 0) {
    jobApplications.value = [...jobApplications.value, ...applications];
    lastVisibleApplication.value = lastVisible;
  }

  isLoading.value = false;
};

const setupObserver = () => {
  if (!observer.value) return;

  const intersectionObserver = new IntersectionObserver(async (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !isLoading.value) {
      await fetchUserApplications();
    }
  });

  intersectionObserver.observe(observer.value);
};

onMounted(async () => {
  await fetchUserApplications();
  setupObserver();
});
</script>

<style scoped>
.job-applications-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.job-application-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.job-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.firm-name,
.application-date,
.application-status {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.observer {
  height: 1px;
}
</style>
