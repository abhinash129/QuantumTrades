// import React, { useEffect, useState, useRef } from "react";
// import { api, wsUrl } from "../api";
// import OrderForm from "./OrderForm";
// import OrderBook from "./OrderBook";
// import TradeHistory from "./TradeHistory";
// import OpenOrders from "./OpenOrders";


// export default function Dashboard({ token, onLogout }) {
//   const [orders, setOrders] = useState([]);
//   const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
//   const [trades, setTrades] = useState([]);
//   const wsRef = useRef(null);

//   const refresh = async () => {
//     const myOrders = await api("/orders", { token });
//     setOrders(myOrders);
//   };

//   useEffect(() => {
//     refresh();
//     const ws = new WebSocket(wsUrl("/ws"));
//     wsRef.current = ws;
//     ws.onmessage = (ev) => {
//       try {
//         const msg = JSON.parse(ev.data);
//         if (msg.type === "snapshot") {
//           setOrderbook(msg.orderbook || {bids:[],asks:[]});
//           setTrades(msg.trades || []);
//         }
//       } catch {}
//     };
//     ws.onopen = () => ws.send("hi");
//     return () => ws.close();
//   }, [token]);

//   const cancel = async (id) => {
//     await api(`/orders/${id}`, { method: "DELETE", token });
//     refresh();
//   };

//   return (
//     <div>
//       <div className="topbar">
//         <h2>QuantumTrades</h2>
//         <button onClick={onLogout}>Logout</button>
//       </div>

//       <div className="grid">
//         <OrderForm token={token} onPlaced={refresh}/>
//         <OrderBook orderbook={orderbook}/>
//       </div>

//       <div className="grid">
//         <div className="card">
//           <h3>My Orders</h3>
//           <table>
//             <thead><tr><th>ID</th><th>Side</th><th>Type</th><th>Price</th><th>Qty</th><th>Remaining</th><th>Active</th><th></th></tr></thead>
//             <tbody>
//               {orders.map(o => (
//                 <tr key={o.id}>
//                   <td>{o.id}</td>
//                   <td>{o.side}</td>
//                   <td>{o.type}</td>
//                   <td>{o.price?.toFixed?.(2)}</td>
//                   <td>{o.quantity}</td>
//                   <td>{o.remaining}</td>
//                   <td>{o.is_active ? "Yes" : "No"}</td>
//                   <td>{o.is_active && <button onClick={()=>cancel(o.id)}>Cancel</button>}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <TradeHistory trades={trades}/>
//       </div>
//     </div>
//   );
// }





// import React, { useEffect, useState, useRef } from "react";
// import { api, wsUrl } from "../api";
// import OrderForm from "./OrderForm";
// import OrderBook from "./OrderBook";
// import TradeHistory from "./TradeHistory";
// import { getUser, hasRole } from "../auth";

// export default function Dashboard({ token, onLogout }) {
//   const [orders, setOrders] = useState([]);
//   const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
//   const [trades, setTrades] = useState([]);
//   const [toast, setToast] = useState(null); // ✅ toast state
//   const wsRef = useRef(null);

//   const showToast = (msg, type = "info") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   const refresh = async () => {
//     try {
//       const myOrders = await api("/orders", { token });
//       setOrders(myOrders);
//     } catch (e) {
//       showToast("Failed to load orders", "error");
//     }
//   };

//   useEffect(() => {
//     refresh();
//     const ws = new WebSocket(wsUrl("/ws"));
//     wsRef.current = ws;
//     ws.onmessage = (ev) => {
//       try {
//         const msg = JSON.parse(ev.data);
//         if (msg.type === "snapshot") {
//           setOrderbook(msg.orderbook || { bids: [], asks: [] });
//           setTrades(msg.trades || []);
//         }
//       } catch {}
//     };
//     ws.onopen = () => ws.send("hi");
//     return () => ws.close();
//   }, [token]);

//   const cancel = async (id) => {
//     try {
//       await api(`/orders/${id}`, { method: "DELETE", token });
//       refresh();
//       showToast("Order cancelled", "success");
//     } catch {
//       showToast("Failed to cancel order", "error");
//     }
//   };

//   const user = getUser();
//   const isAdmin = hasRole("admin");

