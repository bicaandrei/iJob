import { defineStore } from "pinia";
import { getJobsOfFirm } from "../api/firestore"; // Assuming this function fetches jobs from Firestore
import type { Job } from "../models/job";

export const useJobStore = defineStore("job", {
  state: () => ({
    jobs: [] as Job[],
  }),
  actions: {
    async loadJobs(firm_id: string) {
      const fetchedJobs = await getJobsOfFirm(firm_id);
      this.jobs = fetchedJobs || [];
    },
    async addJob(firm_id: string) {
      await this.loadJobs(firm_id);
    },
    clearJobs() {
      this.jobs = [];
    },
  },
  persist: true,
});
