import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaSearch, FaEnvelope, FaEnvelopeOpenText, FaSync } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const EmailsTab = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });
  const [activeRoleTab, setActiveRoleTab] = useState("all");
  
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/member/emails');
      setEmails(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/member/emails');
      setEmails(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch emails');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter(item => {
    // Search Query (by subject)
    if (searchQuery) {
      if (!item.subject?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }

    // Role Filter
    if (activeRoleTab !== "all" && item.senderRole?.toLowerCase() !== activeRoleTab.toLowerCase()) return false;

    // Date Filters
    const d = new Date(item.createdAt);
    if (appliedFilters.day && d.getDate() !== parseInt(appliedFilters.day)) return false;
    if (appliedFilters.month && d.getMonth() + 1 !== parseInt(appliedFilters.month)) return false;
    if (appliedFilters.year && d.getFullYear() !== parseInt(appliedFilters.year)) return false;

    return true;
  });

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="section-title" style={{ margin: 0 }}>Emails</h3>
        <button onClick={handleRefreshClick} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} disabled={refreshing || loading}>
          <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="catalog-bar mb-4">
        <div className="catalog-search" style={{ flex: '1' }}>
          <FaSearch className="catalog-search-icon" />
          <input 
            type="text" 
            placeholder="Search by subject..." 
            className="input w-full" 
            style={{ paddingLeft: '2.25rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="fine-filter-tabs" style={{ marginBottom: '1.25rem' }}>
        <button onClick={() => setActiveRoleTab("all")} className={`fine-filter-tab ${activeRoleTab === "all" ? "active" : ""}`}>All Roles</button>
        <button onClick={() => setActiveRoleTab("Admin")} className={`fine-filter-tab ${activeRoleTab === "Admin" ? "active" : ""}`}>Admin</button>
        <button onClick={() => setActiveRoleTab("Librarian")} className={`fine-filter-tab ${activeRoleTab === "Librarian" ? "active" : ""}`}>Librarian</button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} style={{ minWidth: '90px' }} className="pill-select">
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
        
        <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply Filter</button>
        
        {(appliedFilters.day || appliedFilters.month || appliedFilters.year) && (
          <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setAppliedFilters({ day: "", month: "", year: "" }); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear Filters</button>
        )}
      </div>

      <div className="table-container mb-8">
        {loading ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading emails...</p>
        ) : filteredEmails.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <FaEnvelopeOpenText className="empty-icon" style={{ fontSize: '3rem', color: 'var(--primary-light)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Emails Found</h3>
            <p className="text-muted">No emails match the selected criteria.</p>
          </div>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Recipient</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sent By</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date & Time</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmails.map(item => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700 }}>{item.memberName || user.name || 'Member'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.memberEmail || user.email}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{item.subject}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {item.senderRole}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {item.sentBy?.name || 'System Admin'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                    <div style={{ fontSize: '0.8rem' }}>{new Date(item.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedEmail(item)} 
                      className="btn-icon bg-primary-light text-primary" 
                      title="View Email Message"
                      style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <FaEnvelope />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Email Modal */}
      {selectedEmail && ReactDOM.createPortal(
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}>
          <div className="modal-content animate-scale" style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Header */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaEnvelopeOpenText className="text-primary" /> Email Record
              </h2>
              <button onClick={() => setSelectedEmail(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>&times;</button>
            </div>

            {/* Scrollable Content */}
            <div style={{ overflowY: 'auto', padding: '2rem', flex: 1 }}>
              
              {/* Metadata Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  <div style={{ color: '#64748b', fontWeight: 600, textAlign: 'right' }}>From:</div>
                  <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedEmail.sentBy?.name || 'System Admin'} <span style={{ color: '#64748b', fontWeight: 400 }}>({selectedEmail.senderRole})</span></div>
                  
                  <div style={{ color: '#64748b', fontWeight: 600, textAlign: 'right' }}>To:</div>
                  <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedEmail.memberName} <span style={{ color: '#64748b', fontWeight: 400 }}>&lt;{selectedEmail.memberEmail}&gt;</span></div>
                  
                  <div style={{ color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Date:</div>
                  <div style={{ color: '#0f172a' }}>{new Date(selectedEmail.createdAt).toLocaleString()}</div>
                  
                  <div style={{ color: '#64748b', fontWeight: 600, textAlign: 'right', marginTop: '0.5rem' }}>Subject:</div>
                  <div style={{ color: '#0f172a', fontWeight: 700, marginTop: '0.5rem' }}>{selectedEmail.subject}</div>
                </div>
              </div>
              
              {/* Message Body */}
              <div>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Message Content</h3>
                {selectedEmail.message && selectedEmail.message.includes('<div') ? (
                  <div style={{ color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }} dangerouslySetInnerHTML={{ __html: selectedEmail.message }}></div>
                ) : (
                  <div style={{ color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }} dangerouslySetInnerHTML={{ __html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fcfaff; border-radius: 12px; border: 1px solid #e9d5ff;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #8b5cf6; margin: 0;">BookSphere</h1>
                      </div>
                      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.05);">
                        <p style="white-space: pre-wrap; color: #475569; font-size: 16px; line-height: 1.5;">${selectedEmail.message}</p>
                      </div>
                    </div>
                  `}}></div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedEmail(null)} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}>Close</button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EmailsTab;
