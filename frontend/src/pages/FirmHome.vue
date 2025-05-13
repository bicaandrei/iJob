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
              <div v-if="job.programming_languages.length" class="tech-stack">
                <span class="tech-stack-label"
                  >Required programming languages:</span
                >
                <ul>
                  <li v-for="lang in job.programming_languages" :key="lang">
                    {{ lang }}
                  </li>
                </ul>
              </div>

              <div v-if="job.frameworks.length" class="tech-stack">
                <span class="tech-stack-label">Required frameworks:</span>
                <ul>
                  <li v-for="fw in job.frameworks" :key="fw">{{ fw }}</li>
                </ul>
              </div>

              <div v-if="job.certifications.length" class="tech-stack">
                <span class="tech-stack-label">Required certifications:</span>
                <ul>
                  <li v-for="cert in job.certifications" :key="cert">
                    {{ cert }}
                  </li>
                </ul>
              </div>

              <div v-if="job.tools.length" class="tech-stack">
                <span class="tech-stack-label">Required tools:</span>
                <ul>
                  <li v-for="tool in job.tools" :key="tool">{{ tool }}</li>
                </ul>
              </div>

              <p class="job-location">
                Location: <span class="info">{{ job.location }}</span>
              </p>
              <p class="job-is-remote">
                Includes remote work:
                <span class="info">{{ job.is_remote }}</span>
              </p>
            </div>
            <div class="card-actions">
              <button @click="editJob(job.id)" class="edit-btn">Edit</button>
              <button @click="deleteJob(job.id)" class="delete-btn">
                Delete
              </button>
              <button
                @click="seeJobApplicants(job.id)"
                class="see-applicants-button"
              >
                See applicants
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

const seeJobApplicants = (id: string) => {
  router.push({ name: "firm-job-applications-route", params: { id } });
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
  flex-direction: row;
  flex-wrap: wrap;
  padding: 1rem;
  background: white;
  gap: 1rem;
  margin: 0 auto; /* Center the whole layout */
}

.sidebar {
  padding: 0.5rem 1rem;
  border-right: 1px solid #e5e7eb;
}

.add-job-btn {
  background: #00c49a;
  color: white;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: inline-block;
  margin-top: 1rem;
  margin-right: 1rem;
}

.add-job-btn:hover {
  background: #00a880;
}

.main-content {
  flex: 1;
  padding: 1rem 2rem;
  max-width: 1300px; /* Limit the width */
  margin: 0 auto; /* Center horizontally */
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00c49a;
  margin-bottom: 1.5rem;
  text-align: center;
}

.loading-state,
.empty-state {
  text-align: center;
  color: #6b7280;
}

.jobs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.job-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: #ffffff;
  /* Removed border */
  border: 1px solid #e5e7eb;
  box-shadow: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.job-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00c49a;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0;
  text-align: left;
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

.see-applicants-button {
  background: #00c49a;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.see-applicants-button:hover {
  background: #00a880;
}

.tech-stack {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.job-location,
.job-is-remote,
.tech-stack-label {
  font-weight: 600;
  color: #111827; /* black */
  white-space: nowrap;
  margin-top: 0.25rem;
}

.info {
  font-weight: 600;
  color: grey; /* black */
  white-space: nowrap;
  margin-top: 0.25rem;
}

.tech-stack ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.job-description {
  font-size: 1rem;
  color: grey; /* grey */
  margin-top: 0.5rem;
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

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .sidebar {
    text-align: center;
  }

  .add-job-btn {
    width: 100%;
    max-width: 170px;
    margin: 0 auto;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
