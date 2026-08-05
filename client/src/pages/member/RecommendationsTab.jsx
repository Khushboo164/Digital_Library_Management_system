
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaHeart, FaBook } from 'react-icons/fa';

const RecommendationsTab = ({ onBorrow, onReserve, onWishlist }) => {
  const [books, setBooks] = useState([]);
  
  useEffect(() => {
    api.get('/member/recommendations').then(res => setBooks(res.data.recommendations || []));
  }, []);

  return (
    <div className="animate-fade-in-up">
      <h3 className="section-title">Recommended For You</h3>
      <div className="book-grid">
        {books.map(book => (
          <div key={book._id} className="book-card">
            <div className="book-cover">
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
              ) : null}
              <div className="book-cover-fallback" style={book.coverImage ? { display: 'none' } : {}}><FaBook /><span>{book.title}</span></div>
              <button onClick={(e) => { e.stopPropagation(); onWishlist(book._id); }} className="wishlist-btn-overlay" title="Add to Wishlist">
                <FaHeart />
              </button>
            </div>
            <div className="book-details">
              <span className="book-category">{book.category}</span>
              <h4 className="book-name">{book.title}</h4>
              <p className="book-author">by {book.author}</p>
              <div className="book-footer-centered mt-2">
                {book.availableCopies > 0 ? (
                  <button onClick={(e) => { e.stopPropagation(); onBorrow(book._id); }} className="btn btn-primary borrow-btn-pill">Borrow</button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); onReserve(book._id); }} className="btn btn-outline borrow-btn-pill">Reserve</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecommendationsTab;
