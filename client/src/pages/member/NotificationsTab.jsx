
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaCheck, FaInfoCircle, FaTrash, FaSync } from 'react-icons/fa';

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState([]);

  // Filters
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });

  const [refreshing, setRefreshing] = useState(false);

  const fetchNotes = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/member/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    }
    setRefreshing(false);
  };
  useEffect(() => { fetchNotes(); }, []);

  const markRead = (id) => api.put(`/member/notifications/${id}/read`).then(fetchNotes);
  const markAllRead = () => api.put('/member/notifications/read-all').then(fetchNotes);
  const deleteNotification = (id) => api.delete(`/member/notifications/${id}`).then(fetchNotes);

  const filteredNotifications = notifications.filter(notif => {
    const dateObj = new Date(notif.createdAt);
    const isValidDate = !isNaN(dateObj);
    if (isValidDate) {
      if (appliedFilters.year && dateObj.getFullYear().toString() !== appliedFilters.year) return false;
      if (appliedFilters.month && (dateObj.getMonth() + 1).toString() !== appliedFilters.month) return false;
      if (appliedFilters.day && dateObj.getDate().toString() !== appliedFilters.day) return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title" style={{ margin: 0 }}>Notifications</h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchNotes} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} disabled={refreshing}>
            <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={markAllRead} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Mark All Read</button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} style={{ minWidth: '100px' }} className="pill-select">
          <option value="">Day</option>
          {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ minWidth: '130px' }} className="pill-select">
          <option value="">Month</option>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ minWidth: '100px' }} className="pill-select">
          <option value="">Year</option>
          {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
        </select>
        <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply</button>
        {(appliedFilters.day || appliedFilters.month || appliedFilters.year) && (
          <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setAppliedFilters({ day: "", month: "", year: "" }); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear</button>
        )}
      </div>

      <div className="borrow-list">
        {filteredNotifications.map(n => (
          <div key={n._id} className="borrow-row" style={{ opacity: n.isRead ? 0.6 : 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: n.isRead ? 'var(--bg-muted)' : 'var(--primary-light)',
              color: n.isRead ? 'var(--text-muted)' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
            }}>
              <FaInfoCircle />
            </div>

            <div className="borrow-meta" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h5 style={{ margin: 0, fontWeight: n.isRead ? 600 : 800 }}>{n.title}</h5>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-body)' }}>{n.message}</p>
            </div>

            <div className="borrow-actions" style={{ display: 'flex', gap: '0.5rem' }}>
              {!n.isRead && (
                <button onClick={() => markRead(n._id)} className="btn-icon bg-mint-light text-mint" title="Mark as Read">
                  <FaCheck />
                </button>
              )}
              <button onClick={() => deleteNotification(n._id)} className="btn-icon bg-rose-light text-rose" title="Delete">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NotificationsTab;
