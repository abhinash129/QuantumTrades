import React, { useState } from "react";
import { login, registerUser } from "../auth";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (isRegister) {
        await registerUser({ username, email, password });
      }
      const token = await login(username, password);
      onLogin(token);
    } catch (e) {
      setErr(e.message || "Error");
    }
  };

  return (
    <div className="card">
      <h2>{isRegister ? "Register" : "Login"}</h2>
      <form onSubmit={submit}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required/>
        {isRegister && <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>}
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        {err && <div className="error">{err}</div>}
        <button type="submit">{isRegister ? "Create account" : "Login"}</button>
      </form>
      <button className="link" onClick={()=>setIsRegister(!isRegister)}>
        {isRegister ? "Have an account? Login" : "New here? Register"}
      </button>
    </div>
  );
}
