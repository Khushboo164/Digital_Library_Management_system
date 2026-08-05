import React, { useState, useEffect } from 'react';
import { FaBookDead, FaSync, FaSearch, FaRedo } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LibrarianLostBooksTab = () => {
  const [lostBooks, setLostBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [selectedSort, setSelectedSort] = useState("random_none");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "" });

  const fetchLostBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/lost-books');
      setLostBooks(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch lost books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostBooks();
  }, []);

  const handleUpdateStatus = async (id, field, value) => {
    try {
      await api.put(`/librarian/lost-books/${id}/status`, { [field]: value });
      toast.success("Status updated successfully");
      fetchLostBooks(); // Refresh list to get updated data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Get unique categories for filter
  const categories = ["All Categories", ...new Set(lostBooks.map(b => b.book?.category).filter(Boolean))];

  // Apply filters
  const filteredBooks = lostBooks.filter(borrow => {
    // Search
    const matchesSearch = 
      (borrow.book?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (borrow.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Category
    if (filterCategory !== "All Categories" && borrow.book?.category !== filterCategory) return false;

    // Date parsing
    const dateObj = new Date(borrow.createdAt);
    const isValidDate = !isNaN(dateObj);

    if (isValidDate) {
      if (appliedFilters.year && dateObj.getFullYear().toString() !== appliedFilters.year) return false;
      if (appliedFilters.month && (dateObj.getMonth() + 1).toString() !== appliedFilters.month) return false;
      if (appliedFilters.day && dateObj.getDate().toString() !== appliedFilters.day) return false;
    }

    return true;
  });

  let sortedBooks = [...filteredBooks];
  if (selectedSort !== "random_none") {
    const [sortBy, order] = selectedSort.split('_');
    sortedBooks.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Lost Books History</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {searchTerm && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setSearchTerm('')} style={{ padding: '0.5rem 1.5rem', borderRadius: '24px' }}>
              Clear Search
            </button>
          )}
          <button onClick={fetchLostBooks} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '24px' }}>
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
            placeholder="Search by title, author, or member..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="pill-select" style={{ minWidth: '130px' }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)} className="pill-select" style={{ minWidth: '130px' }}>
          <option value="random_none">Sort By (Random)</option>
          <option value="createdAt_desc">Latest</option>
          <option value="createdAt_asc">Oldest</option>
        </select>
        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="pill-select" style={{ minWidth: '90px' }}>
          <option value="">Day</option>
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
        {(appliedFilters.day || appliedFilters.month || appliedFilters.year || filterCategory !== 'All Categories' || selectedSort !== 'random_none') && (
          <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setAppliedFilters({ day: "", month: "", year: "" }); setFilterCategory("All Categories"); setSelectedSort("random_none"); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center my-8"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
      ) : sortedBooks.length === 0 ? (
        <div className="empty-state">
          <FaBookDead className="empty-icon" />
          <h3>No lost books found</h3>
          <p className="text-muted">No records match your current filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Category</th>
                <th>Lost By User</th>
                <th>Lost Date</th>
                <th>Cost Paid?</th>
                <th>Book Found?</th>
              </tr>
            </thead>
            <tbody>
              {sortedBooks.map((record) => (
                <tr key={record._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {record.book?.coverImage ? (
                        <img src={record.book.coverImage} alt={record.book.title} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '56px', background: 'var(--bg-muted)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaBookDead className="text-muted" />
                        </div>
                      )}
                      <div style={{ fontWeight: 700 }}>{record.book?.title || 'Unknown Book'}</div>
                    </div>
                  </td>
                  <td>{record.book?.category || 'N/A'}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{record.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-muted">{record.user?.email || ''}</div>
                  </td>
                  <td>{new Date(record.updatedAt).toLocaleDateString()}</td>
                  <td>
                    {record.isFound && !record.replacementCostPaid ? (
                      <span className="text-muted font-bold" style={{ marginLeft: '0.2rem' }}>N/A</span>
                    ) : (
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={record.replacementCostPaid} 
                          onChange={(e) => handleUpdateStatus(record._id, 'replacementCostPaid', e.target.checked)}
                          style={{ marginRight: '0.5rem', width: '18px', height: '18px', accentColor: record.replacementCostPaid && record.isFound ? 'var(--sky)' : 'var(--mint)' }}
                        />
                        <span className={record.replacementCostPaid ? (record.isFound ? "text-sky font-bold" : "text-mint font-bold") : "text-amber font-bold"}>
                          {record.replacementCostPaid ? (record.isFound ? "Refunded" : "Paid") : "Pending"}
                        </span>
                      </label>
                    )}
                  </td>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={record.isFound} 
                        onChange={(e) => handleUpdateStatus(record._id, 'isFound', e.target.checked)}
                        style={{ marginRight: '0.5rem', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      <span className={record.isFound ? "text-primary font-bold" : "text-rose font-bold"}>
                        {record.isFound ? "Yes" : "No"}
                      </span>
                    </label>
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

export default LibrarianLostBooksTab;
