import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useChat } from "../context/ChatContext";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

export const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useChat();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/login", form);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const res = await axios.post("http://localhost:3000/api/google-login", {
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
    <div className="min-h-screen flex items-center justify-center bg-[#ECE5DD] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#075E54] text-white text-center py-6">
          <img src="/logo2.png" className="w-14 mx-auto mb-2" />
          <h2 className="text-xl font-semibold">Quick Chat</h2>
          <p className="text-sm opacity-80">Login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md border focus:outline-none "
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-md border focus:outline-none "
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3 rounded-md font-medium transition"
          >
            {loading ? "Logging in..." : "Login"}
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

        <div className="text-center text-sm text-gray-600 pb-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#25D366] font-medium">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};
