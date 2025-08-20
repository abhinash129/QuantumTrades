import React, { useEffect, useState } from "react";
import { getOpenOrders, cancelOrder } from "../api";
import { useToast } from "./ToastProvider";

export default function OpenOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOpenOrders();
      setOrders(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      notify(e.message || "Failed to load open orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCancel = async (id) => {
    try {
      await cancelOrder(id);
      setOrders((os) => os.filter((o) => o.id !== id));
      notify("Order cancelled", "success");
    } catch (e) {
      notify(e.message || "Failed to cancel order", "error");
    }
  };

  if (loading) return <div className="card">Loading open orders…</div>;
  if (!orders.length) return <div className="card">No open orders</div>;

  return (
    <div className="card">
      <h3>Open Orders</h3>
      <div className="table">
        <div className="thead">
          <div>ID</div><div>Side</div><div>Symbol</div><div>Qty</div><div>Price</div><div></div>
        </div>
        {orders.map(o => (
          <div className="trow" key={o.id}>
            <div>{o.id}</div>
            <div>{o.side}</div>
            <div>{o.symbol}</div>
            <div>{o.quantity}</div>
            <div>{o.price}</div>
            <div>
              <button className="btn danger" onClick={() => onCancel(o.id)}>Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
