interface JobApplicationForm {
  applicant_id: string | undefined;
  firm_id: string | undefined;
  job_id: string | undefined;
  name: string;
  email: string;
  experience: number;
  suitability: string;
  cv: File | null;
}

interface JobApplication {
  id: string;
  applicant_id: string | undefined;
  firm_id: string | undefined;
  job_id: string | undefined;
  name: string;
  email: string;
  experience: number;
  suitability: string;
  cv: string | null;
  created_at: Date;
}

interface UserJobApplication {
  id: string;
  job_title: string;
  firm_name: string;
  created_at: Date;
  status?: "Sent" | "Seen";
}

export type { JobApplicationForm, JobApplication, UserJobApplication };
