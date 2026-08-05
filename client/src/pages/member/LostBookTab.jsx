import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from "react-toastify";
import { FaBookDead, FaUndo, FaCreditCard, FaSearch, FaSync, FaRedo, FaTimes } from 'react-icons/fa';

const LostBookTab = ({ currentBooks, onRefresh, onPayCharges }) => {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchRequests = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/member/lost-book');
      setRequests(res.data.requests || []);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshClick = () => {
    fetchRequests();
    if (onRefresh) onRefresh();
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleReport = async (borrowId) => {
    try {
      await api.post('/member/lost-book', { borrowId });
      toast.success('Book reported lost');
      fetchRequests();
    } catch(err) {
      toast.error('Failed to report');
    }
  };

  const handleCancelLostBook = async (borrowId) => {
    if(!window.confirm("Are you sure you want to cancel this lost book report?")) return;
    try {
      await api.delete(`/member/lost-book/${borrowId}`);
      toast.success('Lost book report cancelled');
      fetchRequests();
      if (onRefresh) onRefresh();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to cancel report');
    }
  };

  const handleReturnLostBook = async (borrowId) => {
    try {
      await api.put(`/member/lost-book/${borrowId}/return`);
      toast.success('Return requested for lost book');
      fetchRequests();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to request return');
    }
  };

  const handlePayCharges = async (borrowId, cost) => {
    if (onPayCharges) {
      onPayCharges(borrowId, cost);
      return;
    }
    if(!window.confirm("Are you sure you want to pay the replacement cost for this book?")) return;
    try {
      const response = await api.post("/member/payments/replacement", { borrowId });
      toast.success(response.data?.message || "Replacement cost paid successfully!");
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title" style={{ margin: 0 }}>Report Lost Book</h3>
        <button onClick={handleRefreshClick} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} disabled={refreshing}>
          <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
      <div className="table-container mb-8">
        {currentBooks.length === 0 ? (
          <div className="empty-state"><h4>You haven't borrowed any books yet.</h4></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Category</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentBooks.map(b => (
                <tr key={b.borrowId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-muted)' }}>
                         {b.coverImage ? <img src={b.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>No Img</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{b.title || 'Unknown'}</div>
                        <div className="text-xs text-muted">by {b.author || 'Unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{b.category || 'N/A'}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{b.borrowDate ? new Date(b.borrowDate).toLocaleDateString() : '—'}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{b.dueDate ? new Date(b.dueDate).toLocaleDateString() : '—'}</span>
                  </td>
                  <td>
                    <button onClick={() => handleReport(b.borrowId)} className="btn-icon bg-rose-light text-rose" title="Report Lost"><FaBookDead /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-4" style={{ marginTop: '3rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Lost Book Requests</h3>
      </div>
      
      <div className="catalog-bar mb-4">
        <div className="catalog-search" style={{ flex: '1' }}>
          <FaSearch className="catalog-search-icon" />
          <input 
            type="text" 
            placeholder="Search books..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="catalog-select">
          <option value="All Categories">All Categories</option>
          <option value="Fiction">Fiction</option>
          <option value="Mystery">Mystery</option>
          <option value="Business">Business</option>
          <option value="Psychology">Psychology</option>
          <option value="Self Help">Self Help</option>
          <option value="History">History</option>
          <option value="Technology">Technology</option>
          <option value="Biography">Biography</option>
        </select>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="catalog-select"
          style={{ minWidth: '150px' }}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Returned">Returned</option>
        </select>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead><tr><th>Book</th><th>Date Reported</th><th>Replacement Cost</th><th>Book Status</th><th>Payment Status</th><th>Action</th></tr></thead>
          <tbody>
            {requests.filter(r => {
              const matchesSearch = (r.book?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
              const matchesFilter = filterStatus === 'All' || 
                                    (filterStatus === 'Returned' ? r.status === 'Returned' : r.lostRequestStatus === filterStatus);
              const matchesCategory = filterCategory === 'All Categories' || r.book?.category === filterCategory;
              return matchesSearch && matchesFilter && matchesCategory;
            }).map(r => (
              <tr key={r._id}>
                <td>{r.book?.title}</td>
                <td>{r.lostReportedDate ? new Date(r.lostReportedDate).toLocaleDateString() : new Date(r.updatedAt).toLocaleDateString()}</td>
                <td>₹{r.replacementCost}</td>
                <td>
                  {r.status === 'Returned' ? (
                    <span className="badge badge-success">Returned</span>
                  ) : r.status === 'Return Requested' ? (
                    <span className="badge badge-warning">Return Requested</span>
                  ) : r.status === 'Lost' ? (
                    <span className="badge badge-secondary" style={{ backgroundColor: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1' }}>N/A</span>
                  ) : (
                    <span className={`badge ${r.lostRequestStatus === 'Approved' ? 'badge-success' : 'badge-warning'}`}>{r.lostRequestStatus}</span>
                  )}
                </td>
                <td>
                  {r.replacementCost === 0 ? (
                    <span className="badge badge-secondary" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>No Charges</span>
                  ) : r.replacementCostPaid ? (
                    r.status === 'Returned' ? (
                      <span className="badge badge-sky" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>Refunded</span>
                    ) : (
                      <span className="badge badge-success">Paid</span>
                    )
                  ) : (
                    <span className="badge badge-warning">Unpaid</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {r.status !== 'Returned' && r.status !== 'Return Requested' && !r.replacementCostPaid && r.lostRequestStatus !== 'Approved' && (
                      <button onClick={() => handleCancelLostBook(r._id)} className="btn-icon bg-slate-100 text-slate-500" title="Cancel Lost Report"><FaTimes /></button>
                    )}
                    {r.status !== 'Returned' && r.status !== 'Return Requested' && (
                      <button onClick={() => handleReturnLostBook(r._id)} className="btn-icon bg-sky-light text-sky" title="Found Book? Request Return"><FaUndo /></button>
                    )}
                    {r.status !== 'Returned' && !r.replacementCostPaid && r.replacementCost > 0 && (
                      <button onClick={() => handlePayCharges(r._id, r.replacementCost)} className="btn-icon bg-rose-light text-rose" title="Pay Charges"><FaCreditCard /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default LostBookTab;
