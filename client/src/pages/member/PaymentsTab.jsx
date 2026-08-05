
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from "react-toastify";

const PaymentsTab = ({ type }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/member/payments/${type}/history`);
      setHistory(res.data.history || []);
    } catch (err) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [type]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in-up">
      <h3 className="section-title">{type === 'fine' ? 'Fine Payments' : 'Replacement Payments'}</h3>
      <div className="table-container">
        {history.length === 0 ? (
          <div className="empty-state"><h4>No payment history</h4></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Transaction ID</th><th>Book</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {history.map(h => (
                <tr key={h._id}>
                  <td>{h.transactionId}</td>
                  <td>{h.borrowRecord?.book?.title || 'Unknown'}</td>
                  <td>₹{h.amount}</td>
                  <td>
                    <span className={`badge ${
                      h.status === 'Refunded' ? 'badge-primary' : 
                      (h.status === 'Paid' || h.status === 'Success') ? 'badge-success' : 'badge-warning'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td>{new Date(h.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default PaymentsTab;
