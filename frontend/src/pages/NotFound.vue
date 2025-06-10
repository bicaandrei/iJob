<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
    <router-link :to="redirectURL">Go back to Home</router-link>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/user';
import { onMounted, ref } from 'vue';

const redirectURL = ref("/");
const userStore = useUserStore();

onMounted(() => {
  if (userStore.isAuthenticated) {
    redirectURL.value = "/client/home";
  } else {
    redirectURL.value = "/";
  }
});
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  height: 100vh;
  text-align: center;
}
.not-found h1 {
  font-size: 4rem;
  color: #00c49a;
  margin-bottom: 0.5rem;
}
.not-found h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}
.not-found p {
  margin-bottom: 1.5rem;
  color: #555;
}
.not-found a {
  color: #00c49a;
  text-decoration: underline;
  font-weight: bold;
}
</style>