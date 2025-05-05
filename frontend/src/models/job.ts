enum SkillCategory {
  PROGRAMMING_LANGUAGE,
  CERTIFICATION,
  FRAMEWORK,
  TOOL,
}

interface Job {
  id: string;
  firm_id: string;
  title: string;
  position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  requiredExperience: string;
  description: string;
  location: string;
  is_remote: boolean;
  programming_languages: string[];
  frameworks: string[];
  certifications: string[];
  tools: string[];
  created_at: Date;
}

interface JobForm {
  title: string;
  description: string;
  position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  location: string;
  is_remote: boolean;
  requiredExperience: string;
  programming_languages: string[];
  frameworks: string[];
  certifications: string[];
  tools: string[];
}

interface JobFirm {
  id: string;
  firm_id: string;
  title: string;
  position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  requiredExperience: string;
  description: string;
  location: string;
  is_remote: boolean;
  programming_languages: string[];
  frameworks: string[];
  certifications: string[];
  tools: string[];
  created_at: Date;
  company_name: string;
  email: string;
  firm_profile_pic: string;
  telephone: string;
}

export type { Job, JobForm, JobFirm, SkillCategory };
