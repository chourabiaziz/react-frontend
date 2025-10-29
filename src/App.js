import React, { useState } from "react";

function SparqlQA() {
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
        console.error("Erreur backend:", errText);
        throw new Error(`Erreur backend: ${errText}`);
      }

      const json = await response.json();

      // ✅ Vérifie que la réponse Fuseki est bien au format attendu
      if (json.results && json.results.bindings) {
        setResults(json.results.bindings);
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

  // Fonction pour tester une requête SPARQL directement
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
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🧠 Explorateur Sémantique des Déchets</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Posez votre question en français (ex: Quels sont les types de déchets?)"
          style={{
            width: "60%",
            padding: "8px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 12px",
            backgroundColor: loading ? "#6c757d" : "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            marginRight: "10px",
          }}
        >
          {loading ? "⏳" : "🔍"} Exécuter
        </button>
        
        <button
          type="button"
          onClick={testSparqlDirectly}
          disabled={loading}
          style={{
            padding: "8px 12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          🧪 Test SPARQL
        </button>
      </form>

      {loading && <p>⏳ Chargement...</p>}
      {errorMsg && (
        <div style={{ color: "red", marginTop: "10px", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "6px" }}>
          <strong>❌ Erreur:</strong> {errorMsg}
        </div>
      )}

      {sparqlQuery && (
        <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
          <strong>📋 Requête SPARQL générée:</strong>
          <pre style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>{sparqlQuery}</pre>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>📊 Résultats ({results.length})</h3>
          <table
            border="1"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                {Object.keys(results[0]).map((key) => (
                  <th key={key} style={{ padding: "8px", textAlign: "left" }}>
                    {key.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={index}>
                  {Object.keys(item).map((key) => (
                    <td key={key} style={{ padding: "8px", border: "1px solid #ddd" }}>
                      {item[key]?.value || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length === 0 && !loading && !errorMsg && (
        <div style={{ marginTop: "20px", color: "#6c757d", textAlign: "center" }}>
          <p>💡 Posez une question ou testez la connexion SPARQL</p>
          <p style={{ fontSize: "12px" }}>
            Exemples: "Liste des déchets", "Types de matériaux recyclables", "Points de collecte"
          </p>
        </div>
      )}
    </div>
  );
}

export default SparqlQA;