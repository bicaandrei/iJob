<template>
  <header class="header">
    <button class="title" @click="onTitleClick">iJob</button>
    <button v-if="showLoginButton" @click="signIn" class="sign-in-btn">
      Log In
    </button>
    <button v-else-if="isLoggedIn" @click="signOut" class="sign-out-btn">
      Log Out
    </button>
  </header>
</template>

<script setup>
import router from "../router";
import { computed, onMounted, ref, watch } from "vue";
import { useAuth } from "../api/authentication";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { useRoute } from "vue-router";

const { isLoggedIn, logout } = useAuth();
const route = useRoute();

const showLoginButton = computed(() => {
  return !isLoggedIn.value && route.path !== "/signin";
});

const signIn = () => {
  console.log("Sign In clicked");
  router.push("/signin");
};

const signOut = async () => {
  try {
    logout();
    router.push("/");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

const onTitleClick = () => {
  if (isLoggedIn.value === true) {
    router.push("/home");
  } else {
    router.push("/");
  }
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #007bff;
  color: white;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-left: 2%;
  background-color: #007bff;
  border: none;
}

.sign-in-btn,
.sign-out-btn {
  padding: 8px 16px;
  font-size: 16px;
  margin-right: 2%;
  background-color: white;
  color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.sign-in-btn:hover,
.sign-out-btn:hover {
  background-color: #e0e0e0;
}
</style>
