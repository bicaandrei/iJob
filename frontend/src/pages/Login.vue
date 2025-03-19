<template>
  <div class="auth-container">
    <h2 class="title">{{ isRegister ? "Create Account" : "Sign In" }}</h2>

    <div class="form-group">
      <input v-model="email" type="email" placeholder="Email" class="input" />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="input"
      />
      <input
        v-if="isRegister"
        v-model="confirmPassword"
        type="password"
        placeholder="Retype Password"
        class="input"
      />

      <span class="error-message-class"> {{ errorMessage }} </span>

      <button
        class="btn primary"
        @click="isRegister ? handleRegister() : handleLoginWithEmail()"
      >
        {{ isRegister ? "Register" : "Login" }}
      </button>
    </div>

    <p class="switch-text">
      {{ isRegister ? "Already have an account?" : "Don't have an account?" }}
      <span class="link" @click="isRegister = !isRegister">
        {{ isRegister ? "Login" : "Create one" }}
      </span>
    </p>

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
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useAuth } from "../api/authentication";
import router from "../router";
import "../assets/styles.css";
import RETURN_TYPES from "../utils/error-codes";

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isRegister = ref(false);
const { register, loginWithEmail, loginWithGoogle } = useAuth();
const errorMessage = ref("");

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    displayError(RETURN_TYPES.PASSWORDS_NOT_MATCH);
    return;
  }

  if (!email.value || !password.value) {
    displayError(RETURN_TYPES.CREDENTIALS_REQUIRED);
    return;
  } else {
    if (password.value.length < 6) {
      displayError(RETURN_TYPES.WEAK_PASSWORD);
      return;
    }

    const return_type: RETURN_TYPES = await register(
      email.value,
      password.value
    );
    if (return_type === RETURN_TYPES.SUCCESS) {
      router.push("/home");
    } else if (return_type === RETURN_TYPES.EMAIL_IN_USE) {
      displayError(RETURN_TYPES.EMAIL_IN_USE);
    } else {
      displayError(RETURN_TYPES.REGISTRATION_FAILED);
    }
  }
};

const handleLoginWithEmail = async () => {
  if (!email.value || !password.value) {
    displayError(RETURN_TYPES.CREDENTIALS_REQUIRED);
  } else {
    const return_type: RETURN_TYPES = await loginWithEmail(
      email.value,
      password.value
    );
    if (return_type === RETURN_TYPES.SUCCESS) {
      router.push("/home");
    } else if (return_type === RETURN_TYPES.INVALID_CREDENTIALS) {
      displayError(RETURN_TYPES.INVALID_CREDENTIALS);
    } else {
      displayError(RETURN_TYPES.LOGIN_FAILED);
    }
  }
};

const handleLoginWithGoogle = async () => {
  const return_type: RETURN_TYPES = await loginWithGoogle();
  if (return_type === RETURN_TYPES.SUCCESS) {
    router.push("/home");
  } else {
    displayError(RETURN_TYPES.GOOGLE_LOGIN_FAILED);
  }
};

const displayError = (error_type: RETURN_TYPES) => {
  switch (error_type) {
    case RETURN_TYPES.INVALID_CREDENTIALS:
      errorMessage.value = "Invalid email or password!";
      break;
    case RETURN_TYPES.EMAIL_IN_USE:
      errorMessage.value = "Email is already in use!";
      break;
    case RETURN_TYPES.WEAK_PASSWORD:
      errorMessage.value = "Password must be at least 6 characters long!";
      break;
    case RETURN_TYPES.REGISTRATION_FAILED:
      errorMessage.value = "Failed to register!";
      break;
    case RETURN_TYPES.LOGIN_FAILED:
      errorMessage.value = "Failed to login!";
      break;
    case RETURN_TYPES.CREDENTIALS_REQUIRED:
      errorMessage.value = "Email and password are required!";
      break;
    case RETURN_TYPES.GOOGLE_LOGIN_FAILED:
      errorMessage.value = "Failed to login with Google!";
      break;
    case RETURN_TYPES.PASSWORDS_NOT_MATCH:
      errorMessage.value = "Passwords do not match!";
      break;
  }

  setTimeout(() => {
    errorMessage.value = "";
  }, 5000);
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
