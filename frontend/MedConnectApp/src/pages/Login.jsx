import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // ✅ login API call
      const res = await api.post("/auth/login", { email, password });

      // ✅ Save token in localStorage
      localStorage.setItem("token", res.data.access_token);

      // ✅ Get user details to know role (new API)
      const profile = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      });

      localStorage.setItem("role", profile.data.role);

      // ✅ Redirect based on role
      if (profile.data.role === "patient") {
        navigate("/patient-dashboard");
      } else if (profile.data.role === "doctor") {
        navigate("/doctor-dashboard");
      } else if (profile.data.role === "admin") {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "❌ Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-4 text-teal-700">Sign In</h2>

        <input className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />
        <input type="password" className="w-full border p-2 rounded mb-3"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}
          className="w-full bg-teal-600 text-white py-2 rounded">
          Sign In
        </button>

        <p className="mt-3 text-sm text-gray-500">
          Don’t have an account? <a href="/register" className="text-teal-600">Sign up</a>
        </p>
      </div>
    </div>
  );
}
