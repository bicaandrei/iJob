import { createRouter, createWebHistory } from "vue-router";
import Landing from "./pages/Landing.vue";
import Login from "./pages/Login.vue";
import Home from "./pages/Home.vue";
import { isLoggedIn } from "./api/local-storage";
import { ref } from "vue";
import AccountTypeSelection from "./pages/AccountTypeSelection.vue";
import RegisterUser from "./pages/RegisterUser.vue";
import RegisterFirm from "./pages/RegisterFirm.vue";

const routes = [
  { path: "/", name: "landing-route", component: Landing },
  { path: "/login", name: "login-route", component: Login },
  {
    path: "/account-type",
    name: "account-type-selection-route",
    component: AccountTypeSelection,
  },
  {
    path: "/home",
    name: "home-route",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/register",
    name: "register-route",
    children: [
      { path: "user", name: "register-user-route", component: RegisterUser },
      { path: "firm", name: "register-firm-route", component: RegisterFirm },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const loggedIn = ref(isLoggedIn());
  if (to.name === "login-route" && loggedIn.value) {
    next({ name: "home-route" });
  } else if (requiresAuth && !loggedIn.value) {
    next({ name: "landing-route" });
  } else {
    next();
  }
});

export default router;
