import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/styles.css";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

app.use(router);
app.use(pinia);
app.mount("#app");
