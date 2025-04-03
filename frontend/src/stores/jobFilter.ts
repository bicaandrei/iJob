import { defineStore } from "pinia";
import type { JobFirm } from "../models/job";

export const useJobFilterStore = defineStore("jobStore", {
  state: () => ({
    jobs: [] as JobFirm[],
  }),
  actions: {
    setJobs(jobs: JobFirm[]) {
      this.jobs = jobs;
    },
  },
});
