export const getToken = () => localStorage.getItem("siarf_token");

export const getUser = () => {
  const user = localStorage.getItem("siarf_user");
  return user ? JSON.parse(user) : null;
};

export const saveAuth = (token: string, user: object) => {
  localStorage.setItem("siarf_token", token);
  localStorage.setItem("siarf_user", JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem("siarf_token");
  localStorage.removeItem("siarf_user");
  window.location.href = "/login";
};

export const isAuthenticated = () => !!getToken();