import React, { useEffect, useState, useRef } from "react";
import { api, wsUrl } from "../api";
import OrderForm from "./OrderForm";
import OrderBook from "./OrderBook";
import TradeHistory from "./TradeHistory";

export default function Dashboard({ token, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [trades, setTrades] = useState([]);
  const wsRef = useRef(null);

  const refresh = async () => {
    const myOrders = await api("/orders", { token });
    setOrders(myOrders);
  };

  useEffect(() => {
    refresh();
    const ws = new WebSocket(wsUrl("/ws"));
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "snapshot") {
          setOrderbook(msg.orderbook || {bids:[],asks:[]});
          setTrades(msg.trades || []);
        }
      } catch {}
    };
    ws.onopen = () => ws.send("hi");
    return () => ws.close();
  }, [token]);

  const cancel = async (id) => {
    await api(`/orders/${id}`, { method: "DELETE", token });
    refresh();
  };

  return (
    <div>
      <div className="topbar">
        <h2>QuantumTrades</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <div className="grid">
        <OrderForm token={token} onPlaced={refresh}/>
        <OrderBook orderbook={orderbook}/>
      </div>

      <div className="grid">
        <div className="card">
          <h3>My Orders</h3>
          <table>
            <thead><tr><th>ID</th><th>Side</th><th>Type</th><th>Price</th><th>Qty</th><th>Remaining</th><th>Active</th><th></th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.side}</td>
                  <td>{o.type}</td>
                  <td>{o.price?.toFixed?.(2)}</td>
                  <td>{o.quantity}</td>
                  <td>{o.remaining}</td>
                  <td>{o.is_active ? "Yes" : "No"}</td>
                  <td>{o.is_active && <button onClick={()=>cancel(o.id)}>Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TradeHistory trades={trades}/>
      </div>
    </div>
  );
}
