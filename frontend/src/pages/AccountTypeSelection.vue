<template>
  <div class="account-selection-container">
    <div class="account-type user-account">
      <h2 class="title">Create a User Account</h2>
      <p class="description">
        A user account is perfect for individuals looking for job opportunities.
        You can browse job listings, apply for positions, and manage your
        profile.
      </p>
      <ul>
        <li class="perk">Browse job listings</li>
        <li class="perk">Apply for positions</li>
        <li class="perk">Manage your profile</li>
      </ul>
      <button class="btn primary" @click="redirectToUserSignup">
        Create User Account
      </button>
    </div>

    <div class="account-type firm-account">
      <h2 class="title">Create a Firm Account</h2>
      <p class="description">
        A firm account is designed for companies looking to post job openings
        and find the best candidates for their positions, as well as getting
        relevant analytics.
      </p>
      <ul>
        <li class="perk">Post job openings</li>
        <li class="perk">Find best candidates</li>
        <li class="perk">Manage firm account</li>
      </ul>
      <button class="btn primary" @click="redirectToFirmSignup">
        Create Firm Account
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from "../router";

const redirectToUserSignup = () => {
  router.push({ name: "register-user-route" });
};

const redirectToFirmSignup = () => {
  router.push({ name: "register-firm-route" });
};
</script>

<style scoped>
.account-selection-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 80px auto;
  gap: 2rem;
  font-family: Arial, sans-serif;
}

.account-type {
  height: 20%;
  flex: 1;
  padding: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.description {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.perk {
  font-size: 1rem;
  color: #555;
  margin-left: 0px;
  margin-right: 0px;
}

.btn {
  padding: 0.75rem 1.5rem;
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

@media (max-width: 768px) {
  .account-selection-container {
    flex-direction: column; /* Stack the blocks vertically */
    align-items: flex-start; /* Align the items to the left */
  }

  .account-type {
    width: 60%;
    margin: 0 auto;
  }
}
</style>
