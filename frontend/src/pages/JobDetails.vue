<template>
  <div class="job-details-container">
    <h1 class="page-title">{{ job?.title }}</h1>
    <p class="job-firm"><strong>Company:</strong> {{ job?.company_name }}</p>
    <p class="job-position"><strong>Position:</strong> {{ job?.position }}</p>
    <p class="job-description">
      <strong>Description:</strong> {{ job?.description }}
    </p>
    <p class="job-description">
      <strong>Location:</strong> {{ job?.location }}
    </p>
    <p class="job-experience">
      <strong>Required Experience:</strong> {{ job?.requiredExperience }}
    </p>
    <p class="job-tech-stack">
      <strong>Tech Stack:</strong> {{ job?.techStack.join(", ") }}
    </p>
    <p class="job-description">
      <strong>Includes remote work:</strong> {{ job?.is_remote }}
    </p>

    <div v-if="isApplicationAlreadySent">
      <p class="application-sent-message">
        Application sent
        {{ applicationDate ? timeSince(applicationDate) : "just now" }} .
      </p>
    </div>
    <div v-else>
      <button
        :class="
          isApplicationVisibile === true
            ? 'delete-application-btn'
            : 'apply-btn'
        "
        @click="applyToJob"
      >
        {{ applicationButtonMessage }}
      </button>
    </div>
  </div>
  <job-application
    v-if="isApplicationVisibile"
    :firm_id="job?.firm_id"
    :job_id="job?.id"
    @application-submitted="handleApplicationSubmitted"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getJobFirmById, isApplicationSent } from "../api/firestore";
import type { JobFirm } from "../models/job";
import JobApplication from "../components/JobApplication.vue";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();
const user = userStore.userInfo || { google_uid: "", name: "", email: "" };
const route = useRoute();
const jobId = route.params.id as string;
const isApplicationVisibile = ref(false);
const isApplicationAlreadySent = ref(false);
const applicationButtonMessage = ref("Apply for this Job");
const applicationDate = ref<Date | null>(null);

const job = ref<JobFirm | null>(null);

const fetchJobDetails = async () => {
  if (jobId) {
    const jobData = await getJobFirmById(jobId);
    if (jobData) {
      job.value = jobData;

      const { application_date, sent } = await isApplicationSent(
        user.google_uid,
        job.value.id
      );

      if (sent) {
        isApplicationAlreadySent.value = true;
        applicationDate.value = application_date;
      } else {
        isApplicationAlreadySent.value = false;
      }
    }
  }
};

const applyToJob = () => {
  isApplicationVisibile.value = !isApplicationVisibile.value;
  applicationButtonMessage.value =
    isApplicationVisibile.value === true
      ? "Delete Application"
      : "Apply for this Job";
};

const timeSince = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count > 0) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};

const handleApplicationSubmitted = () => {
  isApplicationVisibile.value = false;
  isApplicationAlreadySent.value = true;
};

onMounted(async () => {
  await fetchJobDetails();
});
</script>

<style scoped>
.job-details-container {
  width: 60%;
  margin: 20px auto;
  padding: 1.5em;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: Arial, sans-serif;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.job-firm,
.job-position,
.job-description,
.job-experience,
.job-tech-stack {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #555;
}

.job-firm,
.job-position strong,
.job-description strong,
.job-experience strong,
.job-tech-stack strong {
  color: #333;
}

.apply-btn {
  width: 35%;
  display: block;
  margin: 2rem auto;
  padding: 0.75rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: #fff;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.delete-application-btn {
  width: 35%;
  display: block;
  margin: 2rem auto;
  padding: 0.75rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background: #ff0000;
  color: #fff;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.apply-btn:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.applying-state {
  text-align: center;
  font-size: 1.25rem;
  color: #007bff;
  margin-top: 1rem;
}

.success-state {
  text-align: center;
  font-size: 1.25rem;
  color: #28a745;
  margin-top: 1rem;
}

.application-sent-message {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
