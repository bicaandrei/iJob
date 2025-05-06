<template>
  <Snackbar ref="snackbarRef" />
  <div class="auth-container">
    <h2 class="title">Register User Account</h2>

    <div class="form-group">
      <input v-model="username" type="text" placeholder="Name" class="input" />
      <input v-model="email" type="email" placeholder="Email" class="input" />
      <input
        v-model="telephone"
        type="tel"
        placeholder="Telephone"
        class="input"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="input"
      />
      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Retype Password"
        class="input"
      />

      <button class="btn primary" @click="handleRegister">Register</button>

      <div class="divider">or</div>
      <button class="btn google" @click="handleLoginWithGoogle">
        <img
          src="https://www.svgrepo.com/show/355037/google.svg"
          alt="Google"
          class="google-icon"
        />
        Continue with Google
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useAuth } from "../api/authentication";
import router from "../router";
import "../assets/styles.css";
import { RETURN_TYPES, getErrorType } from "../utils/error-codes";
import {
  validateEmail,
  validateName,
  validateTelephone,
} from "../utils/validation-rules";
import { setUserDocument } from "../api/firestore";
import Snackbar from "../components/Snackbar.vue";

const username = ref("");
const email = ref("");
const telephone = ref("");
const password = ref("");
const confirmPassword = ref("");
const { user, register_user, loginWithGoogle } = useAuth();
const snackbarRef = ref<InstanceType<typeof Snackbar> | null>(null);

const handleRegister = async () => {
  if (validateUserForm()) {
    const return_type: RETURN_TYPES = await register_user(
      username.value,
      email.value,
      telephone.value,
      password.value
    );
    if (return_type === RETURN_TYPES.SUCCESS) {
      snackbarRef.value?.showSnackbar(
        "Account created successfully!",
        "success"
      );
      setTimeout(() => {
        router.push({ name: "home-route" });
      }, 2000);
    } else if (return_type === RETURN_TYPES.EMAIL_IN_USE) {
      displayError(RETURN_TYPES.EMAIL_IN_USE);
    } else {
      displayError(RETURN_TYPES.REGISTRATION_FAILED);
    }
  }
};

const handleLoginWithGoogle = async () => {
  const return_type: RETURN_TYPES = await loginWithGoogle();
  if (return_type === RETURN_TYPES.SUCCESS) {
    await setUserDocument(
      user.value?.uid || "",
      user.value?.email || "",
      user.value?.displayName || "Anonymous",
      user.value?.photoURL || ""
    );

    router.push({ name: "home-route" });
  } else {
    displayError(RETURN_TYPES.GOOGLE_LOGIN_FAILED);
  }
};

const validateUserForm = (): Boolean => {
  if (
    !username.value ||
    !email.value ||
    !telephone.value ||
    !password.value ||
    !confirmPassword.value
  ) {
    displayError(RETURN_TYPES.CREDENTIALS_REQUIRED);
    return false;
  }

  if (validateName(username.value) === false) {
    displayError(RETURN_TYPES.INVALID_USER_NAME_FORMAT);
    return false;
  }

  if (validateEmail(email.value) === false) {
    displayError(RETURN_TYPES.INVALID_EMAIL_FORMAT);
    return false;
  }

  if (validateTelephone(telephone.value) === false) {
    displayError(RETURN_TYPES.INVALID_TELEPHONE_FORMAT);
    return false;
  }

  if (password.value !== confirmPassword.value) {
    displayError(RETURN_TYPES.PASSWORDS_NOT_MATCH);
    return false;
  }

  if (password.value.length < 6) {
    displayError(RETURN_TYPES.WEAK_PASSWORD);
    return false;
  }

  return true;
};

const displayError = (error_type: RETURN_TYPES) => {
  snackbarRef.value?.showSnackbar(getErrorType(error_type), "error");
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 80px auto;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: Arial, sans-serif;
}
.title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
}
.input:focus {
  border-color: #007bff;
  outline: none;
}
.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}
.primary {
  background: #007bff;
  color: #fff;
}
.primary:hover {
  background: #0056b3;
}
.google {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #333;
  border: 1px solid #ccc;
}
.google:hover {
  background: #f5f5f5;
}
.google-icon {
  width: 20px;
  margin-right: 8px;
}
.switch-text {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
}
.link {
  color: #007bff;
  cursor: pointer;
  margin-left: 4px;
}
.link:hover {
  text-decoration: underline;
}
.divider {
  text-align: center;
  color: #999;
  margin: 0.5rem 0;
}
.welcome-box {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 8px;
  text-align: center;
}
.logout {
  background: #dc3545;
  color: #fff;
  margin-top: 0.5rem;
}
.logout:hover {
  background: #b02a37;
}
</style>
