import { useState, useEffect } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDoctors(res.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const approveDoctor = async (id) => {
    try {
      await api.put(`/doctors/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // ✅ Update doctor in UI without full refresh
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, approved: true } : doc
        )
      );
    } catch (error) {
      console.error("Error approving doctor:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctors List</h1>

        <div className="bg-white shadow rounded p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Specialization</th>
                <th className="p-2">Experience</th>
                <th className="p-2">Fees</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length > 0 ? (
                doctors.map((doc) => (
                  <tr key={doc.id} className="border-b">
                    <td className="p-2">{doc.user.name}</td>
                    <td className="p-2">{doc.user.email}</td>
                    <td className="p-2">{doc.specialization}</td>
                    <td className="p-2">{doc.experience} yrs</td>
                    <td className="p-2">₹{doc.fees}</td>
                    <td className="p-2 font-semibold">
                      {doc.approved ? (
                        <span className="text-green-600">Approved</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </td>
                    <td className="p-2">
                      {!doc.approved && (
                        <button
                          onClick={() => approveDoctor(doc.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2" colSpan="7">No doctors found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
