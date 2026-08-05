
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from "react-toastify";
import { FaSync, FaSearch, FaRedo } from 'react-icons/fa';

const RenewalsTab = ({ currentBooks, onRenewSuccess }) => {
  const [renewHistory, setRenewHistory] = useState([]);
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "", search: "" });
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = () => {
    api.get('/member/renewals/history').then(res => setRenewHistory(res.data.renewHistory || []));
  };

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      await fetchHistory();
      if (onRenewSuccess) onRenewSuccess();
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRenew = async (borrowId) => {
    try {
      await api.post('/member/renewals', { borrowId });
      toast.success('Book renewed successfully');
      if (onRenewSuccess) onRenewSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew');
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title" style={{ margin: 0 }}>Renew Books</h3>
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
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...currentBooks].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate)).map(b => (
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
                    {b.isOverdue ? (
                      <span className="status-badge" style={{ background: '#ffe4e6', color: '#e11d48' }}>OVERDUE</span>
                    ) : (
                      <span className="status-badge bg-primary-light text-primary">BORROWED</span>
                    )}
                  </td>
                  <td>
                    {b.isOverdue ? (
                      <span className="text-danger text-xs font-bold" style={{ whiteSpace: 'nowrap' }}>Cannot Renew</span>
                    ) : (
                      <button onClick={() => handleRenew(b.borrowId)} className="btn-icon bg-primary-light text-primary" title="Renew Book"><FaSync /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-4" style={{ marginTop: '3rem' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Renewal History</h3>
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
          <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear, search: searchQuery })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply Filter</button>
          {(appliedFilters.day || appliedFilters.month || appliedFilters.year || appliedFilters.search) && (
            <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setSearchQuery(""); setAppliedFilters({ day: "", month: "", year: "", search: "" }); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear Filters</button>
          )}
      </div>
      <div className="table-container">
        <table className="data-table">
            <thead><tr><th>Book</th><th>Renew Date</th><th>Renewals Used</th></tr></thead>
            <tbody>
              {renewHistory.filter(record => {
                  const d = new Date(record.borrowDate);
                  if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) return false;
                  if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) return false;
                  if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) return false;
                  if (appliedFilters.search && !(record.book?.title || '').toLowerCase().includes(appliedFilters.search.toLowerCase())) return false;
                  if (filterCategory !== "All Categories" && record.book?.category !== filterCategory) return false;
                  return true;
              }).map(h => (
                <tr key={h._id}>
                  <td>{h.book?.title}</td>
                  <td>{new Date(h.updatedAt).toLocaleDateString()}</td>
                  <td>{h.renewalCount} / 3</td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
export default RenewalsTab;
