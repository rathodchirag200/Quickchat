import axios from "axios";
import React from "react";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export const ChangePassword = () => {
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    oldpassword: Yup.string().required("Old password is required"),
    newpassword: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("New password is required"),
    confirmpassword: Yup.string()
      .oneOf([Yup.ref("newpassword")], "Passwords do not match")
      .required("Confirm password is required"),
  });

  const initialValues = {
    oldpassword: "",
    newpassword: "",
    confirmpassword: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:3000/api/changepassword", values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Password changed successfully");
      resetForm();
      navigate("/profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f0f2f5]">
      <div className="w-full md:w-[24%]  md:min-w-[320px] md:shrink-0 bg-white border-r border-gray-300 flex flex-col">
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200">
          <NavLink to="/profile">
            <FiArrowLeft className="text-xl text-gray-600 cursor-pointer" />
          </NavLink>
          <h2 className="text-lg font-semibold text-gray-800">
            Change Password
          </h2>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-6 px-8 mt-10">
              <div>
                <label className="text-sm text-gray-600">Old Password</label>
                <Field
                  type="password"
                  name="oldpassword"
                  placeholder="Enter current password"
                  className="
                    w-full mt-2 px-4 py-3 rounded-xl
                    border border-gray-300
                    outline-none
                    focus:border-green-500
                    focus:ring-2 focus:ring-green-500/30
                  "
                />
                <ErrorMessage
                  name="oldpassword"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">New Password</label>
                <Field
                  type="password"
                  name="newpassword"
                  placeholder="Enter new password"
                  className="
                    w-full mt-2 px-4 py-3 rounded-xl
                    border border-gray-300
                    outline-none
                    focus:border-green-500
                    focus:ring-2 focus:ring-green-500/30
                  "
                />
                <ErrorMessage
                  name="newpassword"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  name="confirmpassword"
                  placeholder="Confirm new password"
                  className="
                    w-full mt-2 px-4 py-3 rounded-xl
                    border border-gray-300
                    outline-none
                    focus:border-green-500
                    focus:ring-2 focus:ring-green-500/30
                  "
                />
                <ErrorMessage
                  name="confirmpassword"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  mt-4 px-6 py-3 rounded-full
                  bg-green-500 text-white font-medium
                  hover:bg-green-600
                  transition
                  disabled:opacity-50
                "
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="hidden w-[76%] bg-[#f7f5f3] md:flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
          <FiLock className="text-4xl text-gray-300" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800">
          Secure Your Account
        </h1>
        <p className="mt-2 text-gray-500 max-w-sm">
          Changing your password regularly helps keep your account safe.
        </p>
      </div>
    </div>
  );
};