//   return (
//     <div>
//       <div className="topbar">
//         <h2>QuantumTrades</h2>
//         <div className="user-info">
//           {user && <span>Welcome, {user.username || "User"}</span>}
//           <button onClick={onLogout}>Logout</button>
//         </div>
//       </div>

//       <div className="grid">
//         <OrderForm token={token} onPlaced={refresh}/>
//         <OrderBook orderbook={orderbook}/>
//       </div>

//       <div className="grid">
//         <div className="card">
//           <h3>My Orders</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th><th>Side</th><th>Type</th>
//                 <th>Price</th><th>Qty</th><th>Remaining</th>
//                 <th>Active</th><th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map(o => (
//                 <tr key={o.id}>
//                   <td>{o.id}</td>
//                   <td>{o.side}</td>
//                   <td>{o.type}</td>
//                   <td>{o.price?.toFixed?.(2)}</td>
//                   <td>{o.quantity}</td>
//                   <td>{o.remaining}</td>
//                   <td>{o.is_active ? "Yes" : "No"}</td>
//                   <td>{o.is_active && <button onClick={()=>cancel(o.id)}>Cancel</button>}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <TradeHistory trades={trades}/>
//       </div>

//       {/* ✅ Admin-only section */}
//       {isAdmin && (
//         <div className="card">
//           <h3>Admin Panel</h3>
//           <p>Welcome Admin. Here you can manage users, monitor trades, etc.</p>
//         </div>
//       )}

//       {/* ✅ Toast notifications */}
//       {toast && (
//         <div className={`toast ${toast.type}`}>
//           {toast.msg}
//         </div>
//       )}
//     </div>
//   );
// }


// src/components/Dashboard.jsx
// import React, { useEffect, useState, useRef } from "react";
// import { api, wsUrl } from "../api";
// import OrderForm from "./OrderForm";
// import OrderBook from "./OrderBook";
// import TradeHistory from "./TradeHistory";
// import { getUser, hasRole } from "../auth";
// import { useToast } from "./ToastProvider";

// export default function Dashboard({ token, onLogout }) {
//   const [orders, setOrders] = useState([]);
//   const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
//   const [trades, setTrades] = useState([]);
//   const [confirmCancel, setConfirmCancel] = useState(null);
//   const wsRef = useRef(null);

//   const showToast = useToast();

//   const refresh = async () => {
//     try {
//       const myOrders = await api("/orders", { token });
//       setOrders(myOrders);
//     } catch {
//       showToast("Failed to load orders", "error");
//     }
//   };

//   useEffect(() => {
//     refresh();
//     const ws = new WebSocket(wsUrl("/ws"));
//     wsRef.current = ws;
// ws.onmessage = (ev) => {
//   try {
//     const msg = JSON.parse(ev.data);

//     if (msg.type === "snapshot") {
//       setOrderbook(msg.orderbook || { bids: [], asks: [] });
//       setTrades(msg.trades || []);
//     }

//     if (msg.type === "trade") {
//       showToast(`New trade: ${msg.side} ${msg.qty} @ ${msg.price}`, "info");
//     }

//     if (msg.type === "order_update") {
//       showToast(
//         `Order #${msg.order_id} was ${msg.status}`,
//         msg.status === "filled" ? "success" : "info"
//       );
//       refresh();
//     }
//   } catch {}
// };

//     ws.onopen = () => ws.send("hi");
//     return () => ws.close();
//   }, [token]);

//   // const cancelConfirmed = async (id) => {
//   //   try {
//   //     await api(`/orders/${id}`, { method: "DELETE", token });
//   //     refresh();
//   //     showToast("Order cancelled", "success");
//   //   } catch {
//   //     showToast("Failed to cancel order", "error");
//   //   }
//   //   setConfirmCancel(null);
//   // };
//   const cancelConfirmed = async (id) => {
//   try {
//     await api(`/orders/${id}`, { method: "DELETE", token });
//     // ❌ don’t showToast here — WebSocket will handle the notification
//     refresh();
//   } catch {
//     showToast("Failed to cancel order", "error");
//   }
//   setConfirmCancel(null);
// };


//   const user = getUser();
//   const isAdmin = hasRole("admin");

//   return (
//     <div>
//       <div className="topbar">
//         <h2>QuantumTrades</h2>
//         <div className="user-info">
//           {user && (
//             <span>
//               Welcome, {user.username || "User"} ({user.role || "user"})
//             </span>
//           )}
//           <button onClick={onLogout}>Logout</button>
//         </div>
//       </div>

