interface JobApplicationForm {
  applicant_id: string | undefined;
  firm_id: string | undefined;
  job_id: string | undefined;
  name: string;
  email: string;
  telephone: string;
  experience: number;
  suitability: string;
  cv: File | string | null;
  applicant_profile_pic: string | null;
  analysis_score: number | null;
}

interface JobApplication {
  id: string;
  applicant_id: string | undefined;
  firm_id: string | undefined;
  job_id: string | undefined;
  name: string;
  email: string;
  telephone: string;
  experience: number;
  suitability: string;
  cv: string | null;
  created_at: Date;
  status: "Sent" | "Seen";
  applicant_profile_pic: string | null;
  analysis_score: number | null;
}

interface UserJobApplication {
  id: string;
  job_title: string;
  job_position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  firm_name: string;
  created_at: Date;
  status?: "Sent" | "Seen";
}

export type { JobApplicationForm, JobApplication, UserJobApplication };
