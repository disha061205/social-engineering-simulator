type StoredUser = {
  id?: string;
  _id?: string;
  role?: string;
  email?: string;
  name?: string;
};

export const getUser = (): StoredUser => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) as StoredUser : {};
  } catch {
    localStorage.removeItem("user");
    return {};
  }
};

export const getUserId = () => {
  const user = getUser();
  return user.id || user._id || "";
};

export const getUserRole = () => {
  return getUser().role || "";
};

export const isAuthenticated = () => {
  return Boolean(getUserId());
};

export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("lastResult");
  localStorage.removeItem("selectedAttackType");
  localStorage.removeItem("selectedLevel");
  localStorage.removeItem("usedScenarioIds");
  localStorage.removeItem("weakAreas");
};
