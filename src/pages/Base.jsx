 import React from "react";
import { Link } from "react-router-dom";

const Base = ({ children, title }) => {
  return (
    <div className="sparql-container">
    <header className="header">
  <div className="header-content">
    <div className="logo">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
      <h1>{title || "SPARQL App"}</h1>
    </div>
    <p className="subtitle">Votre interface SPARQL moderne</p>
    
    {/* Boutons sur une seule ligne */}
    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
      <Link to="/">
        <button className="btn btn-secondary">Accueil</button>
      </Link>
      <Link to="/chat">
        <button className="btn btn-secondary">Chat</button>
      </Link>
      <Link to="/dechets">
        <button className="btn btn-secondary">Dechets</button>
      </Link>
    </div>
  </div>
    </header>


      <main className="content">{children}</main>

      <style >{`
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
  );
};

export default Base;
