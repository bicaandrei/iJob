<template>
  <Snackbar ref="snackbarRef" />
  <div class="container">
    <aside class="sidebar">
      <button @click="goToAddJob" class="add-job-btn">➕ Add New Job</button>
    </aside>

    <main class="main-content">
      <h1 class="page-title">Your Posted Jobs</h1>
      <div v-if="loading" class="loading-state">Loading jobs...</div>
      <div v-else-if="jobs?.length === 0" class="empty-state">
        No jobs posted yet.
      </div>
      <div v-else class="jobs-grid">
        <div v-for="job in jobs" :key="job.id" class="job-card">
          <div class="card-header">
            <div>
              <h2 class="job-title">{{ job.title }} ({{ job.position }})</h2>
              <p class="job-description">{{ job.description }}</p>
              <p class="tech-stack">
                Tech Stack: <span>{{ job.techStack.join(", ") }}</span>
              </p>
            </div>
            <div class="card-actions">
              <button @click="editJob(job.id)" class="edit-btn">Edit</button>
              <button @click="deleteJob(job.id)" class="delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../api/authentication";
import { useJobStore } from "../stores/job";
import type { Job } from "../models/job";
import { deleteJobById } from "../api/firestore";
import Snackbar from "../components/Snackbar.vue";
import { RETURN_TYPES, getErrorType } from "../utils/error-codes";

const router = useRouter();
const { user } = useAuth();
const jobStore = useJobStore();
const snackbarRef = ref<InstanceType<typeof Snackbar> | null>(null);

const jobs = ref<Job[] | null>(null);
const loading = ref(true);

const goToAddJob = () => {
  router.push({ name: "firm-add-job-route" });
};

const editJob = (id: string) => {
  router.push({ name: "firm-edit-job-route", params: { id } });
};

const deleteJob = async (id: string) => {
  try {
    await deleteJobById(id);
    await reloadJobs();
  } catch (error: any) {
    displayError(RETURN_TYPES.JOB_DELETE_FAILED);
  }
};

const reloadJobs = async () => {
  loading.value = true;
  await jobStore.loadJobs(user.value?.uid || "");
  jobs.value = jobStore.jobs;
  loading.value = false;
};

const displayError = (error_type: RETURN_TYPES) => {
  snackbarRef.value?.showSnackbar(getErrorType(error_type), "error");
};

onMounted(async () => {
  if (!jobStore.jobs.length) {
    await reloadJobs();
  } else {
    jobs.value = jobStore.jobs;
    loading.value = false;
  }
});
</script>

<style scoped>
.container {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 15%;
  padding: 1rem;
  background: #f3f4f6;
  border-right: 1px solid #e5e7eb;
}

.add-job-btn {
  width: 100%;
  max-width: 140px;
  margin-left: 15%;
  margin-right: 15%;
  background: #2563eb;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.add-job-btn:hover {
  background: #1d4ed8;
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.empty-state {
  color: #6b7280;
}

.jobs-grid {
  display: grid;
  gap: 1rem;
}

.job-card {
  padding: 1rem;

  max-width: 80%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: #fff;
  transition: box-shadow 0.2s;
}

.job-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.job-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.job-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.tech-stack {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.edit-btn,
.delete-btn {
  font-size: 0.875rem;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.edit-btn {
  color: #2563eb;
}

.edit-btn:hover {
  text-decoration: underline;
}

.delete-btn {
  color: #dc2626;
}

.delete-btn:hover {
  text-decoration: underline;
}
</style>
