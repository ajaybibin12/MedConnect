import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

export default function Sidebar() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRole(res.data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchRole();
  }, []);

  // ✅ Handle Appointments click based on role
  const handleAppointmentsClick = () => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "doctor") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/patient-dashboard");
    }
  };

  // ✅ Determine active state for Appointments
  const isAppointmentsActive =
    location.pathname.includes("dashboard");

  return (
    <aside className="w-64 bg-teal-700 text-white p-6 min-h-screen">
      <ul className="space-y-4">

        {/* ✅ Appointments for ALL (redirects to correct dashboard) */}
        <li>
          <button
            onClick={handleAppointmentsClick}
            className={`block w-full text-left p-2 rounded ${
              isAppointmentsActive ? "bg-teal-900" : "hover:bg-teal-600"
            }`}
          >
            Appointments
          </button>
        </li>

        {/* ✅ Only Admin sees Doctors */}
        {role === "admin" && (
          <li>
            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                `block p-2 rounded ${isActive ? "bg-teal-900" : "hover:bg-teal-600"}`
              }
            >
              Doctors
            </NavLink>
          </li>
        )}

        {/* ✅ Logout */}
        <li>
          <NavLink onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");}}
            to="/login"
            className="block p-2 rounded text-red-300 hover:text-red-500"
          >
            Logout
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}
