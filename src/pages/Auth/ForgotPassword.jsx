import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Step 1: Check Email and Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    try {
      const res = await fetch('http://127.0.0.1:8000/api/forget-pass/send-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) { setStep(2); } 
      else { setError(data.message || "Email not found in database."); }
    } catch (err) { setError("Server connection failed."); }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/forget-pass/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3); // Move to password reset step
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  // Step 3: Update Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwords.new || !passwords.confirm) {
      setError("All fields are required.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setError("Passwords do not match!");
      return;
    }

    // Strong password regex check
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!regex.test(passwords.new)) {
      setError("Password must be 8+ chars, include uppercase, lowercase, number & special char!");
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/forget-pass/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: passwords.new }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password reset successfully! Please login.");
        navigate('/login'); // Redirect to login page
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden">
      <motion.div 
        initial={{ x: -100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ duration: 0.8 }} 
        className="w-full md:w-1/2 flex flex-col justify-center px-15 md:px-44">
        <div className="max-w-9xl w-full mx-auto">
          <h1 className="text-9xl font-black italic mb-6">Reset Password</h1>
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1" 
                noValidate
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleRequestOTP} 
                className="space-y-9"
              >
                <p className="text-5xl text-gray-500 mb-9">Enter your registered email to receive an OTP.</p>
                <input type="email" placeholder="Email Address" className="text-6xl w-full p-8 bg-gray-100 rounded-2xl outline-none" onChange={(e) => setEmail(e.target.value)} required />
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-red-600 text-4xl font-bold bg-red-50 p-6 rounded-2xl border border-red-100"
                  >
                    {error}
                  </motion.p>
                )}
                <button className="w-full text-4xl py-8 bg-black text-white rounded-full font-bold">Send OTP</button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2" 
                noValidate
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleVerifyOTP} 
                className="space-y-9"
              >
                <p className="text-5xl text-gray-500 mb-4">An OTP has been sent to {email}.</p>
                <input type="text" placeholder="Enter 6-digit OTP" className="text-7xl w-full p-8 bg-gray-100 rounded-2xl outline-none" onChange={(e) => setOtp(e.target.value)} required />
                {error && (
                  <motion.p className="text-red-600 text-4xl font-bold bg-red-50 p-6 rounded-2xl border border-red-100">
                    {error}
                  </motion.p>
                )}
                <button className="w-full text-5xl py-8 bg-black text-white rounded-full font-bold">Verify OTP</button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form 
                key="step3" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleResetPassword} 
                className="space-y-9"
              >
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full text-7xl p-8 bg-gray-100 rounded-2xl outline-none"
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full text-7xl p-8 bg-gray-100 rounded-2xl outline-none"
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  required
                />
                {error && (
                  <motion.p 
                    className="text-red-600 text-4xl font-bold bg-red-50 p-6 rounded-2xl border border-red-100"
                  >
                    {error}
                  </motion.p>
                )}
                <button className="w-full text-5xl py-8 bg-green-600 text-white rounded-full font-bold">
                  Update Password
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="hidden md:block w-1/2 h-full">
        <img src="/images/image_3d81a7.jpg" className="w-full h-full object-cover" alt="Forgot Password Botany" />
      </div>
    </div>
  );
}