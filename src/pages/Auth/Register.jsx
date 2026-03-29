import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";


export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const validate = () => {
    let newErrors = {};

    // 1. Full Name Validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // 2. Email Validation
    if (!form.email.includes("@") || !form.email.includes(".")) {
      newErrors.email = "Invalid email format";
    }

    // 3. Phone Validation
    const cleanPhone = form.phone.replace(/\D/g, ""); 
    if (!cleanPhone) {
  newErrors.phone = "Phone number is required";
} else if (cleanPhone.length !== 10) { 
  
  newErrors.phone = "Phone number must be exactly 10 digits";
}
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      newErrors.password = "8+ chars, 1 capital, 1 number, 1 special char";
    }

    // 5. Confirm Password Validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword
        
      })
    });
     

    const data = await res.json();

    if (res.ok) {
      // ✅ SUCCESS
      alert("Registration successful ✅");
      navigate("/login");
    } else {
      // ❌ ERROR FROM BACKEND
      setErrors({ server: data.error || "Registration failed." });
    }

  } catch (err) {
    setErrors({ server: "Cannot connect to server." });
  }
};
  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden">
      
      {/* Left Side: Professional Form */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-24 overflow-y-auto"
      >
        <div className="max-w-5xl w-full mx-auto py-10">
          <span className="text-4xl text-green-600 font-bold uppercase tracking-widest mb-2 block text-left">
            Start Your Journey
          </span>
          <h1 className="text-9xl font-black italic mb-8 text-left">Join SeedSphere</h1>
          
          <form onSubmit={handleRegister} noValidate className="space-y-5">
            {/* Full Name */}
            <div className="text-left">
              <label className="block text-4xl font-bold text-gray-700 mb-2 uppercase tracking-tighter">Full Name</label>
              <input 
                type="text" 
                className={`w-full text-5xl p-8 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none transition-all ${errors.name ? 'ring-2 ring-red-400' : ''}`}
                placeholder="Lush Green"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-red-500 text-3xl font-bold mt-1">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div className="text-left">
              <label className="block text-4xl font-bold text-gray-700 mb-2 uppercase tracking-tighter">Email Address</label>
              <input 
                type="email" 
                className={`w-full text-5xl p-8 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none transition-all ${errors.email ? 'ring-2 ring-red-400' : ''}`}
                placeholder="botanist@seedsphere.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-red-500 text-3xl font-bold mt-1">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="text-left">
              <label className="block text-4xl font-bold text-gray-700 mb-2 uppercase tracking-tighter">Phone Number</label>
              <input 
                type="text" 
                className={`w-full text-5xl p-8 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none transition-all ${errors.phone ? 'ring-2 ring-red-400' : ''}`}
                placeholder="9876543210"
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <p className="text-red-500 text-3xl font-bold mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="text-left relative">
              <label className="block text-4xl font-bold text-gray-700 mb-2 uppercase tracking-tighter">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`w-full text-5xl p-8 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none transition-all ${errors.password ? 'ring-2 ring-red-400' : ''}`}
                  placeholder="••••••••"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <span 
                  className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" 
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (<EyeIcon className="h-12 w-12" /> ) : ( <EyeSlashIcon className="h-12 w-12" /> )}
                </span>
              </div>
              {errors.password && <p className="text-red-500 text-3xl font-bold mt-1 leading-tight">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="text-left">
              <label className="block text-4xl font-bold text-gray-700 mb-2 uppercase tracking-tighter">Confirm Password</label>
              <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                className={`w-full text-5xl p-8 bg-gray-100 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none transition-all ${errors.confirmPassword ? 'ring-2 ring-red-400' : ''}`}
                placeholder="••••••••"
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              <span 
      className="absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" 
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    >
      {showConfirmPassword ? (
        <EyeIcon className="h-12 w-12" />
      ) : (
        <EyeSlashIcon className="h-12 w-12" />
      )}
    </span>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-3xl font-bold mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.server && (
              <p className="text-red-500 text-4xl font-bold bg-red-50 p-3 rounded-xl border border-red-100">{errors.server}</p>
            )}

            <button 
              type="submit"
              className="w-full text-5xl py-9 bg-black text-white rounded-full font-bold hover:scale-[1.02] transition-transform shadow-xl active:scale-95 mt-4"
            >
              Create Account
            </button>
          </form>
          
          <p className="text-4xl mt-9 text-gray-500 text-center">
            Already a member? <span onClick={() => navigate('/login')} className="text-green-600 font-bold cursor-pointer hover:underline">Sign in here</span>
          </p>
        </div>
      </motion.div>

      {/* Right Side: Botanical Design */}
      <motion.div 
  initial={{ x: 100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  className="hidden md:block w-1/2 h-full relative"
>
  <video 
    autoPlay 
    muted 
    loop 
    playsInline 
    className="w-full h-850 object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700"
  >
    <source src="/images/register.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* Optional: Dark Overlay to match the Login page aesthetic */}
  <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

  {/* Optional: Floating Branding text on top of the video */}
  <div className="absolute bottom-12 left-12 text-white z-10">
    <h2 className="text-4xl font-black italic">SeedSphere 🌱</h2>
    <p className="text-lg opacity-80">Grow your digital ecosystem.</p>
  </div>
</motion.div>
    </div>
  );
}