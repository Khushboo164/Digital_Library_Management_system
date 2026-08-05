import React from 'react';
import { FaUsers, FaBook, FaUserTie, FaExclamationTriangle, FaChartPie, FaBell, FaExchangeAlt, FaMagic, FaClock, FaExclamationCircle, FaCheckCircle, FaTrophy, FaCoins, FaCalendarAlt, FaUndo, FaPlusCircle, FaHistory } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: '800', color: '#1a1d2d' }}>{data.name}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Total Books: <strong style={{ color: '#1a1d2d' }}>{data.value}</strong></p>
      </div>
    );
  }
  return null;
};

const AdminDashboardOverview = ({ data, setActiveTab }) => {
  if (!data) return <div className="text-center py-10">Loading overview...</div>;

  return (
    <div className="admin-overview animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Stat Cards */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: 0 }}>
        
        {/* Card 1: Total Members */}
        <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1d2d' }}>Total Members</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaUsers /></div>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{data.totalMembers}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>Registered on platform</div>
          </div>
        </div>

        {/* Card 2: Total Librarians */}
        <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1d2d' }}>Total Librarians</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaUserTie /></div>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{data.totalLibrarians}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>Library staff</div>
          </div>
        </div>

        {/* Card 3: Total Books */}
        <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1d2d' }}>Total Books</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaBook /></div>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{data.totalBooks}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>In library catalog</div>
          </div>
        </div>

        {/* Card 4: Books Borrowed */}
        <div className="panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '16px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1d2d' }}>Books Borrowed</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaExchangeAlt /></div>
          </div>
          <div style={{ marginTop: '0.2rem' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#334155', lineHeight: 1 }}>{data.health?.booksCurrentlyIssued || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.4rem' }}>Currently checked out</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        
        {/* ROW 1: Assistant & Collection Donut Chart */}
        <div style={{ gridColumn: 'span 7', display: 'flex' }}>
          {/* BookSphere Admin Assistant */}
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
              {data.pendingBorrowRequests > 0 && (
                <div className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaClock />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Borrow Request Pending</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}>You have <strong>{data.pendingBorrowRequests}</strong> borrow requests waiting.</div>
                    <button onClick={() => setActiveTab('workspace')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #d97706', color: '#d97706', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d97706'; }}>Review Requests</button>
                  </div>
                </div>
              )}

              {/* Overdue Alert */}
              {data.overdueBooks > 0 && (
                <div className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaExclamationTriangle />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Overdue Books Alert</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}>There are <strong>{data.overdueBooks}</strong> overdue books in the system.</div>
                    <button onClick={() => setActiveTab('members')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #dc2626', color: '#dc2626', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#dc2626'; }}>Review Overdue</button>
                  </div>
                </div>
              )}

              {/* Blocked Users Alert */}
              {data.blockedUsers > 0 && (
                <div className="assistant-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FaExclamationCircle />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1d2d' }}>Blocked Users Alert</div>
                    <div style={{ fontSize: '0.85rem', color: '#8a94a6', lineHeight: 1.3 }}><strong>{data.blockedUsers}</strong> users are currently blocked from borrowing.</div>
                    <button onClick={() => setActiveTab('users')} style={{ marginTop: '0.2rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', background: 'transparent', border: '1px solid #ea580c', color: '#ea580c', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ea580c'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ea580c'; }}>View Users</button>
                  </div>
                </div>
              )}

              {/* Empty State Fallback */}
              {data.pendingBorrowRequests === 0 &&
               data.overdueBooks === 0 &&
               data.blockedUsers === 0 && (
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
          {/* Status Distribution Chart */}
          <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '340px', width: '100%', borderRadius: '18px', background: 'white', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)', border: 'none' }}>
             <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#1a1d2d' }}>Status Distribution</h3>
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 0 }}>
                <div style={{ flex: 1, position: 'relative', width: '100%', height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.insights?.collectionDistribution || []}
                        innerRadius="70%"
                        outerRadius="90%"
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {(data.insights?.collectionDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={CustomTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend on the right */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '1.5rem', overflowY: 'auto', maxHeight: '250px' }} className="assistant-scroll">
                  {(data.insights?.collectionDistribution || []).map((entry, index) => (
                    <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                      <span style={{ color: '#1a1d2d', fontWeight: 600 }}>{entry.name || 'Other'}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ROW 2: Library Health & Top Borrowed Books */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        <div style={{ gridColumn: 'span 6', display: 'flex' }}>
          <div className="panel" style={{ padding: '1.25rem', width: '100%', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ margin: '0 0 1.2rem 0', fontSize: '1.05rem', fontWeight: 800 }}>Library Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Books Available</span>
                  <span className="font-bold text-mint">{data.health?.availableBooksCount || 0}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((data.health?.availableBooksCount || 0) / (data.totalBooks || 1)) * 100)}%`, height: '100%', background: 'var(--mint)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Books Borrowed</span>
                  <span className="font-bold text-primary">{data.health?.booksCurrentlyIssued || 0}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((data.health?.booksCurrentlyIssued || 0) / (data.totalBooks || 1)) * 100)}%`, height: '100%', background: 'var(--primary)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Books Reserved</span>
                  <span className="font-bold text-amber">{data.health?.activeReservations || 0}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((data.health?.activeReservations || 0) / (data.totalBooks || 1)) * 100)}%`, height: '100%', background: 'var(--amber)' }}></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.2rem' }}>
                <div style={{ padding: '0.6rem', background: 'var(--bg-body)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Lost Books</span>
                  <span className="badge badge-danger">{data.health?.booksLost || 0}</span>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-body)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Under Replacement</span>
                  <span className="badge badge-warning">{data.health?.booksUnderReplacement || 0}</span>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-body)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pending Returns</span>
                  <span className="badge badge-sky">{data.health?.awaitingReturnApproval || 0}</span>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-body)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pending Borrows</span>
                  <span className="badge badge-primary">{data.health?.awaitingBorrowApproval || 0}</span>
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
              {(!data.popularBooks || data.popularBooks.length === 0) && <p className="text-muted">No data available</p>}
              {data.popularBooks && data.popularBooks.map((item, i) => (
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
      </div>

      {/* ROW 3: Financial Snapshot Enhanced */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        <div style={{ gridColumn: 'span 12', display: 'flex' }}>
          <div className="panel" style={{ padding: '1.25rem', width: '100%', borderRadius: '18px' }}>
             <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800 }}>Financial Snapshot</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
               
               <div style={{ padding: '1.25rem', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaCoins /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Today's Collection</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{data.finance?.todayCollection || 0}</div>
                 </div>
               </div>
               
               <div style={{ padding: '1.25rem', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaCalendarAlt /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Collection</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{data.finance?.monthCollection || 0}</div>
                 </div>
               </div>
               
               <div style={{ padding: '1.25rem', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaExclamationCircle /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Fines</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{data.finance?.pendingFine || 0}</div>
                 </div>
               </div>
               
               <div style={{ padding: '1.25rem', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.15)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaBook /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Replacement</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{data.finance?.pendingReplacementCost || 0}</div>
                 </div>
               </div>
               
               <div style={{ padding: '1.25rem', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><FaUndo /></div>
                 <div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Refunded</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{data.finance?.totalRefundedAmount || 0}</div>
                 </div>
               </div>

             </div>
          </div>
        </div>
      </div>

      {/* ROW 4: Active Reservations & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
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
              {(!data.recentEvents || data.recentEvents.length === 0) && <p className="text-muted text-center" style={{ marginTop: '2rem' }}>No recent activity</p>}
              {data.recentEvents?.map((tx, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', position: 'relative' }}>
                  {/* Timeline line */}
                  {i < data.recentEvents.length - 1 && <div style={{ position: 'absolute', left: '14px', top: '28px', bottom: '-20px', width: '2px', background: 'var(--border)' }}></div>}
                  
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, border: '2px solid white', fontSize: '0.8rem' }}>
                    {tx.action.includes('Add') ? <FaPlusCircle /> : tx.action.includes('Approve') || tx.action.includes('Update') ? <FaCheckCircle /> : <FaHistory />}
                  </div>
                  <div style={{ paddingBottom: '0.4rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{tx.action}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{tx.details || tx.admin?.name || 'System'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.1rem' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5: Top Active Librarians & Top Active Members */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        <div style={{ gridColumn: 'span 6', display: 'flex' }}>
          <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', width: '100%', borderRadius: '18px' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Top Active Librarians</h3>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(!data.topLibrarians || data.topLibrarians.length === 0) && <p className="text-muted text-center" style={{ marginTop: '1rem' }}>No data available</p>}
              {data.topLibrarians?.map((lib, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {lib.user.profileImage ? <img src={lib.user.profileImage} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : lib.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>{lib.user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lib.count} Actions</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{lib.percentage}%</div>
                    <svg width="32" height="32" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${lib.percentage}, 100`} />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 6', display: 'flex' }}>
          <div className="panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', width: '100%', borderRadius: '18px' }}>
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

export default AdminDashboardOverview;
