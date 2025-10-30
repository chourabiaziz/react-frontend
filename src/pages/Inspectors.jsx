import { useEffect, useState } from "react";
import { getInspectors, createInspector, updateInspector, deleteInspector, me } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Inspectors() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name:"", email:"", org:"" });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await me();
      setProfile(p);
      try {
        const list = await getInspectors();
        setRows(list);
      } catch (e) {
        setError(e?.error || "Failed to load inspectors");
      }
    })();
  }, []);

  function isAdmin() { return profile?.role === "admin"; }

  async function onCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await createInspector(form);
      setForm({ name:"", email:"", org:"" });
      const list = await getInspectors();
      setRows(list);
    } catch (e) {
      setError(e?.error || "Create failed");
    }
  }

  async function onDelete(id) {
    try {
      await deleteInspector(id);
      setRows(rows.filter(r => r.id !== id));
    } catch (e) {
      setError(e?.error || "Delete failed");
    }
  }

  async function onUpdate(r) {
    const name = prompt("Name", r.name);
    if (name == null) return;
    const email = prompt("Email", r.email);
    if (email == null) return;
    const org = prompt("Org", r.org || "");
    if (org == null) return;
    try {
      await updateInspector(r.id, { name, email, org });
      const list = await getInspectors();
      setRows(list);
    } catch (e) {
      setError(e?.error || "Update failed");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    nav("/login");
  }

  return (
    <div className="container">
      <div className="hstack" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Inspectors</h2>
        <div className="spacer" />
        <Link className="btn secondary" to="/query">Query</Link>
      </div>

      {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

      {isAdmin() && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <form onSubmit={onCreate} className="grid cols-4">
              <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({ ...form, name:e.target.value })} required />
              <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({ ...form, email:e.target.value })} required />
              <input className="input" placeholder="Org" value={form.org} onChange={e=>setForm({ ...form, org:e.target.value })} />
              <button className="btn" type="submit">Add</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Org</th>
                {isAdmin() && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.org}</td>
                  {isAdmin() && (
                    <td className="hstack" style={{ gap: 8 }}>
                      <button className="btn secondary" onClick={() => onUpdate(r)}>Edit</button>
                      <button className="btn danger" onClick={() => onDelete(r.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={isAdmin() ? 5 : 4} className="muted">No inspectors yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


