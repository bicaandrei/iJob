<template>
  <firm-home v-if="isFirm" />
  <user-home v-else />
</template>

<script setup>
import { useUserStore } from "../stores/user";
import FirmHome from "./FirmHome.vue";
import UserHome from "./UserHome.vue";
import { computed } from "vue";

const userStore = useUserStore();
const isFirm = computed(() => userStore.isFirm);
</script>

<style scoped></style>
