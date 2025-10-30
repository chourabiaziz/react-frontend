// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import SparqlQA from './SparqlQA';
import InfrastructureCRUD from './InfrastructureCRUD';
import ProcessusCRUD from './ProcessusCRUD';
import Chat from './pages/Chat';
import Base from './pages/Base';
import DechetsCRUD from './pages/DechetsCRUD';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="main-nav">
          <Link to="/" className="nav-link">🏠 Accueil</Link>
          <Link to="/qa" className="nav-link">Explorateur Sémantique (QA)</Link>
          <Link to="/infra" className="nav-link">Gestion des Infrastructures</Link>
          <Link to="/processus" className="nav-link">Gestion des Processus</Link>
          <Link to="/chat" className="nav-link">Chat</Link>
          <Link to="/dechets" className="nav-link">Gestion des Déchets</Link>
        </nav>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Base />} />
            <Route path="/qa" element={<SparqlQA />} />
            <Route path="/infra" element={<InfrastructureCRUD />} />
            <Route path="/processus" element={<ProcessusCRUD />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/dechets" element={<DechetsCRUD />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
