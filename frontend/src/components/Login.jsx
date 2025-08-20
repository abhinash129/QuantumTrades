// import React, { useState } from "react";
// import { login, registerUser } from "../auth";

// export default function Login({ onLogin }) {
//   const [isRegister, setIsRegister] = useState(false);
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [err, setErr] = useState("");

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr("");
//     try {
//       if (isRegister) {
//         await registerUser({ username, email, password });
//       }
//       const token = await login(username, password);
//       onLogin(token);
//     } catch (e) {
//       setErr(e.message || "Error");
//     }
//   };

//   return (
//     <div className="card">
//       <h2>{isRegister ? "Register" : "Login"}</h2>
//       <form onSubmit={submit}>
//         <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required/>
//         {isRegister && <input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>}
//         <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
//         {err && <div className="error">{err}</div>}
//         <button type="submit">{isRegister ? "Create account" : "Login"}</button>
//       </form>
//       <button className="link" onClick={()=>setIsRegister(!isRegister)}>
//         {isRegister ? "Have an account? Login" : "New here? Register"}
//       </button>
//     </div>
//   );
// }


// import React, { useState } from "react";
// import { login, registerUser } from "../auth";
// import "./Login.css";

// export default function Login({ onLogin }) {
//   const [isRegister, setIsRegister] = useState(false);
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [err, setErr] = useState("");

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr("");
//     try {
//       if (isRegister) {
//         await registerUser({ username, email, password });
//       }
//       const token = await login(username, password);
//       onLogin(token);
//     } catch (e) {
//       setErr(e.message || "Error");
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="card">
//         <h2>{isRegister ? "Register" : "Login"}</h2>
//         <form onSubmit={submit}>
//           <input
//             placeholder="Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             required
//           />
//           {isRegister && (
//             <input
//               placeholder="Email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           )}
//           <input
//             placeholder="Password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           {err && <div className="error">{err}</div>}
//           <button type="submit">
//             {isRegister ? "Create account" : "Login"}
//           </button>
//         </form>
//         <button className="link" onClick={() => setIsRegister(!isRegister)}>
//           {isRegister ? "Have an account? Login" : "New here? Register"}
//         </button>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { login, registerUser } from "../auth";
import "./Login.css";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ validation function
  const validate = () => {
    const errs = {};
    if (!username || username.trim().length < 3) {
      errs.username = "Username must be at least 3 characters";
    }
    if (isRegister) {
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        errs.email = "Valid email is required";
      }
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!validate()) return;

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
    <div className="login-container">
      <div className="card">
        <h2>{isRegister ? "Register" : "Login"}</h2>
        <form onSubmit={submit}>
          {/* Username */}
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={errors.username ? "error-input" : ""}
            required
          />
          {errors.username && <div className="error">{errors.username}</div>}

          {/* Email (only if Register) */}
          {isRegister && (
            <>
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "error-input" : ""}
                required
              />
              {errors.email && <div className="error">{errors.email}</div>}
            </>
          )}

          {/* Password */}
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? "error-input" : ""}
            required
          />
          {errors.password && <div className="error">{errors.password}</div>}

          {/* API Error */}
          {err && <div className="error">{err}</div>}

          <button type="submit">
            {isRegister ? "Create account" : "Login"}
          </button>
        </form>

        {/* Toggle */}
        <button className="link" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Have an account? Login" : "New here? Register"}
        </button>
      </div>
    </div>
  );
}
