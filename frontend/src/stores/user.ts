import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: null,
    isAuthenticated: false,
    isFirm: false,
  }),
  actions: {
    setUser(user: any, is_firm: boolean) {
      this.userInfo = user;
      this.isFirm = is_firm;
      this.isAuthenticated = true;
    },
    clearUser() {
      this.userInfo = null;
      this.isFirm = false;
      this.isAuthenticated = false;
    },
  },
  persist: true,
});
