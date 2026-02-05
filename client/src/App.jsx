import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SetAvatar from "./pages/SetAvatar";
import Register from "./pages/Register";
import Login from "./pages/Login"; // <-- Import Login

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} /> {/* <-- Add Route */}
        <Route path="/setAvatar" element={<SetAvatar />} />
        {/* We will add Chat route next */}
      </Routes>
    </BrowserRouter>
  );
}