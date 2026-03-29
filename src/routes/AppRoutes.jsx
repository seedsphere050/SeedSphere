import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// // --- MAKE SURE THESE ARE ALL HERE ---
import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Register from "../pages/Auth/Register"; // This was likely missing!
import Encyclopedia from "../pages/Encyclopedia/Encyclopedia";
import Recommendation from "../pages/Recommendation/Recommendation";
import DiseaseDetection from "../pages/DiseaseDetection/DiseaseDetection";
import DigitalTwin from "../pages/DigitalTwin/DigitalTwin";
import Footer from "../components/Footer/Footer";
import CareReminders from "../pages/CareReminders/CareReminders"; // This was likely missing!

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Main Pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/encyclopedia" element={<Encyclopedia />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/digital-twin" element={<DigitalTwin />} />
          <Route path="/care-reminder" element={<CareReminders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}