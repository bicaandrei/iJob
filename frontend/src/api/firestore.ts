import {
  getDoc,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
  startAfter,
  limit,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Job, JobFirm, JobForm } from "../models/job";
import { RETURN_TYPES } from "../utils/error-codes";
import defaultProfilePicture from "../assets/default_profile_picture.png";
import { uploadFileToStorage } from "./googleStorage";
import type {
  JobApplication,
  JobApplicationForm,
  UserJobApplication,
} from "../models/job-application";

const firestoreCollectionsConfig = {
  user_collection: import.meta.env.VITE_FIRESTORE_USER_COLLECTION,
  firm_collection: import.meta.env.VITE_FIRESTORE_FIRM_COLLECTION,
  job_ads_collection: import.meta.env.VITE_FIRESTORE_ADS_COLLECTION,
  job_applications_collection: import.meta.env
    .VITE_FIRESTORE_APPLICATIONS_COLLECTION,
};

const getDocumentByUID = async (uid: string) => {
  try {
    const getDocByRef = async (collection: string) => {
      const ref = doc(db, collection, uid);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    };

    const userDoc = await getDocByRef(
      firestoreCollectionsConfig.user_collection
    );
    if (userDoc) {
      return { data: userDoc, is_firm: false };
    }

    const firmDoc = await getDocByRef(
      firestoreCollectionsConfig.firm_collection
    );
    if (firmDoc) {
      return { data: firmDoc, is_firm: true };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching document for UID "${uid}":`, error);
    return null;
  }
};

const setUserDocument = async (
  uid: string,
  email: string,
  name: string,
  profile_pic: string
) => {
  try {
    await setDoc(doc(db, firestoreCollectionsConfig.user_collection, uid), {
      google_uid: uid || "",
      email: email || "",
      name: name || "Anonymous",
      profile_pic: profile_pic || "",
      is_firm: false,
      created_at: new Date(),
    });
  } catch (error) {
    console.error("Error setting user document:", error);
    throw error;
  }
};

const generateUniqueJobId = (): string => {
  return doc(collection(db, firestoreCollectionsConfig.job_ads_collection)).id;
};

const generateUniqueJobApplicationId = (): string => {
  return doc(
    collection(db, firestoreCollectionsConfig.job_applications_collection)
  ).id;
};

const setJobAdDocument = async (
  job_form: JobForm,
  firm_id: string
): Promise<RETURN_TYPES> => {
  try {
    const job: Job = {
      id: generateUniqueJobId(),
      firm_id: firm_id,
      created_at: new Date(),
      ...job_form,
    };

    const programming_languages = [...job.programming_languages];

    const certifications = [...job.certifications];

    const frameworks = [...job.frameworks];

    const tools = [...job.tools];

    const jobRef = doc(
      db,
      firestoreCollectionsConfig.job_ads_collection,
      job.id
    );

    await setDoc(jobRef, {
      ...job,
      programming_languages,
      certifications,
      frameworks,
      tools,
    });

    return RETURN_TYPES.SUCCESS;
  } catch (error: any) {
    console.error("Error adding job: ", error);
    return RETURN_TYPES.JOB_ADD_FAILED;
  }
};

const getJobsOfFirm = async (firm_id: string): Promise<Job[] | null> => {
  try {
    const jobAdsQuery = query(
      collection(db, firestoreCollectionsConfig.job_ads_collection),
      where("firm_id", "==", firm_id)
    );

    const querySnapshot = await getDocs(jobAdsQuery);
    const jobs: Job[] = querySnapshot.docs.map((doc) => doc.data() as Job);

    return jobs;
  } catch (error: any) {
    console.error("Error fetching firm jobs");
    return null;
  }
};

const deleteJobById = async (job_id: string) => {
  try {
    const jobApplicationsQuery = query(
      collection(db, firestoreCollectionsConfig.job_applications_collection),
      where("job_id", "==", job_id)
    );
    const applicationsSnapshot = await getDocs(jobApplicationsQuery);

    const deleteApplicationsPromises = applicationsSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deleteApplicationsPromises);

    const jobAdsQuery = query(
      collection(db, firestoreCollectionsConfig.job_ads_collection),
      where("id", "==", job_id)
    );
    const querySnapshot = await getDocs(jobAdsQuery);

    const deleteJobPromises = querySnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deleteJobPromises);

    console.log(`Job and associated applications deleted successfully.`);
  } catch (error: any) {
    console.error("Error deleting job and its applications:", error);
    throw error;
  }
};

const getJobById = async (uid: string): Promise<JobForm | null> => {
  try {
    const jobRef = doc(db, firestoreCollectionsConfig.job_ads_collection, uid);
    const jobSnap = await getDoc(jobRef);
    if (jobSnap.exists()) {
      const data = jobSnap.data();
      const jobForm: JobForm = {
        title: data.title || "",
        description: data.description || "",
        position: data.position || "",
        requiredExperience: data.requiredExperience || "",
        location: data.location || "",
        programming_languages: Array.isArray(data.programming_languages)
          ? data.programming_languages
          : [""],
        certifications: Array.isArray(data.certifications)
          ? data.certifications
          : [""],
        frameworks: Array.isArray(data.frameworks) ? data.frameworks : [""],
        tools: Array.isArray(data.tools) ? data.tools : [""],
        is_remote: data.is_remote,
      };
      return jobForm;
    }

    return null;
  } catch (error) {
    console.error("Error fetching job");
    return null;
  }
};

const getJobFirmById = async (id: string): Promise<JobFirm | null> => {
  try {
    const jobRef = doc(db, firestoreCollectionsConfig.job_ads_collection, id);
    const jobSnap = await getDoc(jobRef);
    const job = jobSnap.data() as Job;
    if (jobSnap.exists()) {
      const firmRef = doc(
        db,
        firestoreCollectionsConfig.firm_collection,
        job.firm_id
      );
      const firmSnap = await getDoc(firmRef);
      if (firmSnap.exists()) {
        const firmData = firmSnap.data();
        return {
          ...job,
          company_name: firmData.company_name || "",
          email: firmData.email || "",
          firm_profile_pic: firmData.firm_profile_pic || "",
          telephone: firmData.telephone || "",
        };
      } else {
        return {
          ...job,
          company_name: "",
          email: "",
          firm_profile_pic: "",
          telephone: "",
        };
      }
    }

    return null;
  } catch (error: any) {
    console.error("Error fetching job firm");
    return null;
  }
};

const editJobDocument = async (
  job_id: string,
  updatedJob: JobForm
): Promise<RETURN_TYPES> => {
  try {
    const jobRef = doc(
      db,
      firestoreCollectionsConfig.job_ads_collection,
      job_id
    );

    const programming_languages = [...updatedJob.programming_languages];

    const certifications = [...updatedJob.certifications];

    const frameworks = [...updatedJob.frameworks];

    const tools = [...updatedJob.tools];

    await setDoc(
      jobRef,
      {
        ...updatedJob,
        programming_languages,
        certifications,
        frameworks,
        tools,
      },
      { merge: true }
    );

    return RETURN_TYPES.SUCCESS;
  } catch (error: any) {
    console.error("Error editing job");
    return RETURN_TYPES.JOB_EDIT_FAILED;
  }
};

const getAllJobsWithPagination = async (
  pageSize: number,
  lastVisibleJob: QueryDocumentSnapshot | null = null
): Promise<{ jobs: JobFirm[]; lastVisible: QueryDocumentSnapshot | null }> => {
  try {
    const jobAdsCollection = collection(
      db,
      firestoreCollectionsConfig.job_ads_collection
    );
    let jobsQuery;

    if (lastVisibleJob) {
      jobsQuery = query(
        jobAdsCollection,
        orderBy("created_at", "desc"),
        startAfter(lastVisibleJob),
        limit(pageSize)
      );
    } else {
      jobsQuery = query(
        jobAdsCollection,
        orderBy("created_at", "desc"),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(jobsQuery);
    const jobs: JobFirm[] = await Promise.all(
      querySnapshot.docs.map(async (queryDoc) => {
        const job = queryDoc.data() as Job;

        const firmRef = doc(
          db,
          firestoreCollectionsConfig.firm_collection,
          job.firm_id
        );
        const firmSnap = await getDoc(firmRef);

        if (firmSnap.exists()) {
          const firmData = firmSnap.data();
          return {
            ...job,
            company_name: firmData.company_name || "",
            email: firmData.email || "",
            firm_profile_pic: firmData.profile_pic || defaultProfilePicture,
            telephone: firmData.telephone || "",
          } as JobFirm;
        } else {
          return {
            ...job,
            company_name: "",
            email: "",
            firm_profile_pic: defaultProfilePicture,
            telephone: "",
          } as JobFirm;
        }
      })
    );

    const lastVisible =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { jobs, lastVisible };
  } catch (error: any) {
    console.error("Error fetching jobs with firm details:", error);
    return { jobs: [], lastVisible: null };
  }
};

const setJobApplicationDocument = async (
  job_application_form: JobApplicationForm
): Promise<RETURN_TYPES> => {
  try {
    const application_id = generateUniqueJobApplicationId();
    if (job_application_form.cv) {
      const downloadUrl = await uploadFileToStorage(
        job_application_form.cv,
        application_id,
        import.meta.env.VITE_FIREBASE_STORAGE_JOB_APPLICATIONS_CVS
      );

      const job_application: JobApplication = {
        id: application_id,
        applicant_id: job_application_form.applicant_id,
        firm_id: job_application_form.firm_id,
        job_id: job_application_form.job_id,
        name: job_application_form.name,
        email: job_application_form.email,
        telephone: job_application_form.telephone,
        experience: job_application_form.experience,
        suitability: job_application_form.suitability,
        cv: downloadUrl,
        created_at: new Date(),
        status: "Sent",
        applicant_profile_pic: job_application_form.applicant_profile_pic || "",
        analysis_score: job_application_form.analysis_score || null,
      };

      const jobApplicationRef = doc(
        db,
        firestoreCollectionsConfig.job_applications_collection,
        job_application.id
      );

      await setDoc(jobApplicationRef, job_application);

      return RETURN_TYPES.SUCCESS;
    } else {
      return RETURN_TYPES.APPLICATION_CV_REQUIRED;
    }
  } catch (error: any) {
    console.error("Error saving job application");
    return RETURN_TYPES.JOB_APPLICATION_FAILED;
  }
};

const setJobApplicationStatusToSeen = async (application_id: string) => {
  try {
    const applicationRef = doc(
      db,
      firestoreCollectionsConfig.job_applications_collection,
      application_id
    );
    const applicationSnap = await getDoc(applicationRef);
    if (applicationSnap.exists()) {
      const applicationData = applicationSnap.data();
      if (applicationData) {
        await setDoc(
          applicationRef,
          {
            ...applicationData,
            status: "Seen",
          },
          { merge: true }
        );
      }
    } else {
      console.error("Application not found");
    }
  } catch (error: any) {
    console.error("Error updating application status:", error);
  }
};

const isApplicationSent = async (
  user_id: string,
  job_id: string
): Promise<{ application_date: Date; sent: boolean }> => {
  try {
    const applicationRef = collection(
      db,
      firestoreCollectionsConfig.job_applications_collection
    );
    const applicationQuery = query(
      applicationRef,
      where("applicant_id", "==", user_id),
      where("job_id", "==", job_id)
    );

    const applicationSnap = await getDocs(applicationQuery);
    if (!applicationSnap.empty) {
      const application = applicationSnap.docs[0].data();
      return { application_date: application.created_at.toDate(), sent: true };
    } else {
      return { application_date: new Date(), sent: false };
    }
  } catch (error: any) {
    console.error("Check for application failed: ", error);
    return { application_date: new Date(), sent: false };
  }
};

const getUserJobApplicationsById = async (
  user_id: string,
  pageSize: number,
  lastVisibleApplication: QueryDocumentSnapshot | null = null
): Promise<{
  applications: UserJobApplication[];
  lastVisible: QueryDocumentSnapshot | null;
}> => {
  try {
    const applicationsCollection = collection(
      db,
      firestoreCollectionsConfig.job_applications_collection
    );

    let applicationsQuery;

    if (lastVisibleApplication) {
      applicationsQuery = query(
        applicationsCollection,
        where("applicant_id", "==", user_id),
        orderBy("created_at", "desc"),
        startAfter(lastVisibleApplication),
        limit(pageSize)
      );
    } else {
      applicationsQuery = query(
        applicationsCollection,
        where("applicant_id", "==", user_id),
        orderBy("created_at", "desc"),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(applicationsQuery);

    const applications: UserJobApplication[] = await Promise.all(
      querySnapshot.docs.map(async (queryDoc) => {
        const data = queryDoc.data();

        const jobRef = doc(
          db,
          firestoreCollectionsConfig.job_ads_collection,
          data.job_id
        );
        const jobSnap = await getDoc(jobRef);
        const jobTitle = jobSnap.exists()
          ? jobSnap.data().title
          : "Unknown Job";

        const firmRef = doc(
          db,
          firestoreCollectionsConfig.firm_collection,
          data.firm_id
        );
        const firmSnap = await getDoc(firmRef);
        const firmName = firmSnap.exists()
          ? firmSnap.data().company_name
          : "Unknown Firm";

        return {
          id: queryDoc.id,
          job_title: jobTitle,
          firm_name: firmName,
          created_at: data.created_at.toDate(),
          status: data.status,
        } as UserJobApplication;
      })
    );

    const lastVisible =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { applications, lastVisible };
  } catch (error: any) {
    console.error("Error fetching user job applications:", error);
    return { applications: [], lastVisible: null };
  }
};

const getJobApplicationsByJobId = async (
  job_id: string
): Promise<JobApplication[] | null> => {
  try {
    const applicationsRef = collection(
      db,
      firestoreCollectionsConfig.job_applications_collection
    );
    const applicationsQuery = query(
      applicationsRef,
      where("job_id", "==", job_id),
      orderBy("created_at", "desc")
    );
    const querySnapshot = await getDocs(applicationsQuery);
    const applications: JobApplication[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as JobApplication[];
    return applications;
  } catch (error: any) {
    console.error("Error fetching job applications:", error);
    return null;
  }
};

const editUserDocument = async (
  uid: string,
  email: string,
  telephone: string,
  name: string,
  profile_pic: File | null
): Promise<RETURN_TYPES> => {
  try {
    if (profile_pic) {
      const profilePicUrl = await uploadFileToStorage(
        profile_pic,
        uid,
        import.meta.env.VITE_FIREBASE_STORAGE_PROFILE_PICTURES
      );

      await setDoc(
        doc(db, firestoreCollectionsConfig.user_collection, uid),
        {
          email: email || "",
          telephone: telephone || "",
          name: name || "Anonymous",
          profile_pic: profilePicUrl || "",
        },
        { merge: true }
      );
    } else {
      await setDoc(
        doc(db, firestoreCollectionsConfig.user_collection, uid),
        {
          email: email || "",
          telephone: telephone || "",
          name: name || "Anonymous",
        },
        {
          merge: true,
        }
      );
    }
    return RETURN_TYPES.SUCCESS;
  } catch (error) {
    console.error("Error updating user document:", error);
    return RETURN_TYPES.USER_UPDATE_FAILED;
  }
};

const editFirmAccount = async (
  uid: string,
  company_name: string,
  representative_name: string,
  cui: string,
  telephone: string,
  profile_pic: File | null
): Promise<RETURN_TYPES> => {
  try {
    if (profile_pic) {
      const profilePicUrl = await uploadFileToStorage(
        profile_pic,
        uid,
        import.meta.env.VITE_FIREBASE_STORAGE_PROFILE_PICTURES
      );

      await setDoc(
        doc(db, firestoreCollectionsConfig.firm_collection, uid),
        {
          company_name,
          representative_name,
          cui,
          telephone,
          profile_pic: profilePicUrl || "",
        },
        { merge: true }
      );
    } else {
      await setDoc(
        doc(db, firestoreCollectionsConfig.firm_collection, uid),
        {
          company_name,
          representative_name,
          cui,
          telephone,
        },
        { merge: true }
      );
    }

    return RETURN_TYPES.SUCCESS;
  } catch (error) {
    console.error("Error updating firm account:", error);
    return RETURN_TYPES.USER_UPDATE_FAILED;
  }
};

const searchSkills = async (
  searchTerm: string,
  category: string
): Promise<string[]> => {
  const skillsRef = collection(db, "skills");

  const q = query(
    skillsRef,
    where("category", "==", category),
    where("name", ">=", searchTerm),
    where("name", "<=", searchTerm + "\uf8ff")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data().name);
};

export {
  firestoreCollectionsConfig,
  getDocumentByUID,
  setUserDocument,
  setJobAdDocument,
  getJobsOfFirm,
  deleteJobById,
  getJobById,
  editJobDocument,
  getAllJobsWithPagination,
  getJobFirmById,
  setJobApplicationDocument,
  isApplicationSent,
  getUserJobApplicationsById,
  getJobApplicationsByJobId,
  setJobApplicationStatusToSeen,
  editUserDocument,
  editFirmAccount,
  searchSkills,
};
