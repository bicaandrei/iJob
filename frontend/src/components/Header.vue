<template>
  <header class="header">
    <h1 class="title">iJob</h1>
    <button @click="signIn" class="sign-in-btn">Sign In</button>
  </header>
</template>

<script setup>
const signIn = () => {
  console.log("Sign In clicked");
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #007bff;
  color: white;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-left: 5%;
}

.sign-in-btn {
  padding: 8px 16px;
  font-size: 16px;
  background-color: white;
  color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.sign-in-btn:hover {
  background-color: #e0e0e0;
}
</style>
