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
 // ⬇️ add at bottom (or export alongside your other API helpers)
export function getOpenOrders() {
  return api("/orders?status=open"); // adjust if your backend uses another path
}

export function cancelOrder(orderId) {
  return api(`/orders/${orderId}`, { method: "DELETE" }); // adjust if backend differs
}
