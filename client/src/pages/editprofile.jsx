import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowLeft, FiCamera } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [about, setabout] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
      const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}api/getme`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.data;
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
        setabout(data.about || "");
      })
      .catch(console.error);
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("about", about);
    if (image) formData.append("image", image);

    try {
      await axios.post(`${API_URL}api/edit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (error) {
      toast.error("Profile update failed");
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ================= LEFT SIDEBAR (SCROLL ONLY HERE) ================= */}
      <div
        className="
          w-full md:w-[24%]
          md:min-w-[320px] md:shrink-0
          h-full bg-white border-r border-gray-300
          flex flex-col overflow-y-auto
        "
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200">
          <NavLink to="/profile">
            <FiArrowLeft className="text-xl cursor-pointer" />
          </NavLink>
          <h2 className="text-lg font-medium">Edit Profile</h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center mt-10 gap-6 px-6 pb-10"
        >
          {/* Image */}
          <div className="relative">
            <img
              src={
                preview
                  ? preview
                  : user.image?.startsWith("http")
                  ? user.image
                  : `${API_URL}${user.image}`
              }
              className="w-36 h-36 rounded-full object-cover"
              alt="profile"
            />

            <label className="absolute bottom-2 right-2 bg-green-500 p-2 rounded-full cursor-pointer">
              <FiCamera className="text-white" />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Name */}
          <div className="w-full">
            <label className="text-sm text-gray-500">Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-gray-200 py-2 outline-none"
            />
          </div>

          {/* Email */}
          <div className="w-full">
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-200 py-2 outline-none"
            />
          </div>

          {/* About */}
          <div className="w-full">
            <label className="text-sm text-gray-500">About</label>
            <input
              type="text"
              value={about}
              onChange={(e) => setabout(e.target.value)}
              className="w-full border-b border-gray-200 py-2 outline-none"
            />
          </div>

          <button
            type="submit"
            className="mt-6 px-8 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            Save Changes
          </button>
        </form>
      </div>

      <div className="hidden md:flex w-[76%] bg-[#f7f5f3] flex-col gap-3 items-center justify-center">
        <img src="/edit.png" className="w-16 h-16" alt="edit" />
        <h1 className="text-[28px] font-bold">Edit Profile</h1>
      </div>
    </div>
  );
};
