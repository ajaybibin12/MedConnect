import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setFormData({ name: res.data.name, email: res.data.email, password: "" });
      setPreviewImage(res.data.profile_image
        ? `http://127.0.0.1:8000/${res.data.profile_image}`
        : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    if (formData.password) {
      form.append("password", formData.password);
    }
    if (imageFile) {
      form.append("profile_image", imageFile);
    }

    try {
      const res = await api.put("/auth/update-profile", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile(res.data);
      setEditing(false);
      alert("✅ Profile updated!");
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Failed to update profile.");
    }
  };

  if (!profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-bold text-teal-700 mb-4 text-center">My Profile</h2>

        <div className="flex justify-center mb-4">
          <img
            src={previewImage}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border"
          />
        </div>

        {!editing ? (
          <>
            <p className="text-lg"><strong>Name:</strong> {profile.name}</p>
            <p className="text-lg"><strong>Email:</strong> {profile.email}</p>
            <p className="text-lg"><strong>Role:</strong> {localStorage.getItem("role")}</p>
            <p className="text-sm text-gray-500 mb-4">
              Joined on {new Date(profile.created_at).toLocaleDateString()}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="bg-teal-600 text-white px-4 py-2 rounded w-full"
            >
              Update Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <input
              type="text"
              name="name"
              className="w-full border rounded px-3 py-2"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              className="w-full border rounded px-3 py-2"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              className="w-full border rounded px-3 py-2"
              placeholder="New Password (optional)"
              onChange={handleInputChange}
            />

            {/* Stylized file input */}
            <div className="flex items-center space-x-4">
              <label htmlFor="imageUpload" className="cursor-pointer bg-gray-200 text-sm px-3 py-2 rounded hover:bg-gray-300">
                Choose Profile Image
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imageFile && (
                <span className="text-sm text-gray-500 truncate">{imageFile.name}</span>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-teal-600 text-white px-4 py-2 rounded w-full"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setImageFile(null);
                  setPreviewImage(profile.profile_image
                    ? `http://127.0.0.1:8000/${profile.profile_image}`
                    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png");
                }}
                className="bg-gray-300 text-black px-4 py-2 rounded w-full"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
