import { Link, useNavigate } from "react-router-dom";

export default function Nav() {
  const nav = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    nav("/login");
  }
  const authed = !!localStorage.getItem("token");
  return (
    <div className="nav">
      <div className="nav-inner hstack">
        <div className="brand">Mini SemWeb</div>
        <div className="spacer" />
        {authed && (
          <div className="hstack" style={{ gap: 16 }}>
            <Link className="link" to="/inspectors">Inspectors</Link>
            <Link className="link" to="/query">Query</Link>
            <button className="btn secondary" onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}


