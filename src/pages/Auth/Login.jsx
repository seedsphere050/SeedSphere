// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();
//   const [error, setError] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!email || !password) {
//       setError("Please fill in all fields.");
//       return;
//     } 
//     if (!emailRegex.test(email)) {
//       setError("Please enter a valid email address.");
//       return;
//     }

//     try {
//       const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }), // ✅ Must send "email", not "username"
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // ✅ Store token and email only (backend returns these)
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userToken", data.token);
//         localStorage.setItem("userEmail", data.email);

//         navigate('/');  // redirect to dashboard/home
//         window.location.reload();
//       } else {
//         // ✅ backend sends error in "error" field
//         setError(data.error || "The email address or password may be incorrect.");
//       }
//     } catch (err) {
//       setError("Cannot connect to the server. Please try again later.");
//     }
//   };

//   return (
//     <div className="flex h-screen w-screen bg-white overflow-hidden">
//       <motion.div 
//         initial={{ x: -100, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 0.8 }}
//         className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-20"
//       >
//         <div className="max-w-4xl w-full mx-auto">
//           <span className="text-green-600 font-bold uppercase tracking-widest text-4xl mb-4 block text-left">
//             Welcome Back
//           </span>
//           <h1 className="text-9xl font-black italic mb-10 text-left leading-tight">
//             Login to SeedSphere
//           </h1>
          
//           <form onSubmit={handleLogin} noValidate className="space-y-8">
//             <div className="text-left">
//               <label className="block text-4xl font-bold text-gray-700 mb-3 uppercase tracking-tighter">
//                 Email Address
//               </label>
//               <input 
//                 type="email" 
//                 required 
//                 className="w-full p-9 text-5xl bg-gray-100 rounded-2xl border-none focus:ring-4 focus:ring-green-500 outline-none transition-all justify-between"
//                 placeholder="botanist@seedsphere.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             <div className="text-left">
//               <div className="flex justify-between items-center w-full mb-3">
//                 <label className="text-4xl font-bold text-gray-700 uppercase tracking-tighter">
//                   Password
//                 </label>
//                 <span 
//                   onClick={() => navigate('/forgot-password')}
//                   className="text-5xl font-bold text-green-600 hover:text-green-700 cursor-pointer transition-colors"
//                 >
//                   Forgot Password?
//                 </span>
//               </div>
//               <input 
//                 type="password" 
//                 required 
//                 className="w-full p-9 text-5xl bg-gray-100 rounded-2xl border-none focus:ring-4 focus:ring-green-500 outline-none transition-all"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             {error && (
//               <motion.p 
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="text-red-600 text-4xl font-bold bg-red-50 p-4 rounded-xl border border-red-100"
//               >
//                 {error}
//               </motion.p>
//             )}

//             <button 
//               type="submit"
//               className="w-full py-9 bg-black text-white rounded-full font-bold text-5xl hover:scale-[1.02] transition-transform shadow-2xl active:scale-95"
//             >
//               Sign In
//             </button>
//           </form>
          
//           <p className="mt-10 text-gray-500 text-center text-4xl">
//             Don't have an account? <span onClick={() => navigate('/register')} className="text-green-600 font-bold cursor-pointer hover:underline">Register here</span>
//           </p>
//         </div>
//       </motion.div>

//       <div className="hidden md:block w-1/2 h-full bg-gray-100">
//         <video 
//           autoPlay 
//           muted 
//           loop 
//           playsInline 
//           className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
//         >
//           <source src="/images/login.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    } 
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login({
          name: data.name,
          token: data.token,
          email: email
        });
        navigate('/');
      } else {
        setError(data.message || "The email address or password may be incorrect.");
      }
    } catch (err) {
      setError("Cannot connect to the database. Please try again later.");
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden">
      
      {/* Left Side: Professional Form */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-20"
      >
        <div className="max-w-4xl w-full mx-auto">
          {/* Increased from text-sm to text-lg */}
          <span className="text-green-600 font-bold uppercase tracking-widest text-4xl mb-4 block text-left">
            Welcome Back
          </span>
          {/* Increased from text-5xl to text-6xl */}
          <h1 className="text-9xl font-black italic mb-10 text-left leading-tight">
            Login to SeedSphere
          </h1>
          
          <form onSubmit={handleLogin} noValidate className="space-y-8">
            {/* Email Field */}
            <div className="text-left">
              {/* Increased label to text-lg */}
              <label className="block text-4xl font-bold text-gray-700 mb-3 uppercase tracking-tighter">
                Email Address
              </label>
              {/* Increased input text to text-xl and padding to p-5 */}
              <input 
                type="email" 
                required 
                className="w-full p-9 text-5xl bg-gray-100 rounded-2xl border-none focus:ring-4 focus:ring-green-500 outline-none transition-all justify-between"
                placeholder="botanist@seedsphere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="text-left">
              <div className="flex justify-between items-center w-full mb-3">
                <label className="text-4xl font-bold text-gray-700 uppercase tracking-tighter">
                  Password
                </label>
                <span 
                  onClick={() => navigate('/forgot-password')}
                  className="text-5xl font-bold text-green-600 hover:text-green-700 cursor-pointer transition-colors"
                >
                  Forgot Password?
                </span>
              </div>
              <input 
                type="password" 
                required 
                className="w-full p-9 text-5xl bg-gray-100 rounded-2xl border-none focus:ring-4 focus:ring-green-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-4xl font-bold bg-red-50 p-4 rounded-xl border border-red-100"
              >
                {error}
              </motion.p>
            )}

            {/* Increased button text to text-2xl */}
            <button 
              type="submit"
              className="w-full py-9 bg-black text-white rounded-full font-bold text-5xl hover:scale-[1.02] transition-transform shadow-2xl active:scale-95"
            >
              Sign In
            </button>
          </form>
          
          {/* Increased footer text to text-xl */}
          <p className="mt-10 text-gray-500 text-center text-4xl">
            Don't have an account? <span onClick={() => navigate('/register')} className="text-green-600 font-bold cursor-pointer hover:underline">Register here</span>
          </p>
        </div>
      </motion.div>

      {/* Right Side */}
      <div className="hidden md:block w-1/2 h-full bg-gray-100">
  <video 
    autoPlay 
    muted 
    loop 
    playsInline 
    className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
  >
    <source src="/images/login.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>
    </div>
  );
}
