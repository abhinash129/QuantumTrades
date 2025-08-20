// import React, { useState } from "react";
// import { api } from "../api";

// export default function OrderForm({ token, onPlaced }) {
//   const [side, setSide] = useState("buy");
//   const [type, setType] = useState("limit");
//   const [price, setPrice] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [err, setErr] = useState("");

//   const submit = async (e) => {
//     e.preventDefault();
//     setErr("");
//     try {
//       const body = { side, type, quantity: Number(quantity) };
//       if (type === "limit") body.price = Number(price);
//       await api("/orders", { method: "POST", body, token });
//       setPrice("");
//       setQuantity("");
//       if (onPlaced) onPlaced();
//     } catch (e) {
//       setErr(e.message);
//     }
//   };

//   return (
//     <div className="card">
//       <h3>Place Order</h3>
//       <form onSubmit={submit}>
//         <div className="row">
//           <label>Side</label>
//           <select value={side} onChange={e=>setSide(e.target.value)}>
//             <option value="buy">Buy</option>
//             <option value="sell">Sell</option>
//           </select>
//         </div>
//         <div className="row">
//           <label>Type</label>
//           <select value={type} onChange={e=>setType(e.target.value)}>
//             <option value="limit">Limit</option>
//             <option value="market">Market</option>
//           </select>
//         </div>
//         {type === "limit" && (
//           <div className="row">
//             <label>Price</label>
//             <input type="number" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required />
//           </div>
//         )}
//         <div className="row">
//           <label>Quantity</label>
//           <input type="number" step="0.01" value={quantity} onChange={e=>setQuantity(e.target.value)} required />
//         </div>
//         {err && <div className="error">{err}</div>}
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// }



import React, { useState } from "react";
import { api } from "../api";

export default function OrderForm({ token, onPlaced }) {
  const [side, setSide] = useState("buy");
  const [type, setType] = useState("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [err, setErr] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ validate inputs
  const validate = () => {
    const errs = {};
    if (!side) errs.side = "Side is required";
    if (!type) errs.type = "Type is required";
    if (type === "limit" && (!price || parseFloat(price) <= 0))
      errs.price = "Price must be greater than 0";
    if (!quantity || parseFloat(quantity) <= 0)
      errs.quantity = "Quantity must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!validate()) return;

    try {
      await api("/orders", {
        method: "POST",
        token,
        body: { side, type, price: parseFloat(price), quantity: parseFloat(quantity) }
      });
      onPlaced();
      setPrice("");
      setQuantity("");
      setErrors({});
    } catch (e) {
      setErr(e.message || "Failed to place order");
    }
  };

  return (
    <div className="card">
      <h3>Place Order</h3>
      <form onSubmit={submit}>
        {/* Side */}
        <div className="row">
          <label>Side</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value)}
            className={errors.side ? "error-input" : ""}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        {errors.side && <div className="error">{errors.side}</div>}

        {/* Type */}
        <div className="row">
          <label>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={errors.type ? "error-input" : ""}
          >
            <option value="limit">Limit</option>
            <option value="market">Market</option>
          </select>
        </div>
        {errors.type && <div className="error">{errors.type}</div>}

        {/* Price (only for limit orders) */}
        {type === "limit" && (
          <>
            <div className="row">
              <label>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={errors.price ? "error-input" : ""}
              />
            </div>
            {errors.price && <div className="error">{errors.price}</div>}
          </>
        )}

        {/* Quantity */}
        <div className="row">
          <label>Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={errors.quantity ? "error-input" : ""}
          />
        </div>
        {errors.quantity && <div className="error">{errors.quantity}</div>}

        {/* API error */}
        {err && <div className="error">{err}</div>}

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
