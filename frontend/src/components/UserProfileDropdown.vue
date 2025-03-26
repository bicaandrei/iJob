<template>
  <div>
    <img
      :src="profilePicture"
      alt="User Profile"
      class="profile-picture"
      @click="toggleDropdown"
      referrerpolicy="no-referrer"
    />
    <div v-if="dropdownVisible" class="dropdown-menu">
      <div class="profile-info">
        <img
          :src="profilePicture"
          alt="User Profile"
          class="profile-picture-large"
        />
        <div class="profile-details">
          <p class="profile-name">{{ accountName }}</p>
          <p class="profile-email">
            {{ accountEmail }}
          </p>
        </div>
      </div>

      <div class="dropdown-options">
        <button @click="goToProfile" class="dropdown-item">
          {{ accountOption }}
        </button>
        <button v-if="firmAdsOption" class="dropdown-item">
          {{ firmAdsOption }}
        </button>
        <button @click="signOut" class="dropdown-item">Log Out</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "../router";
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useAuth } from "../api/authentication";
import { useRoute } from "vue-router";
import defaultProfilePicture from "../assets/default_profile_picture.png";
import { useUserStore } from "../stores/user";
import { useFavicon } from "@vueuse/core";
import { auth } from "../api/firebase";

const { user, logout } = useAuth();
const dropdownVisible = ref(false);
const route = useRoute();
const userStore = useUserStore();
const storeUser = computed(() => userStore.userInfo || {});

const accountName = computed(() => {
  if (userStore.isFirm) {
    return storeUser.value.representative_name || "Anonymous";
  } else {
    return storeUser.value.name || "Anonymous";
  }
});

const accountEmail = computed(() => {
  return storeUser.value.email || "No email available";
});

const profilePicture = computed(() => {
  // const photoURL = user.value.photoURL;
  // return photoURL && photoURL.startsWith("http")
  //   ? photoURL
  //   : defaultProfilePicture;
  return defaultProfilePicture;
});

const accountOption = computed(() => {
  return userStore.isFirm ? "My Firm" : "My Account";
});

const firmAdsOption = computed(() => {
  return userStore.isFirm ? "Firm ads" : false;
});

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
  console.log(user.value.photoURL);
};

const closeDropdown = () => {
  dropdownVisible.value = false;
};

const handleClickOutside = (event) => {
  const dropdown = document.querySelector(".dropdown-menu");
  const profilePic = document.querySelector(".profile-picture");
  if (
    dropdown &&
    !dropdown.contains(event.target) &&
    !profilePic.contains(event.target)
  ) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

const signOut = async () => {
  try {
    closeDropdown();
    logout();
    userStore.clearUser();
    router.push("/");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

const goToProfile = () => {
  closeDropdown();
  router.push({ name: "client-account-route" });
};
</script>

<style scoped>
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
