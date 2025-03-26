interface Job {
  id: string;
  firm_id: string;
  title: string;
  position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  description: string;
  techStack: string[];
}

interface JobForm {
  title: string;
  description: string;
  position: "Intern" | "Junior" | "Middle" | "Senior" | "";
  requiredExperience: string;
  techStack: string[]; // Each tech has a name and editable state
}

export type { Job, JobForm };
