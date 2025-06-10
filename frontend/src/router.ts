import { createRouter, createWebHistory } from "vue-router";
import Landing from "./pages/Landing.vue";
import Login from "./pages/Login.vue";
import Home from "./pages/Home.vue";
import AccountTypeSelection from "./pages/AccountTypeSelection.vue";
import RegisterUser from "./pages/RegisterUser.vue";
import RegisterFirm from "./pages/RegisterFirm.vue";
import ClientAccount from "./pages/ClientAccount.vue";
import { isLoggedIn } from "./api/local-storage";
import { ref } from "vue";

import AddJob from "./pages/AddJob.vue";
import EditJob from "./pages/EditJob.vue";
import JobDetails from "./pages/JobDetails.vue";
import UserJobApplications from "./pages/UserJobApplications.vue";
import FirmJobApplications from "./pages/FirmJobApplications.vue";
import NotFound from "./pages/NotFound.vue";

const routes = [
  { path: "/", name: "landing-route", component: Landing },
  { path: "/login", name: "login-route", component: Login },
  {
    path: "/account-type",
    name: "account-type-selection-route",
    component: AccountTypeSelection,
  },
  {
    path: "/register",
    name: "register-route",
    children: [
      { path: "user", name: "register-user-route", component: RegisterUser },
      { path: "firm", name: "register-firm-route", component: RegisterFirm },
    ],
  },
  {
    path: "/client",
    name: "client-route",
    meta: { requiresAuth: true }, // Set requiresAuth on the parent route
    children: [
      {
        path: "account",
        name: "client-account-route",
        component: ClientAccount,
      },
      {
        path: "home",
        name: "home-route",
        component: Home,
      },
      {
        path: "/firm/add-job",
        name: "firm-add-job-route",
        component: AddJob,
      },
      {
        path: "/firm/edit-job/:id",
        name: "firm-edit-job-route",
        component: EditJob,
      },
      {
        path: "/user/job-details/:id",
        name: "user-job-details-route",
        component: JobDetails,
      },
      {
        path: "/user/job-applications",
        name: "user-job-applications-route",
        component: UserJobApplications,
      },
      {
        path: "/firm/job-applications/:id",
        name: "firm-job-applications-route",
        component: FirmJobApplications,
      },
    ],
  },
    {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _, next) => {
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
