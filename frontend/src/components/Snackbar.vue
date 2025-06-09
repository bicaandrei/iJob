<template>
  <transition name="fade">
    <div v-if="isVisible" class="snackbar" :class="snackbar?.type">
      {{ snackbar?.message }}
      <button @click="isVisible = false">✖</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface SnackbarData {
  message: string;
  type: "success" | "error";
}

const snackbar = ref<SnackbarData | null>(null);
const isVisible = ref(false);

const showSnackbar = (message: string, type: "success" | "error") => {
  snackbar.value = { message, type };
  isVisible.value = true;

  setTimeout(() => {
    isVisible.value = false;
  }, 5000);
};

defineExpose({ showSnackbar });
</script>

<style scoped>
.snackbar {
  position: fixed;
  top: 20px; /* Move to the top of the page */
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Ensure it appears above other elements */
}
.success {
  background-color: #00c49a;
}
.error {
  background-color: #f44336;
}
button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  margin-left: 10px;
  cursor: pointer;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
