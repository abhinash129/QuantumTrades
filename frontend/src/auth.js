// import { jwtDecode } from "jwt-decode";
// import { api } from "./api";

// export async function login(username, password) {
//   const form = new URLSearchParams();
//   form.append("username", username);
//   form.append("password", password);
//   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/auth/login`, {
//     method: "POST",
//     body: form
//   });
//   if (!res.ok) throw new Error(await res.text());
//   const data = await res.json();
//   localStorage.setItem("token", data.access_token);
//   return data.access_token;
// }

// export async function registerUser({ username, email, password }) {
//   return api("/auth/register", { method: "POST", body: { username, email, password } });
// }

// export function getToken() {
//   return localStorage.getItem("token");
// }

// export function getUser() {
//   const token = getToken();
//   if (!token) return null;
//   try { return jwtDecode(token); } catch { return null; }
// }

// export function logout() {
//   localStorage.removeItem("token");
// }




// import { jwtDecode } from "jwt-decode";
// import { api } from "./api";

// export async function login(username, password) {
//   const form = new URLSearchParams();
//   form.append("username", username);
//   form.append("password", password);
//   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/auth/login`, {
//     method: "POST",
//     body: form
//   });
//   if (!res.ok) throw new Error(await res.text());
//   const data = await res.json();
//   localStorage.setItem("token", data.access_token);
//   return data.access_token;
// }

// export async function registerUser({ username, email, password }) {
//   return api("/auth/register", { method: "POST", body: { username, email, password } });
// }

// export function getToken() {
//   return localStorage.getItem("token");
// }

// export function getUser() {
//   const token = getToken();
//   if (!token) return null;
//   try {
//     return jwtDecode(token);
//   } catch {
//     return null;
//   }
// }

// export function hasRole(role) {
//   const user = getUser();
//   if (!user) return false;

//   // support both { role: "admin" } and { roles: ["admin","user"] }
//   if (user.role) return user.role === role;
//   if (Array.isArray(user.roles)) return user.roles.includes(role);

//   return false;
// }

// export function logout() {
//   localStorage.removeItem("token");
// }




// src/auth.js
import { jwtDecode } from "jwt-decode";
import { api } from "./api";

export async function login(username, password) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/auth/login`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  localStorage.setItem("token", data.access_token);
  return data.access_token;
}

export async function registerUser({ username, email, password }) {
  return api("/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
}

/* ✅ Role helper */
export function hasRole(role) {
  const user = getUser();
  if (!user || !user.role) return false;
  return user.role === role;
}
