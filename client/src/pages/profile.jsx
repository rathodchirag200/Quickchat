import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowLeft, FiEdit2, FiPhone } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";

export const Profile = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/getme", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.data))
      .catch((err) => console.error(err));
  }, [token]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ================= Sidebar (SCROLL ONLY HERE) ================= */}
      <div
        className="
          w-full md:w-[24%]
          md:min-w-[320px] md:shrink-0
          bg-white border-r border-gray-300
          flex flex-col overflow-y-auto
        "
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200">
          <NavLink to="/">
            <FiArrowLeft className="text-xl cursor-pointer" />
          </NavLink>
          <h2 className="text-lg font-medium">Profile</h2>
        </div>

        {/* Profile Image */}
        <div className="flex flex-col items-center mt-10 gap-4">
          <img
            src={
              user.image?.startsWith("http")
                ? user.image
                : `http://localhost:3000/${user.image}`
            }
            className="w-36 h-36 rounded-full object-cover"
            alt="profile"
          />

          <button
            onClick={() => navigate("/editprofile")}
            className="px-6 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition"
          >
            Edit Profile
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-10 px-8 space-y-8 pb-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-lg mt-1">{user.username}</p>
            </div>
            <FiEdit2 className="text-gray-400" />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">About</p>
              <p className="text-md mt-1">{user.about || "—"}</p>
            </div>
            <FiEdit2 className="text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            <FiPhone className="text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-md mt-1">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/changepassword")}
            className="
              w-full px-4 py-3 rounded-xl
              bg-[#01010121]
              font-medium
              hover:bg-[#0a080852]
              transition duration-200
            "
          >
            Change Password
          </button>
        </div>
      </div>

      {/* ================= Right Section (NO SCROLL) ================= */}
      <div className="hidden md:flex w-[76%] bg-[#f7f5f3] flex-col items-center justify-center">
        <img src="/profile2.png" className="w-16 h-16" alt="profile icon" />
        <h1 className="text-[28px] font-bold">Profile</h1>
      </div>
    </div>
  );
};
