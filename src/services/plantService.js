// const BASE_URL = "http://localhost:8000/api";
const BASE_URL= "http://127.0.0.1:8000/api";
/**
 * Send an image File to the backend for disease detection.
 * Returns { ok: bool, data: { name, plant_name, description, severity,
 *           symptoms, treatment, prevention, confidence, gradcam_image } }
 */
export const detectDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const headers = {};
  const token = localStorage.getItem("userToken");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/detect/`, {
    method: "POST",
    headers,
    body: formData,
  });
  return { ok: res.ok, data: await res.json() };
};

/**
 * Convert a webcam base64 screenshot to a File and run detection.
 */
export const detectDiseaseFromBase64 = async (base64String) => {
  const res  = await fetch(base64String);
  const blob = await res.blob();
  const file = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
  return detectDisease(file);
};

/** Get all diseases for the Encyclopedia page */
export const getAllDiseases = async () => {
  const res = await fetch(`${BASE_URL}/diseases/`);
  return res.json();
};

/** Get a single disease by exact class name */
export const getDiseaseDetail = async (diseaseName) => {
  const res = await fetch(`${BASE_URL}/diseases/${encodeURIComponent(diseaseName)}/`);
  return res.json();
};
