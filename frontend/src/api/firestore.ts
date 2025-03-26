import {
  getDoc,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Job, JobForm } from "../models/job";
import { RETURN_TYPES } from "../utils/error-codes";

const firestoreCollectionsConfig = {
  user_collection: import.meta.env.VITE_FIRESTORE_USER_COLLECTION,
  firm_collection: import.meta.env.VITE_FIRESTORE_FIRM_COLLECTION,
  job_ads_collection: import.meta.env.VITE_FIRESTORE_ADS_COLLECTION,
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

const setJobAdDocument = async (
  job_form: JobForm,
  firm_id: string
): Promise<RETURN_TYPES> => {
  try {
    const job: Job = {
      id: generateUniqueJobId(),
      firm_id: firm_id,
      ...job_form,
    };

    const techStack = [...job.techStack];
    if (techStack.length === 0) {
      techStack.push("Any");
    }

    const jobRef = doc(
      db,
      firestoreCollectionsConfig.job_ads_collection,
      job.id
    );

    await setDoc(jobRef, { ...job, techStack });

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

export {
  firestoreCollectionsConfig,
  getDocumentByUID,
  setUserDocument,
  setJobAdDocument,
  getJobsOfFirm,
};
