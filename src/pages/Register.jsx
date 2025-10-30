import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, me } from "../api";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register({ name, email, password });
      const profile = await me();
      localStorage.setItem("profile", JSON.stringify(profile));
      nav("/inspectors");
    } catch (e) {
      setError(e?.error || "Registration failed");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card">
        <div className="card-body">
          <h2 style={{ marginTop: 0 }}>Create account</h2>
          <p className="muted" style={{ marginTop: 4 }}>Register to get started</p>
          {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
          <form onSubmit={onSubmit} className="grid" style={{ marginTop: 12 }}>
            <div>
              <div className="label">Name</div>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div>
              <div className="label">Email</div>
              <input className="input" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <div className="label">Password</div>
              <input className="input" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
            </div>
            <div className="hstack" style={{ justifyContent: "space-between", marginTop: 8 }}>
              <Link className="link" to="/login">Already have an account?</Link>
              <button className="btn" type="submit">Register</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


