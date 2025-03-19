import { ref } from "vue";
import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import RETURN_TYPES from "../utils/error-codes";

const user = ref<User | null>(null);
const isLoggedIn = ref(false);

onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser;
  isLoggedIn.value = currentUser !== null;
});

const register = async (
  email: string,
  password: string
): Promise<RETURN_TYPES> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user.value = userCredential.user;
    return RETURN_TYPES.SUCCESS;
  } catch (error: any) {
    console.error("Registration error:", error);
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
    return RETURN_TYPES.SUCCESS;
  } catch (error: any) {
    console.error("Google login error:", error);
    return RETURN_TYPES.GOOGLE_LOGIN_FAILED;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    user.value = null;
  } catch (error) {
    console.error("Logout error:", error);
  }
};

export function useAuth() {
  return {
    user,
    isLoggedIn,
    register,
    loginWithEmail,
    loginWithGoogle,
    logout,
  };
}
