import { useState } from "react";
import { runSparql } from "../api";
import { Link } from "react-router-dom";

export default function Query() {
  const [q, setQ] = useState(
    "PREFIX : <http://example.org/waste#>\n" +
      "SELECT ?type (SUM(?qty) AS ?total)\n" +
      "WHERE { ?w a :Waste ; :hasType/:name ?type ; :hasQuantity ?qty . }\n" +
      "GROUP BY ?type ORDER BY DESC(?total)"
  );
  const [res, setRes] = useState(null);
  const [error, setError] = useState("");

  async function onRun(e) {
    e.preventDefault();
    setError("");
    try {
      const js = await runSparql(q);
      setRes(js);
    } catch (e) {
      setError(e?.error || "SPARQL failed");
    }
  }

  function renderTable(r) {
    const vars = r?.head?.vars || [];
    const rows = r?.results?.bindings || [];
    if (!vars.length) return <div className="muted">No columns</div>;
    return (
      <table className="table" style={{ marginTop: 8 }}>
        <thead>
          <tr>
            {vars.map((v) => (
              <th key={v}>{v}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {vars.map((v) => (
                <td key={v}>{row[v]?.value ?? ""}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={vars.length} className="muted">No results</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  return (
    <div className="container">
      <div className="hstack" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>SPARQL Query</h2>
        <div className="spacer" />
        <Link className="btn secondary" to="/inspectors">Inspectors</Link>
      </div>

      {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <form onSubmit={onRun} className="grid" style={{ gap: 12 }}>
            <div>
              <div className="label">SPARQL</div>
              <textarea className="textarea" value={q} onChange={e=>setQ(e.target.value)} rows={10} />
            </div>
            <div className="hstack" style={{ justifyContent: "flex-end" }}>
              <button className="btn" type="submit">Run</button>
            </div>
          </form>
        </div>
      </div>

      {res && (
        <div className="card">
          <div className="card-body">
            <div className="label">Results</div>
            {renderTable(res)}
            <details style={{ marginTop: 8 }}>
              <summary>Raw JSON</summary>
              <pre style={{ background: "#0b1220", border: "1px solid var(--border)", borderRadius: 10, padding: 10, overflow: "auto" }}>
                {JSON.stringify(res, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}


