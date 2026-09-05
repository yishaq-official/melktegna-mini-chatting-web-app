import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SetAvatar from "./pages/SetAvatar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Landing from "./pages/Landing";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setAvatar" element={<SetAvatar />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}