//       <div className="grid">
//         <OrderForm token={token} onPlaced={refresh} />
//         <OrderBook orderbook={orderbook} />
//       </div>

//       <div className="grid">
//         <div className="card">
//           <h3>My Orders</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Side</th>
//                 <th>Type</th>
//                 <th>Price</th>
//                 <th>Qty</th>
//                 <th>Remaining</th>
//                 <th>Active</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((o) => (
//                 <tr key={o.id}>
//                   <td>{o.id}</td>
//                   <td>{o.side}</td>
//                   <td>{o.type}</td>
//                   <td>{o.price?.toFixed?.(2)}</td>
//                   <td>{o.quantity}</td>
//                   <td>{o.remaining}</td>
//                   <td>{o.is_active ? "Yes" : "No"}</td>
//                   <td>
//                     {o.is_active && (
//                       <button
//                         className="btn danger"
//                         onClick={() => setConfirmCancel(o.id)}
//                       >
//                         Cancel
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <TradeHistory trades={trades} />
//       </div>

//       {/* ✅ Admin-only section */}

// {isAdmin && (
//   <div className="card">
//     <h3>Admin Panel</h3>
//     <p>Welcome Admin. Manage users and monitor trades below:</p>

//     <button className="btn" onClick={async () => {
//       try {
//         const allUsers = await api("/users", { token });
//         setUsers(allUsers);
//       } catch {
//         showToast("Failed to load users", "error");
//       }
//     }}>
//       Load Users
//     </button>

//     {users && users.length > 0 && (
//       <table style={{ marginTop: "16px", width: "100%" }}>
//         <thead>
//           <tr>
//             <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((u) => (
//             <tr key={u.id}>
//               <td>{u.id}</td>
//               <td>{u.username}</td>
//               <td>{u.email}</td>
//               <td>{u.role}</td>
//               <td>
//                 {/* 🔹 Delete User */}
//                 <button
//                   className="btn danger"
//                   onClick={async () => {
//                     if (!window.confirm(`Delete user ${u.username}?`)) return;
//                     try {
//                       await api(`/users/${u.id}`, { method: "DELETE", token });
//                       showToast("User deleted", "success");
//                       setUsers(users.filter((x) => x.id !== u.id));
//                     } catch {
//                       showToast("Failed to delete user", "error");
//                     }
//                   }}
//                 >
//                   Delete
//                 </button>

//                 {/* 🔹 Promote/Demote */}
//                 <button
//                   className="btn"
//                   style={{ marginLeft: "8px" }}
//                   onClick={async () => {
//                     try {
//                       const newRole = u.role === "admin" ? "user" : "admin";
//                       await api(`/users/${u.id}/role`, {
//                         method: "PUT",
//                         body: { role: newRole },
//                         token,
//                       });
//                       showToast(`User role updated to ${newRole}`, "success");
//                       setUsers(users.map(x => x.id === u.id ? { ...x, role: newRole } : x));
//                     } catch {
//                       showToast("Failed to update role", "error");
//                     }
//                   }}
//                 >
//                   {u.role === "admin" ? "Demote to User" : "Promote to Admin"}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     )}
//   </div>
// )}

//     </div>
//   );
// }



import React, { useEffect, useState, useRef } from "react";
import { api, wsUrl } from "../api";
import OrderForm from "./OrderForm";
import OrderBook from "./OrderBook";
import TradeHistory from "./TradeHistory";
import { getUser, hasRole } from "../auth";
import { useToast } from "./ToastProvider";
import ConfirmModal from "./ConfirmModal";

