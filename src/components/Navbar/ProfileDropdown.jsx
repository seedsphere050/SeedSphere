import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="absolute right-0 top-14 bg-white shadow-lg rounded-xl w-48 p-4 flex flex-col gap-3">
      
      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="text-left text-red-500 hover:text-red-600"
      >
        Logout
      </button>
    </div>
  );
}