<template>
  <div class="form-container">
    <h1 class="page-title">Edit Job</h1>
    <form @submit.prevent="updateJob" class="form-grid">
      <div>
        <label class="label">Job Title</label>
        <input v-model="job.title" type="text" class="input" required />
      </div>

      <div>
        <label class="label">Description</label>
        <textarea
          v-model="job.description"
          class="input"
          rows="4"
          required
        ></textarea>
      </div>

      <div>
        <label class="label">Position</label>
        <select v-model="job.position" class="input" required>
          <option disabled value="">Select position</option>
          <option>Junior</option>
          <option>Middle</option>
          <option>Senior</option>
        </select>
      </div>

      <div>
        <label class="label">Required Experience</label>
        <input
          v-model="job.requiredExperience"
          type="text"
          class="input"
          required
        />
      </div>

      <div>
        <label class="label">Tech Stack</label>
        <input
          v-model="techStackInput"
          @keydown.enter.prevent="addTech"
          type="text"
          class="input"
          placeholder="Type and press Enter"
        />
        <div class="tech-tags">
          <span
            v-for="(tech, index) in job.techStack"
            :key="index"
            class="tech-tag"
          >
            {{ tech }}
            <button @click="removeTech(index)" class="remove-tag">×</button>
          </span>
        </div>
      </div>

      <button type="submit" class="submit-btn">Update Job</button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

interface JobForm {
  id: number;
  title: string;
  description: string;
  position: "Junior" | "Middle" | "Senior" | "";
  requiredExperience: string;
  techStack: string[];
}

const router = useRouter();
const route = useRoute();
const techStackInput = ref("");

// Mock: pretend this is coming from your API/backend/store
const mockJobDB: JobForm[] = [
  {
    id: 1,
    title: "Frontend Developer",
    description: "Build UIs...",
    position: "Middle",
    requiredExperience: "3+ years",
    techStack: ["Vue", "TypeScript"],
  },
  {
    id: 2,
    title: "Backend Engineer",
    description: "Work on APIs...",
    position: "Senior",
    requiredExperience: "5+ years",
    techStack: ["Node.js", "Postgres"],
  },
];

const job = ref<JobForm>({
  id: Number(route.params.id),
  title: "",
  description: "",
  position: "",
  requiredExperience: "",
  techStack: [],
});

onMounted(() => {
  const foundJob = mockJobDB.find((j) => j.id === job.value.id);
  if (foundJob) {
    job.value = { ...foundJob };
  } else {
    router.push("/firm"); // Redirect if job not found
  }
});

const addTech = () => {
  if (techStackInput.value.trim()) {
    job.value.techStack.push(techStackInput.value.trim());
    techStackInput.value = "";
  }
};

const removeTech = (index: number) => {
  job.value.techStack.splice(index, 1);
};

const updateJob = () => {
  console.log("Updated job:", job.value);
  router.push("/firm");
};
</script>

<style scoped>
/* Reusing the same styling from AddJobPage */
.form-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.tech-tag {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
}

.remove-tag {
  margin-left: 0.25rem;
  color: #dc2626;
  background: none;
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
}

.submit-btn {
  background: #2563eb;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #1d4ed8;
}
</style>
