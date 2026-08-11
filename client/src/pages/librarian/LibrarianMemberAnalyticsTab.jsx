import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch, FaUser, FaBook, FaCoins, FaExclamationTriangle, FaEnvelope, FaBan, FaCheckCircle, FaTimes, FaBookmark, FaStar, FaSync } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LibrarianMemberAnalyticsTab = () => {
  const [memberId, setMemberId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  // Email Modal State
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [emailSubject, setEmailSubject] = useState('Warning: Misleading Activity on BookSphere');
  const [emailContent, setEmailContent] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Filter State
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchMembers = async () => {
    try {
      setFetchingMembers(true);
      const res = await api.get('/librarian/members');
      setMembers(res.data);
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
      const res = await api.get(`/librarian/member/${id}`);
      setAnalytics(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Member analytics not found');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Returned':
      case 'Return Approved':
        return 'bg-mint-light text-mint';
      case 'Borrow Rejected':
      case 'Return Rejected':
      case 'Lost':
        return 'bg-rose-light text-rose';
      case 'Borrow Requested':
      case 'Return Requested':
        return 'bg-amber-light text-amber';
      case 'Borrowed':
      case 'Borrow Approved':
      default:
        return 'bg-primary-light text-primary';
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!memberId.trim()) {
      setAnalytics(null);
      return;
    }

    const query = memberId.trim().toLowerCase();
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
    setMemberId('');
    setAnalytics(null);
  };

  const handleToggleBlock = async (memberId, isBlocked) => {
    try {
      const endpoint = isBlocked ? `/auth/unblock/${memberId}` : `/auth/block/${memberId}`;
      const res = await api.put(endpoint);
      toast.success(res.data.message || (isBlocked ? 'User unblocked' : 'User blocked'));
      
      // Update local state
      if (analytics && analytics.member._id === memberId) {
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
      
      await api.post('/librarian/member/email', {
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
        <h2 className="section-title" style={{ margin: 0 }}>Member Analytics Search</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {(memberId || analytics) && (
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
            placeholder="Enter Member ID, Name, or Email..." 
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
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
        {(appliedFilters.day || appliedFilters.month || appliedFilters.year || statusFilter !== 'all') && (
          <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setAppliedFilters({ day: "", month: "", year: "" }); setStatusFilter("all"); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear Filters</button>
        )}
      </div>

      {/* Analytics Modal */}
      {analytics && createPortal(
        <div className="modal-bg" onClick={() => { setAnalytics(null); setMemberId(''); }}>
          <div className="modal-card-v2" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setAnalytics(null); setMemberId(''); }} className="modal-close-btn" style={{ position: 'absolute', top: '15px', right: '15px' }}>✕</button>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="panel" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                <FaUser />
              </div>
              <div>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 800 }}>{analytics.member.name}</h2>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)' }}>{analytics.member.email}</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span className={`badge ${analytics.member.isBlocked ? 'badge-danger' : 'badge-primary'}`}>
                    {analytics.member.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                  <span className="badge badge-info">Joined {new Date(analytics.member.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button 
                onClick={() => handleToggleBlock(analytics.member._id, analytics.member.isBlocked)} 
                className={`btn ${analytics.member.isBlocked ? 'btn-outline' : 'btn-danger'}`}
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {analytics.member.isBlocked ? <FaCheckCircle /> : <FaBan />} 
                {analytics.member.isBlocked ? 'Unblock User' : 'Block User'}
              </button>
              <button 
                onClick={() => openEmailModal(analytics.member)} 
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FaEnvelope /> Warn User
              </button>
            </div>
          </div>

          {/* Statistics row */}
          <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaBook className="text-primary" /> <span className="font-bold">Total Borrowed</span>
              </div>
              <h2 className="text-primary-dark font-bold text-2xl m-0">{analytics.statistics.totalBooksBorrowed}</h2>
            </div>
            <div className="panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaBook className="text-mint" /> <span className="font-bold">Returned</span>
              </div>
              <h2 className="text-primary-dark font-bold text-2xl m-0">{analytics.statistics.totalBooksReturned}</h2>
            </div>
            <div className="panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaCoins className="text-amber" /> <span className="font-bold">Fine Paid</span>
              </div>
              <h2 className="text-primary-dark font-bold text-2xl m-0">₹{analytics.statistics.totalFinePaid}</h2>
            </div>
            <div className="panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaExclamationTriangle className="text-rose" /> <span className="font-bold">Lost Books</span>
              </div>
              <h2 className="text-primary-dark font-bold text-2xl m-0">{analytics.statistics.lostBooks}</h2>
            </div>
          </div>

          {/* Borrow History */}
          <div className="panel" style={{ padding: '1.5rem' }}>
            <h3 className="panel-title" style={{ fontWeight: 800, marginBottom: '1rem' }}>Borrow History</h3>
            {analytics.borrowHistory.length === 0 ? (
              <p className="text-muted">No borrow history found for this member.</p>
            ) : (
              <div className="table-container mb-6" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <tr>
                      <th>Book</th>
                      <th>Borrow Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Fine Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.borrowHistory.map(borrow => (
                      <tr key={borrow._id}>
                        <td><strong>{borrow.book?.title}</strong></td>
                        <td>{borrow.issueDate || borrow.requestDate ? new Date(borrow.issueDate || borrow.requestDate).toLocaleDateString() : '-'}</td>
                        <td>{borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(borrow.status)}`} style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {borrow.status}
                          </span>
                        </td>
                        <td>{borrow.finePaid ? `₹${borrow.fine}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="two-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Active Reservations */}
            <div className="panel" style={{ padding: '1.5rem', height: '100%' }}>
              <h3 className="panel-title" style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaBookmark className="text-primary" /> Active Reservations
              </h3>
              {(!analytics.reservations || analytics.reservations.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-light)', borderRadius: 'var(--radius)' }}>
                  <p className="text-muted" style={{ margin: 0 }}>No active reservations.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analytics.reservations.map(resv => (
                    <div key={resv._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: 'var(--radius)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaBook className="text-primary" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem' }}>{resv.book?.title}</h4>
                        <span className="text-sm text-muted" style={{ display: 'block' }}>Queue Position: #{resv.queuePosition} • Status: {resv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <div className="panel" style={{ padding: '1.5rem', height: '100%' }}>
              <h3 className="panel-title" style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaStar className="text-amber" /> Wishlist
              </h3>
              {(!analytics.wishlist || analytics.wishlist.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-light)', borderRadius: 'var(--radius)' }}>
                  <p className="text-muted" style={{ margin: 0 }}>Empty wishlist.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {analytics.wishlist.map(book => (
                    <div key={book._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: 'var(--radius)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaBook className="text-amber" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.25rem' }}>{book.title}</h4>
                        <span className="text-sm text-muted" style={{ display: 'block' }}>{book.author}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Members List View */}
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          


          <div className="panel" style={{ padding: '1.5rem' }}>
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
                    if (memberId.trim()) {
                      const q = memberId.toLowerCase();
                      if (!(m._id.includes(q) || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))) return false;
                    }
                    
                    // Status Filter
                    if (statusFilter === "unblocked" && m.isBlocked) return false;
                    if (statusFilter === "blocked" && !m.isBlocked) return false;

                    // Date Filter
                    const d = new Date(m.createdAt);
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
                      <td>{new Date(member.createdAt).toLocaleDateString()}</td>
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

export default LibrarianMemberAnalyticsTab;
