import React, { useState, useEffect } from 'react';
import { FaSync, FaCalendarAlt, FaBook, FaUserTie, FaUser, FaCog, FaShieldAlt, FaHistory, FaSearch, FaChartBar, FaBell, FaExclamationTriangle, FaBan, FaArrowRight } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const formatTimeOnly = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
};

const AdminMyActivitiesTab = ({ setActiveTab }) => {
  const [data, setData] = useState([]);
  const [needsAttention, setNeedsAttention] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [activeFilters, setActiveFilters] = useState({ date: "", month: "", year: "" });
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/activities');
      setData(res.data.activities || res.data);
      if (res.data.needsAttention) {
          setNeedsAttention(res.data.needsAttention);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch activities data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getFilteredTimeline = () => {
    if (!data) return [];
    let filtered = data;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a => 
            (a.action || "").toLowerCase().includes(q) || 
            (a.category || "").toLowerCase().includes(q) ||
            (a.targetUser?.name || "").toLowerCase().includes(q) ||
            (a.targetUser?.email || "").toLowerCase().includes(q) ||
            (a.targetBook?.title || "").toLowerCase().includes(q)
        );
    }
    
    if (activeFilters.date || activeFilters.month || activeFilters.year) {
        filtered = filtered.filter(a => {
            if (!a.createdAt) return false;
            const dt = new Date(a.createdAt);
            const d = dt.getDate().toString().padStart(2,'0');
            const m = (dt.getMonth()+1).toString().padStart(2,'0');
            const y = dt.getFullYear().toString();
            
            if (activeFilters.date && d !== activeFilters.date) return false;
            if (activeFilters.month && m !== activeFilters.month) return false;
            if (activeFilters.year && y !== activeFilters.year) return false;
            return true;
        });
    }

    return filtered;
  };

  const filteredTimeline = getFilteredTimeline();

  const getInsights = () => {
    if (!data || data.length === 0) return { todayCount: 0, mostFreqCat: "N/A", mostFreqAct: "N/A", mostActiveHour: "N/A", totalWeek: 0 };
    
    let todayCount = 0;
    let weekCount = 0;
    const freqCatMap = {};
    const freqActMap = {};
    const hourMap = {};

    const now = new Date();
    
    data.forEach(a => {
        if(!a.createdAt) return;
        const dt = new Date(a.createdAt);
        
        // Today
        if(dt.toDateString() === now.toDateString()) todayCount++;
        
        // This Week (last 7 days)
        if((now - dt) / (1000 * 60 * 60 * 24) <= 7) weekCount++;
        
        // Freq Map (Category)
        const cat = a.category || "Other";
        freqCatMap[cat] = (freqCatMap[cat] || 0) + 1;
        
        // Freq Map (Action)
        const act = a.action || "Other";
        freqActMap[act] = (freqActMap[act] || 0) + 1;
        
        // Hour Map
        const h = dt.getHours();
        hourMap[h] = (hourMap[h] || 0) + 1;
    });

    const mostFreqCat = Object.keys(freqCatMap).sort((a,b) => freqCatMap[b]-freqCatMap[a])[0] || "N/A";
    const mostFreqAct = Object.keys(freqActMap).sort((a,b) => freqActMap[b]-freqActMap[a])[0] || "N/A";
    
    const mostActiveHrNum = parseInt(Object.keys(hourMap).sort((a,b) => hourMap[b]-hourMap[a])[0]);
    const mostActiveHour = isNaN(mostActiveHrNum) ? "N/A" : `${mostActiveHrNum % 12 || 12} ${mostActiveHrNum >= 12 ? 'PM' : 'AM'}`;

    return {
        todayCount, mostFreqCat, mostFreqAct, mostActiveHour, totalWeek: weekCount
    };
  };

  const insights = getInsights();
  const targetActivities = 10;
  const completedActivities = insights.todayCount;
  const progressPct = Math.min(100, Math.round((completedActivities / targetActivities) * 100));

  const handleApplyFilter = () => {
      setActiveFilters({
          date: filterDate,
          month: filterMonth,
          year: filterYear
      });
  };

  const getColorForCategory = (category) => {
      const lower = (category || "").toLowerCase();
      if(lower.includes("book")) return "primary";
      if(lower.includes("user") || lower.includes("member")) return "rose";
      if(lower.includes("system") || lower.includes("setting")) return "sky";
      if(lower.includes("librarian")) return "cyan";
      if(lower.includes("security")) return "amber";
      return "muted";
  };

  const getIconForCategory = (category) => {
      const lower = (category || "").toLowerCase();
      if(lower.includes("book")) return <FaBook />;
      if(lower.includes("user") || lower.includes("member")) return <FaUser />;
      if(lower.includes("system") || lower.includes("setting")) return <FaCog />;
      if(lower.includes("librarian")) return <FaUserTie />;
      if(lower.includes("security")) return <FaShieldAlt />;
      return <FaHistory />;
  };

  if (loading) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>;
  }

  return (
    <>
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>My Activities</h1>
          <button onClick={fetchData} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }} disabled={loading}><FaSync className={loading ? "spin" : ""} /> Refresh Feed</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          
          {/* LEFT: ACTIVITY FEED */}
          <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', overflowY: 'auto' }}>
                  <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, padding: '1.5rem 1.5rem 1rem 1.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1.5rem', borderRadius: '16px 16px 0 0' }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>Activity Feed</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                              type="text" 
                              placeholder="Search by User, Book Title, or Action..." 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                          />
                          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                              <FaSearch /> Search
                          </button>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                          <select value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', border: 'none', outline: 'none', fontWeight: 600, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%238b5cf6'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', fontSize: '0.9rem' }}>
                              <option value="">Date</option>
                              {[...Array(31)].map((_, i) => <option key={i+1} value={(i+1).toString().padStart(2,'0')}>{i+1}</option>)}
                          </select>
                          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', border: 'none', outline: 'none', fontWeight: 600, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%238b5cf6'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', fontSize: '0.9rem' }}>
                              <option value="">Month</option>
                              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => <option key={i+1} value={(i+1).toString().padStart(2,'0')}>{m}</option>)}
                          </select>
                          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', border: 'none', outline: 'none', fontWeight: 600, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%238b5cf6'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', fontSize: '0.9rem' }}>
                              <option value="">Year</option>
                              {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y.toString()}>{y}</option>; })}
                          </select>
                          <button onClick={handleApplyFilter} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '25px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                              Apply Filter
                          </button>
                          {(activeFilters.date || activeFilters.month || activeFilters.year || searchQuery) && (
                              <button onClick={() => { setFilterDate(""); setFilterMonth(""); setFilterYear(""); setActiveFilters({ date: "", month: "", year: "" }); setSearchQuery(""); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.6rem 1.25rem', borderRadius: '25px', fontWeight: 600, cursor: 'pointer' }}>
                                  Clear Filters
                              </button>
                          )}
                      </div>
                  </div>

              {/* TIMELINE */}
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                  {filteredTimeline.length === 0 ? (
                      <div className="text-center text-muted py-8">No activities found.</div>
                  ) : (
                      (() => {
                          const groupedTimeline = filteredTimeline.reduce((acc, curr) => {
                              const d = new Date(curr.createdAt);
                              const dateLabel = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                              if (!acc[dateLabel]) acc[dateLabel] = [];
                              acc[dateLabel].push(curr);
                              return acc;
                          }, {});
                          
                          return Object.keys(groupedTimeline).map((dateLabel, gIdx) => (
                              <div key={dateLabel} style={{ marginBottom: gIdx === Object.keys(groupedTimeline).length - 1 ? 0 : '2rem' }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(139,92,246,0.1)', display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '25px', marginBottom: '1.5rem' }}>
                                      {dateLabel}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '0.5rem' }}>
                                      {groupedTimeline[dateLabel].map((item, aIdx) => {
                                          const color = getColorForCategory(item.category);
                                          const isLast = aIdx === groupedTimeline[dateLabel].length - 1;
                                          return (
                                              <div key={item._id} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                                                  {!isLast && <div style={{ position: 'absolute', left: '60px', top: '36px', bottom: '-24px', width: '2px', background: '#f1f5f9', zIndex: 0 }}></div>}
                                                  
                                                  <div style={{ width: '60px', textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8', paddingTop: '0.5rem', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
                                                      <span>{formatTimeOnly(item.createdAt).split(' ')[0]}</span>
                                                      <span>{formatTimeOnly(item.createdAt).split(' ')[1]}</span>
                                                  </div>
                                                  
                                                  <div style={{ zIndex: 1, width: '36px', height: '36px', borderRadius: '50%', background: `var(--${color})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.15rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                      {getIconForCategory(item.category)}
                                                  </div>
                                                  
                                                  <div style={{ flex: 1, background: 'white', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                                      <div>
                                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                              <strong style={{ color: 'var(--text-dark)', fontSize: '0.95rem' }}>{item.action}</strong>
                                                              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: `rgba(var(--${color}-rgb), 0.1)`, color: `var(--${color})`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.category}</span>
                                                          </div>
                                                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.description || item.action}</div>
                                                          
                                                          {(item.targetBook || item.targetUser) && (
                                                              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                                                  {item.targetBook && <span>Target Book: {item.targetBook.title}</span>}
                                                                  {item.targetUser && <span>Target User: {item.targetUser.name}</span>}
                                                              </div>
                                                          )}
                                                      </div>
                                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                                          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.75rem', borderRadius: '12px', background: '#dcfce7', color: '#166534', fontWeight: 700 }}>Completed</span>
                                                          <button onClick={() => setSelectedActivity(item)} style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.background='var(--primary)'; e.target.style.color='white';}} onMouseLeave={e => {e.target.style.background='none'; e.target.style.color='var(--primary)';}}>
                                                              View Details
                                                          </button>
                                                      </div>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          ));
                      })()
                  )}
              </div>
          </div>
      </div>

          {/* RIGHT: INSIGHTS & TARGETS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Activity Insights */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaChartBar className="text-primary" /> Activity Insights
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaHistory/> Most Frequent Category</span>
                          <strong style={{ color: 'var(--text-dark)' }}>{insights.mostFreqCat}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaSync/> Most Frequent Action</span>
                          <strong style={{ color: 'var(--text-dark)' }}>{insights.mostFreqAct}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaHistory/> Most Active Hour</span>
                          <strong style={{ color: 'var(--text-dark)' }}>{insights.mostActiveHour}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaHistory/> Total Actions (All Time)</span>
                          <strong style={{ color: 'var(--text-dark)' }}>{data.length}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaSync/> Total Actions This Week</span>
                          <strong style={{ color: 'var(--text-dark)', fontSize: '1rem' }}>{insights.totalWeek}</strong>
                      </div>
                  </div>
              </div>

              {/* Today's Performance */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaHistory className="text-primary" /> Today's Performance
                  </h3>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray={`${progressPct}, 100`} />
                          </svg>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                              {progressPct}%
                          </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target</span>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>{targetActivities} Activities</strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</span>
                              <strong style={{ fontSize: '0.9rem', color: '#16a34a' }}>{completedActivities}</strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining</span>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>{Math.max(0, targetActivities - completedActivities)}</strong>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Needs Your Attention */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaBell className="text-rose" /> Needs Your Attention
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: 600 }}><FaBan className="text-rose"/> Blocked Members</span>
                          <span style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>{needsAttention.blockedMembers || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: 600 }}><FaExclamationTriangle className="text-rose"/> Unverified Accounts</span>
                          <span style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>{needsAttention.unverifiedUsers || 0}</span>
                      </div>
                  </div>
                  
                  <button onClick={() => setActiveTab('workspace')} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 700, width: '100%', cursor: 'pointer' }}>
                      Go to Workspace <FaArrowRight />
                  </button>
                  <button onClick={() => setActiveTab('lost-books')} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 700, width: '100%', cursor: 'pointer', color: 'var(--text-dark)', background: 'transparent' }}>
                      View Lost Books <FaArrowRight />
                  </button>
                  <button onClick={() => setActiveTab('reservations')} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 700, width: '100%', cursor: 'pointer', color: 'var(--text-dark)', background: 'transparent' }}>
                      View Reservations <FaArrowRight />
                  </button>
              </div>

          </div>

      </div>

      {/* BOTTOM ROW (Summary Statistics) */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', marginTop: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>Summary Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              
              {/* Card 1: System Settings Updates */}
              <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Recent Config Changes</h4>
                      <span onClick={() => { setSearchQuery('System'); window.scrollTo({top:0, behavior:'smooth'}); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {data.filter(a => a.category === "System Management" || a.category === "Settings").slice(0,3).map(a => (
                          <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '28px', height: '28px', background: 'rgba(139,92,246,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FaCog className="text-primary" size={12} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.action}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatTimeOnly(a.createdAt)}</span>
                              </div>
                          </div>
                      ))}
                      {data.filter(a => a.category === "System Management" || a.category === "Settings").length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent changes.</span>}
                  </div>
              </div>

              {/* Card 2: Librarian Management */}
              <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Librarian Management</h4>
                      <span onClick={() => { setSearchQuery('Librarian'); window.scrollTo({top:0, behavior:'smooth'}); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {data.filter(a => a.category === "Librarian Management").slice(0,3).map(a => (
                          <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '28px', height: '28px', background: 'rgba(34,197,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FaUserTie className="text-mint" size={12} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.action}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.targetUser?.name || 'Unknown User'}</span>
                              </div>
                          </div>
                      ))}
                      {data.filter(a => a.category === "Librarian Management").length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent activity.</span>}
                  </div>
              </div>

              {/* Card 3: User Management */}
              <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Member Actions</h4>
                      <span onClick={() => { setSearchQuery('Member'); window.scrollTo({top:0, behavior:'smooth'}); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {data.filter(a => a.category === "Member Management" || a.category === "User Management").slice(0,3).map(a => (
                          <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '28px', height: '28px', background: 'rgba(14,165,233,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FaUser className="text-sky" size={12} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.action}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.targetUser?.name || 'Unknown User'}</span>
                              </div>
                          </div>
                      ))}
                      {data.filter(a => a.category === "Member Management" || a.category === "User Management").length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent activity.</span>}
                  </div>
              </div>

              {/* Card 4: Security Events */}
              <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Security Events</h4>
                      <span onClick={() => { setSearchQuery('Security'); window.scrollTo({top:0, behavior:'smooth'}); }} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {data.filter(a => a.category === "Security").slice(0,3).map(a => (
                          <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '28px', height: '28px', background: 'rgba(244,63,94,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <FaShieldAlt className="text-rose" size={12} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.action}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatTimeOnly(a.createdAt)}</span>
                              </div>
                          </div>
                      ))}
                      {data.filter(a => a.category === "Security").length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent events.</span>}
                  </div>
              </div>

          </div>
      </div>
    </div>

      {/* ACTIVITY DETAILS MODAL */}
      {selectedActivity && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
              <div className="bg-white rounded-xl shadow-lg" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'white', borderRadius: '16px', position: 'relative' }}>
                  <button onClick={() => setSelectedActivity(null)} style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
                  <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-dark)' }}>Activity Details</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Action:</strong>
                          <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{selectedActivity.action}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Date:</strong>
                          <span>{formatDateTime(selectedActivity.createdAt)}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Description:</strong>
                          <span>{selectedActivity.details || selectedActivity.description || selectedActivity.action}</span>
                      </div>
                      {selectedActivity.targetBook && (
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                              <strong style={{ color: 'var(--text-muted)' }}>Book:</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <FaBook className="text-muted" /> {selectedActivity.targetBook.title}
                              </div>
                          </div>
                      )}
                      {selectedActivity.targetUser && (
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                              <strong style={{ color: 'var(--text-muted)' }}>Target:</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <FaUser className="text-muted" /> {selectedActivity.targetUser.name} ({selectedActivity.targetUser.email})
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default AdminMyActivitiesTab;
