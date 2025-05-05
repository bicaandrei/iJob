import { useAuth } from "./authentication";

export const analyzeCV = async (
  file: File,
  jobSkills: object,
  job_experience: string,
  job_title: string
): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_requirements", JSON.stringify(jobSkills));
  formData.append("job_required_experience", job_experience);
  formData.append("job_title", job_title);

  try {
    const { user } = useAuth();
    const currentUser = user.value;
    if (!currentUser) {
      throw new Error("User is not authenticated");
    }

    const idToken = await currentUser.getIdToken(true);

    const response = await fetch(
      `${import.meta.env.VITE_FLASK_API_URL}/upload_cv`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to analyze CV");
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing CV:", error);
    throw error;
  }
};
