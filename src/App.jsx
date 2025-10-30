import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Inspectors from "./pages/Inspectors";
import Query from "./pages/Query";
import Nav from "./components/Nav";

function isAuthed() {
  return !!localStorage.getItem("token");
}

function Protected({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inspectors" element={<Protected><Inspectors /></Protected>} />
        <Route path="/query" element={<Protected><Query /></Protected>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


