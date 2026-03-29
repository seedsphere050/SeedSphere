const BASE_URL = "http://localhost:8000/api";

export const registerUser = async (formData) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return { ok: res.ok, data: await res.json() };
};

export const forgotPassword = async (email, newPassword) => {
  const res = await fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword }),
  });
  return res.json();
};

export const getProfile = async () => {
  const res = await fetch(`${BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
  });
  return res.json();
};

export const isLoggedIn = () => !!localStorage.getItem("userToken");

export const logout = () => {
  ["userToken", "userName", "isLoggedIn", "seedSphereUser"].forEach(
    (k) => localStorage.removeItem(k)
  );
};
