// '''import { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Check if user is already logged in (e.g., in localStorage)
//   useEffect(() => {
//     const savedUser = localStorage.getItem("seedSphereUser");
//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData) => {
//     setUser(userData);
//     localStorage.setItem("seedSphereUser", JSON.stringify(userData));
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("seedSphereUser");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);'''

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (e.g., in localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem("seedSphereUser");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn && savedUser) {
      try{
        const userData = JSON.parse(savedUser);
        setUser(userData);
    } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.clear(); 
      }
    }
    setLoading(false);
  }, []);
  

  const login = (userData) => {
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("seedSphereUser", JSON.stringify(userData));
    localStorage.setItem("userName", userData.name);
    localStorage.removeItem("userToken");
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("seedSphereUser");
    localStorage.removeItem("userName");
    localStorage.removeItem("userToken");   
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
