import React, { useState, useEffect } from 'react';
import { FaSync, FaCalendarAlt, FaBook, FaBan, FaCoins, FaExchangeAlt, FaCheckCircle, FaInbox, FaUndo, FaTimesCircle, FaSearch, FaUser, FaEnvelope, FaExclamationTriangle, FaChartBar, FaClock, FaHistory, FaArrowRight, FaBell } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const formatTimeOnly = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).toUpperCase();
};

const LibrarianMyActivitiesTab = ({ setActiveTab }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [viewModalType, setViewModalType] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [activeFilters, setActiveFilters] = useState({ date: "", month: "", year: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/my-performance');
      setData(res.data);
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
    if (!data?.timeline) return [];
    let filtered = data.timeline;
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(a => 
            (a.title || "").toLowerCase().includes(q) || 
            (a.description || "").toLowerCase().includes(q) ||
            (a.user?.name || "").toLowerCase().includes(q) ||
            (a.user?.memberId || "").toLowerCase().includes(q) ||
            (a.user?.email || "").toLowerCase().includes(q) ||
            (a.book?.title || "").toLowerCase().includes(q)
        );
    }
    
    if (activeFilters.date || activeFilters.month || activeFilters.year) {
        filtered = filtered.filter(a => {
            const d = new Date(a.timestamp);
            if (activeFilters.date && d.getDate().toString() !== activeFilters.date) return false;
            if (activeFilters.month && (d.getMonth() + 1).toString() !== activeFilters.month) return false;
            if (activeFilters.year && d.getFullYear().toString() !== activeFilters.year) return false;
            return true;
        });
    }
    return filtered;
  };

  const filteredTimeline = getFilteredTimeline();

  // Group by Date
  const groupedTimeline = {};
  filteredTimeline.forEach(a => {
      const d = new Date(a.timestamp);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      let label = dateStr;
      const now = new Date();
      if (d.toDateString() === now.toDateString()) label = `Today - ${dateStr}`;
      else {
          const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
          if (d.toDateString() === yesterday.toDateString()) label = `Yesterday - ${dateStr}`;
      }
      if(!groupedTimeline[label]) groupedTimeline[label] = [];
      groupedTimeline[label].push(a);
  });

  const getInsights = () => {
    if (!data?.timeline) return {};
    const todayCount = data.timeline.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length;
    
    const freqMap = {};
    data.timeline.forEach(a => { freqMap[a.type] = (freqMap[a.type] || 0) + 1; });
    const mostFreq = Object.keys(freqMap).sort((a,b) => freqMap[b]-freqMap[a])[0] || "None";

    const hourMap = {};
    data.timeline.forEach(a => { 
        const h = new Date(a.timestamp).getHours();
        hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const mostActiveHrNum = parseInt(Object.keys(hourMap).sort((a,b) => hourMap[b]-hourMap[a])[0]);
    const mostActiveHour = isNaN(mostActiveHrNum) ? "N/A" : `${mostActiveHrNum % 12 || 12} ${mostActiveHrNum >= 12 ? 'PM' : 'AM'}`;

    const catMap = {};
    data.timeline.forEach(a => {
        if(a.book?.category) catMap[a.book.category] = (catMap[a.book.category] || 0) + 1;
    });
    const mostCat = Object.keys(catMap).sort((a,b) => catMap[b]-catMap[a])[0] || "N/A";

    let approvalCount = 0; let totalApprovalDiff = 0;
    let returnCount = 0; let totalReturnDiff = 0;

    data.timeline.forEach(a => {
       if (a.borrowDate && a.approvalDate) {
           approvalCount++;
           totalApprovalDiff += new Date(a.approvalDate) - new Date(a.borrowDate);
       }
       if (a.returnRequestDate && a.returnReceiveDate) {
           returnCount++;
           totalReturnDiff += new Date(a.returnReceiveDate) - new Date(a.returnRequestDate);
       }
    });

    const msToMins = (ms) => ms > 0 ? (ms / (1000*60)).toFixed(1) + " mins" : "N/A";
    
    return {
        todayCount, mostFreq, mostActiveHour, mostCat,
        avgApproval: approvalCount > 0 ? msToMins(totalApprovalDiff / approvalCount) : "N/A",
        avgReturn: returnCount > 0 ? msToMins(totalReturnDiff / returnCount) : "N/A",
        totalWeek: data.timeline.length // simplification
    };
  };

  const insights = getInsights();

  const getColorForType = (type) => {
      const lower = (type || "").toLowerCase();
      if(lower.includes("book")) return "primary";
      if(lower.includes("borrow") || lower.includes("circulation")) return "sky";
      if(lower.includes("return")) return "mint";
      if(lower.includes("reservation")) return "amber";
      if(lower.includes("fine") || lower.includes("replacement")) return "amber";
      if(lower.includes("lost")) return "rose";
      if(lower.includes("email")) return "cyan";
      if(lower.includes("member")) return "rose";
      return "muted";
  };

  const getIconForType = (type) => {
    const lower = (type || "").toLowerCase();
      if(lower.includes("book")) return <FaBook />;
      if(lower.includes("borrow") || lower.includes("circulation")) return <FaExchangeAlt />;
      if(lower.includes("return")) return <FaUndo />;
      if(lower.includes("reservation")) return <FaCalendarAlt />;
      if(lower.includes("fine") || lower.includes("replacement")) return <FaCoins />;
      if(lower.includes("lost")) return <FaExclamationTriangle />;
      if(lower.includes("email") || lower.includes("notification") || lower.includes("reminder")) return <FaEnvelope />;
      if(lower.includes("member")) return <FaUser />;
      return <FaCheckCircle />;
  }

  if (loading) return <div className="flex justify-center my-12"><FaSync className="animate-spin text-primary" style={{ fontSize: '2.5rem' }} /></div>;

  // Render variables
  const targetActivities = 25;
  const completedActivities = insights.todayCount || 0;
  const progressPct = Math.min(100, Math.round((completedActivities / targetActivities) * 100));

  return (
    <>
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>My Activities</h1>
          <button onClick={fetchData} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}><FaSync /> Refresh Feed</button>
      </div>

      {/* Main Grid: Feed & Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          
          {/* LEFT PANE (Timeline) */}
          <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', overflowY: 'auto' }}>
                  <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, padding: '1.5rem 1.5rem 1rem 1.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '1.5rem', borderRadius: '16px 16px 0 0' }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>Activity Feed</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                              type="text" 
                              placeholder="Search by Member Name, ID, or Book Title..." 
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
                              {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                          </select>
                          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', border: 'none', outline: 'none', fontWeight: 600, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%238b5cf6'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', fontSize: '0.9rem' }}>
                              <option value="">Month</option>
                              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                          </select>
                          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', padding: '0.6rem 2rem 0.6rem 1rem', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', border: 'none', outline: 'none', fontWeight: 600, cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%238b5cf6'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem', fontSize: '0.9rem' }}>
                              <option value="">Year</option>
                              {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
                          </select>
                          <button onClick={() => setActiveFilters({ date: filterDate, month: filterMonth, year: filterYear })} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '25px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                              Apply Filter
                          </button>
                          {(activeFilters.date || activeFilters.month || activeFilters.year || searchQuery) && (
                              <button onClick={() => { setFilterDate(""); setFilterMonth(""); setFilterYear(""); setActiveFilters({ date: "", month: "", year: "" }); setSearchQuery(""); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.6rem 1.25rem', borderRadius: '25px', fontWeight: 600, cursor: 'pointer' }}>
                                  Clear Filters
                              </button>
                          )}
                      </div>
                  </div>
                  <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                  {Object.keys(groupedTimeline).length === 0 ? (
                      <div className="text-center text-muted py-8">No activities found.</div>
                  ) : (
                      Object.keys(groupedTimeline).map((dateLabel, gIdx) => (
                          <div key={dateLabel} style={{ marginBottom: gIdx === Object.keys(groupedTimeline).length - 1 ? 0 : '2rem' }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(139,92,246,0.1)', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                  {dateLabel}
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '0.5rem' }}>
                                  {groupedTimeline[dateLabel].map((activity, aIdx) => {
                                      const col = getColorForType(activity.type);
                                      const isLast = aIdx === groupedTimeline[dateLabel].length - 1;
                                      return (
                                          <div key={activity._id} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                                              {!isLast && <div style={{ position: 'absolute', left: '60px', top: '36px', bottom: '-24px', width: '2px', background: '#f1f5f9', zIndex: 0 }}></div>}
                                              
                                              <div style={{ width: '60px', textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8', paddingTop: '0.5rem', fontWeight: 600 }}>
                                                  {formatTimeOnly(activity.timestamp)}
                                              </div>
                                              
                                              <div style={{ zIndex: 1, width: '36px', height: '36px', borderRadius: '50%', background: `var(--${col})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.15rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                                  {getIconForType(activity.type)}
                                              </div>
                                              
                                              <div style={{ flex: 1, background: 'white', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                                  <div>
                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                          <strong style={{ color: 'var(--text-dark)', fontSize: '0.95rem' }}>{activity.title}</strong>
                                                          <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: `rgba(var(--${col}-rgb), 0.1)`, color: `var(--${col})`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{activity.type}</span>
                                                      </div>
                                                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activity.description}</div>
                                                      
                                                      {/* Small Sub Details */}
                                                      {(activity.book || activity.user) && (
                                                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                                              {activity.book?.title && <span>Book: {activity.book.title}</span>}
                                                              {activity.book?.category && <span>Category: {activity.book.category}</span>}
                                                              {activity.user?.name && <span>Member: {activity.user.name}</span>}
                                                          </div>
                                                      )}
                                                  </div>
                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.75rem', borderRadius: '12px', background: '#dcfce7', color: '#166534', fontWeight: 700 }}>Completed</span>
                                                      <button onClick={() => setSelectedActivity(activity)} style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => {e.target.style.background='var(--primary)'; e.target.style.color='white';}} onMouseLeave={e => {e.target.style.background='none'; e.target.style.color='var(--primary)';}}>
                                                          View Details
                                                      </button>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      ))
                  )}
                  {filteredTimeline.length > 0 && (
                      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                          <button style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '25px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Load More Activities &darr;</button>
                      </div>
                  )}
                  </div>
              </div>
          </div>

          {/* RIGHT SIDEBAR (The 3 Cards) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Activity Insights */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaChartBar className="text-primary" /> Activity Insights
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaHistory/> Most Frequent Activity</span>
                          <strong style={{ color: 'var(--text-dark)' }}>{insights.mostFreq}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaClock/> Most Active Hour</span>
                          <strong style={{ color: 'var(--text-dark)' }}>{insights.mostActiveHour}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaCheckCircle/> Average Approval Time</span>
                          <strong style={{ color: 'var(--text-dark)' }}>{insights.avgApproval}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaUndo/> Average Return Time</span>
                          <strong style={{ color: 'var(--text-dark)' }}>{insights.avgReturn}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden' }}>
                          <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaBook/> Top Category Handled</span>
                          <strong style={{ color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px', textAlign: 'right' }}>{insights.mostCat}</strong>
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
                      <FaClock className="text-primary" /> Today's Performance
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
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: 600 }}><FaExclamationTriangle className="text-rose"/> Borrow Requests</span>
                          <span style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>{data?.needsAttention?.borrowRequests || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: 600 }}><FaExclamationTriangle className="text-rose"/> Return Requests</span>
                          <span style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>{data?.needsAttention?.returnRequests || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: 600 }}><FaExclamationTriangle className="text-rose"/> Lost Book Reports</span>
                          <span style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>{data?.needsAttention?.lostBooks || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontWeight: 600 }}><FaExclamationTriangle className="text-rose"/> Damaged Books</span>
                          <span style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>{data?.needsAttention?.damagedBooks || 0}</span>
                      </div>
                  </div>
                  
                  <button onClick={() => setActiveTab('workspace')} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '8px', border: 'none', fontWeight: 700, width: '100%', cursor: 'pointer' }}>
                      Go to Workspace <FaArrowRight />
                  </button>
              </div>

          </div>

      </div>

      {/* BOTTOM ROW (Separate Card for other summaries) */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)', marginTop: '1rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>Summary Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              
              {/* Books Added */}
              <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Books Added by Me</h4>
                      <span onClick={() => setViewModalType('booksAdded')} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(data?.booksAdded || []).slice(0,3).map(b => (
                          <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '28px', height: '36px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                      {b.coverImage ? <img src={b.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaBook className="text-muted" style={{ margin: 'auto', marginTop: '10px' }}/>}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</span>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatDateTime(b.createdAt)}</span>
                                  </div>
                              </div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'rgba(139,92,246,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>{b.totalCopies} Copies</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Returns Processed */}
              <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Returns Processed</h4>
                      <span onClick={() => setViewModalType('returnsProcessed')} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(data?.timeline || []).filter(a => a.type === "Returns" && a.title.includes("Handled")).slice(0,3).map((r, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '28px', height: '36px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <FaUndo className="text-mint" />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.book?.title || "Unknown Book"}</span>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatTimeOnly(r.timestamp)}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Payments Collected */}
              <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Payments Collected</h4>
                      <span onClick={() => setViewModalType('paymentsCollected')} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[...(data?.fineRecords || []), ...(data?.replacementRecords || [])].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0,3).map((p, i) => {
                          const amt = p.fine || p.replacementCost;
                          const isRep = !!p.replacementCost;
                          return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>₹</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dark)' }}>₹{amt}</span>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isRep ? 'Replacement' : 'Fine'} - {p.book?.title || "Book"}</span>
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </div>

              {/* Recent Notifications */}
              <div style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>Recent Notifications</h4>
                      <span onClick={() => setViewModalType('recentNotifications')} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>View All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(data?.recentNotifications || []).slice(0,3).map((n, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                                      <FaEnvelope />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.action}</span>
                                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Sent to {n.member?.name || "Member"}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      </div>
      </div>

      {/* ACTIVITY DETAILS MODAL */}
      {selectedActivity && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div className="bg-white rounded-xl shadow-lg" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'white', borderRadius: '16px', position: 'relative' }}>
                  <button onClick={() => setSelectedActivity(null)} style={{ position: 'absolute', top: '1rem', right: '1.25rem', background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
                  <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-dark)' }}>Activity Details</h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Action:</strong>
                          <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{selectedActivity.title}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Date:</strong>
                          <span>{formatDateTime(selectedActivity.timestamp)}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Description:</strong>
                          <span>{selectedActivity.description}</span>
                      </div>
                      {selectedActivity.book && (
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                              <strong style={{ color: 'var(--text-muted)' }}>Book:</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <FaBook className="text-muted" /> {selectedActivity.book.title}
                              </div>
                          </div>
                      )}
                      {selectedActivity.user && (
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
                              <strong style={{ color: 'var(--text-muted)' }}>Member:</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <FaUser className="text-muted" /> {selectedActivity.user.name} ({selectedActivity.user.email})
                              </div>
                          </div>
                      )}
                      {(selectedActivity.borrowDate || selectedActivity.issueDate) && (
                          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginTop: '0.5rem' }}>
                              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Lifecycle Dates</h4>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {selectedActivity.borrowDate && <div>Requested: {formatDateTime(selectedActivity.borrowDate)}</div>}
                                  {selectedActivity.approvalDate && <div>Approved: {formatDateTime(selectedActivity.approvalDate)}</div>}
                                  {selectedActivity.issueDate && <div>Issued: {formatDateTime(selectedActivity.issueDate)}</div>}
                                  {selectedActivity.returnRequestDate && <div>Return Req: {formatDateTime(selectedActivity.returnRequestDate)}</div>}
                                  {selectedActivity.returnReceiveDate && <div>Returned: {formatDateTime(selectedActivity.returnReceiveDate)}</div>}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* VIEW ALL MODAL */}
      {viewModalType && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div className="bg-white rounded-xl shadow-lg animate-fade-in-up" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '16px', position: 'relative' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-dark)' }}>
                          {viewModalType === 'booksAdded' ? 'All Books Added by Me' :
                           viewModalType === 'returnsProcessed' ? 'All Returns Processed' :
                           viewModalType === 'paymentsCollected' ? 'All Payments Collected' :
                           viewModalType === 'recentNotifications' ? 'All Recent Notifications' : 'Details'}
                      </h2>
                      <button onClick={() => setViewModalType(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
                  </div>
                  <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      
                      {viewModalType === 'booksAdded' && (data?.booksAdded || []).map(b => (
                          <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div style={{ width: '40px', height: '52px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                      {b.coverImage ? <img src={b.coverImage} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaBook className="text-muted" style={{ margin: 'auto', marginTop: '16px' }}/>}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>{b.title}</span>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.author} | Added: {formatDateTime(b.createdAt)}</span>
                                  </div>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(139,92,246,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>{b.totalCopies} Copies</span>
                          </div>
                      ))}

                      {viewModalType === 'returnsProcessed' && (data?.timeline || []).filter(a => a.type === "Returns" && a.title.includes("Handled")).map((r, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div style={{ width: '40px', height: '52px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <FaUndo className="text-mint" style={{ fontSize: '1.25rem' }} />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>{r.book?.title || "Unknown Book"}</span>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.user?.name || "Unknown Member"}</span>
                                  </div>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDateTime(r.timestamp)}</span>
                          </div>
                      ))}

                      {viewModalType === 'paymentsCollected' && [...(data?.fineRecords || []), ...(data?.replacementRecords || [])].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((p, i) => {
                          const amt = p.fine || p.replacementCost;
                          const isRep = !!p.replacementCost;
                          return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>₹</div>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-dark)' }}>{isRep ? 'Replacement Fee' : 'Overdue Fine'} - {p.book?.title || "Book"}</span>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member: {p.user?.name || "Unknown"} | {formatDateTime(p.updatedAt)}</span>
                                      </div>
                                  </div>
                                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>₹{amt}</span>
                              </div>
                          )
                      })}

                      {viewModalType === 'recentNotifications' && (data?.recentNotifications || []).map((n, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', gap: '1rem' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                                  <FaEnvelope />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>{n.action}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sent to: {n.member?.name || "Member"} ({n.member?.email})</span>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDateTime(n.date)}</span>
                          </div>
                      ))}

                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default LibrarianMyActivitiesTab;
