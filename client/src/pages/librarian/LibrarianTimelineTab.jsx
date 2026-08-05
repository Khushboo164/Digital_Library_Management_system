import React, { useState, useEffect } from 'react';
import { FaHistory, FaSync, FaCalendarAlt } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LibrarianTimelineTab = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/activities');
      setActivities(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getFilteredActivities = () => {
    const now = new Date();
    return activities.filter(a => {
      const d = new Date(a.createdAt);
      if (filter === "today") return d.toDateString() === now.toDateString();
      if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }
      if (filter === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filtered = getFilteredActivities();

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Activity Timeline</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select className="catalog-select" value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.5rem 2rem 0.5rem 1rem' }}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button onClick={fetchActivities} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FaHistory className="empty-icon" />
          <h3>No activity found</h3>
          <p className="text-muted">There are no librarian actions logged for this period.</p>
        </div>
      ) : (
        <div className="timeline-container" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ position: 'relative', borderLeft: '2px solid var(--border)', paddingLeft: '2rem' }}>
            {filtered.map((activity, idx) => (
              <div key={activity._id} style={{ position: 'relative', marginBottom: idx === filtered.length - 1 ? 0 : '2rem' }}>
                <div style={{ position: 'absolute', left: '-2.45rem', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid var(--bg-card)' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>{activity.action}</h4>
                    <p style={{ margin: 0, color: 'var(--text-body)', fontSize: '0.9rem' }}>
                      <strong className="text-primary">{activity.librarian?.name || 'System'}</strong> 
                      {activity.member ? ` acted on member ` : ""}
                      {activity.member && <strong className="text-amber">{activity.member.name}</strong>}
                      {activity.book ? ` for book ` : ""}
                      {activity.book && <strong className="text-mint">{activity.book.title}</strong>}
                    </p>
                    {activity.details && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{activity.details}"</p>}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                      <FaCalendarAlt />
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrarianTimelineTab;
