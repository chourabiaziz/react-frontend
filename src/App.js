// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Base from "./pages/Base";
import DechetsCRUD from "./pages/DechetsCRUD";
 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Base/> } />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dechets" element={<DechetsCRUD />} />
      </Routes>
    </Router>
  );
}

export default App;
