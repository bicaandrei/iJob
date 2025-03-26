<template>
  <div class="account-page">
    <div class="header">
      <h1>{{ title }}</h1>
    </div>
    <div class="form-container">
      <form class="user-form">
        <div
          v-if="!userStore.isFirm"
          v-for="(value, user_key) in userFields"
          :user_key="user_key"
          class="form-field"
        >
          <label :for="user_key">{{ formatLabel(user_key) }}</label>
          <input
            :id="user_key"
            v-model="userFields[user_key]"
            :disabled="true"
            type="text"
          />
        </div>
        <div
          v-else
          v-if="userStore.isFirm"
          v-for="(value, firm_key) in firmFields"
          :key="firm_key"
          class="form-field"
        >
          <label :for="firm_key">{{ formatLabel(firm_key) }}</label>
          <input
            :id="firm_key"
            v-model="firmFields[firm_key]"
            :disabled="true"
            type="text"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();
const user = userStore.userInfo;

const title = computed(() =>
  userStore.isFirm ? "Firm Account" : "My Account"
);

const firmFields = reactive({
  company_name: user.company_name || "",
  representative_name: user.representative_name || "",
  email: user.email || "",
  cui: user.cui || "",
  telephone: user.telephone || "",
  profile_pic: user.profile_pic || "",
});

const userFields = reactive({
  name: user.name || "",
  email: user.email || "",
  profile_pic: user.profile_pic || "",
});

const formatLabel = (key) => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};
</script>

<style scoped>
.account-page {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 40px;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
}

.form-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.user-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 600px;
  width: 100%;
}

.form-field {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
}
</style>
