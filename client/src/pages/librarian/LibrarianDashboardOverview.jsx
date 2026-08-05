import React from 'react';
import { 
  FaBook, FaUsers, FaCoins, FaExchangeAlt, FaUserSlash, FaExclamationCircle, 
  FaCheckCircle, FaClock, FaCalendarAlt, FaBell, FaTrophy, FaLongArrowAltRight, 
  FaExclamationTriangle, FaChartPie, FaPlusCircle, FaTrash, FaCheck, FaHistory,
  FaArrowUp, FaArrowDown, FaMagic, FaUndo
} from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: '800', color: '#1a1d2d' }}>{data.category || 'Unknown'}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Total Books: <strong style={{ color: '#1a1d2d' }}>{data.total}</strong></p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Available: <strong style={{ color: '#10b981' }}>{data.available}</strong></p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Borrowed: <strong style={{ color: '#3b82f6' }}>{data.borrowed}</strong></p>
      </div>
    );
  }
  return null;
};

const LibrarianDashboardOverview = ({ data, setActiveTab }) => {
  if (!data) return null;

  const donutData = data.insights?.collectionDistribution || [];
  const totalLibraryBooks = donutData.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Overview Cards (Top) */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: 0 }}>
        <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1d2d' }}>Total Members</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaUsers /></div>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{data.overview.totalMembers}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>Registered on platform</div>
          </div>
        </div>

        <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1d2d' }}>Total Books</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaBook /></div>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{data.overview.totalBooksEntered}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>In library catalog</div>
          </div>
        </div>

        <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1d2d' }}>Blocked Members</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fce7f3', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaUserSlash /></div>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{data.overview.blockedMembers}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>Restricted accounts</div>
          </div>
        </div>

        <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1d2d' }}>Books Borrowed</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaExchangeAlt /></div>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{data.overview.totalBooksWithdrawn}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>Currently checked out</div>
          </div>
        </div>
      </div>

      {/* Grid Layout for Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        
        {/* ROW 1: Assistant & Collection Donut Chart */}
        <div style={{ gridColumn: 'span 7', display: 'flex' }}>
          {/* BookSphere Librarian Assistant */}
          <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '340px', border: 'none', background: 'white', borderRadius: '18px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)', width: '100%' }}>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f3e8ff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.15)' }}>
                <FaMagic />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.1rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1a1d2d' }}>BookSphere Assistant</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Your intelligent workspace companion</p>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="assistant-scroll">
              
              {/* Borrow Request Pending */}
              {data.assistantData?.borrowRequestPendingCount > 0 && (
                <div className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaClock />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Borrow Request Pending</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}>You have <strong>{data.assistantData.borrowRequestPendingCount}</strong> borrow requests waiting.</div>
                    <button onClick={() => setActiveTab('workspace')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #d97706', color: '#d97706', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d97706'; }}>Review Requests</button>
                  </div>
                </div>
              )}

              {/* Overdue Member Alert */}
              {data.assistantData?.overdueMembersList?.map((borrow, i) => {
                const daysOverdue = Math.floor((new Date() - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24));
                return (
                  <div key={`overdue-${i}`} className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      <FaExclamationTriangle />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Overdue Member</div>
                      <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}><strong>{borrow.user?.name}</strong> is overdue by <strong>{daysOverdue} days</strong>.</div>
                      <button onClick={() => setActiveTab('overdue')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}>View Member</button>
                    </div>
                  </div>
                );
              })}

              {/* Return Request Pending */}
              {data.assistantData?.returnRequestPendingCount > 0 && (
                <div className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaLayerGroup />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Return Request Pending</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}>You have <strong>{data.assistantData.returnRequestPendingCount}</strong> return requests waiting.</div>
                    <button onClick={() => setActiveTab('workspace')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #10b981', color: '#10b981', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#10b981'; }}>Review Returns</button>
                  </div>
                </div>
              )}

              {/* Lost Books Pending */}
              {data.assistantData?.lostBooksPending > 0 && (
                <div className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaExclamationTriangle />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Lost Books Reported</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}>You have <strong>{data.assistantData.lostBooksPending}</strong> lost book reports to handle.</div>
                    <button onClick={() => setActiveTab('lost-books')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}>Handle Reports</button>
                  </div>
                </div>
              )}

              {/* Low Stock Books */}
              {data.assistantData?.lowStockBooksList?.map((book, i) => (
                <div key={'lowstock-' + i} className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaLayerGroup />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Low Stock Alert</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}><strong>{book.title}</strong> has only {book.availableCopies} {book.availableCopies === 1 ? 'copy' : 'copies'} left.</div>
                    <button onClick={() => setActiveTab('catalog')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f59e0b'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f59e0b'; }}>Check Catalog</button>
                  </div>
                </div>
              ))}

              {/* Reservation Ready */}
              {data.assistantData?.reservationsReady?.map((res, i) => (
                <div key={`res-${i}`} className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaBook />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Reserved Book Available</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}>Available for <strong>{res.user?.name}</strong>.</div>
                    <button onClick={() => setActiveTab('reservations')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #7e22ce', color: '#7e22ce', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#7e22ce'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7e22ce'; }}>Notify Member</button>
                  </div>
                </div>
              ))}

              {/* Low Stock Alert */}
              {data.assistantData?.lowStockBooksList?.map((book, i) => (
                <div key={`lowstock-${i}`} className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaExclamationCircle />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Low Book Copies</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}>"{book.title}" has only <strong>{book.availableCopies} copies</strong>.</div>
                    <button onClick={() => setActiveTab('catalog')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #c2410c', color: '#c2410c', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#c2410c'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c2410c'; }}>Manage Inventory</button>
                  </div>
                </div>
              ))}

              {/* Lost Book Update */}
              {data.assistantData?.lostBooksPending?.map((borrow, i) => (
                <div key={`lost-${i}`} className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaBook />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Lost Book Reported</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}>Replacement payment is pending.</div>
                    <button onClick={() => setActiveTab('payments')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #b91c1c', color: '#b91c1c', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#b91c1c'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b91c1c'; }}>Open Record</button>
                  </div>
                </div>
              ))}

              {/* Empty State Fallback */}
              {data.assistantData?.borrowRequestPendingCount === 0 &&
               data.assistantData?.overdueMembersList?.length === 0 &&
               data.assistantData?.reservationsReady?.length === 0 &&
               data.assistantData?.lowStockBooksList?.length === 0 &&
               data.assistantData?.lostBooksPending?.length === 0 &&
               data.assistantData?.fineData?.totalPendingFineAmount === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', background: '#f0fdf4', borderRadius: '12px', border: '1px dashed #86efac' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    <FaCheckCircle />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: 800, color: '#14532d' }}>Everything Looks Great!</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#166534' }}>No pending alerts.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 5', display: 'flex' }}>
          {/* Collection Distribution Chart */}
          <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '340px', width: '100%', borderRadius: '18px' }}>
             <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#1a1d2d' }}>Status Distribution</h3>
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 0 }}>
                <div style={{ flex: 1, position: 'relative', width: '100%', height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        innerRadius="70%"
                        outerRadius="90%"
                        paddingAngle={4}
                        dataKey="total"
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend on the right */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.5rem', overflowY: 'auto', maxHeight: '250px' }} className="assistant-scroll">
                  {donutData.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                      <span style={{ color: '#1a1d2d', fontWeight: 600 }}>{entry.category || 'Other'}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* ROW 2: Library Health & Top Borrowed Books */}
        <div style={{ gridColumn: 'span 6', display: 'flex' }}>
          <div className="panel" style={{ padding: '1.25rem', width: '100%', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.05rem', fontWeight: 800 }}>Library Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Books Available</span>
                  <span className="font-bold text-mint">{data.health.availableBooksCount}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (data.health.availableBooksCount / data.overview.totalBooks) * 100 || 0)}%`, height: '100%', background: 'var(--mint)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Books Borrowed</span>
                  <span className="font-bold text-primary">{data.health.booksCurrentlyIssued}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (data.health.booksCurrentlyIssued / totalLibraryBooks) * 100 || 0)}%`, height: '100%', background: 'var(--primary)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Books Reserved</span>
                  <span className="font-bold text-amber">{data.health.activeReservations}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (data.health.activeReservations / totalLibraryBooks) * 100 || 0)}%`, height: '100%', background: 'var(--amber)' }}></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.2rem' }}>
                <div style={{ padding: '0.6rem', background: 'var(--bg-body)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lost Books</span>
                  <span className="badge badge-error">{data.health.booksLost}</span>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-body)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Under Replacement</span>
                  <span className="badge badge-warning">{data.health.booksUnderReplacement}</span>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-body)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pending Returns</span>
                  <span className="badge badge-info">{data.health.awaitingReturnApproval}</span>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-body)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pending Borrows</span>
                  <span className="badge badge-primary">{data.health.awaitingBorrowApproval}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 6', display: 'flex', minHeight: 0 }}>
          <div className="panel" style={{ padding: '0', width: '100%', borderRadius: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1.25rem 1.25rem 0 1.25rem' }}>
              <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.05rem', fontWeight: 800 }}><FaTrophy className="text-amber" style={{ marginRight: '0.5rem' }}/> Top Borrowed Books</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="assistant-scroll">
              {data.popularBooks.length === 0 && <p className="text-muted">No data available</p>}
              {data.popularBooks.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '56px', background: 'var(--bg-body)', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {item.book.coverImage ? <img src={item.book.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaBook className="text-muted" style={{ margin: '1rem 0 0 0.8rem' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>{item.book.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem', marginBottom: '0.3rem' }}>{item.borrowCount} borrows</div>
                    <div style={{ width: '100%', height: '5px', background: 'var(--border)', borderRadius: '2.5px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (item.borrowCount / (data.popularBooks[0]?.borrowCount || 1)) * 100)}%`, height: '100%', background: 'var(--primary-gradient)' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* ROW 3: Financial Snapshot Enhanced */}
        <div style={{ gridColumn: 'span 12', display: 'flex' }}>
          <div className="panel" style={{ padding: '1.25rem', width: '100%', borderRadius: '18px' }}>
             <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800 }}>Financial Snapshot</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
               
               <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaCoins /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Today's Collection</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>₹{data.finance.todayCollection}</div>
                 </div>
               </div>
               
               <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaCalendarAlt /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Collection</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>₹{data.finance.monthCollection}</div>
                 </div>
               </div>
               
               <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaExclamationCircle /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Fines</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>₹{data.finance.pendingFine || 0}</div>
                 </div>
               </div>
               
               <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaBook /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Replacement</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>₹{data.finance.pendingReplacementCost || 0}</div>
                 </div>
               </div>
               
               <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaUndo /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Refunded</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>₹{data.finance.totalRefundedAmount || 0}</div>
                 </div>
               </div>

             </div>
          </div>
        </div>

        {/* ROW 4: Active Reservations & Recent Transactions */}
        <div style={{ gridColumn: 'span 6', display: 'flex' }}>
          <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '300px', width: '100%', borderRadius: '18px' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Active Reservations</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }} className="assistant-scroll">
              {(!data.activeReservationsList || data.activeReservationsList.length === 0) && <p className="text-muted text-center" style={{ marginTop: '2rem' }}>No active reservations</p>}
              {data.activeReservationsList?.map((res, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg-body)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span className="badge badge-primary" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        Reserved
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(res.reservationDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{res.user?.name || 'Unknown Member'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.book?.title || 'Unknown Book'}</div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => setActiveTab('reservations')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '6px', marginLeft: '0.5rem' }}>Review</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 6', display: 'flex' }}>
          <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '300px', width: '100%', borderRadius: '18px' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Recent Activity</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="assistant-scroll">
              {data.recentTransactions.length === 0 && <p className="text-muted text-center" style={{ marginTop: '2rem' }}>No recent activity</p>}
              {data.recentTransactions.map((tx, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', position: 'relative' }}>
                  {/* Timeline line */}
                  {i < data.recentTransactions.length - 1 && <div style={{ position: 'absolute', left: '14px', top: '28px', bottom: '-20px', width: '2px', background: 'var(--border)' }}></div>}
                  
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, border: '2px solid white', fontSize: '0.8rem' }}>
                    {tx.action.includes('Add') ? <FaPlusCircle /> : tx.action.includes('Approve') ? <FaCheckCircle /> : <FaHistory />}
                  </div>
                  <div style={{ paddingBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{tx.action}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{tx.member?.name || tx.book?.title || 'System'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.1rem' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ROW 5: Top Active Members */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ gridColumn: 'span 6', display: 'flex', minHeight: 0 }}>
          <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', width: '100%', borderRadius: '18px', height: '100%' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Top Active Members</h3>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(!data.topMembers || data.topMembers.length === 0) && <p className="text-muted text-center" style={{ marginTop: '1rem' }}>No data available</p>}
              {data.topMembers?.map((member, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {member.user.profileImage ? <img src={member.user.profileImage} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>{member.user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.count} Borrows</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>{member.percentage}%</div>
                    <svg width="32" height="32" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${member.percentage}, 100`} />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboardOverview;
