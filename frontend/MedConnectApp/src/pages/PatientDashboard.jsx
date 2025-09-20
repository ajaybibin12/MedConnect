import { useState, useEffect } from "react";
import api from "../api/axios"; 
import Sidebar from "../components/Sidebar";

export default function PatientDashboard() {

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    doctor_id: "",
    date: "",
    time_slot: "",
  });
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatientName();
  }, []);


  const fetchPatientName = async () => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPatientName(res.data.name);   // ✅ store name from response
      // console.log("Patient Info:", res.data);
    } catch (error) {
      console.error("Error fetching patient info:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/patient", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // 🔹 Adjust to your GET endpoint
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // ✅ Fetch all doctors
  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors/approved", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoctors(res.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/appointments/book", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setShowForm(false);
      setFormData({ doctor_id: "", date: "", time_slot: "" });
      fetchAppointments();
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await api.delete(`/appointments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Appointment cancelled successfully!");
      fetchAppointments(); // refresh list
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment.");
    }
  };

  // ✅ Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



  return (
    <div className="flex">
      {/* ✅ Sidebar */}
      <Sidebar />
      {/* ✅ Main content */}
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {patientName || "Patient"}</h1>

        {/* Upcoming Appointments */}
        {/* add a button to book an appointment */}
        <button className="bg-teal-600 text-white px-4 py-2 rounded mb-6"
          onClick={() => setShowForm(!showForm)}>
          Book Appointment
        </button>
        {/* ✅ Booking Form (toggle) */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow p-4 mb-6 rounded space-y-4"
          >
            {/* ✅ Doctor Selection Dropdown */}
            <div>
              <label className="block text-sm font-medium">Select Doctor</label>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">-- Select a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.user.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Time Slot</label>
              <input
                type="text"
                name="time_slot"
                value={formData.time_slot}
                onChange={handleChange}
                placeholder="e.g. 10:00 AM"
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded"
            >
              Confirm Appointment
            </button>
          </form>
        )}
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Upcoming Appointments</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Date</th>
                <th className="p-2">Time</th>
                <th className="p-2">Doctor</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="p-2">{appt.date}</td>
                    <td className="p-2">{appt.time_slot}</td>
                    <td className="p-2">{appt.doctor?.user?.name}</td>
                    <td className="p-2 text-green-600 font-semibold">{appt.status}</td>
                    <td className="p-2">
                      {(appt.status === "pending" || appt.status === "confirmed") && (
                        <button
                          onClick={() => cancelAppointment(appt.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2" colSpan="4">
                    No upcoming appointments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
