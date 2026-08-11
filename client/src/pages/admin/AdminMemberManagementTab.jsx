import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch, FaUser, FaBook, FaCoins, FaExclamationTriangle, FaBan, FaCheckCircle, FaSync, FaEnvelope, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AdminMemberManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');

  // Filter State
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchMembers = async () => {
    try {
      setFetchingMembers(true);
      const res = await api.get('/admin/users');
      setMembers(res.data.filter(u => u.role === 'member'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch members');
    } finally {
      setFetchingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchAnalytics = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/member/${id}`);
      setAnalytics(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Member analytics not found');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setAnalytics(null);
      return;
    }

    const query = searchTerm.trim().toLowerCase();
    const foundMember = members.find(m => 
      m._id === query || 
      m.name.toLowerCase().includes(query) || 
      m.email.toLowerCase().includes(query)
    );

    if (!foundMember) {
      toast.error('No member found matching your search');
      setAnalytics(null);
      return;
    }

    fetchAnalytics(foundMember._id);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setAnalytics(null);
  };

  const handleToggleBlock = async (memberId, isBlocked) => {
    try {
      const endpoint = isBlocked ? `/auth/unblock/${memberId}` : `/auth/block/${memberId}`;
      const res = await api.put(endpoint);
      toast.success(res.data.message || (isBlocked ? 'User unblocked' : 'User blocked'));
      
      if (analytics && analytics.member.id === memberId) {
        setAnalytics({ ...analytics, member: { ...analytics.member, isBlocked: !isBlocked } });
      }
      setMembers(members.map(m => m._id === memberId ? { ...m, isBlocked: !isBlocked } : m));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const openEmailModal = (member) => {
    setSelectedMember(member);
    setEmailSubject('Warning: Misleading Activity on BookSphere');
    setEmailContent(`Dear ${member.name},\n\nWe have noticed some misleading activity associated with your account on BookSphere.\n\nPlease adhere to the library rules.\n\nRegards,\nBookSphere Admin`);
    setEmailModalVisible(true);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error("Please provide both subject and message");
      return;
    }
    try {
      setSendingEmail(true);
      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fcfaff; border-radius: 12px; border: 1px solid #e9d5ff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #8b5cf6; margin: 0;">BookSphere</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.05);">
            <p style="white-space: pre-wrap; color: #475569; font-size: 16px; line-height: 1.5;">${emailContent}</p>
          </div>
        </div>
      `;
      await api.post('/admin/member/email', {
        email: selectedMember.email,
        subject: emailSubject,
        message: htmlContent,
        memberId: selectedMember._id,
        memberName: selectedMember.name
      });
      toast.success("Email sent successfully!");
      setEmailModalVisible(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Member Management</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {(searchTerm || analytics) && (
            <button type="button" className="btn btn-outline btn-sm" onClick={handleClearSearch} style={{ padding: '0.5rem 1rem', borderRadius: '24px' }}>
              Clear Search
            </button>
          )}
          <button onClick={fetchMembers} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '24px' }} disabled={fetchingMembers}>
            <FaSync className={fetchingMembers ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="catalog-bar mb-4">
        <div className="catalog-search" style={{ flex: '1', margin: 0 }}>
          <FaSearch className="catalog-search-icon" />
          <input 
            type="text" 
            className="input w-full" 
            placeholder="Enter Member ID to view analytics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: '120px' }} className="pill-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
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
        <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply Filter</button>
      </div>

      {analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                <FaUser />
              </div>
              <div>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', color: '#0f172a' }}>{analytics.member.name}</h2>
                <p style={{ margin: '0 0 0.5rem', color: '#64748b' }}>{analytics.member.email}</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: analytics.member.isBlocked ? '#fef2f2' : '#ecfdf5', color: analytics.member.isBlocked ? '#ef4444' : '#10b981' }}>
                    {analytics.member.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                    Joined {new Date(analytics.member.joiningDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button 
                onClick={() => handleToggleBlock(analytics.member.id, analytics.member.isBlocked)} 
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: analytics.member.isBlocked ? '1px solid #10b981' : 'none', background: analytics.member.isBlocked ? 'transparent' : '#ef4444', color: analytics.member.isBlocked ? '#10b981' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
              >
                {analytics.member.isBlocked ? <><FaCheckCircle /> Unblock User</> : <><FaBan /> Block User</>} 
              </button>
              <button 
                onClick={() => openEmailModal({ _id: analytics.member.id, name: analytics.member.name, email: analytics.member.email })}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--amber-light)', color: 'var(--amber)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
              >
                <FaEnvelope /> Warn User
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b' }}>
                <FaBook /> <span style={{ fontWeight: 500 }}>Total Borrowed</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--primary)' }}>{analytics.statistics.totalBooksBorrowed}</h2>
            </div>
            <div className="panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b' }}>
                <FaBook /> <span style={{ fontWeight: 500 }}>Returned</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '2rem', color: '#10b981' }}>{analytics.statistics.totalBooksReturned}</h2>
            </div>
            <div className="panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b' }}>
                <FaCoins /> <span style={{ fontWeight: 500 }}>Fine Paid</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '2rem', color: '#f59e0b' }}>₹{analytics.statistics.totalFinePaid}</h2>
            </div>
            <div className="panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#64748b' }}>
                <FaExclamationTriangle /> <span style={{ fontWeight: 500 }}>Lost Books</span>
              </div>
              <h2 style={{ margin: 0, fontSize: '2rem', color: '#ef4444' }}>{analytics.statistics.lostBooks}</h2>
            </div>
          </div>

          <div className="panel" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: '#0f172a' }}>Borrow History</h3>
            {analytics.borrowHistory.length === 0 ? (
              <p style={{ color: '#64748b' }}>No borrow history found for this member.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Book</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Borrow Date</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Due Date</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.borrowHistory.map((record) => (
                      <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>{record.book?.title || 'Unknown Book'}</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{new Date(record.borrowDate).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{new Date(record.dueDate).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '999px', 
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: record.returned ? '#ecfdf5' : record.isLost ? '#fef2f2' : new Date(record.dueDate) < new Date() ? '#fffbeb' : '#eff6ff',
                            color: record.returned ? '#10b981' : record.isLost ? '#ef4444' : new Date(record.dueDate) < new Date() ? '#f59e0b' : 'var(--primary)'
                          }}>
                            {record.returned ? 'Returned' : record.isLost ? 'Lost' : new Date(record.dueDate) < new Date() ? 'Overdue' : 'Borrowed'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: record.fine > 0 ? '#ef4444' : '#475569' }}>
                          {record.fine > 0 ? `₹${record.fine} ${record.finePaid ? '(Paid)' : '(Unpaid)'}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>
      )}

      {/* Members List View */}
      <div className="panel" style={{ padding: '1.5rem', marginTop: analytics ? '1.5rem' : '0' }}>
        <h3 className="panel-title" style={{ fontWeight: 800, marginBottom: '1rem' }}>All Members</h3>
        
        {fetchingMembers ? (
        <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading members...</p>
      ) : members.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No members found in the system.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.filter(m => {
                // Search Query Filter
                if (searchTerm.trim()) {
                  const q = searchTerm.toLowerCase();
                  if (!(m._id.includes(q) || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))) return false;
                }
                
                // Status Filter
                if (statusFilter === "active" && m.isBlocked) return false;
                if (statusFilter === "blocked" && !m.isBlocked) return false;

                // Date Filter
                const d = new Date(m.joiningDate);
                if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) return false;
                if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) return false;
                if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) return false;

                return true;
              }).map(member => (
                <tr key={member._id}>
                  <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member._id}</span></td>
                  <td><strong>{member.name}</strong></td>
                  <td>{member.email}</td>
                  <td>
                    {member.isBlocked 
                      ? <span className="status-badge bg-rose-light text-rose">BLOCKED</span> 
                      : <span className="status-badge bg-mint-light text-mint">ACTIVE</span>
                    }
                  </td>
                  <td>{new Date(member.joiningDate).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        onClick={() => fetchAnalytics(member._id)} 
                        className="btn-icon bg-primary-light text-primary" 
                        title="View Analytics"
                      >
                        <FaUser />
                      </button>
                      
                      <button 
                        onClick={() => handleToggleBlock(member._id, member.isBlocked)} 
                        className={`btn-icon ${member.isBlocked ? 'bg-mint-light text-mint' : 'bg-rose-light text-rose'}`}
                        title={member.isBlocked ? "Unblock User" : "Block User"}
                      >
                        {member.isBlocked ? <FaCheckCircle /> : <FaBan />}
                      </button>
                      <button 
                        onClick={() => openEmailModal(member)}
                        className="btn-icon bg-amber-light text-amber"
                        title="Send Warning Email"
                      >
                        <FaEnvelope />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Email Modal */}
      {emailModalVisible && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="panel animate-fade-in-up" style={{ width: '90%', maxWidth: '600px', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setEmailModalVisible(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <FaTimes />
            </button>
            
            <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaEnvelope className="text-primary" /> Send Warning Email
            </h2>
            <p className="text-muted">To: <strong>{selectedMember?.name}</strong> ({selectedMember?.email})</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Subject</label>
                <input 
                  type="text" 
                  className="custom-input" 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Message</label>
                <textarea 
                  className="custom-input" 
                  rows="6"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', resize: 'vertical' }}
                  value={emailContent}
                  onChange={e => setEmailContent(e.target.value)}
                ></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setEmailModalVisible(false)} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
                  Cancel
                </button>
                <button onClick={handleSendEmail} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} disabled={sendingEmail}>
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminMemberManagementTab;
