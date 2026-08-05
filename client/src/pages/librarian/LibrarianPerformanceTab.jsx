import React, { useState, useEffect } from 'react';
import { FaBook, FaUserSlash, FaCoins, FaSync } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LibrarianPerformanceTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/my-performance');
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  if (loading) {
    return <div className="flex justify-center mt-4"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>;
  }

  if (!data) return null;

  const { summary, booksAdded, booksDeleted, blockedMembers, fineRecords, replacementRecords } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Summary Cards */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)' }}>Books Added</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaBook />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--primary-dark)' }}>{summary.totalBooksAdded}</h2>
        </div>

        <div className="panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)' }}>Books Deleted</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaBook />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--primary-dark)' }}>{summary.totalBooksDeleted}</h2>
        </div>

        <div className="panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)' }}>Members Blocked</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaUserSlash />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--primary-dark)' }}>{summary.totalMembersBlocked}</h2>
        </div>

        <div className="panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)' }}>Fine Collected</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaCoins />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--primary-dark)' }}>₹{summary.totalFineCollected}</h2>
        </div>
      </div>

      {/* Details Sections */}
      <div className="two-cols" style={{ gap: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel" style={{ padding: '1.25rem' }}>
          <h3 className="panel-title" style={{ fontWeight: 800, marginBottom: '1rem' }}>Recently Added Books</h3>
          {booksAdded.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {booksAdded.slice(0, 5).map(b => (
                <li key={b._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span><strong>{b.title}</strong> <span className="text-muted text-xs ml-2">by {b.author}</span></span>
                  <span className="text-muted text-xs">{new Date(b.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-sm">No books added yet.</p>
          )}
        </div>

        <div className="panel" style={{ padding: '1.25rem' }}>
          <h3 className="panel-title" style={{ fontWeight: 800, marginBottom: '1rem' }}>Fines Collected</h3>
          {fineRecords.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {fineRecords.slice(0, 5).map(f => (
                <li key={f._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span><strong>{f.user?.name}</strong> <span className="text-muted text-xs ml-2">{f.book?.title}</span></span>
                  <span className="font-bold text-mint">₹{f.fine}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted text-sm">No fines collected yet.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default LibrarianPerformanceTab;
