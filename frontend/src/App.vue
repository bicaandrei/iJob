<template>
  <Header />
  <router-view />
</template>

<script setup>
import Header from "./components/Header.vue";
import { onMounted } from "vue";
import { useUserStore } from "./stores/user";
import { onAuthStateChanged } from "firebase/auth";
import { getDocumentByUID } from "./api/firestore";
import { auth } from "./api/firebase";
import { useJobStore } from "./stores/job";

const userStore = useUserStore();
const jobStore = useJobStore();

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      const doc = await getDocumentByUID(currentUser.uid);
      if (doc !== null) {
        userStore.setUser(doc.data, doc.is_firm);
      } else {
        userStore.clearUser();
      }
    } else {
      jobStore.clearJobs();
      userStore.clearUser();
    }
  });
});
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}
</style>
