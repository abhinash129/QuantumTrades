import { jwtDecode } from "jwt-decode";
import { api } from "./api";

export async function login(username, password) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/auth/login`, {
    method: "POST",
    body: form
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data.access_token;
}

export async function registerUser({ username, email, password }) {
  return api("/auth/register", { method: "POST", body: { username, email, password } });
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const token = getToken();
  if (!token) return null;
  try { return jwtDecode(token); } catch { return null; }
}

export function logout() {
  localStorage.removeItem("token");
}
