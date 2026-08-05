import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaUserSlash, FaEnvelope, FaEye, FaSync, FaSearch, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LibrarianOverdueTab = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEmailClick = (record) => {
    setSelectedRecord(record);
    setEmailData({
      subject: "Overdue Book Reminder",
      message: `Dear ${record.user?.name || 'Member'},\n\nYour borrowed book "${record.book?.title || 'Unknown'}" was due on ${new Date(record.dueDate).toLocaleDateString()}.\n\nIt is currently overdue. Kindly return the book and pay your pending fine of ₹${record.fine || (record.daysOverdue > 0 ? record.daysOverdue * 10 : 0)} at the earliest.\n\nThank you,\nLibrary Management`
    });
    setShowEmailModal(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailData.subject || !emailData.message) {
      return toast.warning("Subject and message are required.");
    }
    try {
      setSendingEmail(true);
      await api.post('/librarian/member/email', {
        email: selectedRecord.user?.email,
        subject: emailData.subject,
        message: emailData.message,
        memberId: selectedRecord.user?._id,
        memberName: selectedRecord.user?.name
      });
      toast.success("Reminder email sent successfully!");
      setShowEmailModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/overdue');
      
      const now = new Date();
      const processed = res.data.map(borrow => {
        const due = new Date(borrow.dueDate);
        const diffTime = now - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...borrow, daysOverdue: diffDays };
      }).filter(b => b.daysOverdue > -4) // Only show due in < 3 days or overdue
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

      setRecords(processed);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const getUrgencyClass = (days) => {
    if (days <= 0) return "bg-mint-light text-mint"; // Green - Due Soon
    if (days <= 3) return "bg-amber-light text-amber"; // Yellow - 1-3 days
    if (days <= 7) return "bg-orange-light text-orange"; // Orange - 4-7 days
    return "bg-rose-light text-rose"; // Red - > 7 days
  };

  const getUrgencyLabel = (days) => {
    if (days <= 0) return "Due Soon";
    if (days <= 3) return "Slightly Overdue";
    if (days <= 7) return "Very Overdue";
    return "Critical";
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.book?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesUrgency = true;
    if (urgencyFilter === "due_soon") matchesUrgency = record.daysOverdue <= 0;
    else if (urgencyFilter === "slightly") matchesUrgency = record.daysOverdue > 0 && record.daysOverdue <= 3;
    else if (urgencyFilter === "very") matchesUrgency = record.daysOverdue > 3 && record.daysOverdue <= 7;
    else if (urgencyFilter === "critical") matchesUrgency = record.daysOverdue > 7;

    const d = new Date(record.dueDate);
    let matchesDate = true;
    if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) matchesDate = false;
    if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) matchesDate = false;
    if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) matchesDate = false;

    return matchesSearch && matchesUrgency && matchesDate;
  });

  return (
    <div className="animate-fade-in-up">
      {/* Standard Header Panel */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Overdue & Due Soon Members</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {searchTerm && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearchTerm('')} style={{ padding: '0.5rem 1.5rem', borderRadius: '24px' }}>
              Clear Search
            </button>
          )}
          <button onClick={fetchOverdue} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '24px' }}>
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
            placeholder="Search by member or book..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} style={{ minWidth: '130px' }} className="pill-select">
          <option value="all">All Urgencies</option>
          <option value="due_soon">Due Soon</option>
          <option value="slightly">Slightly Overdue</option>
          <option value="very">Very Overdue</option>
          <option value="critical">Critical</option>
        </select>
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
      </div>

      {loading ? (
        <div className="flex justify-center my-8"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
      ) : filteredRecords.length === 0 ? (
        <div className="empty-state">
          <FaUserSlash className="empty-icon" />
          <h3>No overdue members</h3>
          <p className="text-muted">All borrowed books are currently well within their due dates.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Current Fine</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record._id} style={{ borderLeft: `4px solid ${record.daysOverdue > 7 ? 'var(--rose)' : record.daysOverdue > 3 ? 'orange' : record.daysOverdue > 0 ? 'var(--amber)' : 'var(--mint)'}` }}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{record.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted">{record.user?.email || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{record.book?.title || 'Unknown'}</div>
                  </td>
                  <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${getUrgencyClass(record.daysOverdue)}`}>
                      {getUrgencyLabel(record.daysOverdue)}
                    </span>
                    <div className="text-xs text-muted mt-1">
                      {record.daysOverdue > 0 ? `${record.daysOverdue} days late` : `in ${Math.abs(record.daysOverdue)} days`}
                    </div>
                  </td>
                  <td>
                    <span className="font-bold text-rose">₹{record.fine || (record.daysOverdue > 0 ? record.daysOverdue * 10 : 0)}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEmailClick(record)} className="btn-icon bg-amber-light text-amber" title="Send Reminder Email">
                        <FaEnvelope />
                      </button>
                      <button onClick={() => handleViewClick(record)} className="btn-icon bg-primary-light text-primary" title="View Member Profile">
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    {/* View Member Modal */}
    {showViewModal && selectedRecord && createPortal(
      <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowViewModal(false)}>
        <div className="panel animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
          <button 
            onClick={() => setShowViewModal(false)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <FaTimes />
          </button>
          <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            Overdue Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-muted)', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Member Information</h4>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Name:</strong> {selectedRecord.user?.name || 'N/A'}</p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Email:</strong> {selectedRecord.user?.email || 'N/A'}</p>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-muted)', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>Book Information</h4>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Title:</strong> {selectedRecord.book?.title || 'Unknown'}</p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Borrow Date:</strong> {new Date(selectedRecord.borrowDate).toLocaleDateString()}</p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Due Date:</strong> {new Date(selectedRecord.dueDate).toLocaleDateString()}</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--rose)' }}>Fine Details</h4>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Overdue By:</strong> {selectedRecord.daysOverdue} days</p>
              <p style={{ margin: '0 0 0.25rem 0' }}><strong>Calculated Fine:</strong> ₹{selectedRecord.fine || (selectedRecord.daysOverdue > 0 ? selectedRecord.daysOverdue * 10 : 0)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button onClick={() => setShowViewModal(false)} className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>Close</button>
            <button onClick={() => { setShowViewModal(false); handleEmailClick(selectedRecord); }} className="btn btn-primary" style={{ marginLeft: '1rem', padding: '0.75rem 1.5rem' }}>Send Email</button>
          </div>
        </div>
      </div>,
      document.body
    )}

    {/* Send Email Modal */}
    {showEmailModal && selectedRecord && createPortal(
      <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setShowEmailModal(false)}>
        <div className="panel animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '600px', padding: '2rem', position: 'relative' }}>
          <button 
            onClick={() => setShowEmailModal(false)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <FaTimes />
          </button>
          <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaEnvelope className="text-primary" /> Send Reminder Email
          </h2>
          <p className="text-muted">To: <strong>{selectedRecord.user?.name || 'Unknown'}</strong> ({selectedRecord.user?.email || 'N/A'})</p>

          <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Subject</label>
              <input type="text" className="custom-input" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Message</label>
              <textarea className="custom-input" rows="6" value={emailData.message} onChange={(e) => setEmailData({...emailData, message: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', resize: 'vertical' }}></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowEmailModal(false)} className="btn btn-outline" disabled={sendingEmail} style={{ padding: '0.75rem 1.5rem' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ marginLeft: '1rem', padding: '0.75rem 1.5rem' }} disabled={sendingEmail}>
                {sendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )}
    </div>
  );
};

export default LibrarianOverdueTab;
