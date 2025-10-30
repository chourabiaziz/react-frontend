const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function register(body) {
  const r = await fetch(`${API}/auth/register`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
  const js = await r.json(); if (!r.ok) throw js; if (js.access_token) localStorage.setItem("token", js.access_token); return js;
}

export async function login(body) {
  const r = await fetch(`${API}/auth/login`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
  const js = await r.json(); if (!r.ok) throw js; if (js.access_token) localStorage.setItem("token", js.access_token); return js;
}

export async function me() {
  const r = await fetch(`${API}/me`, { headers: { ...authHeaders() } }); return r.json();
}

export async function runSparql(q) {
  const r = await fetch(`${API}/sparql`, { method:"POST", headers:{ "Content-Type":"application/json", ...authHeaders() }, body: JSON.stringify({ q }) });
  const js = await r.json(); if (!r.ok) throw js; return js;
}

export async function getInspectors() {
  const r = await fetch(`${API}/inspectors`, { headers:{ ...authHeaders() } });
  const js = await r.json(); if (!r.ok) throw js; return js;
}

export async function createInspector(body) {
  const r = await fetch(`${API}/inspectors`, { method:"POST", headers:{ "Content-Type":"application/json", ...authHeaders() }, body: JSON.stringify(body) });
  const js = await r.json(); if (!r.ok) throw js; return js;
}

export async function updateInspector(id, body) {
  const r = await fetch(`${API}/inspectors/${id}`, { method:"PUT", headers:{ "Content-Type":"application/json", ...authHeaders() }, body: JSON.stringify(body) });
  const js = await r.json(); if (!r.ok) throw js; return js;
}

export async function deleteInspector(id) {
  const r = await fetch(`${API}/inspectors/${id}`, { method:"DELETE", headers:{ ...authHeaders() } });
  const js = await r.json(); if (!r.ok) throw js; return js;
}


