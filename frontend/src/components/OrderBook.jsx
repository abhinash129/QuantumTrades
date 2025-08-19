import React from "react";

export default function OrderBook({ orderbook }) {
  const bids = orderbook?.bids || [];
  const asks = orderbook?.asks || [];

  return (
    <div className="card">
      <h3>Order Book</h3>
      <div className="grid">
        <div>
          <h4>Bids</h4>
          <table>
            <thead><tr><th>Price</th><th>Qty</th></tr></thead>
            <tbody>
              {bids.map(b => (
                <tr key={`b-${b.id}`}>
                  <td>{b.price?.toFixed(2)}</td>
                  <td>{b.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4>Asks</h4>
          <table>
            <thead><tr><th>Price</th><th>Qty</th></tr></thead>
            <tbody>
              {asks.map(a => (
                <tr key={`a-${a.id}`}>
                  <td>{a.price?.toFixed(2)}</td>
                  <td>{a.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
