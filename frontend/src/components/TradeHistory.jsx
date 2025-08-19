import React from "react";

export default function TradeHistory({ trades }) {
  return (
    <div className="card">
      <h3>Recent Trades</h3>
      <table>
        <thead><tr><th>ID</th><th>Price</th><th>Qty</th><th>Time</th></tr></thead>
        <tbody>
          {trades.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.price.toFixed(2)}</td>
              <td>{t.quantity}</td>
              <td>{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
