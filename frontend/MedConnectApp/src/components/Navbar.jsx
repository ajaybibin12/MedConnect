import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (token) {
      fetchProfileImage();
    }
  }, [token]);

  const fetchProfileImage = async () => {
    try {
      const res = await api.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const imagePath = res.data.profile_image
        ? `http://127.0.0.1:8000/${res.data.profile_image}`
        : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

      setProfileImage(imagePath);
    } catch (err) {
      console.error("Failed to fetch profile image:", err);
      setProfileImage("https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
      <h1
        className="text-xl font-bold text-teal-700 cursor-pointer"
        onClick={() =>
          token
            ? localStorage.getItem("role") === "patient"
              ? navigate("/patient-dashboard")
              : navigate("/doctor-dashboard")
            : navigate("/login")
        }
      >
        MedConnect
      </h1>

      <div className="flex items-center space-x-4">
        {/* ✅ If logged in → show profile image and logout */}
        {token ? (
          <>
            {/* ✅ Profile Image as button */}
            <img
              src={profileImage}
              alt="Profile"
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full cursor-pointer object-cover border hover:ring-2 ring-teal-400"
              title="View Profile"
            />
            <button
              onClick={handleLogout}
              className="text-red-500 ml-2 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="bg-teal-600 text-white px-4 py-2 rounded">
              Login
            </a>
            <a href="/register" className="text-teal-600">
              Sign Up
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
