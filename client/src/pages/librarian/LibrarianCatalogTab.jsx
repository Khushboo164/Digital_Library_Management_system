import React, { useState, useEffect } from 'react';
import { FaBook, FaPlus, FaSearch, FaSync, FaTimes, FaRedo, FaTrash, FaEdit } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LibrarianCatalogTab = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("random_none");
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeletedBooks, setShowDeletedBooks] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', category: '', 
    description: '', coverImage: '', publisher: '', 
    publishedYear: '', language: 'English', totalCopies: 1, availableCopies: 1
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/librarian/books${showDeletedBooks ? '?deleted=true' : ''}`);
      setBooks(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [showDeletedBooks]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData, totalCopies: parseInt(formData.totalCopies) || 1, availableCopies: parseInt(formData.availableCopies), publishedYear: parseInt(formData.publishedYear) || undefined };
      if (editingBook) {
        await api.put(`/librarian/books/${editingBook._id}`, payload);
        toast.success("Book updated successfully!");
        setEditingBook(null);
      } else {
        await api.post('/librarian/books', payload);
        toast.success("Book added successfully!");
      }
      setIsModalOpen(false);
      setFormData({ title: '', author: '', isbn: '', category: '', description: '', coverImage: '', publisher: '', publishedYear: '', language: 'English', totalCopies: 1, availableCopies: 1 });
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingBook ? 'update' : 'add'} book`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (book, e) => {
    if(e) e.stopPropagation();
    setEditingBook(book);
    setFormData({
      title: book.title || '', author: book.author || '', isbn: book.isbn || '', 
      category: book.category || '', description: book.description || '', 
      coverImage: book.coverImage || '', publisher: book.publisher || '', 
      publishedYear: book.publishedYear || '', language: book.language || 'English', 
      totalCopies: book.totalCopies || 1, availableCopies: book.availableCopies ?? 1
    });
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book? It will be moved to Deleted Books.")) return;
    try {
      await api.delete(`/librarian/books/${bookId}`);
      toast.success("Book removed successfully");
      setSelectedBook(null);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete book");
    }
  };

  const handleRestoreBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to restore this book to the main catalog?")) return;
    try {
      await api.put(`/librarian/books/${bookId}/restore`);
      toast.success("Book restored successfully");
      setSelectedBook(null);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore book");
    }
  };

  let filtered = books.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.includes(searchTerm)
  );

  if (selectedCategory !== "All") {
    filtered = filtered.filter(b => b.category === selectedCategory);
  }

  if (selectedSort !== "random_none") {
    const [sortBy, order] = selectedSort.split('_');
    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedBooks = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSort]);

  return (
    <>
      <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Browse Catalog</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => { setEditingBook(null); setFormData({ title: '', author: '', isbn: '', category: '', description: '', coverImage: '', publisher: '', publishedYear: '', language: 'English', totalCopies: 1, availableCopies: 1 }); setIsModalOpen(true); }} className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '24px' }}>
            <FaPlus /> Add New Book
          </button>
          <button onClick={() => setShowDeletedBooks(!showDeletedBooks)} className={`btn ${showDeletedBooks ? 'btn-primary' : 'btn-outline'} btn-sm`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '24px' }}>
            {showDeletedBooks ? <FaBook /> : <FaTrash />} 
            {showDeletedBooks ? 'Back to Catalog' : 'Deleted Books'}
          </button>
          <button onClick={fetchBooks} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '24px' }}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="catalog-bar mb-4">
        <div className="catalog-search" style={{ flex: '1' }}>
          <FaSearch className="catalog-search-icon" />
          <input 
            type="text" 
            className="input w-full" 
            placeholder="Search books, authors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="catalog-select">
          <option value="All">All Categories</option>
          <option value="Fiction">Fiction</option>
          <option value="Mystery">Mystery</option>
          <option value="Business">Business</option>
          <option value="Psychology">Psychology</option>
          <option value="Self Help">Self Help</option>
          <option value="History">History</option>
          <option value="Technology">Technology</option>
          <option value="Biography">Biography</option>
        </select>
        <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)} className="catalog-select">
          <option value="random_none">Random</option>
          <option value="createdAt_desc">Latest</option>
          <option value="title_asc">Title (A to Z)</option>
          <option value="title_desc">Title (Z to A)</option>
          <option value="averageRating_desc">Highest Rated</option>
          <option value="availableCopies_desc">Currently Available</option>
          <option value="publishedYear_desc">Publication Year (Newest)</option>
          <option value="publishedYear_asc">Publication Year (Oldest)</option>
        </select>
        <button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedSort("random_none"); fetchBooks(); }} className="topbar-btn" title="Reset">
          <FaRedo />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-8"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FaBook className="empty-icon" />
          <h3>No books found</h3>
          <p className="text-muted">Try adjusting your search or add a new book.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>{showDeletedBooks ? 'Deleted Date' : 'Added Date'}</th>
                <th>Stock (Avail/Total)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBooks.map(book => (
                <tr key={book._id} onClick={() => setSelectedBook(book)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '55px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-muted)' }}>
                         {book.coverImage ? <img src={book.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>No Img</div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{book.title}</div>
                        <div className="text-xs text-muted">by {book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td>{book.category}</td>
                  <td>{book.isbn || '-'}</td>
                  <td>{new Date(showDeletedBooks && book.deletedDate ? book.deletedDate : book.createdAt).toLocaleDateString()}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'space-between' }}>
                      <div style={{ whiteSpace: 'nowrap' }}>
                        <span className={`font-bold ${book.availableCopies === 0 ? 'text-rose' : 'text-mint'}`}>
                          {book.availableCopies}
                        </span> <span style={{ color: 'var(--text-muted)' }}>/ {book.totalCopies}</span>
                      </div>
                      {showDeletedBooks ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRestoreBook(book._id); }}
                          className="btn-icon bg-primary-light text-primary"
                          title="Restore Book"
                        >
                          <FaRedo />
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditClick(book, e); }}
                            className="btn-icon bg-sky-light text-sky"
                            title="Edit Book"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteBook(book._id); }}
                            className="btn-icon bg-rose-light text-rose"
                            title="Remove Book"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pager">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-outline btn-sm" style={{ borderRadius: '20px' }}>Previous</button>
          <div className="pager-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce((acc, page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) acc.push('...');
                acc.push(page);
                return acc;
              }, [])
              .map((item, idx) =>
                item === '...' ? (
                  <span key={`dots-${idx}`} className="pager-dots">…</span>
                ) : (
                  <button key={item} onClick={() => handlePageChange(item)} className={`pager-num ${currentPage === item ? 'active' : ''}`}>{item}</button>
                )
              )}
          </div>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn btn-outline btn-sm" style={{ borderRadius: '20px' }}>Next</button>
        </div>
      )}
      </div>

      {/* Add Book Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="panel animate-fade-in-up" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="input w-full" required />
                </div>
                <div>
                  <label className="label">Author *</label>
                  <input type="text" name="author" value={formData.author} onChange={handleChange} className="input w-full" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: editingBook ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">Category *</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} className="input w-full" required placeholder="e.g. Fiction, Science" />
                </div>
                <div>
                  <label className="label">ISBN</label>
                  <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} className="input w-full" />
                </div>
                <div>
                  <label className="label">Total Copies *</label>
                  <input type="number" name="totalCopies" min="1" value={formData.totalCopies} onChange={handleChange} className="input w-full" required />
                </div>
                {editingBook && (
                  <div>
                    <label className="label">Available Copies *</label>
                    <input type="number" name="availableCopies" min="0" max={formData.totalCopies} value={formData.availableCopies} onChange={handleChange} className="input w-full" required />
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">Publisher</label>
                  <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="input w-full" />
                </div>
                <div>
                  <label className="label">Published Year</label>
                  <input type="number" name="publishedYear" value={formData.publishedYear} onChange={handleChange} className="input w-full" placeholder="e.g. 2023" />
                </div>
                <div>
                  <label className="label">Language</label>
                  <input type="text" name="language" value={formData.language} onChange={handleChange} className="input w-full" />
                </div>
              </div>
              <div>
                <label className="label">Cover Image URL</label>
                <input type="url" name="coverImage" value={formData.coverImage} onChange={handleChange} className="input w-full" placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="input w-full" rows="3"></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (editingBook ? 'Updating...' : 'Adding...') : (editingBook ? 'Update Book' : 'Add Book')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="modal-bg" onClick={() => setSelectedBook(null)}>
          <div className="modal-card-v2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedBook(null)} className="modal-close-btn">✕</button>
            <div className="modal-v2-inner">
              <div className="modal-v2-cover">
                {selectedBook.coverImage ? (
                  <img src={selectedBook.coverImage} alt={selectedBook.title} />
                ) : (
                  <div className="modal-v2-cover-fallback"><FaBook /><span>{selectedBook.title}</span></div>
                )}
              </div>
              <div className="modal-v2-info">
                <span className="book-category">{selectedBook.category}</span>
                <h3 className="modal-v2-title">{selectedBook.title}</h3>
                <p className="modal-v2-author">by {selectedBook.author}</p>
                <div className="modal-v2-desc-scroll">
                  <p className="modal-v2-desc">{selectedBook.description || "No description provided."}</p>
                </div>
                <div className="modal-v2-meta">
                  <div><span className="meta-label">Publisher</span><span className="meta-value">{selectedBook.publisher || "N/A"}</span></div>
                  <div><span className="meta-label">Language</span><span className="meta-value">{selectedBook.language || "English"}</span></div>
                  <div><span className="meta-label">ISBN</span><span className="meta-value">{selectedBook.isbn || "N/A"}</span></div>
                  <div><span className="meta-label">Year</span><span className="meta-value">{selectedBook.publishedYear || "N/A"}</span></div>
                </div>
                <div className="modal-v2-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span className={`modal-v2-avail ${selectedBook.availableCopies > 0 ? "text-mint" : "text-amber"}`}>
                      {selectedBook.availableCopies > 0 ? `${selectedBook.availableCopies} / ${selectedBook.totalCopies} Available` : "Not Available"}
                    </span>
                    {selectedBook.editedDate && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Last Edited: {new Date(selectedBook.editedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {showDeletedBooks ? (
                      <button 
                        onClick={() => { handleRestoreBook(selectedBook._id); setSelectedBook(null); }}
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <FaRedo /> Restore Book
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => { setSelectedBook(null); handleEditClick(selectedBook); }}
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <FaEdit /> Edit Book
                        </button>
                        <button 
                          onClick={() => { handleDeleteBook(selectedBook._id); setSelectedBook(null); }}
                          className="btn btn-outline" 
                          style={{ borderColor: 'var(--rose)', color: 'var(--rose)', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <FaTrash /> Remove Book
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LibrarianCatalogTab;
