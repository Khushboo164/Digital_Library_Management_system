import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from "react-toastify";
import { FaStar, FaBook } from 'react-icons/fa';

const RatingsTab = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [ratings, setRatings] = useState({}); // bookId -> rating object
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch borrow history
      const borrowRes = await api.get('/member/borrow-history');
      const history = borrowRes.data.borrowHistory || [];
      
      // Extract unique books that were actually issued
      const uniqueBooksMap = {};
      history.forEach(h => {
        const isIssued = h.status === 'Borrowed' || h.status === 'Returned' || h.status === 'Lost';
        if (h.bookId && isIssued && !uniqueBooksMap[h.bookId]) {
          uniqueBooksMap[h.bookId] = {
            bookId: h.bookId,
            title: h.title,
            author: h.author,
            coverImage: h.coverImage
          };
        }
      });
      setBorrowedBooks(Object.values(uniqueBooksMap));

      // Fetch user's ratings
      const ratingRes = await api.get('/member/ratings');
      const userRatings = ratingRes.data.ratings || [];
      
      const ratingsMap = {};
      userRatings.forEach(r => {
        if (r.book && r.book._id) {
            ratingsMap[r.book._id] = r;
        } else if (r.book) {
            ratingsMap[r.book] = r;
        }
      });
      setRatings(ratingsMap);
    } catch (err) {
      toast.error('Failed to load ratings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRate = async (bookId, newRatingValue) => {
    try {
      const existingRating = ratings[bookId];
      if (existingRating) {
        // Update existing rating
        const res = await api.put(`/member/ratings/${existingRating._id}`, { rating: newRatingValue });
        setRatings({ ...ratings, [bookId]: res.data.rating });
        toast.success('Rating updated successfully!');
      } else {
        // Create new rating
        const res = await api.post('/member/ratings', { bookId, rating: newRatingValue });
        setRatings({ ...ratings, [bookId]: res.data.rating });
        toast.success('Rating added successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  if (loading) return <div className="flex justify-center" style={{ padding: '4rem 0' }}><FaStar className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>;

  return (
    <div className="animate-fade-in-up">
      <h3 className="section-title">Rate Your Borrowed Books</h3>
      <div className="book-grid">
        {borrowedBooks.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}><h4>You haven't borrowed any books yet.</h4></div>
        ) : (
          borrowedBooks.map(book => {
            const currentRating = ratings[book.bookId]?.rating || 0;
            return (
              <div key={book.bookId} className="book-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)', opacity: 0.5 }}>
                        <FaBook style={{ fontSize: '3rem', marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>{book.title}</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 0.2rem', fontSize: '1rem', color: 'var(--text-dark)' }}>{book.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{book.author}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.2rem', marginTop: 'auto' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <FaStar 
                      key={star} 
                      onClick={() => handleRate(book.bookId, star)}
                      style={{ 
                        cursor: 'pointer', 
                        color: star <= currentRating ? '#f39c12' : '#e0e0e0',
                        fontSize: '1.25rem',
                        transition: 'color 0.2s ease'
                      }} 
                    />
                  ))}
                </div>
                {currentRating > 0 && <span style={{ fontSize: '0.75rem', color: '#f39c12', fontWeight: 'bold' }}>{currentRating} out of 5</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default RatingsTab;
