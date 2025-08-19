import React, { useState } from "react";
import { api } from "../api";

export default function OrderForm({ token, onPlaced }) {
  const [side, setSide] = useState("buy");
  const [type, setType] = useState("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const body = { side, type, quantity: Number(quantity) };
      if (type === "limit") body.price = Number(price);
      await api("/orders", { method: "POST", body, token });
      setPrice("");
      setQuantity("");
      if (onPlaced) onPlaced();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="card">
      <h3>Place Order</h3>
      <form onSubmit={submit}>
        <div className="row">
          <label>Side</label>
          <select value={side} onChange={e=>setSide(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div className="row">
          <label>Type</label>
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option value="limit">Limit</option>
            <option value="market">Market</option>
          </select>
        </div>
        {type === "limit" && (
          <div className="row">
            <label>Price</label>
            <input type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required />
          </div>
        )}
        <div className="row">
          <label>Quantity</label>
          <input type="number" step="0.01" value={quantity} onChange={e=>setQuantity(e.target.value)} required />
        </div>
        {err && <div className="error">{err}</div>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
