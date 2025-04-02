import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { storage } from "./firebase";

const uploadFileToStorage = async (
  file: File,
  application_id: string
): Promise<string | null> => {
  try {
    const fileRef = storageRef(
      storage,
      `job_applications/${application_id}_${Date.now()}.pdf`
    );
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);
    return downloadUrl;
  } catch (error: any) {
    console.error("Error uploading file to Firebase Storage", error);
    return null;
  }
};

export { uploadFileToStorage };
