import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BellIcon } from "@heroicons/react/24/outline";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const bellRef = useRef(null);
  const profileRef = useRef(null);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === "/";
  const [dueReminders, setDueReminders] = useState([]);
  const [openBell, setOpenBell] = useState(false);
  

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpenBell(false);
      }
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setOpenDropdown(false);
    }
  }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("careReminders");
    if (stored) {
      const reminders = JSON.parse(stored);
      const today = new Date().toDateString();
      setDueReminders(reminders.filter((r) => r.nextWatering === today && !r.completed));
    }
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Encyclopedia", path: "/encyclopedia" },
    { name: "Recommendation", path: "/recommendation" },
    { name: "Disease Detection", path: "/disease-detection" },
    { name: "Digital Twin", path: "/digital-twin" },
  ];

  const getInitials = (name) => {
    if (!name) return "";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase();
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-70 z-50 transition-all duration-300
        ${isHome && !scrolled
          ? "bg-transparent text-black"
          : "bg-white/95 backdrop-blur-md shadow-xl text-gray-900 border-b-2 border-gray-100"
        }`}
    >
      <div className="w-full px-12 xl:px-20 h-full flex items-center justify-between">
  <div
    onClick={() => navigate("/")}
    className="cursor-pointer flex items-center gap-4 select-none"
  >
    <img 
      src="/images/Logo.png" 
      alt="SeedSphere Logo" 
      className="h-60 w-60 object-contain hover:scale-105 transition-transform duration-300" 
    />
  </div>

        <div className="hidden md:flex items-center gap-24">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className="relative text-6xl font-black tracking-wide transition-colors hover:text-green-700 pb-1"
            >
              {({ isActive }) => (
                <>
                  {link.name}
                  {isActive && (
                    <span className="absolute left-0 -bottom-5 w-full h-[5px] bg-green-500 rounded-full shadow-[0_2px_8px_rgba(34,197,94,0.6)]"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-10 relative">
          <div className="relative" ref={bellRef}>
            <BellIcon onClick={() => setOpenBell(!openBell)} className="h-20 w-20 gap-10 cursor-pointer hover:text-green-500 transition-colors" />
            {dueReminders.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">{dueReminders.length}</span>
            )}
            {openBell && (
              <div className="absolute right-0 mt-5 h-110 w-185 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 z-50 text-gray-900">
                <h3 className="font-bold text-8xl italic mb-3">Care Reminders</h3>
                {dueReminders.length === 0 ? (
                  <p className="text-6xl italic text-gray-500 mt-4">No reminders due today</p>
                ) : (
                  dueReminders.map((r) => (
                    <div key={r.id} className="p-3 mb-2 bg-red-50 rounded-xl">
                      <p className="font-semibold text-base">{r.plantName}</p>
                      <p className="text-3xl text-gray-500">Water today</p>
                    </div>
                  ))
                )}
                <button onClick={() => navigate("/care-reminder")} className="mt-6 w-full bg-green-600 text-white py-5 rounded-xl hover:bg-green-700 font-semibold text-5xl transition">View All</button>
              </div>
            )}
          </div>
          
          {/* Profile Section */}
          <div className="relative" ref={profileRef}>
          {!user ? (
            <button onClick={() => navigate("/login")} className="px-19 py-8 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-black text-6xl shadow-lg">Login</button>
          ) : (
            <div className="flex items-center gap-4">
      <div 
        onClick={() => setOpenDropdown(!openDropdown)} 
        className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition shadow-lg border-2 border-white"
      >
        <span className="text-sm font-bold leading-none select-none">
          {getInitials(user.name) || "?"}
        </span>
      </div>
          {openDropdown && (
        <div className="absolute right-0 mt-2 top-full">
           <ProfileDropdown />
        </div>
      )}
          </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
}