import React, { useState, useEffect } from 'react';
import { FaBook, FaCheckCircle, FaTimesCircle, FaBell, FaForward, FaSync, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LibrarianReservationsTab = ({ readOnly }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Date");
  const [monthFilter, setMonthFilter] = useState("Month");
  const [yearFilter, setYearFilter] = useState("Year");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/reservations');
      setReservations(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await api.put(`/librarian/reservations/${id}/${action}`);
      toast.success(res.data.message);
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action}`);
    }
  };

  const filteredReservations = reservations.filter(resv => {
    const matchesSearch =
      resv.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resv.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resv.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || resv.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || resv.book?.category === categoryFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'Date' || monthFilter !== 'Month' || yearFilter !== 'Year') {
      const resDate = new Date(resv.createdAt || resv.reservationDate);
      if (dateFilter !== 'Date' && resDate.getDate().toString() !== dateFilter) matchesDate = false;
      if (monthFilter !== 'Month' && (resDate.getMonth() + 1).toString() !== monthFilter) matchesDate = false;
      if (yearFilter !== 'Year' && resDate.getFullYear().toString() !== yearFilter) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Reserved Books</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={fetchReservations} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem', borderRadius: '24px' }}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="catalog-bar mb-4">
        <div className="catalog-search" style={{ flex: '1' }}>
          <FaSearch className="catalog-search-icon" />
          <input 
            type="text" 
            className="input w-full" 
            placeholder="Search reservations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="catalog-select">
          <option value="All">All Categories</option>
          <option value="Fiction">Fiction</option>
          <option value="Mystery">Mystery</option>
          <option value="Business">Business</option>
          <option value="Psychology">Psychology</option>
          <option value="Self Help">Self Help</option>
          <option value="History">History</option>
          <option value="Technology">Technology</option>
          <option value="Biography">Biography</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="catalog-select">
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Ready">Ready</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Expired">Expired</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="pill-select" style={{ minWidth: '90px' }}>
          <option value="Date">Date</option>
          {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="pill-select" style={{ minWidth: '130px' }}>
          <option value="Month">Month</option>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="pill-select" style={{ minWidth: '100px' }}>
          <option value="Year">Year</option>
          {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
        </select>
        <button className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>
          Apply Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-8"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
      ) : filteredReservations.length === 0 ? (
        <div className="empty-state">
          <FaBook className="empty-icon" />
          <h3>No reservations</h3>
          <p className="text-muted">The reservation queue is currently empty or none match search.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Category</th>
                <th>Member</th>
                <th>Queue</th>
                <th>Date</th>
                <th>Status</th>
                {!readOnly && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((resv, idx) => (
                <tr key={resv._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-muted)' }}>
                         {resv.book?.coverImage ? <img src={resv.book.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>No Img</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{resv.book?.title || 'Unknown'}</div>
                        <div className="text-xs text-muted">Available: {resv.book?.availableCopies || 0} / {resv.book?.totalCopies || 0}</div>
                      </div>
                    </div>
                  </td>
                  <td>{resv.book?.category || 'N/A'}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{resv.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted">{resv.user?.email || 'N/A'}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-body)' }}>{resv.queuePosition || idx + 1}</span>
                  </td>
                  <td>{new Date(resv.reservationDate).toLocaleDateString()}</td>
                  <td>
                    {resv.status === 'Pending' ? <span className="status-badge bg-amber-light text-amber">PENDING</span> : 
                     resv.status === 'Fulfilled' ? <span className="status-badge bg-mint-light text-mint">FULFILLED</span> : 
                     <span className="status-badge bg-rose-light text-rose">CANCELLED</span>}
                  </td>
                  {!readOnly && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {resv.status === "Pending" && (
                          <>
                            <button onClick={() => handleAction(resv._id, "notify")} className="btn-icon bg-sky-light text-sky" title="Notify Member">
                              <FaBell />
                            </button>
                            <button onClick={() => handleAction(resv._id, "borrow")} className="btn-icon bg-mint-light text-mint" title="Mark Borrowed">
                              <FaCheckCircle />
                            </button>
                            <button onClick={() => handleAction(resv._id, "skip")} className="btn-icon bg-amber-light text-amber" title="Skip">
                              <FaForward />
                            </button>
                            <button onClick={() => handleAction(resv._id, "cancel")} className="btn-icon bg-rose-light text-rose" title="Cancel">
                              <FaTimesCircle />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LibrarianReservationsTab;
