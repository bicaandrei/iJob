<template>
  <header class="header">
    <button class="title" @click="onTitleClick">iJob</button>
    <button v-if="showLoginButton" @click="signIn" class="sign-in-btn">
      Log In
    </button>
    <user-profile-dropdown class="profile-container" v-if="showLogoutButton" />
  </header>
</template>

<script setup>
import router from "../router";
import { computed, ref, onMounted } from "vue";
import { useAuth } from "../api/authentication";
import { useRoute } from "vue-router";
import defaultProfilePicture from "../assets/default_profile_picture.png";
import UserProfileDropdown from "./UserProfileDropdown.vue";
import { useUserStore } from "../stores/user";

const { user, logout } = useAuth();
const dropdownVisible = ref(false);
const route = useRoute();
const userStore = useUserStore();

const showLoginButton = computed(() => {
  return route.path === "/";
});

const showLogoutButton = computed(() => {
  const isHome = route.name === "home-route";
  const isClientOrChild = route.matched.some((r) => r.name === "client-route");

  return isHome || isClientOrChild;
});

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const signIn = () => {
  router.push({ name: "login-route" });
};

const onTitleClick = () => {
  if (userStore.isAuthenticated) {
    router.push({ name: "home-route" });
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
  background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
  color: white;
  border-bottom: 1px solid #333;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-left: 2%;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
}

.sign-in-btn {
  padding: 8px 16px;
  font-size: 16px;
  margin-right: 2%;
  background-color: #ffffff11;
  color: white;
  border: 1px solid #888;
  border-radius: 5px;
  cursor: pointer;
}

.sign-in-btn:hover {
  background-color: #ffffff22;
}

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

.sign-out-btn:hover {
  background-color: #e0e0e0;
}

.profile-container {
  position: relative;
  margin-right: 2%;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 250px;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.profile-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.profile-picture-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid #007bff;
}

.profile-details {
  display: flex;
  flex-direction: column;
}

.profile-name {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.profile-email {
  font-size: 14px;
  margin: 0;
  color: #666;
}

.dropdown-options {
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  padding: 10px 15px;
  font-size: 14px;
  color: #333;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}
</style>
