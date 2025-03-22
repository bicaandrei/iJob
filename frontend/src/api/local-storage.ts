const setLoggedInFlag = () => {
  if (!isLoggedIn()) {
    localStorage.setItem("isLoggedIn", "true");
  }
};

const isLoggedIn = (): Boolean => {
  return localStorage.getItem("isLoggedIn") === "true";
};

const deleteLoggedInFlag = () => {
  localStorage.removeItem("isLoggedIn");
};

export { setLoggedInFlag, isLoggedIn, deleteLoggedInFlag };
