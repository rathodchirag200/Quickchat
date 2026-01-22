import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Otpmodal } from "../modal/otp";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { useChat } from "../context/chatcontext";

export const Register = () => {
  const navigate = useNavigate();
  const { setToken } = useChat();
      const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("image", form.image);

      const res = await axios.post(
        `${API_URL}api/register`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      toast.success("OTP sent to your email");
      setOtpEmail(form.email);
      setShowOtp(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await axios.post(`${API_URL}api/google-login`, {
        email: user.email,
        username: user.displayName,
        image: user.photoURL,
        firebaseUID: user.uid,
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      toast.success("Google login successful");
      navigate("/");
    } catch (error) {
      toast.error("Google login failed");
    }
  };

  return (
    <div className="bg-[#ECE5DD] min-h-screen px-4 py-8">
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="bg-[#075E54] text-white text-center py-6">
            <img src="/logo2.png" className="w-14 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Quick Chat</h2>
            <p className="text-sm opacity-80">Create your account</p>
          </div>

          {/* Image Upload */}
          <div className="flex justify-center mt-6">
            <label className="cursor-pointer text-center">
              <div className="w-24 h-24 rounded-full border-2 border-[#25D366] overflow-hidden flex items-center justify-center bg-gray-100 mx-auto">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">Photo</span>
                )}
              </div>
              <span className="block text-[#25D366] text-sm mt-2">
                Upload photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <input
              type="text"
              name="username"
              placeholder="Full name"
              value={form.username}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-md border outline-none"
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-md border outline-none"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="px-4 py-3 rounded-md border outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3 rounded-md font-medium transition"
            >
              {loading ? "Please wait..." : "Sign Up"}
            </button>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="flex-1 h-px bg-gray-300" />
              OR
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              className="flex items-center justify-center gap-3 border rounded-md py-3 hover:bg-gray-50 transition"
            >
              <img src="/google.png" className="w-5 h-5" />
              Continue with Google
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 pb-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#25D366] font-medium">
              Login
            </Link>
          </div>

          {/* OTP Modal */}
          {showOtp && (
            <Otpmodal email={otpEmail} onClose={() => setShowOtp(false)} />
          )}

        </div>
      </div>
    </div>
  );

};
