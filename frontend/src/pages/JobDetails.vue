<template>
  <div class="job-details-container">
    <!-- Firm Profile Picture -->
    <div class="firm-logo-container">
      <img
        :src="job?.firm_profile_pic || defaultProfilePicture"
        alt="Company Logo"
        class="firm-logo"
      />
    </div>

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
    <div class="tech-stack">
      <h4>Required Skills:</h4>
      <ul>
        <li v-for="skill in getRequiredSkills(job).split(', ')" :key="skill">
          {{ skill }}
        </li>
      </ul>
    </div>

    <p class="job-description">
      <strong>Includes remote work:</strong> {{ job?.is_remote ? "Yes" : "No" }}
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

  <img
    class="bottom-left-illustration"
    :src="dashboardIllustration"
    alt="Dashboard Illustration"
  />
  <img
    class="bottom-right-illustration"
    :src="cvAnalysisIllustration"
    alt="CV Analysis Illustration"
  />

  <job-application
    v-if="isApplicationVisibile"
    :firm_id="job?.firm_id"
    :job_id="job?.id"
    :job_programming_languages="job?.programming_languages"
    :job_certifications="job?.certifications"
    :job_frameworks="job?.frameworks"
    :job_tools="job?.tools"
    :job_experience="job?.requiredExperience"
    :job_title="job?.title"
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
import defaultProfilePicture from "../assets/default_profile_picture.png";
import dashboardIllustration from "../assets/dashboard_info_illustration.png";
import cvAnalysisIllustration from "../assets/cv_analysis_illustration.png";

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
      console.log("Job data:", job.value);

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

const getRequiredSkills = (job: JobFirm | null): string => {
  const skills = [
    ...(job?.programming_languages || []),
    ...(job?.frameworks || []),
    ...(job?.certifications || []),
    ...(job?.tools || []),
  ];
  return skills.length > 0 ? skills.join(", ") : "None";
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
.firm-logo-container {
  text-align: center;
  margin-bottom: 1rem;
}

.firm-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.job-details-container {
  width: 40%;
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
  color: #00c49a;
}

.job-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.job-tech-stack,
.job-firm,
.job-position,
.job-description,
.job-experience,
.job-tech-stack {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #555;
}

.job-tech-stack,
.job-firm,
.job-position strong,
.job-description strong,
.job-experience strong,
.job-tech-stack strong {
  color: #333;
}

.apply-btn {
  width: 220px;
  display: block;
  margin: 2rem auto;
  padding: 0.75rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background: #00c49a;
  color: #fff;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.delete-application-btn {
  width: 220px;
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

.delete-application-btn:hover {
  background: #cc0000;
  transform: scale(1.05);
}

.apply-btn:hover {
  background: #00a880;
  transform: scale(1.05);
}

.tech-stack {
  margin-top: 1rem;
}

.tech-stack h4 {
  font-size: 1.2rem;
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

.bottom-left-illustration,
.bottom-right-illustration {
  position: fixed;
  bottom: -100px;
  width: 30%;
  z-index: -1;
  pointer-events: none;
  transform: rotate(-45deg); /* angle */
}

.bottom-right-illustration {
  right: -100px;
}

.bottom-left-illustration {
  left: -100px;
  transform: rotate(45deg); /* mirrored angle */
}

@media (max-width: 768px) {
  .bottom-left-illustration,
  .bottom-right-illustration {
    display: none;
  }
}

@media (max-width: 1300px) {
  .job-details-container {
    width: 50%;
  }
}

@media (max-width: 900px) {
  .job-details-container {
    width: 70%;
  }
}
</style>
