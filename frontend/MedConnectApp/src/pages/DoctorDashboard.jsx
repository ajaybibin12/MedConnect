import { useState, useEffect } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function DoctorDashboard() {
  const [doctorName, setDoctorName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ New states for profile form
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    fees: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchDoctorName();
    fetchDoctorProfile();
  }, []);

  const fetchDoctorName = async () => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoctorName(res.data.name);
    } catch (error) {
      console.error("Error fetching doctor info:", error);
    }
  };

  const fetchDoctorProfile = async () => {
    try {
      const res = await api.get("/doctors/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoctorProfile(res.data);
      if (res.data.approved) {
        fetchAppointments();
      }
    } catch (error) {
      console.log("Doctor profile not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments/doctor", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // ✅ Handle form field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit doctor profile
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/doctors/create", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setSuccessMessage("✅ Profile submitted! Waiting for admin approval.");
      setShowProfileForm(false);  // hide form after submission
      fetchDoctorProfile();       // refresh profile
    } catch (error) {
      console.error("Error creating doctor profile:", error);
    }
  };

  // ✅ Handle status update (Confirm or Reject)
  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(
        `/appointments/${appointmentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
    } catch (error) {
      console.error(`Error updating appointment status to ${newStatus}:`, error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome, {doctorName || "Doctor"}!
        </h1>

        {/* ✅ CASE 1: No profile yet */}
        {!doctorProfile && (
          <div className="bg-yellow-100 p-4 rounded shadow mb-6">
            <p className="mb-4 font-medium text-yellow-800">
              You haven’t created your profile yet. Please complete your profile.
            </p>
            <button
              onClick={() => setShowProfileForm(!showProfileForm)}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
            >
              {showProfileForm ? "Close Form" : "Complete Profile"}
            </button>

            {/* ✅ Profile Form (only if showProfileForm is true) */}
            {showProfileForm && (
              <form
                onSubmit={handleProfileSubmit}
                className="bg-white shadow p-4 mt-4 rounded space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="e.g. Pediatrician"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Fees</label>
                  <input
                    type="number"
                    step="0.01"
                    name="fees"
                    value={formData.fees}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Submit Profile
                </button>
              </form>
            )}
          </div>
        )}

        {/* ✅ Show success message after profile submission */}
        {successMessage && (
          <div className="bg-green-100 p-3 rounded text-green-700 mb-4">
            {successMessage}
          </div>
        )}

        {/* ✅ CASE 2: Profile exists but not approved */}
        {doctorProfile && !doctorProfile.approved && (
          <div className="bg-orange-100 p-4 rounded shadow">
            <p className="text-orange-800 font-medium">
              Your profile is submitted but awaiting admin approval.
            </p>
          </div>
        )}

        {/* ✅ CASE 3: Approved → Show Appointments */}
        {doctorProfile && doctorProfile.approved && (
          <div className="bg-white shadow rounded p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">Appointments</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Date</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Patient</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appt) => (
                    <tr key={appt.id} className="border-b">
                      <td className="p-2">{appt.date}</td>
                      <td className="p-2">{appt.time_slot}</td>
                      <td className="p-2">{appt.patient?.name}</td>
                      <td className="p-2 font-semibold capitalize">{appt.status}</td>

                      <td className="p-2">
                        {appt.status === "pending" ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateStatus(appt.id, "confirmed")}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(appt.id, "rejected")}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2" colSpan="5">
                      No upcoming appointments
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
