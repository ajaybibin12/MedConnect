import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", { name, email, password, role });
      alert("✅ Registration successful! Please log in.");
      navigate("/login"); // redirect to login after success
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "❌ Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-4 text-teal-700">Create Account</h2>

        <input className="w-full border p-2 rounded mb-3"
          placeholder="Full Name"
          onChange={e => setName(e.target.value)}
        />
        <input className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />
        <input type="password" className="w-full border p-2 rounded mb-3"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <select className="w-full border p-2 rounded mb-3"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        <button onClick={handleRegister}
          className="w-full bg-teal-600 text-white py-2 rounded">
          Sign Up
        </button>

        <p className="mt-3 text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-teal-600">Sign In</a>
        </p>
      </div>
    </div>
  );
}
