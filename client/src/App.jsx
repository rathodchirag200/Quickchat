import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Otpmodal } from "./modal/otp";
import { ToastContainer } from "react-toastify";
import { Profile } from "./pages/profile";
import { EditProfile } from "./pages/editprofile";
import { ChangePassword } from "./pages/chnage";
import { Chatwindow } from "./pages/chatwindow";
import { SidebarLayout } from "./layout/sidevbarlayout";
import { Dashboard } from "./pages/dashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otpmodal />} />

          <Route path="/" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/editprofile" element={<EditProfile />} />
        <Route path="/changepassword" element={<ChangePassword />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
