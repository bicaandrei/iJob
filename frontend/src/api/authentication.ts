import { ref } from "vue";
import { auth, db, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  deleteUser,
  type User,
} from "firebase/auth";
import { RETURN_TYPES } from "../utils/error-codes";
import { doc, setDoc } from "firebase/firestore";
import { firestoreCollectionsConfig } from "./firestore";
import { setLoggedInFlag, deleteLoggedInFlag } from "./local-storage";

const user = ref<User | null>(null);

onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser;
});

const register_user = async (
  username: string,
  email: string,
  telephone: string,
  password: string
): Promise<RETURN_TYPES> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user.value = userCredential.user;

    await setDoc(
      doc(
        db,
        firestoreCollectionsConfig.user_collection,
        userCredential.user.uid
      ),
      {
        google_uid: userCredential.user.uid,
        email: userCredential.user.email || "",
        telephone: telephone,
        name: username,
        profile_pic: userCredential.user.photoURL || "",
        is_firm: false,
        created_at: new Date(),
      }
    );

    setLoggedInFlag();
    return RETURN_TYPES.SUCCESS;
  } catch (error: any) {
    console.error("Registration error:", error);
    if (user.value) {
      try {
        await deleteUser(user.value);
      } catch (deleteError) {
        console.error("User deletion error:", deleteError);
      }
    }

    if (error.code === "auth/email-already-in-use") {
      return RETURN_TYPES.EMAIL_IN_USE;
    } else {
      return RETURN_TYPES.REGISTRATION_FAILED;
    }
  }
};

const register_firm = async (
  company_name: string,
  representative_name: string,
  email: string,
  cui: string,
  telephone: string,
  password: string
): Promise<RETURN_TYPES> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user.value = userCredential.user;

    await setDoc(
      doc(
        db,
        firestoreCollectionsConfig.firm_collection,
        userCredential.user.uid
      ),
      {
        google_uid: userCredential.user.uid,
        email: userCredential.user.email || "",
        company_name: company_name,
        representative_name: representative_name,
        cui: cui,
        telephone: telephone,
        profile_pic: userCredential.user.photoURL || "",
        is_firm: true,
        created_at: new Date(),
      }
    );

    setLoggedInFlag();
    return RETURN_TYPES.SUCCESS;
  } catch (error: any) {
    console.error("Registration error:", error);
    if (user.value) {
      try {
        await deleteUser(user.value);
      } catch (deleteError) {
        console.error("User deletion error:", deleteError);
      }
    }

    if (error.code === "auth/email-already-in-use") {
      return RETURN_TYPES.EMAIL_IN_USE;
    } else {
      return RETURN_TYPES.REGISTRATION_FAILED;
    }
  }
};

const loginWithEmail = async (
  email: string,
  password: string
): Promise<RETURN_TYPES> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    user.value = userCredential.user;

    setLoggedInFlag();
    return RETURN_TYPES.SUCCESS;
  } catch (error: any) {
    console.error("Email login error:", error);
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/invalid-email"
    ) {
      return RETURN_TYPES.INVALID_CREDENTIALS;
    }
    return RETURN_TYPES.LOGIN_FAILED;
  }
};

const loginWithGoogle = async (): Promise<RETURN_TYPES> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    user.value = result.user;

    setLoggedInFlag();
    return RETURN_TYPES.SUCCESS;
  } catch (error: any) {
    console.error("Google login error:", error);
    return RETURN_TYPES.GOOGLE_LOGIN_FAILED;
  }
};

const logout = async () => {
  try {
    await signOut(auth);

    deleteLoggedInFlag();
    user.value = null;
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export function useAuth() {
  return {
    user,
    register_user,
    register_firm,
    loginWithEmail,
    loginWithGoogle,
    logout,
  };
}
