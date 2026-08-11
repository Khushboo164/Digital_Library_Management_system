import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaSearch, FaUserTie, FaUserPlus, FaUserMinus, FaUser, FaBook, FaCoins, FaEnvelope, FaBan, FaCheckCircle, FaTimes, FaAddressCard, FaExclamationTriangle, FaSync } from "react-icons/fa";
import api from "../../utils/api";
import { toast } from "react-toastify";

const AdminLibrarianManagementTab = () => {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newLib, setNewLib] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [selectedLibrarian, setSelectedLibrarian] = useState(null);

  // Email Modal State
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });

  const fetchLibrarians = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/librarians");
      setLibrarians(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch librarians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrarians();
  }, []);

  const handleAddLibrarian = async (e) => {
    e.preventDefault();
    if (!newLib.name || !newLib.email || !newLib.password) {
        return toast.error("Please fill all fields");
    }
    try {
      setIsSubmitting(true);
      await api.post("/admin/librarian", newLib);
      toast.success("Librarian added successfully");
      setShowAddForm(false);
      setNewLib({ name: "", email: "", password: "" });
      fetchLibrarians();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add librarian");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResign = async (id) => {
    if (!window.confirm("Are you sure you want to mark this librarian as resigned?")) return;
    try {
      await api.put(`/admin/librarian/${id}/resign`);
      toast.success("Librarian marked as resigned");
      fetchLibrarians();
      if (analytics && analytics.librarian.id === id) {
        fetchAnalytics(id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const handleKeep = async (id) => {
    // If there is an API to un-resign, call it here. For now we will just re-enable it if needed, or leave it as it is.
    // The instructions say "remove or keep instead of block, unblock". So keep would mean un-resign or make active again.
    // Since we don't have an endpoint for un-resign, I'll alert or mock it.
    toast.error("Endpoint to reactivate librarian not implemented yet");
  };

  const fetchAnalytics = async (id) => {
    try {
      setAnalyticsLoading(true);
      const res = await api.get(`/admin/librarian/${id}`);
      setAnalytics(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Librarian analytics not found');
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const openEmailModal = (librarian) => {
    setSelectedLibrarian(librarian);
    setEmailSubject('Important: Administrative Update');
    setEmailMessage(`Dear ${librarian.name},\n\nWe are writing to inform you about an important administrative update regarding your role at BookSphere.\n\nPlease review the recent policy changes.\n\nRegards,\nBookSphere Admin`);
    setEmailModalVisible(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailMessage.trim()) return toast.error('Please fill all fields');
    try {
      setEmailSending(true);
      
      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fcfaff; border-radius: 12px; border: 1px solid #e9d5ff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #8b5cf6; margin: 0;">BookSphere</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.05);">
            <p style="white-space: pre-wrap; color: #475569; font-size: 16px; line-height: 1.5;">${emailMessage}</p>
          </div>
        </div>
      `;

      await api.post('/librarian/member/email', { email: selectedLibrarian.email, subject: emailSubject, message: htmlContent, memberId: selectedLibrarian.id, memberName: selectedLibrarian.name });
      toast.success('Email sent successfully');
      setEmailModalVisible(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  const filteredLibrarians = librarians.filter((lib) => {
    // Search Query Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      if (!(lib.name.toLowerCase().includes(q) || lib.email.toLowerCase().includes(q))) return false;
    }
    
    // Status Filter
    if (statusFilter === "resigned" && lib.isActiveEmployee) return false;
    if (statusFilter === "active" && !lib.isActiveEmployee) return false;

    // Date Filter
    const d = new Date(lib.createdAt);
    if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) return false;
    if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) return false;
    if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) return false;

    return true;
  });

  if (loading) {
    return <div className="text-center py-10">Loading librarians...</div>;
  }

  return (
    <div className="animate-fade-in-up">
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Librarian Management</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {searchTerm && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearchTerm('')} style={{ padding: '0.5rem 1.5rem', borderRadius: '24px' }}>
              Clear Search
            </button>
          )}
          <button onClick={fetchLibrarians} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '24px' }}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="catalog-bar mb-4">
        <div className="catalog-search" style={{ flex: '1', margin: 0 }}>
          <FaSearch className="catalog-search-icon" />
          <input 
            type="text" 
            className="input w-full" 
            placeholder="Enter Librarian Name or Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pill-select" style={{ minWidth: '120px' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="resigned">Resigned</option>
        </select>
        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="pill-select" style={{ minWidth: '100px' }}>
          <option value="">Day</option>
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
        {(appliedFilters.day || appliedFilters.month || appliedFilters.year || statusFilter !== 'all') && (
          <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setAppliedFilters({ day: "", month: "", year: "" }); setStatusFilter("all"); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear</button>
        )}
      </div>

      {/* Librarians List View */}
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="panel" style={{ padding: '1.5rem' }}>
            <h3 className="panel-title" style={{ fontWeight: 800, marginBottom: '1rem' }}>All Librarians</h3>
            
            {loading ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>Loading librarians...</p>
          ) : filteredLibrarians.length === 0 ? (
             <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No librarians found.</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Resigned</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLibrarians.map((lib) => (
                    <tr key={lib._id}>
                      <td><strong>{lib.name}</strong></td>
                      <td>{lib.email}</td>
                      <td>
                        {lib.isActiveEmployee 
                          ? <span className="status-badge bg-mint-light text-mint">ACTIVE</span>
                          : <span className="status-badge bg-rose-light text-rose">RESIGNED</span>
                        }
                      </td>
                      <td>{new Date(lib.createdAt).toLocaleDateString()}</td>
                      <td>{lib.resignedAt ? new Date(lib.resignedAt).toLocaleDateString() : "-"}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button 
                            onClick={() => { setSelectedLibrarian({ ...lib, id: lib._id }); fetchAnalytics(lib._id); }}
                            className="btn-icon bg-primary-light text-primary"
                            title="View Profile"
                          >
                            <FaUser />
                          </button>
                          
                          <button 
                            onClick={() => lib.isActiveEmployee ? handleResign(lib._id) : handleKeep(lib._id)} 
                            className={`btn-icon ${!lib.isActiveEmployee ? 'bg-mint-light text-mint' : 'bg-rose-light text-rose'}`}
                            title={!lib.isActiveEmployee ? "Reactivate (Keep)" : "Remove (Resign)"}
                          >
                            {!lib.isActiveEmployee ? <FaCheckCircle /> : <FaBan />}
                          </button>
                          
                          <button 
                            onClick={() => openEmailModal(lib)} 
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

      {/* Analytics Modal */}
      {analytics && createPortal(
        <div className="modal-bg" onClick={() => { setAnalytics(null); setSelectedLibrarian(null); }}>
          <div className="modal-card-v2" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setAnalytics(null); setSelectedLibrarian(null); }} className="modal-close-btn" style={{ position: 'absolute', top: '15px', right: '15px' }}>✕</button>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="panel" style={{ padding: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    <FaUserTie />
                  </div>
                  <div>
                    <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 800 }}>{analytics.librarian.name}</h2>
                    <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)' }}>{analytics.librarian.email}</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span className={`badge ${!analytics.librarian.isActiveEmployee ? 'badge-danger' : 'badge-primary'}`}>
                        {!analytics.librarian.isActiveEmployee ? 'Resigned' : 'Active Employee'}
                      </span>
                      <span className="badge badge-info">Joined {new Date(analytics.librarian.joiningDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <button 
                    onClick={() => analytics.librarian.isActiveEmployee ? handleResign(analytics.librarian.id) : handleKeep(analytics.librarian.id)} 
                    className={`btn ${analytics.librarian.isActiveEmployee ? 'btn-danger' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {!analytics.librarian.isActiveEmployee ? <FaCheckCircle /> : <FaUserMinus />} 
                    {!analytics.librarian.isActiveEmployee ? 'Reactivate (Keep)' : 'Remove (Resign)'}
                  </button>
                  <button 
                    onClick={() => openEmailModal(analytics.librarian)} 
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FaEnvelope /> Send Email
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <FaBook style={{ color: 'var(--primary)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{analytics.summary?.booksAdded || 0}</h3>
                  <p className="text-muted" style={{ margin: 0 }}>Books Added</p>
                </div>
                <div className="panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <FaBan style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{analytics.summary?.blockedMembers || 0}</h3>
                  <p className="text-muted" style={{ margin: 0 }}>Members Blocked</p>
                </div>
                <div className="panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <FaCoins style={{ color: '#f59e0b', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>₹{analytics.summary?.totalFineCollected || 0}</h3>
                  <p className="text-muted" style={{ margin: 0 }}>Fines Collected</p>
                </div>
                <div className="panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <FaExclamationTriangle style={{ color: '#8b5cf6', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>₹{analytics.summary?.totalReplacementCollected || 0}</h3>
                  <p className="text-muted" style={{ margin: 0 }}>Replacement Cost</p>
                </div>
              </div>

              {/* Books Added History */}
              <div className="panel" style={{ padding: '1.5rem' }}>
                <h3 className="panel-title" style={{ fontWeight: 800, marginBottom: '1rem' }}>Recently Added Books</h3>
                {(!analytics.booksAdded || analytics.booksAdded.length === 0) ? (
                  <p className="text-muted">No books added by this librarian.</p>
                ) : (
                  <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                        <tr>
                          <th>Book Title</th>
                          <th>Author</th>
                          <th>Copies Added</th>
                          <th>Added Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.booksAdded.slice(0, 50).map(book => (
                          <tr key={book._id}>
                            <td><strong>{book.title}</strong></td>
                            <td>{book.author}</td>
                            <td>{book.totalCopies}</td>
                            <td>{new Date(book.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

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
              <FaEnvelope className="text-primary" /> Send Email
            </h2>
            <p className="text-muted">To: <strong>{selectedLibrarian?.name}</strong> ({selectedLibrarian?.email})</p>
            
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
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                ></textarea>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setEmailModalVisible(false)} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
                  Cancel
                </button>
                <button onClick={handleSendEmail} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }} disabled={emailSending}>
                  {emailSending ? 'Sending...' : 'Send Email'}
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

export default AdminLibrarianManagementTab;
