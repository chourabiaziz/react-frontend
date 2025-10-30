
import React, { useState } from 'react';
import SparqlQA from './SparqlQA';
import InfrastructureCRUD from './InfrastructureCRUD';
import ProcessusCRUD from './ProcessusCRUD'; // Importer le nouveau composant
import './App.css';

function App() {
  const [page, setPage] = useState('qa'); // 'qa', 'infra', ou 'processus'

  return (
    <div className="App">
      <nav className="main-nav">
        <button 
          onClick={() => setPage('qa')} 
          className={page === 'qa' ? 'active' : ''}
        >
          Explorateur Sémantique (QA)
        </button>
        <button 
          onClick={() => setPage('infra')} 
          className={page === 'infra' ? 'active' : ''}
        >
          Gestion des Infrastructures
        </button>
        <button 
          onClick={() => setPage('processus')} 
          className={page === 'processus' ? 'active' : ''}
        >
          Gestion des Processus
        </button>
      </nav>

      <div className="page-content">
        {page === 'qa' && <SparqlQA />}
        {page === 'infra' && <InfrastructureCRUD />}
        {page === 'processus' && <ProcessusCRUD />}
      </div>
    </div>
  );
}

export default App;
