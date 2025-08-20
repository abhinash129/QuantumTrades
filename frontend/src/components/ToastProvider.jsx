// import React, { createContext, useContext, useState, useCallback } from "react";

// const ToastCtx = createContext({ notify: () => {} });
// export const useToast = () => useContext(ToastCtx);

// export function ToastProvider({ children }) {
//   const [toasts, setToasts] = useState([]);

//   const notify = useCallback((message, type = "info") => {
//     const id = `${Date.now()}-${Math.random()}`;
//     setToasts((t) => [...t, { id, message, type }]);
//     setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
//   }, []);

//   return (
//     <ToastCtx.Provider value={{ notify }}>
//       {children}
//       <div className="toasts">
//         {toasts.map((t) => (
//           <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
//         ))}
//       </div>
//     </ToastCtx.Provider>
//   );
// }


// src/components/ToastProvider.jsx
import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
