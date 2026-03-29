import Navbar from "../components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";

export default function MainLayout() {
  return (
    <>
      <Navbar />
      {/* pt-24 to give taller navbar room */}
      <main className="pt-64" >
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
