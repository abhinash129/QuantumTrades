// import React, { useState } from "react";
// import Login from "./components/Login";
// import Dashboard from "./components/Dashboard";
// import { getToken, logout } from "./auth";

// export default function App() {
//   const [token, setToken] = useState(getToken());

//   return (
//     <div className="container">
//       {!token ? (
//         <Login onLogin={setToken} />
//       ) : (
//         <Dashboard token={token} onLogout={() => { logout(); setToken(null); }} />
//       )}
//     </div>
//   );
// }


import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { getToken, logout } from "./auth";
import { ToastProvider } from "./components/ToastProvider";

export default function App() {
  const [token, setToken] = useState(getToken());

  return (
    <ToastProvider>
      <div className="container">
        {!token ? (
          <Login onLogin={setToken} />
        ) : (
          <Dashboard
            token={token}
            onLogout={() => {
              logout();
              setToken(null);
            }}
          />
        )}
      </div>
    </ToastProvider>
  );
}
