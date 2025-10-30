import React, { useState } from "react";
import Base from "./Base";
 
function Chat() {
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sparqlQuery, setSparqlQuery] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setErrorMsg("");
    setSparqlQuery("");

    try {
      const response = await fetch("http://127.0.0.1:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erreur backend: ${errText}`);
      }

      const json = await response.json();

      if (json.answer_fallback) {
        setErrorMsg("");
        setResults([{ text_answer: json.text_answer }]);
        setSparqlQuery("");
        return;
      }

      if (json.results && json.results.bindings) {
        setResults(json.results.bindings);
        if (json.sparql_query) {
          setSparqlQuery(json.sparql_query);
        }
      } else {
        console.warn("Réponse inattendue:", json);
        setErrorMsg("Réponse inattendue du serveur SPARQL.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSparqlDirectly = async () => {
    const testQuery = `
PREFIX ex: <http://example.org/dechets#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?s ?p ?o WHERE {
  ?s ?p ?o .
} LIMIT 10
    `.trim();

    setLoading(true);
    setErrorMsg("");
    setResults([]);
    setSparqlQuery(testQuery);

    try {
      const response = await fetch("http://127.0.0.1:5000/test-sparql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: testQuery }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erreur: ${errText}`);
      }

      const json = await response.json();
      if (json.results && json.results.bindings) {
        setResults(json.results.bindings);
      } else {
        setErrorMsg("Réponse inattendue du serveur SPARQL.");
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Base title="Chat SPARQL">

    <div className="sparql-container">
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h1>Explorateur Sémantique des Déchets</h1>
          </div>
          <div className="subtitle">
            Interface de requête SPARQL intelligente
          </div>
        </div>
      </div>

      <div className="content">
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-group">
            <div className="input-wrapper">
              <svg className="input-icon" width="10" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Posez votre question en français (ex: Quels sont les types de déchets?)"
                className="search-input"
              />
            </div>
            <div className="button-group">
           
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary "
              >
                {loading ? (
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {loading ? "Traitement..." : "Exécuter"}
              </button>
              <button
                type="button"
                onClick={testSparqlDirectly}
                disabled={loading}
                className="btn btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Test SPARQL
              </button>
            </div>
          </div>
        </form>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>Analyse de votre requête en cours...</span>
          </div>
        )}

        {errorMsg && (
          <div className="error-card">
            <div className="error-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>Erreur de traitement</h3>
            </div>
            <p>{errorMsg}</p>
          </div>
        )}

        {sparqlQuery && (
          <div className="query-card">
            <div className="card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3>Requête SPARQL Générée</h3>
            </div>
            <pre className="query-code">{sparqlQuery}</pre>
          </div>
        )}

        {results.length > 0 && (
          <div className="results-card">
            <div className="card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 17L9 12L15 12L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 17L15 17L15 20L9 20L9 17Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 4L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4 8L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 12L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>Résultats ({results.length})</h3>
            </div>
            <div className="table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key}>{key.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, index) => (
                    <tr key={index}>
                      {Object.keys(item).map((key) => (
                        <td key={key}>
                          {item[key]?.value || item[key] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

{results.length === 0 && !loading && !errorMsg && (
  <div className="empty-state">
    <div className="empty-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <h3>Commencez votre exploration</h3>
    <p>Posez une question ou testez la connexion SPARQL</p>
    <div className="examples">
      <div className="example-tags">
        <span 
          className="tag" 
          onClick={() => {
            setQuestion("Liste des déchets");
            // Déclencher automatiquement la recherche après un court délai
            setTimeout(() => {
              document.querySelector('.btn-primary').click();
            }, 100);
          }}
        >
          Liste des déchets
        </span>
        <span 
          className="tag" 
          onClick={() => {
            setQuestion("Liste des déchets dangereux");
            setTimeout(() => {
              document.querySelector('.btn-primary').click();
            }, 100);
          }}
        >
          Liste des déchets dangereux
          </span>
        <span 
          className="tag" 
          onClick={() => {
            setQuestion("le nombre total  de déchets dangereux");
            setTimeout(() => {
              document.querySelector('.btn-primary').click();
            }, 100);
          }}
        >
le nombre total  de déchets dangereux
          </span>
      </div>
    </div>
  </div>
)}
      </div>

      <style jsx>{`
        .sparql-container {
          min-height: 100vh;
          background: #0f0f0f;
          color: #e0e0e0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          background: #1a1a1a;
          border-bottom: 1px solid #2a2a2a;
          padding: 1.5rem 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .logo svg {
          color: #10b981;
        }

        .logo h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f8fafc;
          margin: 0;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .search-form {
          margin-bottom: 2rem;
        }

        .input-group {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .input-wrapper {
          position: relative;
          flex: 1;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          background: #1a1a1a;
          border: 1px solid #374151;
          border-radius: 0.75rem;
          color: #f8fafc;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #10b981;
          color: white;
          margin-left: 0.5rem;
        }

        .btn-primary:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #374151;
          color: #e5e7eb;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #4b5563;
          transform: translateY(-1px);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-state {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: #1a1a1a;
          border: 1px solid #374151;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #374151;
          border-top: 2px solid #10b981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-card {
          background: #1a1a1a;
          border: 1px solid #ef4444;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .error-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .error-header svg {
          color: #ef4444;
        }

        .error-header h3 {
          margin: 0;
          color: #ef4444;
          font-size: 1rem;
          font-weight: 600;
        }

        .query-card, .results-card {
          background: #1a1a1a;
          border: 1px solid #374151;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: #1f2937;
          border-bottom: 1px solid #374151;
        }

        .card-header svg {
          color: #10b981;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #f8fafc;
        }

        .query-code {
          padding: 1.5rem;
          margin: 0;
          background: #111827;
          color: #e5e7eb;
          font-size: 0.75rem;
          line-height: 1.5;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .table-container {
          overflow-x: auto;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }

        .results-table th {
          background: #1f2937;
          padding: 0.875rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #f8fafc;
          border-bottom: 1px solid #374151;
        }

        .results-table td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #374151;
          color: #d1d5db;
        }

        .results-table tr:hover {
          background: #1f2937;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }

        .empty-icon {
          margin-bottom: 1.5rem;
        }

        .empty-icon svg {
          color: #374151;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #94a3b8;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .empty-state p {
          margin: 0 0 2rem 0;
          font-size: 0.875rem;
        }

        .examples {
          display: inline-block;
        }

        .example-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tag {
          padding: 0.5rem 0.75rem;
          background: #1a1a1a;
          border: 1px solid #374151;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          color: #94a3b8;
          transition: all 0.2s;
        }

        .tag:hover {
          border-color: #10b981;
          color: #10b981;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .content {
            padding: 1rem;
          }

          .input-group {
            flex-direction: column;
          }

          .button-group {
            width: 100%;
          }

          .btn {
            flex: 1;
            justify-content: center;
          }

          .example-tags {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
    </Base>
  );
}

export default Chat;