import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { storage } from "./firebase";

const uploadFileToStorage = async (
  file: File,
  owner_id: string,
  folder: string
): Promise<string | null> => {
  try {
    const fileRef = storageRef(
      storage,
      `${folder}/${owner_id}_${Date.now()}.pdf`
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