export default function Dashboard({ token, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [trades, setTrades] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const wsRef = useRef(null);

  const showToast = useToast();

  const refresh = async () => {
    try {
      const myOrders = await api("/orders", { token });
      setOrders(myOrders);
    } catch {
      showToast("Failed to load orders", "error");
    }
  };

  useEffect(() => {
    refresh();
    const ws = new WebSocket(wsUrl("/ws"));
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        if (msg.type === "snapshot") {
          setOrderbook(msg.orderbook || { bids: [], asks: [] });
          setTrades(msg.trades || []);
        }

        if (msg.type === "trade") {
          showToast(`New trade: ${msg.side} ${msg.qty} @ ${msg.price}`, "info");
        }

        if (msg.type === "order_update") {
          showToast(
            `Order #${msg.order_id} was ${msg.status}`,
            msg.status === "filled" ? "success" : "info"
          );
          refresh();
        }
      } catch {}
    };

    ws.onopen = () => ws.send("hi");
    return () => ws.close();
  }, [token]);

  const user = getUser();
  const isAdmin = hasRole("admin");

  return (
    <div>
      <div className="topbar">
        <h2>QuantumTrades</h2>
        <div className="user-info">
          {user && (
            <span>
              Welcome, {user.username || "User"} ({user.role || "user"})
            </span>
          )}
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="grid">
        <OrderForm token={token} onPlaced={refresh} />
        <OrderBook orderbook={orderbook} />
      </div>

      <div className="grid">
        <div className="card">
          <h3>My Orders</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Side</th>
                <th>Type</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Remaining</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.side}</td>
                  <td>{o.type}</td>
                  <td>{o.price?.toFixed?.(2)}</td>
                  <td>{o.quantity}</td>
                  <td>{o.remaining}</td>
                  <td>{o.is_active ? "Yes" : "No"}</td>
                  <td>
                    {o.is_active && (
                      <button
                        className="btn danger"
                        onClick={() =>
                          setModal({
                            title: "Cancel Order",
                            message: `Are you sure you want to cancel order #${o.id}?`,
                            onConfirm: async () => {
                              try {
                                await api(`/orders/${o.id}`, {
                                  method: "DELETE",
                                  token,
                                });
                                refresh(); // WebSocket sends toast
                              } catch {
                                showToast("Failed to cancel order", "error");
                              }
                              setModal(null);
                            },
                          })
                        }
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TradeHistory trades={trades} />
      </div>

      {/* ✅ Admin-only section */}
      {isAdmin && (
        <div className="card">
          <h3>Admin Panel</h3>
          <p>Welcome Admin. Manage users and monitor trades below:</p>

          <button
            className="btn"
            onClick={async () => {
              try {
                const allUsers = await api("/users", { token });
                setUsers(allUsers);
              } catch {
                showToast("Failed to load users", "error");
              }
            }}
          >
            Load Users
          </button>

          {users && users.length > 0 && (
            <table style={{ marginTop: "16px", width: "100%" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      {/* 🔹 Delete User */}
                      <button
                        className="btn danger"
                        onClick={() =>
                          setModal({
                            title: "Delete User",
                            message: `Delete user ${u.username}? This cannot be undone.`,
                            onConfirm: async () => {
                              try {
                                await api(`/users/${u.id}`, {
                                  method: "DELETE",
                                  token,
                                });
                                setUsers(users.filter((x) => x.id !== u.id));
                                showToast("User deleted", "success");
                              } catch {
                                showToast("Failed to delete user", "error");
                              }
                              setModal(null);
                            },
                          })
                        }
                      >
                        Delete
                      </button>

                      {/* 🔹 Promote/Demote with confirmation */}
                      <button
                        className="btn"
                        style={{ marginLeft: "8px" }}
                        onClick={() =>
                          setModal({
                            title: `${
                              u.role === "admin"
                                ? "Demote to User"
                                : "Promote to Admin"
                            }`,
                            message: `Are you sure you want to change ${u.username}'s role to ${
                              u.role === "admin" ? "user" : "admin"
                            }?`,
                            onConfirm: async () => {
                              try {
                                const newRole =
                                  u.role === "admin" ? "user" : "admin";
                                await api(`/users/${u.id}/role`, {
                                  method: "PUT",
                                  body: { role: newRole },
                                  token,
                                });
                                showToast(
                                  `User role updated to ${newRole}`,
                                  "success"
                                );
                                setUsers(
                                  users.map((x) =>
                                    x.id === u.id
                                      ? { ...x, role: newRole }
                                      : x
                                  )
                                );
                              } catch {
                                showToast("Failed to update role", "error");
                              }
                              setModal(null);
                            },
                          })
                        }
                      >
                        {u.role === "admin"
                          ? "Demote to User"
                          : "Promote to Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ✅ Reusable Confirm Modal */}
      {modal && (
        <ConfirmModal
          title={modal.title}
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
