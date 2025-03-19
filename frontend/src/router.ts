import { createRouter, createWebHistory } from "vue-router";
import Landing from "./pages/Landing.vue";
import Login from "./pages/Login.vue";
import Home from "./pages/Home.vue";
import { auth } from "./api/firebase";

const routes = [
  { path: "/", component: Landing },
  { path: "/signin", component: Login },
  { path: "/home", component: Home, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const currentUser = auth.currentUser;

  // if (to.path === "/signin" && currentUser) {
  //   // next("/home");
  // } else
  if (requiresAuth && !currentUser) {
    //next("/");
  } else {
    next();
  }
});

export default router;
