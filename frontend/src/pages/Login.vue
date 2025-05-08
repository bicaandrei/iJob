<template>
  <Snackbar ref="snackbarRef" />
  <div class="auth-container">
    <h2 class="title">Log in</h2>

    <div class="form-group">
      <input v-model="email" type="email" placeholder="Email" class="input" />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="input"
      />

      <button class="btn primary" @click="handleLoginWithEmail">Login</button>
    </div>

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
import { RETURN_TYPES, getErrorType } from "../utils/error-codes";
import Snackbar from "../components/Snackbar.vue";

const email = ref("");
const password = ref("");
const { loginWithEmail, loginWithGoogle } = useAuth();
const snackbarRef = ref<InstanceType<typeof Snackbar> | null>(null);

const handleLoginWithEmail = async () => {
  if (!email.value || !password.value) {
    displayError(RETURN_TYPES.CREDENTIALS_REQUIRED);
  } else {
    const return_type: RETURN_TYPES = await loginWithEmail(
      email.value,
      password.value
    );
    if (return_type === RETURN_TYPES.SUCCESS) {
      snackbarRef.value?.showSnackbar("Login was successful!", "success");

      setTimeout(() => {
        router.push({ name: "home-route" });
      }, 2000);
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
    snackbarRef.value?.showSnackbar("Login was successful!", "success");

    setTimeout(() => {
      router.push({ name: "home-route" });
    }, 2000);
  } else {
    displayError(RETURN_TYPES.GOOGLE_LOGIN_FAILED);
  }
};

const displayError = (error_type: RETURN_TYPES) => {
  snackbarRef.value?.showSnackbar(getErrorType(error_type), "error");
};
</script>

<style scoped>
.auth-container {
  max-width: 300px;
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
  border-color: #00a880;
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
  background: #00c49a;
  color: #fff;
}
.primary:hover {
  background: #00a880;
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
  color: #00a880;
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
