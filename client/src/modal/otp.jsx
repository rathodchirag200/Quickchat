import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const Otpmodal = ({ email, onClose }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}api/verify`, {
        email,
        otp,
      });

      toast.success("OTP verified successfully");
      onClose();
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);

    try {
      await axios.post(`${API_URL}api/resend`, { email });
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40  flex items-center justify-center z-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-[#075E54] text-white text-center py-4">
          <h2 className="text-lg font-semibold">Verify your number</h2>
          <p className="text-sm opacity-80 mt-1">Quick Chat security</p>
        </div>

        <div className="p-6">
          <p className="text-center text-sm text-gray-600 mb-5">
            Enter the OTP sent to <br />
            <span className="font-medium text-black">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              maxLength="4"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[0.6em] px-4 py-3 border rounded-md  outline-none"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3 rounded-md font-medium transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            Didn’t receive OTP?{" "}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-[#25D366] font-medium hover:underline disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full text-sm text-gray-500 hover:text-black transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
