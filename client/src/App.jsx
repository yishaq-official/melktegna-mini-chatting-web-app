import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SetAvatar from "./pages/SetAvatar";
import Register from "./pages/Register";
import Login from "./pages/Login"; // <-- Import Login
import Chat from "./pages/Chat";
import Landing from "./pages/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} /> {/* <-- Add Route */}
        <Route path="/setAvatar" element={<SetAvatar />} />
        <Route path="/chat" element={<Chat />} />
        {/* We will add Chat route next */}
      </Routes>
    </BrowserRouter>
  );
}