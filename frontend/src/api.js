const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function api(path, { method="GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.headers.get("content-type")?.includes("application/json") ? res.json() : res.text();
}

export function wsUrl(path="/ws") {
  const base = API_BASE.replace(/^http/, "ws");
  return `${base}${path}`;
}
