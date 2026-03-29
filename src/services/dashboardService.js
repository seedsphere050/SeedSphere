const BASE_URL = "http://localhost:8000/api";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("userToken")}`,
});

export const getUserDashboard = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/user`, { headers: authHeaders() });
  return res.json();
};

export const getAdminDashboard = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/admin`, { headers: authHeaders() });
  return res.json();
};
