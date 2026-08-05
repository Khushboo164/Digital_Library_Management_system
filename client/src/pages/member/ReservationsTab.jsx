
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from "react-toastify";
import { FaTimesCircle, FaRedoAlt, FaSearch, FaSync, FaRedo } from 'react-icons/fa';

const ReservationsTab = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/member/reservations');
      setReservations(res.data.reservations || []);
    } catch (err) {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/member/reservations/${id}/cancel`);
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  if (loading) return <div>Loading...</div>;

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = (r.book?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.book?.author || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    const matchesCategory = filterCategory === "All Categories" || r.book?.category === filterCategory;
    
    let matchesDate = true;
    if (appliedFilters.day || appliedFilters.month || appliedFilters.year) {
      const d = new Date(r.createdAt); // assuming reservations have createdAt
      if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) matchesDate = false;
      if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) matchesDate = false;
      if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) matchesDate = false;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title" style={{ margin: 0 }}>Reserved Books</h3>
        <button onClick={fetchReservations} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} disabled={refreshing}>
          <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
      <div className="catalog-bar mb-4">
        <div className="catalog-search" style={{ flex: '1' }}>
          <FaSearch className="catalog-search-icon" />
          <input 
            type="text" 
            placeholder="Search reservations..." 
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
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Fulfilled">Approved/Fulfilled</option>
        </select>
      </div>
      
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="pill-select" style={{ minWidth: '90px' }}>
          <option value="">Date</option>
          {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="pill-select" style={{ minWidth: '130px' }}>
          <option value="">Month</option>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="pill-select" style={{ minWidth: '100px' }}>
          <option value="">Year</option>
          {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
        </select>
        <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply Filter</button>
        {(appliedFilters.day || appliedFilters.month || appliedFilters.year) && (
          <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setAppliedFilters({ day: "", month: "", year: "" }); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear Filters</button>
        )}
      </div>
      <div className="table-container">
        {filteredReservations.length === 0 ? (
          <div className="empty-state"><h4>No reservations found</h4></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Category</th>
                <th>Queue</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(r => (
                <tr key={r._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-muted)' }}>
                         {r.book?.coverImage ? <img src={r.book.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>No Img</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{r.book?.title || 'Unknown'}</div>
                        <div className="text-xs text-muted">Available: {r.book?.availableCopies || 0} / {r.book?.totalCopies || 0}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.book?.category || 'N/A'}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-body)' }}>{r.queuePosition}</span>
                  </td>
                  <td>{new Date(r.reservationDate).toLocaleDateString()}</td>
                  <td>
                    {r.status === 'Pending' ? <span className="status-badge bg-amber-light text-amber">PENDING</span> : 
                     r.status === 'Fulfilled' ? <span className="status-badge bg-mint-light text-mint">FULFILLED</span> : 
                     <span className="status-badge bg-rose-light text-rose">CANCELLED</span>}
                  </td>
                  <td>
                    {r.status === 'Pending' && <button onClick={() => handleCancel(r._id)} className="btn-icon bg-rose-light text-rose" title="Cancel Reservation"><FaTimesCircle /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default ReservationsTab;
