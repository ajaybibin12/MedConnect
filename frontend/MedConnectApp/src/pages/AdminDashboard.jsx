import { useState, useEffect } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("");
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAdminName();
    fetchAppointments();
  }, []);

  const fetchAdminName = async () => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAdminName(res.data.name);
    } catch (error) {
      console.error("Error fetching admin info:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/admin", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome, {adminName || "Admin"}!
        </h1>

        {/* ✅ All Appointments Table */}
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">All Appointments</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Date</th>
                <th className="p-2">Time</th>
                <th className="p-2">Doctor</th>
                <th className="p-2">Patient</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id} className="border-b">
                    <td className="p-2">{appt.date}</td>
                    <td className="p-2">{appt.time_slot}</td>
                    <td className="p-2">{appt.doctor?.user?.name}</td>
                    <td className="p-2">{appt.patient?.name}</td>
                    <td className="p-2 font-semibold capitalize">{appt.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2" colSpan="5">No appointments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
