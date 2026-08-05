import React, { useState, useEffect } from 'react';
import { FaCoins, FaCheckCircle, FaFileInvoiceDollar, FaSync, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import ReceiptModal from '../../components/ReceiptModal';

const AdminFinanceTab = () => {
  const [fines, setFines] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [paymentTypeTab, setPaymentTypeTab] = useState("all");
  const [fineTab, setFineTab] = useState("unpaid");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/payments');
      setFines(res.data.fines);
      setReplacements(res.data.replacements);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);



  const getAllPayments = () => {
    const allFines = fines.map(f => ({ ...f, type: 'Late Fees', isPaid: f.finePaid, amount: f.fine, datePaid: f.finePaidDate }));
    const allReps = replacements.map(r => ({ ...r, type: 'Replacement Cost', isPaid: r.replacementCostPaid, amount: r.replacementCost, datePaid: r.replacementCostPaidDate }));
    return [...allFines, ...allReps];
  };

  const getFilteredData = () => {
    let data = getAllPayments();
    
    // Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(d => 
        d.user?.name?.toLowerCase().includes(q) || 
        d.user?.email?.toLowerCase().includes(q) || 
        d.book?.title?.toLowerCase().includes(q)
      );
    }
    // Filter by Category
    if (filterCategory !== "All Categories") {
      data = data.filter(d => d.book?.category === filterCategory);
    }
    
    // Filter by Type
    if (paymentTypeTab !== "all") {
      data = data.filter(d => d.type === paymentTypeTab);
    }
    
    // Filter by Status
    data = data.filter(d => {
      if (fineTab === "refunded") return d.isPaid && d.type === 'Replacement Cost' && d.isFound;
      if (fineTab === "paid") return d.isPaid && !(d.type === 'Replacement Cost' && d.isFound);
      return !d.isPaid;
    });
    
    // Filter by Date
    data = data.filter(record => {
      const dateToUse = record.isPaid ? record.datePaid : record.createdAt;
      if (!dateToUse) return true;
      const d = new Date(dateToUse);
      if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) return false;
      if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) return false;
      if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) return false;
      return true;
    });

    // Sort by date desc
    return data.sort((a, b) => {
        const da = a.isPaid ? a.datePaid : a.createdAt;
        const db = b.isPaid ? b.datePaid : b.createdAt;
        return new Date(db) - new Date(da);
    });
  };

  const filtered = getFilteredData();

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Payment History</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {searchTerm && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearchTerm('')} style={{ padding: '0.5rem 1.5rem', borderRadius: '24px' }}>
              Clear Search
            </button>
          )}
          <button onClick={fetchPayments} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '24px' }}>
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
            placeholder="Search payments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="catalog-select" style={{ borderLeft: '1px solid var(--border)' }}>
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

      <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="fine-filter-tabs" style={{ margin: 0 }}>
          <button onClick={() => setPaymentTypeTab("all")} className={`fine-filter-tab ${paymentTypeTab === "all" ? "active" : ""}`}>
            All Types
          </button>
          <button onClick={() => setPaymentTypeTab("Late Fees")} className={`fine-filter-tab ${paymentTypeTab === "Late Fees" ? "active" : ""}`}>
            Late Fees
          </button>
          <button onClick={() => setPaymentTypeTab("Replacement Cost")} className={`fine-filter-tab ${paymentTypeTab === "Replacement Cost" ? "active" : ""}`}>
            Replacement Cost
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="fine-filter-tabs" style={{ margin: 0 }}>
          <button onClick={() => setFineTab("unpaid")} className={`fine-filter-tab ${fineTab === "unpaid" ? "active" : ""}`}>
            Unpaid ({getAllPayments().filter(f => !f.isPaid && (paymentTypeTab === "all" || f.type === paymentTypeTab)).length})
          </button>
          <button onClick={() => setFineTab("paid")} className={`fine-filter-tab ${fineTab === "paid" ? "active" : ""}`}>
            Paid ({getAllPayments().filter(f => f.isPaid && !(f.type === 'Replacement Cost' && f.isFound) && (paymentTypeTab === "all" || f.type === paymentTypeTab)).length})
          </button>
          <button onClick={() => setFineTab("refunded")} className={`fine-filter-tab ${fineTab === "refunded" ? "active" : ""}`}>
            Refunded ({getAllPayments().filter(f => f.isPaid && (f.type === 'Replacement Cost' && f.isFound) && (paymentTypeTab === "all" || f.type === paymentTypeTab)).length})
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="pill-select" style={{ minWidth: '90px' }}>
          <option value="">Date</option>
          {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="pill-select" style={{ minWidth: '130px' }}>
          <option value="">Month</option>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="pill-select" style={{ minWidth: '100px' }}>
          <option value="">Year</option>
          {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
        </select>
        <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply Filter</button>
        {(appliedFilters.day || appliedFilters.month || appliedFilters.year) && (
          <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setAppliedFilters({ day: "", month: "", year: "" }); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center my-8"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FaCoins className="empty-icon" />
          <h3>No records found</h3>
          <p className="text-muted">There are no payment records in this category.</p>
        </div>
      ) : (
        <div className="table-container mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(record => (
                <tr key={`${record._id}-${record.type}`}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{record.user?.name || 'Unknown'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{record.book?.title || 'Unknown'}</div>
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ background: '#fffbeb', color: '#f59e0b', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>{record.type.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className="font-bold text-rose" style={{ fontSize: '1.1rem' }}>
                      ₹{record.amount}
                    </span>
                  </td>
                  <td>
                      {record.isPaid ? (
                        (record.type === 'Replacement Cost' && record.isFound) ? 
                          <span className="status-badge text-sky" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>REFUNDED</span> : 
                          <span className="status-badge bg-mint-light text-mint">PAID</span>
                      ) : (
                        <span className="status-badge bg-amber-light text-amber">PENDING</span>
                      )}
                  </td>
                  <td>
                    {record.isPaid 
                      ? new Date(record.datePaid).toLocaleDateString()
                      : new Date(record.createdAt).toLocaleDateString()
                    }
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {!record.isPaid && (
                        <span className="text-muted text-sm italic">No actions</span>
                      )}
                      {record.isPaid && (
                        <button onClick={() => setSelectedReceipt({
                            id: record._id,
                            date: record.isPaid ? record.datePaid : record.createdAt,
                            amount: record.amount,
                            type: record.type,
                            bookTitle: record.book?.title,
                            memberName: record.user?.name,
                            status: (record.type === 'Replacement Cost' && record.isFound) ? 'Refunded' : 'Paid'
                          })} className="btn-icon bg-sky-light text-sky" title="View Receipt">
                          <FaFileInvoiceDollar />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ReceiptModal receiptData={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
        </div>
      )}
    </div>
  );
};

export default AdminFinanceTab;
