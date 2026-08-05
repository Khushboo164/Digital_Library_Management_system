
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from "react-toastify";

import { FaHeart, FaTrash, FaBook } from 'react-icons/fa';

const WishlistTab = ({ onBorrow }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/member/wishlist');
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/member/wishlist/${id}`);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in-up">
      <h3 className="section-title">My Wishlist</h3>
      {wishlist.length === 0 ? (
        <div className="empty-state"><h4>No books in wishlist</h4></div>
      ) : (
        <div className="book-grid">
          {wishlist.map(item => (
            <div key={item._id} className="book-card">
              <div className="book-cover">
                {item.book.coverImage ? <img src={item.book.coverImage} alt={item.book.title} /> : <div>{item.book.title}</div>}
              </div>
              <div className="book-details">
                <span className="book-category">{item.book.category}</span>
                <h4 className="book-name">{item.book.title}</h4>
                <p className="book-author">by {item.book.author}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleRemove(item._id)} className="btn btn-outline btn-sm">Remove</button>
                  {item.book.availableCopies > 0 && (
                     <button onClick={() => onBorrow(item.book._id)} className="btn btn-primary btn-sm">Borrow</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default WishlistTab;
