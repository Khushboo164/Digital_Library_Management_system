import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaMagic, FaExclamationTriangle, FaCoins, FaCheckCircle, 
  FaBookOpen, FaHeart, FaStar, FaLightbulb, FaTrophy, FaCalendarCheck, FaClock
} from 'react-icons/fa';

const BookSphereAssistant = ({ dashboardData, setActiveTab }) => {
  const navigate = useNavigate();

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Generate Assistant Feed Items
  const generateAssistantItems = () => {
    const items = [];
    if (!dashboardData) return items;

    // 1. Overdue books
    const overdueBooks = dashboardData.currentlyBorrowedBooks?.filter(b => b.daysRemaining < 0) || [];
    overdueBooks.forEach(b => {
      items.push({
        id: `overdue-${b.borrowId}`,
        priority: 1,
        title: 'Book Overdue',
        description: `"${b.title}" was due on ${formatDate(b.dueDate)}.`,
        extra: b.fine ? `Fine: ₹${b.fine}` : '',
        icon: <FaExclamationTriangle />,
        color: '#dc2626', // red
        bgColor: 'rgba(220, 38, 38, 0.1)',
        action: { label: 'Pay Fine / Return', onClick: () => setActiveTab('due-books') }
      });
    });

    // 2. Pending fine payment
    if (dashboardData.paymentSummary?.pendingFine > 0) {
      items.push({
        id: 'pending-fine',
        priority: 2,
        title: 'Fine Payment Pending',
        description: `You have unpaid fines totaling ₹${dashboardData.paymentSummary.pendingFine}.`,
        icon: <FaCoins />,
        color: '#dc2626', // red
        bgColor: 'rgba(220, 38, 38, 0.1)',
        action: { label: 'Pay Fine', onClick: () => setActiveTab('fines') }
      });
    }

    // 3. Pending replacement payment
    if (dashboardData.paymentSummary?.pendingReplacementCost > 0) {
      items.push({
        id: 'pending-replacement',
        priority: 3,
        title: 'Replacement Payment Pending',
        description: `You have an unpaid replacement charge of ₹${dashboardData.paymentSummary.pendingReplacementCost}.`,
        icon: <FaCoins />,
        color: '#e11d48', // deep rose/red
        bgColor: 'rgba(225, 29, 72, 0.1)',
        action: { label: 'Pay Now', onClick: () => setActiveTab('payments') }
      });
    }

    // 4. Reserved book available
    const reservedAvailable = dashboardData.activeReservations?.filter(r => r.status === "Fulfilled") || [];
    reservedAvailable.forEach(r => {
      items.push({
        id: `reservation-ready-${r._id}`,
        priority: 4,
        title: 'Reserved Book Available',
        description: `"${r.book?.title}" is ready for you to collect.`,
        icon: <FaCheckCircle />,
        color: 'var(--mint)',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        action: { label: 'Borrow Now', onClick: () => setActiveTab('reservations') }
      });
    });

    // 5. Return approval
    const returnApproved = dashboardData.currentlyBorrowedBooks?.filter(b => b.status === "Return Approved") || [];
    returnApproved.forEach(b => {
      items.push({
        id: `return-approved-${b.borrowId}`,
        priority: 5,
        title: 'Return Approved',
        description: `Please submit "${b.title}" at the library counter.`,
        icon: <FaBookOpen />,
        color: 'var(--primary)',
        bgColor: 'rgba(139, 92, 246, 0.1)'
      });
    });

    // 6. Borrow approval
    const borrowApproved = dashboardData.currentlyBorrowedBooks?.filter(b => b.status === "Borrow Approved") || [];
    borrowApproved.forEach(b => {
      items.push({
        id: `borrow-approved-${b.borrowId}`,
        priority: 6,
        title: 'Borrow Approved',
        description: `"${b.title}" is approved! Collect it from the library.`,
        icon: <FaCheckCircle />,
        color: 'var(--primary)',
        bgColor: 'rgba(139, 92, 246, 0.1)',
        action: { label: 'View Details', onClick: () => setActiveTab('overview') }
      });
    });

    // 7. Borrow request pending
    const borrowRequested = dashboardData.currentlyBorrowedBooks?.filter(b => b.status === "Borrow Requested") || [];
    borrowRequested.forEach(b => {
      items.push({
        id: `borrow-pending-${b.borrowId}`,
        priority: 7,
        title: 'Borrow Request Pending',
        description: `Waiting for librarian approval for "${b.title}".`,
        icon: <FaClock />,
        color: 'var(--amber)',
        bgColor: 'rgba(245, 158, 11, 0.1)'
      });
    });

    // 8. Upcoming due books
    const upcomingBooks = dashboardData.currentlyBorrowedBooks?.filter(b => b.daysRemaining >= 0 && b.daysRemaining <= 3 && b.status === 'Borrowed') || [];
    upcomingBooks.forEach(b => {
      items.push({
        id: `due-soon-${b.borrowId}`,
        priority: 8,
        title: 'Book Due Soon',
        description: `"${b.title}" is due ${b.daysRemaining === 0 ? 'today' : `in ${b.daysRemaining} days`}.`,
        icon: <FaCalendarCheck />,
        color: 'var(--amber)',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        action: { label: 'Request Return', onClick: () => navigate(`/member/books/${b.bookId || ''}`) }
      });
    });

    // 9. Wishlist available
    const wishlistAvail = dashboardData.wishlistAvailable || [];
    wishlistAvail.forEach(w => {
      items.push({
        id: `wishlist-${w._id}`,
        priority: 9,
        title: 'Wishlist Item Available',
        description: `"${w.title}" is now available to borrow.`,
        icon: <FaHeart />,
        color: '#ec4899', // pink
        bgColor: 'rgba(236, 72, 153, 0.1)',
        action: { label: 'View Book', onClick: () => navigate(`/member/books/${w._id}`) }
      });
    });

    // 10. Rating reminder
    const unrated = dashboardData.unratedBooks || [];
    unrated.forEach(u => {
      items.push({
        id: `unrated-${u.borrowId}`,
        priority: 10,
        title: 'Rate Your Recent Book',
        description: `How was "${u.title}"?`,
        icon: <FaStar />,
        color: '#eab308', // yellow
        bgColor: 'rgba(234, 179, 8, 0.1)',
        action: { label: 'Rate Book', onClick: () => setActiveTab('ratings') }
      });
    });

    // 11. Recommendations
    const recs = dashboardData.recommendationsPreview || [];
    if (recs.length > 0) {
      const topRec = recs[0];
      items.push({
        id: `rec-${topRec._id}`,
        priority: 11,
        title: 'Recommended For You',
        description: `"${topRec.title}" based on your reading history.`,
        icon: <FaLightbulb />,
        color: '#06b6d4', // cyan
        bgColor: 'rgba(6, 182, 212, 0.1)',
        action: { label: 'View Book', onClick: () => navigate(`/member/books/${topRec._id}`) }
      });
    }

    // 12. Reading achievements
    const totalBorrows = dashboardData.overviewStats?.totalSuccessfulBorrows || 0;
    if (totalBorrows >= 1) { 
        items.push({
            id: `achievement-borrows`,
            priority: 12,
            title: 'Achievement Unlocked',
            description: `You've completed ${totalBorrows} successful borrows! Keep reading.`,
            icon: <FaTrophy />,
            color: 'var(--mint)',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        });
    }

    // Sort items by priority
    return items.sort((a, b) => a.priority - b.priority);
  };

  const feedItems = generateAssistantItems();

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '1.25rem', height: '340px' }}>
      <div className="panel-head" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', 
          background: 'var(--primary-light)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary-dark)', fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
        }}>
          <FaMagic style={{ animation: 'pulse 2s infinite' }} />
        </div>
        <div>
          <h3 className="panel-title" style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>BookSphere Assistant</h3>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>Your personalized reading assistant</p>
        </div>
      </div>

      <div className="assistant-scroll-container" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingRight: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          minHeight: 0,
          /* Fallback standard properties */
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--primary-light) transparent'
      }}>
        <style>{`
          .assistant-scroll-container::-webkit-scrollbar {
            width: 4px;
          }
          .assistant-scroll-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .assistant-scroll-container::-webkit-scrollbar-thumb {
            background-color: var(--primary-light);
            border-radius: 4px;
          }
          .assistant-card {
            background: rgba(255, 255, 255, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 14px;
            padding: 1rem;
            display: flex;
            gap: 1rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
            animation: slideInUp 0.4s ease forwards;
            opacity: 0;
            transform: translateY(10px);
          }
          .assistant-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            background: rgba(255, 255, 255, 0.7);
          }
          @keyframes slideInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .assistant-icon-box {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            flex-shrink: 0;
          }
        `}</style>

        {feedItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '0.5rem' }}>
            {feedItems.map((item, index) => (
              <div 
                key={item.id} 
                className="assistant-card" 
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="assistant-icon-box" style={{ background: item.bgColor, color: item.color }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {item.title}
                  </h4>
                  <p style={{ margin: '0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {item.description}
                  </p>
                  {item.extra && (
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', fontWeight: 700, color: item.color }}>
                      {item.extra}
                    </p>
                  )}
                  {item.action && (
                    <button 
                      onClick={item.action.onClick}
                      style={{
                        marginTop: '0.5rem',
                        background: 'transparent',
                        border: `1px solid ${item.color}`,
                        color: item.color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'inline-block'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = item.color;
                        e.target.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = item.color;
                      }}
                    >
                      {item.action.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', opacity: 0.8, textAlign: 'center', minHeight: '200px' }}>
            <FaCheckCircle style={{ fontSize: '3rem', color: 'var(--mint)', marginBottom: '1rem', opacity: 0.5 }} />
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: 'var(--text-dark)' }}>🎉 You're all caught up!</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>No pending requests, payments or due books.</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>Enjoy reading with BookSphere.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSphereAssistant;
