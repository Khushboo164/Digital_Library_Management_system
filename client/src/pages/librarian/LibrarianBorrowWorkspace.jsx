import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaBookOpen, FaSync, FaInbox, FaThumbsUp, FaUndo, FaArchive, FaCheckDouble, FaHandshake } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LibrarianBorrowWorkspace = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [innerTab, setInnerTab] = useState("new");
  
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/borrows');
      setBorrows(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch borrows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrows();
  }, []);

  const handleAction = async (id, action, type, reason = "") => {
    try {
      let res;
      const url = `/librarian/requests/${type}/${id}/${action}`;
      if (action === "reject") {
        res = await api.put(url, { reason });
      } else {
        res = await api.put(url);
      }
      toast.success(res.data.message);
      fetchBorrows();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action}`);
    }
  };

  const filterBorrows = () => {
    let filteredList = [];
    switch (innerTab) {
      case "new": filteredList = borrows.filter(b => b.status === "Borrow Requested"); break;
      case "approved": filteredList = borrows.filter(b => b.status === "Borrow Approved"); break;
      case "borrowed": filteredList = borrows.filter(b => b.status === "Borrowed"); break;
      case "returns": filteredList = borrows.filter(b => b.status === "Return Requested" || b.status === "Return Approved"); break;
      case "completed": filteredList = borrows.filter(b => b.status === "Returned"); break;
      case "rejected": filteredList = borrows.filter(b => b.status === "Borrow Rejected" || b.status === "Return Rejected"); break;
      default: filteredList = [];
    }

    const resultList = filteredList.filter(b => {
      const d = new Date(b.createdAt); // use createdAt for when the request was made
      if (appliedFilters.day && d.getDate() !== parseInt(appliedFilters.day)) return false;
      if (appliedFilters.month && d.getMonth() + 1 !== parseInt(appliedFilters.month)) return false;
      if (appliedFilters.year && d.getFullYear() !== parseInt(appliedFilters.year)) return false;
      return true;
    });

    resultList.sort((a, b) => {
      let dateA, dateB;
      if (innerTab === "new") { dateA = a.requestDate; dateB = b.requestDate; }
      else if (innerTab === "approved") { dateA = a.approvalDate; dateB = b.approvalDate; }
      else if (innerTab === "borrowed") { dateA = a.issueDate; dateB = b.issueDate; }
      else if (innerTab === "returns") { dateA = a.returnRequestDate || a.returnApprovalDate; dateB = b.returnRequestDate || b.returnApprovalDate; }
      else { dateA = a.updatedAt; dateB = b.updatedAt; }

      const timeA = dateA ? new Date(dateA).getTime() : new Date(a.createdAt).getTime();
      const timeB = dateB ? new Date(dateB).getTime() : new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
    
    return resultList;
  };

  const filtered = filterBorrows();

  const getStatusBadge = (status) => {
    switch (status) {
      case "Borrow Requested": return <span className="status-badge bg-amber-light text-amber">REQUESTED</span>;
      case "Borrow Approved": return <span className="status-badge bg-sky-light text-sky">APPROVED</span>;
      case "Borrowed": return <span className="status-badge bg-primary-light text-primary">BORROWED</span>;
      case "Return Requested": return <span className="status-badge bg-amber-light text-amber">RETURN REQ</span>;
      case "Return Approved": return <span className="status-badge bg-sky-light text-sky">RETURN APP</span>;
      case "Returned": return <span className="status-badge bg-mint-light text-mint">RETURNED</span>;
      case "Borrow Rejected":
      case "Return Rejected": return <span className="status-badge bg-rose-light text-rose">REJECTED</span>;
      default: return <span className="status-badge bg-muted text-muted">{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Borrow Management Workspace</h2>
        <button onClick={fetchBorrows} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          <FaSync className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="catalog-bar" style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0', borderRadius: '0', boxShadow: 'none', background: 'transparent' }}>
        {[
          { id: "new", label: "New Requests", icon: <FaInbox /> },
          { id: "approved", label: "Approved (Awaiting Pickup)", icon: <FaThumbsUp /> },
          { id: "borrowed", label: "Currently Borrowed", icon: <FaBookOpen /> },
          { id: "returns", label: "Return Queue", icon: <FaUndo /> },
          { id: "completed", label: "Completed / History", icon: <FaArchive /> },
          { id: "rejected", label: "Rejected", icon: <FaTimesCircle /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setInnerTab(tab.id)}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: innerTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
              color: innerTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: innerTab === tab.id ? 800 : 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '1rem 0' }}>
        <select 
          value={filterDay} 
          onChange={(e) => setFilterDay(e.target.value)} 
          style={{ minWidth: '90px' }}
          className="pill-select"
        >
          <option value="">Date</option>
          {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
        
        <select 
          value={filterMonth} 
          onChange={(e) => setFilterMonth(e.target.value)} 
          style={{ minWidth: '130px' }}
          className="pill-select"
        >
          <option value="">Month</option>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        
        <select 
          value={filterYear} 
          onChange={(e) => setFilterYear(e.target.value)} 
          style={{ minWidth: '100px' }}
          className="pill-select"
        >
          <option value="">Year</option>
          {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
        </select>
        
        <button 
          onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear })} 
          className="btn btn-primary btn-sm ml-2" 
          style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}
        >
          Apply Filter
        </button>
        
        {(appliedFilters.day || appliedFilters.month || appliedFilters.year) && (
          <button 
            onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setAppliedFilters({ day: "", month: "", year: "" }); }} 
            className="btn btn-outline btn-sm ml-2" 
            style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center my-8"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FaBookOpen className="empty-icon" />
          <h3>No records found</h3>
          <p className="text-muted">There are no borrow records in this queue.</p>
        </div>
      ) : (
        <div className="table-container mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Date</th>
                <th>Status</th>
                <th>Available Copies</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(borrow => (
                <tr key={borrow._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{borrow.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted">{borrow.user?.email || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-muted)' }}>
                         {borrow.book?.coverImage ? <img src={borrow.book.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>No Img</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {borrow.book?.title || 'Unknown'}
                          {borrow.lostReported && <span className="badge badge-warning" style={{fontSize: '0.6rem', padding: '0.1rem 0.3rem'}}>Found Lost Book</span>}
                        </div>
                        <div className="text-xs text-muted">by {borrow.book?.author || 'Unknown'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      {innerTab === "new" && new Date(borrow.requestDate).toLocaleDateString()}
                      {innerTab === "approved" && new Date(borrow.approvalDate).toLocaleDateString()}
                      {innerTab === "borrowed" && new Date(borrow.issueDate).toLocaleDateString()}
                      {innerTab === "returns" && new Date(borrow.returnRequestDate || borrow.returnApprovalDate).toLocaleDateString()}
                      {innerTab === "completed" && new Date(borrow.updatedAt).toLocaleDateString()}
                      {innerTab === "rejected" && new Date(borrow.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>{getStatusBadge(borrow.status)}</td>
                  <td>
                    <span className="badge badge-primary">{borrow.book?.availableCopies || 0}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {borrow.status === "Borrow Requested" && (
                        <>
                          <button onClick={() => handleAction(borrow._id, "approve", "borrow")} className="btn-icon bg-mint-light text-mint" title="Approve">
                            <FaCheckCircle />
                          </button>
                          <button onClick={() => handleAction(borrow._id, "reject", "borrow")} className="btn-icon bg-rose-light text-rose" title="Reject">
                            <FaTimesCircle />
                          </button>
                        </>
                      )}
                      {borrow.status === "Borrow Approved" && (
                        <button onClick={() => handleAction(borrow._id, "issue", "borrow")} className="btn-icon bg-mint-light text-mint" title="Mark Issued">
                          <FaCheckCircle />
                        </button>
                      )}
                      {borrow.status === "Return Requested" && (
                        <>
                          <button onClick={() => handleAction(borrow._id, "approve", "return")} className="btn-icon bg-mint-light text-mint" title="Approve Return">
                            <FaCheckCircle />
                          </button>
                          <button onClick={() => handleAction(borrow._id, "reject", "return")} className="btn-icon bg-rose-light text-rose" title="Reject Return">
                            <FaTimesCircle />
                          </button>
                        </>
                      )}
                      {borrow.status === "Return Approved" && (
                        <button onClick={() => handleAction(borrow._id, "receive", "return")} className="btn-icon bg-mint-light text-mint" title="Mark Received">
                          <FaCheckDouble />
                        </button>
                      )}
                      {["Returned", "Borrow Rejected", "Return Rejected", "Borrowed"].includes(borrow.status) && (
                        <span className="text-muted text-sm italic">No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LibrarianBorrowWorkspace;
