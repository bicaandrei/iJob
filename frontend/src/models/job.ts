interface Job {
  id: string;
  firm_id: string;
  title: string;
  position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  requiredExperience: string;
  description: string;
  techStack: string[];
  created_at: Date;
}

interface JobForm {
  title: string;
  description: string;
  position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  requiredExperience: string;
  techStack: string[];
}

interface JobFirm {
  id: string;
  firm_id: string;
  title: string;
  position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  requiredExperience: string;
  description: string;
  techStack: string[];
  created_at: Date;
  company_name: string;
  email: string;
  firm_profile_pic: string;
  telephone: string;
}

export type { Job, JobForm, JobFirm };
