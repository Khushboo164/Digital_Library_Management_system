import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaCalendarCheck, FaRedoAlt, FaMoneyBillWave, FaShieldAlt, FaQuestionCircle, FaPen, FaBell, FaMagic, FaChartBar, FaClock, FaBookOpen, FaCoins, FaRedo, FaCheckCircle, FaExclamationTriangle, FaBook, FaChevronRight, FaThLarge, FaCalendarAlt, FaCog, FaSearch, FaUser, FaSignOutAlt, FaInfoCircle, FaAward, FaSync, FaLayerGroup, FaHistory, FaStar, FaUserEdit, FaLifeRing, FaFileInvoiceDollar, FaEnvelope, FaCreditCard, FaUndoAlt } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import api from "../../utils/api";
import { toast } from "react-toastify";
import "./MemberDashboard.css";
import "../../styles/DashboardLayout.css";

import WishlistTab from './WishlistTab';
import ReservationsTab from './ReservationsTab';
import RenewalsTab from './RenewalsTab';
import PaymentsTab from './PaymentsTab';
import RatingsTab from './RatingsTab';
import NotificationsTab from './NotificationsTab';
import RecommendationsTab from './RecommendationsTab';
import LostBookTab from './LostBookTab';
import EmailsTab from './EmailsTab';
import BookSphereAssistant from './BookSphereAssistant';
import ReceiptModal from '../../components/ReceiptModal';



const MemberDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});



  // Catalog State
  const [books, setBooks] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Filtering, Sorting, Pagination
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("random");
  const [sortOrder, setSortOrder] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [allFetchedBooks, setAllFetchedBooks] = useState([]);
  const [isFrontendPaginated, setIsFrontendPaginated] = useState(false);
  const limit = 8;

  // History
  const [historyTab, setHistoryTab] = useState("borrows");
  const [fineTab, setFineTab] = useState("unpaid");
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentTypeTab, setPaymentTypeTab] = useState("all");
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [fineHistory, setFineHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ day: "", month: "", year: "", status: "", search: "" });
  const [dueBooksPaymentFilter, setDueBooksPaymentFilter] = useState("All");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Profile
  const [profileData, setProfileData] = useState({ name: user.name || "", email: user.email || "", currentPassword: "", newPassword: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // --- Data Fetching ---
  const fetchDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const response = await api.get("/member/dashboard");
      setDashboardData(response.data);
      if (response.data.member) {
        const u = { ...user, name: response.data.member.name, email: response.data.member.email, status: response.data.member.accountStatus };
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
        setProfileData(prev => ({ ...prev, name: u.name, email: u.email }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchCatalogBooks = async (page = 1, keyword = searchKeyword, category = selectedCategory, sortBy = selectedSort, order = sortOrder) => {
    try {
      setSearchLoading(true);
      let response;
      const isSearching = keyword.trim() !== "";
      const isFiltering = category !== "All" && category !== "";
      const isSorting = sortBy !== "" && sortBy !== "default";

      if (isSearching) {
        response = await api.get(`/books/search?keyword=${encodeURIComponent(keyword)}`);
        const list = response.data.books || [];
        setAllFetchedBooks(list); setTotalBooks(list.length); setTotalPages(Math.ceil(list.length / limit) || 1);
        setBooks(list.slice((page - 1) * limit, page * limit)); setIsFrontendPaginated(true);
      } else if (isFiltering) {
        response = await api.get(`/books/filter?category=${encodeURIComponent(category)}`);
        const list = response.data.books || [];
        setAllFetchedBooks(list); setTotalBooks(list.length); setTotalPages(Math.ceil(list.length / limit) || 1);
        setBooks(list.slice((page - 1) * limit, page * limit)); setIsFrontendPaginated(true);
      } else if (isSorting) {
        response = await api.get(`/books/sort?sortBy=${sortBy}&order=${order}`);
        const list = response.data.books || [];
        setAllFetchedBooks(list); setTotalBooks(list.length); setTotalPages(Math.ceil(list.length / limit) || 1);
        setBooks(list.slice((page - 1) * limit, page * limit)); setIsFrontendPaginated(true);
      } else {
        response = await api.get(`/books/pagination?page=${page}&limit=${limit}`);
        console.log("Books:", response.data.books);
        setBooks(response.data.books || []); setTotalBooks(response.data.totalBooks || 0);
        setTotalPages(response.data.totalPages || 1); setIsFrontendPaginated(false);
      }
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to load library catalog");
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isFrontendPaginated) {
      setBooks(allFetchedBooks.slice((newPage - 1) * limit, newPage * limit));
      setCurrentPage(newPage);
    } else {
      fetchCatalogBooks(newPage, searchKeyword, selectedCategory, selectedSort, sortOrder);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const borrowRes = await api.get("/member/borrow-history");
      setBorrowHistory(borrowRes.data.borrowHistory || []);
      const fineRes = await api.get("/member/fine-history");
      setFineHistory(fineRes.data.fineHistory || []);
    } catch (error) {
      toast.error("Failed to load history data");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => {
    if (activeTab === "catalog") fetchCatalogBooks();
    else if (activeTab === "history" || activeTab === "fines") fetchHistory();
    else if (activeTab === "overview") fetchDashboardData();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

    const handleReserveBook = async (bookId) => {
    try {
      const res = await api.post("/member/reservations", { bookId });
      toast.success(res.data?.message || "Book reserved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reserve book");
    }
  };

  const handleWishlist = async (bookId) => {
    try {
      const res = await api.post("/member/wishlist", { bookId });
      toast.success(res.data?.message || "Added to wishlist!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update wishlist");
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      const response = await api.post("/books/borrow", { bookId });
      toast.success(response.data?.message || "Book borrowed successfully!");
      setSelectedBook(null);
      fetchCatalogBooks(currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not borrow book");
    }
  };

  const handleReturnBook = async (borrowId) => {
    try {
      const response = await api.post("/books/return", { borrowId });
      toast.success(response.data?.message || "Book returned successfully!");
      if (activeTab === 'history') fetchHistory();
      else fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not return book");
    }
  };

  const handlePayFine = (borrowId, amount) => {
    setPaymentModal({ borrowId, amount, type: 'fine' });
  };

  const handlePayReplacement = (borrowId, amount) => {
    setPaymentModal({ borrowId, amount, type: 'replacement' });
  };

  const confirmPayment = async () => {
    if (!paymentModal) return;
    try {
      if (paymentModal.type === 'fine') {
        const response = await api.put(`/books/pay-fine/${paymentModal.borrowId}`);
        toast.success(`Paid fine successfully!`);
      } else {
        const response = await api.post("/member/payments/replacement", { borrowId: paymentModal.borrowId });
        toast.success(response.data?.message || "Replacement cost paid successfully!");
      }
      setPaymentModal(null);
      if (activeTab === 'history' || activeTab === 'fines') fetchHistory();
      else fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      
      const payload = { 
          name: profileData.name, 
          email: profileData.email 
      };
      
      if (isChangingPassword) {
          if (!profileData.currentPassword || !profileData.newPassword) {
              toast.error("Please provide both current and new password");
              setProfileLoading(false);
              return;
          }
          payload.currentPassword = profileData.currentPassword;
          payload.newPassword = profileData.newPassword;
      }

      const response = await api.put("/member/profile", payload);
      toast.success("Profile updated successfully!");
      
      const u = { ...user, name: payload.name, email: payload.email };
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      
      setProfileData({ ...profileData, currentPassword: "", newPassword: "" });
      setIsChangingPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  
  const navItems = [
    { id: "overview", label: "Dashboard", icon: <FaThLarge /> },
    { id: "catalog", label: "Browse Books", icon: <FaBook /> },
    { id: "wishlist", label: "Wishlist", icon: <FaHeart /> },
    { id: "reservations", label: "Reserved Books", icon: <FaCalendarCheck /> },
    { id: "history", label: "My Borrows", icon: <FaHistory /> },
    { id: "due-books", label: "Due Books", icon: <FaExclamationTriangle /> },
    { id: "renewals", label: "Renew Books", icon: <FaRedoAlt /> },
    { id: "recommendations", label: "Recommendations", icon: <FaMagic /> },
    { id: "fines", label: "My Payments", icon: <FaCoins /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "emails", label: "Emails", icon: <FaEnvelope /> },
    { id: "ratings", label: "Ratings", icon: <FaStar /> },
    { id: "lost-book", label: "Lost Book Request", icon: <FaQuestionCircle /> },
    { id: "helpline", label: "Help and Support", icon: <FaLifeRing /> },
  ];


  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon"><FaBookOpen /></div>
          <div>
            <div className="brand-name">Book<span>Sphere</span></div>
            <span className="brand-sub">Digital Library</span>
          </div>
        </div>

        <div className="dash-user-card">
          <div className="dash-user-avatar">{user.name ? user.name[0].toUpperCase() : "M"}</div>
          <div className="dash-user-meta">
            <h3>{user.name}</h3>
            <span className="dash-user-role">Member</span>
          </div>
          
          {/* Hover Menu */}
          <div className="user-dropdown-menu">
            <button className="user-dropdown-item" onClick={() => setActiveTab("view-profile")}><FaUser /> View Profile</button>
            <button className="user-dropdown-item" onClick={() => setActiveTab("profile")}><FaUserEdit /> Update Profile</button>
          </div>
        </div>

        <nav className="dash-nav">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`dash-nav-item ${activeTab === item.id ? "active" : ""}`}>
              <span className="dash-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="dash-logout">
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <header className="dash-topbar">
          <div className="topbar-left">
            <span className="topbar-label">Workspace</span>
            <h3 className="topbar-title">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "catalog" && "Browse Catalog"}
              {activeTab === "wishlist" && "My Wishlist"}
              {activeTab === "reservations" && "Reserved Books"}
              {activeTab === "renewals" && "Renewals"}
              {activeTab === "recommendations" && "Recommended For You"}
              {activeTab === "history" && "My Borrows"}
              {activeTab === "lost-book" && "Lost Book Request"}
              {activeTab === "fines" && "My Payments"}
              {activeTab === "ratings" && "My Ratings"}
              {activeTab === "notifications" && "Notifications"}
              {activeTab === "emails" && "Emails"}
              {activeTab === "profile" && "Update Profile"}
              {activeTab === "view-profile" && "My Profile"}
              {activeTab === "helpline" && "Helpline / Support"}
            </h3>
          </div>
          <div className="topbar-right">

            <div className="topbar-date">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
          </div>
        </header>

        <div className="dash-workspace">
          {loading && activeTab === "overview" ? (
            <div className="flex justify-center mt-4"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
          ) : (
            <>
              {user.status === "Blocked" && (
                <div className="blocked-alert">
                  <FaExclamationTriangle className="blocked-alert-icon" />
                  <div><h4>Account Blocked</h4><p>You cannot borrow new books due to pending dues.</p></div>
                </div>
              )}

              {/* OVERVIEW */}
              {activeTab === "overview" && dashboardData && (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {dashboardData.upcomingDueBook && (
        <div className="due-banner" style={{ background: 'linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1))', borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="due-banner-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="due-banner-icon" style={{ color: 'var(--rose)', fontSize: '1.5rem' }}><FaClock /></div>
            <div>
              <span className="due-banner-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--rose)' }}>Upcoming Due Book</span>
              <h4 style={{ margin: 0, fontSize: '1rem' }}>{dashboardData.upcomingDueBook.title} is due in <strong>{dashboardData.upcomingDueBook.daysRemaining} days</strong></h4>
            </div>
          </div>
          <button onClick={() => setActiveTab("history")} className="btn btn-outline btn-sm" style={{ borderRadius: '8px', padding: '0.4rem 0.75rem' }}>View</button>
        </div>
      )}

      {/* Top Overview Cards (Premium) */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: 0 }}>
        {[
          { 
            label: "Borrowed", 
            value: dashboardData.overviewStats.currentlyBorrowedBooksCount, 
            icon: <FaBookOpen />, 
            tab: "history",
            subtitle: "Currently reading",
            iconColor: "#3b82f6",
            iconBg: "rgba(59, 130, 246, 0.15)"
          },
          { 
            label: "Requests", 
            value: dashboardData.overviewStats.totalPendingRequests, 
            icon: <FaClock />, 
            tab: "reservations",
            subtitle: "Pending approval",
            iconColor: "#f59e0b",
            iconBg: "rgba(245, 158, 11, 0.15)"
          },
          { 
            label: "Wishlist", 
            value: dashboardData.overviewStats.wishlistCount, 
            icon: <FaHeart />, 
            tab: "wishlist",
            subtitle: "Saved for later",
            iconColor: "#ec4899",
            iconBg: "rgba(236, 72, 153, 0.15)"
          },
          { 
            label: "Payments", 
            value: `₹${dashboardData.overviewStats.pendingPaymentsSum}`, 
            icon: <FaCoins />, 
            tab: "fines",
            subtitle: "Total dues pending",
            iconColor: "#ef4444",
            iconBg: "rgba(239, 68, 68, 0.15)"
          },
        ].map((s, i) => (
          <div key={i} onClick={() => setActiveTab(s.tab)} style={{ 
              cursor: 'pointer', 
              padding: '1.25rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.05)',
              transition: 'all 0.25s ease'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.05)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)' }}>{s.label}</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.iconBg, color: s.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: `0 4px 10px ${s.iconBg}` }}>
                {s.icon}
              </div>
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <h2 style={{ margin: '0', fontSize: '2rem', fontWeight: 900, color: 'var(--primary-dark)', lineHeight: 1 }}>{s.value}</h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="two-cols" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: 0 }}>
        <BookSphereAssistant dashboardData={dashboardData} setActiveTab={setActiveTab} />

        <div className="panel" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '1.25rem', height: '340px' }}>
          <div className="panel-head" style={{ marginBottom: '1rem' }}>
            <h3 className="panel-title" style={{ fontWeight: 800, fontSize: '1.1rem' }}>Status Distribution</h3>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', minHeight: '240px', padding: '0 1rem' }}>
            <div style={{ width: '150px', height: '150px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dashboardData.donutAnalytics} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                    {dashboardData.donutAnalytics.map((entry, index) => {
                      const colors = { 'Borrow Requested': '#f59e0b', 'Borrow Approved': '#0ea5e9', 'Borrow Rejected': '#ef4444', 'Borrowed': '#10b981', 'Overdue': '#ec4899', 'Return Requested': '#8b5cf6', 'Return Approved': '#06b6d4', 'Return Rejected': '#f43f5e', 'Returned': '#047857', 'Lost Book Returned': '#0ea5e9', 'Lost': '#dc2626' };
                      return <Cell key={`cell-${index}`} fill={colors[entry.name] || 'var(--primary)'} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.8rem', padding: '0.5rem 0.75rem', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {dashboardData.donutAnalytics.map((entry, index) => {
                    const colors = { 'Borrow Requested': '#f59e0b', 'Borrow Approved': '#0ea5e9', 'Borrow Rejected': '#ef4444', 'Borrowed': '#10b981', 'Overdue': '#ec4899', 'Return Requested': '#8b5cf6', 'Return Approved': '#06b6d4', 'Return Rejected': '#f43f5e', 'Returned': '#047857', 'Lost Book Returned': '#0ea5e9', 'Lost': '#dc2626' };
                    return (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[entry.name] || 'var(--primary)' }}></div>
                            <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{entry.name}</span>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Action / Finance Row */}
      <div className="two-cols" style={{ gap: '1rem', marginBottom: 0 }}>
        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-head" style={{ marginBottom: '1rem' }}>
            <h3 className="panel-title" style={{ fontWeight: 800, fontSize: '1.1rem' }}>Action Center</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dashboardData.pendingActionsCounts.borrowRequestsWaiting > 0 && (
              <div className="action-row" onClick={() => setActiveTab("history")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon-wrap stat-icon-amber" style={{ width: '36px', height: '36px', fontSize: '1rem', borderRadius: '10px' }}><FaClock /></div>
                  <div><h5 style={{ margin: 0, fontSize: '0.9rem' }}>{dashboardData.pendingActionsCounts.borrowRequestsWaiting} Borrow Requests</h5><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Response: ~24h</p></div>
                </div>
                <button className="btn btn-outline btn-sm" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>View</button>
              </div>
            )}
            {dashboardData.pendingActionsCounts.returnRequestsWaiting > 0 && (
              <div className="action-row" onClick={() => setActiveTab("history")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon-wrap stat-icon-blue" style={{ width: '36px', height: '36px', fontSize: '1rem', borderRadius: '10px' }}><FaRedo /></div>
                  <div><h5 style={{ margin: 0, fontSize: '0.9rem' }}>{dashboardData.pendingActionsCounts.returnRequestsWaiting} Return Requests</h5><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Response: ~24h</p></div>
                </div>
                <button className="btn btn-outline btn-sm" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>View</button>
              </div>
            )}
            {dashboardData.pendingActionsCounts.reservedBooksAvailable > 0 && (
              <div className="action-row" onClick={() => setActiveTab("reservations")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="stat-icon-wrap stat-icon-green" style={{ width: '36px', height: '36px', fontSize: '1rem', borderRadius: '10px' }}><FaCheckCircle /></div>
                  <div><h5 style={{ margin: 0, fontSize: '0.9rem' }}>{dashboardData.pendingActionsCounts.reservedBooksAvailable} Reserved Ready</h5><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Collect at library</p></div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Collect</button>
              </div>
            )}
            {(dashboardData.pendingActionsCounts.borrowRequestsWaiting === 0 && dashboardData.pendingActionsCounts.returnRequestsWaiting === 0 && dashboardData.pendingActionsCounts.reservedBooksAvailable === 0) && (
              <div className="empty-state" style={{ padding: '1.5rem', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--mint-light)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  <FaCheckCircle />
                </div>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>All caught up!</h4>
              </div>
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: '1.25rem' }}>
          <div className="panel-head" style={{ marginBottom: '1rem' }}>
            <h3 className="panel-title" style={{ fontWeight: 800, fontSize: '1.1rem' }}>Payment Summary</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="pay-mini-card" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <FaExclamationTriangle style={{ color: '#dc2626' }}/>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>Pending Fines</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{dashboardData.paymentSummary.pendingFine}</span>
            </div>
            <div className="pay-mini-card bg-mint">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <FaCheckCircle style={{ color: 'var(--mint)' }}/>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mint)' }}>Paid Fines</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{dashboardData.paymentSummary.paidFine}</span>
            </div>
            <div className="pay-mini-card" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <FaExclamationTriangle style={{ color: '#dc2626' }}/>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>Pending Replace</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{dashboardData.paymentSummary.pendingReplacementCost}</span>
            </div>
            <div className="pay-mini-card bg-mint">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <FaCheckCircle style={{ color: 'var(--mint)' }}/>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mint)' }}>Paid Replace</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{dashboardData.paymentSummary.paidReplacementCost}</span>
            </div>
            <div className="pay-mini-card" style={{ gridColumn: '1 / -1', background: 'rgba(14, 165, 233, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <FaCheckCircle style={{ color: '#0ea5e9' }}/>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0ea5e9' }}>Refunded Amount</span>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)' }}>₹{dashboardData.paymentSummary.refundedAmount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="section-title" style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '1rem' }}>Borrowed & Pending</h3>
        {dashboardData.currentlyBorrowedBooks?.length === 0 ? (
          <div className="empty-state" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '2rem' }}>
            <FaBookOpen className="empty-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
            <h4 className="text-dark font-bold" style={{ fontSize: '1rem' }}>No Active Books</h4>
            <button onClick={() => setActiveTab("catalog")} className="btn btn-primary btn-sm" style={{ borderRadius: '8px', marginTop: '1rem' }}>Browse Library</button>
          </div>
        ) : (
          <div className="borrow-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {dashboardData.currentlyBorrowedBooks?.map((b) => {
                let badgeClass = 'badge-primary';
                if (b.status === 'Borrow Requested') badgeClass = 'badge-borrow-req';
                else if (b.status === 'Borrow Approved') badgeClass = 'badge-borrow-app';
                else if (b.status === 'Borrowed') badgeClass = 'badge-borrowed';
                else if (b.status === 'Return Requested') badgeClass = 'badge-return-req';
                else if (b.status === 'Return Approved') badgeClass = 'badge-return-app';
                
                const totalDays = 14; // Default loan period
                const progressPct = b.daysRemaining != null ? Math.max(0, Math.min(100, ((totalDays - b.daysRemaining) / totalDays) * 100)) : 0;
                
                return (
                <div key={b.borrowId} className="book-card-horizontal" style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '1rem', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', gap: '1rem', alignItems: 'stretch', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                    <div style={{ width: '70px', height: '105px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(0,0,0,0.03)', flexShrink: 0, position: 'relative' }}>
                      {b.coverImage ? <img src={b.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', color: 'transparent' }} onError={(e) => { e.target.style.display = 'none'; }} /> : <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><FaBook className="text-muted" /></div>}
                      {b.coverImage && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: -1 }}><FaBook className="text-muted" /></div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', gap: '0.5rem' }}>
                        <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.title}>{b.title}</h5>
                        {b.isOverdue && b.status === "Borrowed" ? (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>OVERDUE</span>
                        ) : (
                          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>{b.status}</span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`by ${b.author}`}>by {b.author}</p>
                      
                      {(b.status === "Borrowed" || b.status === "Return Requested" || b.status === "Return Approved") && (
                        <div style={{ marginTop: 'auto' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                            <span className="text-muted">Due: {new Date(b.dueDate).toLocaleDateString()}</span>
                            <span className={`font-bold ${b.daysRemaining < 0 ? 'text-rose' : 'text-mint'}`}>
                              {b.daysRemaining < 0 ? `${Math.abs(b.daysRemaining)}d overdue` : `${b.daysRemaining}d left`}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressPct}%`, height: '100%', background: b.daysRemaining < 0 ? 'var(--rose)' : 'var(--primary)', borderRadius: '2px' }}></div>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                        {b.status === "Borrow Requested" && <button className="btn btn-outline btn-sm w-full" disabled style={{ opacity: 0.5, borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem' }}>Waiting Approval</button>}
                        {b.status === "Borrow Approved" && <button className="btn btn-primary btn-sm w-full" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem' }}>Collect Book</button>}
                        {b.status === "Borrowed" && (
                          b.fine > 0 
                            ? <button onClick={() => { setActiveTab("fines") }} className="btn btn-danger btn-sm w-full" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem' }}>Pay Fine (₹{b.fine})</button> 
                            : <button onClick={() => { setActiveTab("history") }} className="btn btn-outline btn-sm w-full" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem' }}>Return</button>
                        )}
                        {b.status === "Return Requested" && <button className="btn btn-outline btn-sm w-full" disabled style={{ opacity: 0.5, borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem' }}>Waiting Approval</button>}
                        {b.status === "Return Approved" && <button className="btn btn-primary btn-sm w-full" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem', background: 'var(--sky)', borderColor: 'var(--sky)' }}>Return to Library</button>}
                        {b.status === "Lost" && <button onClick={() => handlePayReplacement(b.borrowId, b.replacementCost)} className="btn btn-danger btn-sm w-full" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem' }}>Pay Charges (Lost)</button>}
                      </div>
                    </div>
                </div>
                );
            })}
          </div>
        )}
      </div>
      
      <div className="two-cols" style={{ gap: '1rem' }}>
        <div className="panel" style={{ padding: '1.25rem' }}>
            <div className="panel-head" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="panel-title" style={{ fontWeight: 800, fontSize: '1.1rem' }}>Borrow History</h3>
              <button onClick={() => setActiveTab("history")} className="btn btn-outline btn-sm" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>View All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '0.25rem' }}>
                {dashboardData.recentBorrowHistory?.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>No history found.</p>
                ) : (
                    dashboardData.recentBorrowHistory?.map((h, i) => {
                      let badgeClass = 'badge-primary';
                      if (h.status === 'Returned') badgeClass = 'badge-returned';
                      else if (h.status === 'Borrowed') badgeClass = 'badge-borrowed';

                      return (
                        <div key={h._id} style={{ display: 'flex', gap: '1rem', position: 'relative', paddingBottom: i !== dashboardData.recentBorrowHistory.length - 1 ? '1rem' : 0 }}>
                            {i !== dashboardData.recentBorrowHistory.length - 1 && <div style={{ position: 'absolute', left: '15px', top: '32px', bottom: 0, width: '2px', background: 'var(--border)' }}></div>}
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, border: '2px solid white', overflow: 'hidden' }}>
                                {h.book?.coverImage ? <img src={h.book.coverImage} alt={h.book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaBook className="text-muted" style={{ fontSize: '0.7rem' }} />}
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h6 style={{ margin: '0 0 0.15rem', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      {h.book?.title}
                                      {h.lostReported && <span className="badge badge-warning" style={{fontSize: '0.6rem', padding: '0.1rem 0.3rem'}}>Found Lost Book</span>}
                                    </h6>
                                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(h.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className={`badge ${badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{h.status}</span>
                            </div>
                        </div>
                      )
                    })
                )}
            </div>
        </div>
        
        <div className="panel" style={{ padding: '1.25rem' }}>
            <div className="panel-head" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="panel-title" style={{ fontWeight: 800, fontSize: '1.1rem' }}>Active Reservations</h3>
              <button onClick={() => setActiveTab("reservations")} className="btn btn-outline btn-sm" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>View All</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {dashboardData.activeReservations?.length === 0 ? (
                    <div className="empty-state" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '1rem 0' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                        <FaHeart />
                      </div>
                      <p className="text-muted font-bold" style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem' }}>No active reservations</p>
                      <button onClick={() => setActiveTab("catalog")} className="btn btn-primary btn-sm" style={{ borderRadius: '8px', fontSize: '0.75rem' }}>Browse Catalog</button>
                    </div>
                ) : (
                    dashboardData.activeReservations?.map(r => (
                        <div key={r._id} className="borrow-row" style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ width: '36px', height: '54px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(0,0,0,0.03)', flexShrink: 0 }}>
                                    {r.book?.coverImage ? <img src={r.book.coverImage} alt={r.book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaBook className="text-muted" />}
                                </div>
                                <div>
                                    <h6 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 800 }}>{r.book?.title}</h6>
                                    {r.status === 'Pending' && <span className="text-primary font-bold" style={{ fontSize: '0.7rem', background: 'var(--primary-light)', padding: '0.15rem 0.5rem', borderRadius: '100px' }}>Queue: #{r.queuePosition}</span>}
                                </div>
                            </div>
                            {r.status === 'Fulfilled' ? (
                                <button onClick={() => setActiveTab("history")} className="btn btn-primary btn-sm" style={{ borderRadius: '8px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Borrow</button>
                            ) : (
                                <span className="badge badge-borrow-req" style={{ fontSize: '0.65rem' }}>Pending</span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  )}
              {/* CATALOG */}
              {activeTab === "catalog" && (
                <>
                <div className="animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="section-title" style={{ margin: 0 }}>Browse Catalog</h3>
                    <button onClick={() => fetchCatalogBooks(1, searchKeyword, selectedCategory, selectedSort, sortOrder)} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} disabled={searchLoading}>
                      <FaSync className={searchLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                  </div>
                  <div className="catalog-bar mb-4">
                    <div className="catalog-search">
                      <FaSearch className="catalog-search-icon" />
                      <input type="text" placeholder="Search books, authors..." value={searchKeyword} onChange={(e) => { setSearchKeyword(e.target.value); fetchCatalogBooks(1, e.target.value, selectedCategory, selectedSort, sortOrder); }} className="input" style={{ paddingLeft: '2.25rem' }} />
                    </div>
                    <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); fetchCatalogBooks(1, searchKeyword, e.target.value, selectedSort, sortOrder); }} className="catalog-select">
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
                    <select value={`${selectedSort}_${sortOrder}`} onChange={(e) => { 
                      const [sortBy, order] = e.target.value.split('_');
                      setSelectedSort(sortBy);
                      setSortOrder(order);
                      fetchCatalogBooks(1, searchKeyword, selectedCategory, sortBy, order); 
                    }} className="catalog-select">
                      <option value="random_none">Random</option>
                      <option value="createdAt_desc">Latest</option>
                      <option value="title_asc">Title (A to Z)</option>
                      <option value="title_desc">Title (Z to A)</option>
                      <option value="averageRating_desc">Highest Rated</option>
                      <option value="availableCopies_desc">Currently Available</option>
                      <option value="publishedYear_desc">Publication Year (Newest)</option>
                      <option value="publishedYear_asc">Publication Year (Oldest)</option>
                    </select>
                  </div>

                  {searchLoading ? (
                    <div className="flex justify-center" style={{ padding: '4rem 0' }}><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
                  ) : books.length === 0 ? (
                    <div className="empty-state"><FaBook className="empty-icon" /><h4 className="text-dark font-bold">No Books Found</h4><p className="text-muted">Try adjusting your filters.</p></div>
                  ) : (
                    <div className="book-grid">
                      {books.map((book) => (
                      <div key={book._id} onClick={() => setSelectedBook(book)} className="book-card">


                        <div className="book-cover">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                          ) : null}
                          <div className="book-cover-fallback" style={book.coverImage ? { display: 'none' } : {}}><FaBook /><span>{book.title}</span></div>
                          <button onClick={(e) => { e.stopPropagation(); handleWishlist(book._id); }} className="wishlist-btn-overlay" title="Add to Wishlist">
                            <FaHeart />
                          </button>
                        </div>
                        <div className="book-details">
                          <span className="book-category">{book.category}</span>
                          <h4 className="book-name">{book.title}</h4>
                          <p className="book-author">by {book.author}</p>
                          {book.averageRating > 0 && (
                            <div className="book-rating" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f39c12', fontSize: '0.85rem', margin: '0.2rem 0', justifyContent: 'center' }}>
                              <FaStar /> <span>{book.averageRating} ({book.ratingCount})</span>
                            </div>
                          )}
                          <div className="book-footer-centered">
                            {book.availableCopies > 0 ? (
                            <button onClick={(e) => { e.stopPropagation(); if (user.status !== "Blocked") handleBorrowBook(book._id); else toast.error("Account blocked."); }} disabled={user.status === "Blocked"} className="btn btn-primary borrow-btn-pill">Borrow</button>
                          ) : (
                            <button onClick={(e) => { e.stopPropagation(); if (user.status !== "Blocked") handleReserveBook(book._id); else toast.error("Account blocked."); }} disabled={user.status === "Blocked"} className="btn btn-outline borrow-btn-pill">Reserve</button>
                          )}
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="pager">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-outline btn-sm">Previous</button>
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
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn btn-outline btn-sm">Next</button>
                    </div>
                  )}
                </div>

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
                            <button onClick={() => handleWishlist(selectedBook._id)} className="wishlist-btn-overlay" style={{top: '0.75rem', right: '3.5rem', fontSize: '1.25rem'}} title="Add to Wishlist">
                              <FaHeart />
                            </button>
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
                            <div className="modal-v2-footer">
                              <span className={`modal-v2-avail ${selectedBook.availableCopies > 0 ? "text-mint" : "text-amber"}`}>
                                {selectedBook.availableCopies > 0 ? `${selectedBook.availableCopies} Copies Available` : "Not Available"}
                              </span>
                              {selectedBook.availableCopies > 0 ? (
                              <button onClick={() => handleBorrowBook(selectedBook._id)} disabled={user.status === "Blocked"} className="btn btn-primary">Borrow Book</button>
                            ) : (
                              <button onClick={() => handleReserveBook(selectedBook._id)} disabled={user.status === "Blocked"} className="btn btn-outline">Reserve Book</button>
                            )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* HISTORY */}
              {activeTab === "history" && (
                <div className="animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="section-title" style={{ margin: 0 }}>Borrow History</h3>
                    <button onClick={fetchHistory} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} disabled={historyLoading}>
                      <FaSync className={historyLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                  </div>

                  <div className="catalog-bar mb-4">
                    <div className="catalog-search" style={{ flex: '1' }}>
                      <FaSearch className="catalog-search-icon" />
                      <input 
                        type="text" 
                        placeholder="Search books..." 
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        className="input w-full"
                        style={{ paddingLeft: '2.25rem' }}
                      />
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="catalog-select" style={{ minWidth: '140px' }}>
                      <option value="">All Statuses</option>
                      {['Borrow Requested', 'Borrow Approved', 'Borrowed', 'Return Requested', 'Return Approved', 'Returned', 'Rejected', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="catalog-select">
                      <option value="All Categories">All Categories</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Mystery">Mystery</option>
                      <option value="Business">Business</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Self Help">Self Help</option>
                      <option value="History">History</option>
                      <option value="Technology">Technology</option>
                      <option value="Biography">Biography</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="pill-select" style={{ minWidth: '90px' }}>
                      <option value="">Date</option>
                      {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="pill-select" style={{ minWidth: '130px' }}>
                      <option value="">Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                    <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="pill-select" style={{ minWidth: '100px' }}>
                      <option value="">Year</option>
                      {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
                    </select>
                    <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear, status: filterStatus, search: historySearchQuery })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply Filter</button>
                    {(appliedFilters.day || appliedFilters.month || appliedFilters.year || appliedFilters.status || appliedFilters.search) && (
                      <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setFilterStatus(""); setHistorySearchQuery(""); setAppliedFilters({ day: "", month: "", year: "", status: "", search: "" }); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear Filters</button>
                    )}
                  </div>
                  {historyLoading ? (
                    <div className="flex justify-center" style={{ padding: '4rem 0' }}><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
                  ) : (
                    <div className="table-container">
                      {borrowHistory.length === 0 ? (
                        <div className="empty-state"><FaHistory className="empty-icon" /><h4 className="text-dark">No history yet.</h4></div>
                      ) : (
                        <table className="data-table">
                          <thead><tr><th>Book</th><th>Borrow</th><th>Due</th><th>Return</th><th>Fines</th><th>Status</th><th style={{ textAlign: 'center' }}>Action</th></tr></thead>
                          <tbody>
                            {borrowHistory.filter(record => {
                                const d = new Date(record.borrowDate);
                                if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) return false;
                                if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) return false;
                                if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) return false;
                                if (appliedFilters.status && record.status !== appliedFilters.status) return false;
                                if (appliedFilters.search && !(record.title || '').toLowerCase().includes(appliedFilters.search.toLowerCase())) return false;
                                if (filterCategory !== "All Categories" && record.category !== filterCategory) return false;
                                return true;
                            }).map((l) => (
                              <tr key={l.borrowId}>
                                <td>
                                  <div className="font-bold text-dark" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                    {l.title}
                                    {l.lostReported && <span className="badge badge-warning" style={{fontSize: '0.6rem', padding: '0.1rem 0.3rem'}}>Found Lost Book</span>}
                                  </div>
                                  <div className="text-xs text-muted">{l.author}</div>
                                </td>
                                <td>{l.borrowDate ? new Date(l.borrowDate).toLocaleDateString() : "—"}</td>
                                <td>{l.dueDate ? new Date(l.dueDate).toLocaleDateString() : "—"}</td>
                                <td>{l.returnDate ? new Date(l.returnDate).toLocaleDateString() : "—"}</td>
                                <td className="font-bold">{l.status === "Lost" ? (l.replacementCost > 0 ? `₹${l.replacementCost}` : '—') : l.fine > 0 ? `₹${l.fine}` : "₹0"}</td>
                                <td>
                                  {l.isOverdue && l.status === "Borrowed" ? (
                                    <span className="badge badge-danger">OVERDUE</span>
                                  ) : (
                                    <span className={`badge ${l.status === "Returned" ? "badge-success" : l.status === "Lost" ? "badge-danger" : "badge-warning"}`}>{l.status}</span>
                                  )}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {l.status === "Borrow Requested" && (
                                    <span className="text-muted font-bold text-xs block">Waiting for Librarian Approval</span>
                                  )}
                                  {l.status === "Borrow Approved" && (
                                    <span className="text-mint font-bold text-xs block">Approved - Please collect</span>
                                  )}
                                  {l.status === "Borrow Rejected" && (
                                    <span className="text-danger font-bold text-xs block">Rejected</span>
                                  )}
                                  {l.status === "Borrowed" && l.fine === 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                      <button onClick={() => handleReturnBook(l.borrowId)} className="btn-icon bg-sky-light text-sky" title="Request Return"><FaUndoAlt /></button>
                                    </div>
                                  )}
                                  {l.status === "Borrowed" && l.fine > 0 && !l.finePaid && (
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                      <button onClick={() => handlePayFine(l.borrowId, l.fine)} className="btn-icon bg-rose-light text-rose" title="Pay Fine"><FaCreditCard /></button>
                                      <button onClick={() => handleReturnBook(l.borrowId)} className="btn-icon bg-sky-light text-sky" title="Request Return"><FaUndoAlt /></button>
                                    </div>
                                  )}
                                  {l.status === "Borrowed" && l.fine > 0 && l.finePaid && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                      <span className="text-mint font-bold text-xs ml-2 block">Fine Paid</span>
                                      <button onClick={() => handleReturnBook(l.borrowId)} className="btn-icon bg-sky-light text-sky" title="Request Return"><FaUndoAlt /></button>
                                    </div>
                                  )}
                                  {l.status === "Return Requested" && (
                                    <span className="text-muted font-bold text-xs block">Waiting for Librarian Approval</span>
                                  )}
                                  {l.status === "Return Approved" && (
                                    <span className="text-mint font-bold text-xs block">Approved - Please return book</span>
                                  )}
                                  {l.status === "Return Rejected" && (
                                    <span className="text-danger font-bold text-xs block">Return Request Rejected</span>
                                  )}
                                  {l.status === "Returned" && (
                                    <span className="text-mint font-bold text-xs block">Returned Successfully</span>
                                  )}
                                  {l.status === "Lost" && l.replacementCost > 0 && !l.replacementCostPaid && (
                                    <button onClick={() => handlePayReplacement(l.borrowId, l.replacementCost)} className="btn btn-danger btn-sm block">Pay Charges</button>
                                  )}
                                  {l.status === "Lost" && l.replacementCostPaid && (
                                    <span className="text-mint font-bold text-xs ml-2 block">Paid</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* DUE BOOKS */}
              {activeTab === "due-books" && (
                <div className="animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="section-title" style={{ margin: 0 }}>Due Books</h3>
                    <button onClick={fetchHistory} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} disabled={historyLoading}>
                      <FaSync className={historyLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                  </div>

                  <div className="catalog-bar mb-4">
                    <div className="catalog-search" style={{ flex: '1' }}>
                      <FaSearch className="catalog-search-icon" />
                      <input 
                        type="text" 
                        placeholder="Search books..." 
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        className="input w-full"
                        style={{ paddingLeft: '2.25rem' }}
                      />
                    </div>
                    <select value={dueBooksPaymentFilter} onChange={(e) => setDueBooksPaymentFilter(e.target.value)} className="catalog-select" style={{ minWidth: '140px' }}>
                      <option value="All">All Fines</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="pill-select" style={{ minWidth: '90px' }}>
                      <option value="">Date</option>
                      {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="pill-select" style={{ minWidth: '130px' }}>
                      <option value="">Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                    <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="pill-select" style={{ minWidth: '100px' }}>
                      <option value="">Year</option>
                      {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
                    </select>
                    <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear, search: historySearchQuery })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply Filter</button>
                    {(appliedFilters.day || appliedFilters.month || appliedFilters.year || appliedFilters.search || dueBooksPaymentFilter !== "All") && (
                      <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setHistorySearchQuery(""); setDueBooksPaymentFilter("All"); setAppliedFilters({ day: "", month: "", year: "", search: "" }); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear Filters</button>
                    )}
                  </div>
                  
                  {historyLoading ? (
                    <div className="flex justify-center" style={{ padding: '4rem 0' }}><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead><tr><th>Book</th><th>Borrow</th><th>Due</th><th>Return</th><th>Fines</th><th>Status</th><th style={{ textAlign: 'center' }}>Action</th></tr></thead>
                        <tbody>
                          {borrowHistory.filter(record => {
                              if (!record.isOverdue && record.fine === 0) return false;
                              
                              const d = new Date(record.borrowDate);
                              if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) return false;
                              if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) return false;
                              if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) return false;
                              if (appliedFilters.search && !(record.title || '').toLowerCase().includes(appliedFilters.search.toLowerCase())) return false;
                              
                              if (dueBooksPaymentFilter === "Paid" && !record.finePaid) return false;
                              if (dueBooksPaymentFilter === "Unpaid" && (record.fine === 0 || record.finePaid)) return false;
                              
                              return true;
                          }).map((l) => (
                            <tr key={`due-${l.borrowId}`}>
                              <td>
                                <div className="font-bold text-dark" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                  {l.title}
                                </div>
                                <div className="text-xs text-muted">{l.author}</div>
                              </td>
                              <td>{l.borrowDate ? new Date(l.borrowDate).toLocaleDateString() : "—"}</td>
                              <td>{l.dueDate ? new Date(l.dueDate).toLocaleDateString() : "—"}</td>
                              <td>{l.returnDate ? new Date(l.returnDate).toLocaleDateString() : "—"}</td>
                              <td className="font-bold">{l.fine > 0 ? `₹${l.fine}` : "₹0"}</td>
                              <td>
                                {l.isOverdue && l.status === "Borrowed" ? (
                                  <span className="badge badge-danger">OVERDUE</span>
                                ) : (
                                  <span className={`badge ${l.status === "Returned" ? "badge-success" : l.status === "Lost" ? "badge-danger" : "badge-warning"}`}>{l.status}</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {l.status === "Borrowed" && l.fine > 0 && !l.finePaid && (
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button onClick={() => handlePayFine(l.borrowId, l.fine)} className="btn-icon bg-rose-light text-rose" title="Pay Fine"><FaCreditCard /></button>
                                    <button onClick={() => handleReturnBook(l.borrowId)} className="btn-icon bg-sky-light text-sky" title="Request Return"><FaUndoAlt /></button>
                                  </div>
                                )}
                                {l.status === "Borrowed" && l.fine > 0 && l.finePaid && (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                    <span className="text-mint font-bold text-xs block">Fine Paid</span>
                                    <button onClick={() => handleReturnBook(l.borrowId)} className="btn-icon bg-sky-light text-sky" title="Request Return"><FaUndoAlt /></button>
                                  </div>
                                )}
                                {l.status === "Borrowed" && l.fine === 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button onClick={() => handleReturnBook(l.borrowId)} className="btn-icon bg-sky-light text-sky" title="Request Return"><FaUndoAlt /></button>
                                  </div>
                                )}
                                {l.status === "Return Requested" && (
                                  <span className="text-muted font-bold text-xs block">Waiting Approval</span>
                                )}
                                {l.status === "Return Approved" && (
                                  <span className="text-mint font-bold text-xs block">Please return book</span>
                                )}
                                {l.status === "Returned" && (
                                  <span className="text-mint font-bold text-xs block">Returned</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {borrowHistory.filter(record => (!record.isOverdue && record.fine === 0) ? false : true).length === 0 && (
                            <tr><td colSpan="7" className="text-center" style={{ padding: '2rem' }}>No due books found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENTS */}
              {activeTab === "fines" && (
                <div className="animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="section-title" style={{ margin: 0 }}>Payment History</h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {historySearchQuery && (
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setHistorySearchQuery('')} style={{ padding: '0.5rem 1.5rem', borderRadius: '24px' }}>
                          Clear Search
                        </button>
                      )}
                      <button onClick={fetchHistory} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '24px' }} disabled={historyLoading}>
                        <FaSync className={historyLoading ? "animate-spin" : ""} /> Refresh
                      </button>
                    </div>
                  </div>

                  <div className="catalog-bar mb-4">
                    <div className="catalog-search" style={{ flex: '1', margin: 0 }}>
                      <FaSearch className="catalog-search-icon" />
                      <input 
                        type="text" 
                        className="input w-full" 
                        placeholder="Search payments..." 
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                      />
                    </div>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="catalog-select" style={{ borderLeft: '1px solid var(--border)' }}>
                      <option value="All Categories">All Categories</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Mystery">Mystery</option>
                      <option value="Business">Business</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Self Help">Self Help</option>
                      <option value="History">History</option>
                      <option value="Technology">Technology</option>
                      <option value="Biography">Biography</option>
                    </select>
                  </div>

                  <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                    <div className="fine-filter-tabs" style={{ margin: 0 }}>
                      <button onClick={() => setPaymentTypeTab("all")} className={`fine-filter-tab ${paymentTypeTab === "all" ? "active" : ""}`}>All Types</button>
                      <button onClick={() => setPaymentTypeTab("fine")} className={`fine-filter-tab ${paymentTypeTab === "fine" ? "active" : ""}`}>Late Fees</button>
                      <button onClick={() => setPaymentTypeTab("replacement")} className={`fine-filter-tab ${paymentTypeTab === "replacement" ? "active" : ""}`}>Replacement Cost</button>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
                    <div className="fine-filter-tabs" style={{ margin: 0 }}>
                      <button onClick={() => setFineTab("unpaid")} className={`fine-filter-tab ${fineTab === "unpaid" ? "active" : ""}`}>
                        Unpaid ({fineHistory.filter(f => f.status === "Unpaid" && (paymentTypeTab === "all" || f.type === paymentTypeTab)).length})
                      </button>
                      <button onClick={() => setFineTab("paid")} className={`fine-filter-tab ${fineTab === "paid" ? "active" : ""}`}>
                        Paid ({fineHistory.filter(f => f.status === "Paid" && (paymentTypeTab === "all" || f.type === paymentTypeTab)).length})
                      </button>
                      <button onClick={() => setFineTab("refunded")} className={`fine-filter-tab ${fineTab === "refunded" ? "active" : ""}`}>
                        Refunded ({fineHistory.filter(f => f.status === "Refunded" && (paymentTypeTab === "all" || f.type === paymentTypeTab)).length})
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
                    <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="pill-select" style={{ minWidth: '90px' }}>
                      <option value="">Date</option>
                      {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="pill-select" style={{ minWidth: '130px' }}>
                      <option value="">Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                    <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="pill-select" style={{ minWidth: '100px' }}>
                      <option value="">Year</option>
                      {[...Array(10)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
                    </select>
                    <button onClick={() => setAppliedFilters({ day: filterDay, month: filterMonth, year: filterYear, search: historySearchQuery })} className="btn btn-primary btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Apply Filter</button>
                    {(appliedFilters.day || appliedFilters.month || appliedFilters.year || appliedFilters.search) && (
                      <button onClick={() => { setFilterDay(""); setFilterMonth(""); setFilterYear(""); setHistorySearchQuery(""); setAppliedFilters({ day: "", month: "", year: "", search: "" }); }} className="btn btn-outline btn-sm ml-2" style={{ padding: '0.65rem 1.5rem', borderRadius: '24px' }}>Clear</button>
                    )}
                  </div>

                  {historyLoading ? (
                    <div className="flex justify-center" style={{ padding: '4rem 0' }}><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
                  ) : (
                    <div className="table-container">
                      {fineHistory.filter(f => (fineTab === "refunded" ? f.status === "Refunded" : fineTab === "paid" ? f.status === "Paid" : f.status === "Unpaid") && (paymentTypeTab === "all" || f.type === paymentTypeTab)).filter(record => {
                          if (appliedFilters.search && !(record.title || '').toLowerCase().includes(appliedFilters.search.toLowerCase())) return false;
                          if (filterCategory !== "All Categories" && record.category !== filterCategory) return false;
                          if (!record.date) return true;
                          const d = new Date(record.date);
                          if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) return false;
                          if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) return false;
                          if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) return false;
                          return true;
                      }).length === 0 ? (
                        <div className="empty-state"><FaCoins className="empty-icon" /><h4 className="text-dark font-bold">No payments found.</h4></div>
                      ) : (
                        <table className="data-table">
                          <thead><tr><th>Book</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th><th style={{ textAlign: 'center' }}>Action</th></tr></thead>
                          <tbody>
                            {fineHistory.filter(f => (fineTab === "refunded" ? f.status === "Refunded" : fineTab === "paid" ? f.status === "Paid" : f.status === "Unpaid") && (paymentTypeTab === "all" || f.type === paymentTypeTab)).filter(record => {
                                if (appliedFilters.search && !(record.title || '').toLowerCase().includes(appliedFilters.search.toLowerCase())) return false;
                                if (filterCategory !== "All Categories" && record.category !== filterCategory) return false;
                                if (!record.date) return true;
                                const d = new Date(record.date);
                                if (appliedFilters.day && d.getDate().toString() !== appliedFilters.day) return false;
                                if (appliedFilters.month && (d.getMonth() + 1).toString() !== appliedFilters.month) return false;
                                if (appliedFilters.year && d.getFullYear().toString() !== appliedFilters.year) return false;
                                return true;
                            }).map((l) => (
                              <tr key={`${l.id}-${l.type}`}>
                                <td className="font-bold text-dark">{l.title}</td>
                                <td><span className="badge badge-warning" style={{ background: '#fffbeb', color: '#f59e0b', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>{l.type.toUpperCase()}</span></td>
                                <td>
                                  <span className="font-bold text-rose" style={{ fontSize: '1.1rem' }}>
                                    ₹{l.amount}
                                  </span>
                                </td>
                                <td>{l.date ? new Date(l.date).toLocaleDateString() : "—"}</td>
                                <td><span className={`badge ${l.status === "Paid" ? "badge-success" : l.status === "Refunded" ? "bg-sky-light text-sky" : "badge-danger"}`} style={l.status === "Refunded" ? { background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' } : {}}>{l.status}</span></td>
                                <td style={{ textAlign: 'center' }}>
                                  {l.status === "Unpaid" && l.type === "fine" && (
                                    <button onClick={() => handlePayFine(l.id || l.borrowId, l.amount || l.fine)} className="btn-icon bg-rose-light text-rose mx-auto block" title="Pay Fine">
                                      <FaCreditCard />
                                    </button>
                                  )}
                                  {l.status === "Unpaid" && l.type === "replacement" && (
                                    <button onClick={() => handlePayReplacement(l.id || l.borrowId, l.amount || l.replacementCost)} className="btn-icon bg-rose-light text-rose mx-auto block" title="Pay Charges">
                                      <FaCreditCard />
                                    </button>
                                  )}
                                  {(l.status === "Paid" || l.status === "Refunded") && (
                                    <button onClick={() => setSelectedReceipt({
                                      id: l.id || l.borrowId,
                                      date: l.date,
                                      amount: l.amount,
                                      type: l.type,
                                      bookTitle: l.title,
                                      memberName: user?.name,
                                      status: l.status
                                    })} className="btn-icon bg-sky-light text-sky mx-auto block" title="View Receipt">
                                      <FaFileInvoiceDollar />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )}

              
              {activeTab === 'wishlist' && <WishlistTab onBorrow={handleBorrowBook} />}
              {activeTab === 'reservations' && <ReservationsTab />}
              {activeTab === 'renewals' && <RenewalsTab currentBooks={dashboardData?.currentlyBorrowedBooks || []} onRenewSuccess={() => fetchDashboardData(false)} />}
              {activeTab === 'recommendations' && <RecommendationsTab onBorrow={handleBorrowBook} onReserve={handleReserveBook} onWishlist={handleWishlist} />}
              {activeTab === 'lost-book' && <LostBookTab currentBooks={dashboardData?.currentlyBorrowedBooks || []} onRefresh={() => fetchDashboardData(false)} onPayCharges={handlePayReplacement} />}
              
              {activeTab === 'ratings' && <RatingsTab />}
              {activeTab === 'notifications' && <NotificationsTab />}
              {activeTab === 'emails' && <EmailsTab />}

              {/* PROFILE (Update) */}
              {activeTab === "profile" && (
                <div className="animate-fade-in-up">
                  <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                    
                    <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem' }}><FaUserEdit /></div>
                        <h3 className="section-title" style={{ margin: '0 0 0.25rem 0', fontSize: '1.6rem', fontWeight: 800 }}>Update Profile</h3>
                        <p className="text-muted" style={{ margin: 0 }}>Keep your account information up to date.</p>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="settings-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Full Name</label>
                        <input type="text" required value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="input" style={{ padding: '0.85rem', borderRadius: '12px' }} />
                      </div>
                      <div className="field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Email Address</label>
                        <input type="email" required value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="input" style={{ padding: '0.85rem', borderRadius: '12px' }} />
                      </div>

                      <div className="field-group" style={{ margin: 0, marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                            <input type="checkbox" checked={isChangingPassword} onChange={(e) => setIsChangingPassword(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                            Change Password
                        </label>
                      </div>

                      {isChangingPassword && (
                          <div className="password-fields-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                              <div className="field-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Current Password</label>
                                <input type="password" required={isChangingPassword} value={profileData.currentPassword} onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })} className="input" placeholder="Enter your current password" style={{ padding: '0.85rem', borderRadius: '10px' }} />
                              </div>
                              <div className="field-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>New Password</label>
                                <input type="password" required={isChangingPassword} value={profileData.newPassword} onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })} className="input" placeholder="Enter your new password" style={{ padding: '0.85rem', borderRadius: '10px' }} />
                              </div>
                          </div>
                      )}

                      <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ padding: '0.85rem', fontSize: '1.05rem', borderRadius: '12px', marginTop: '1rem', boxShadow: '0 6px 16px rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {profileLoading ? <><FaSync className="animate-spin" /> Updating...</> : "Save Changes"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* VIEW PROFILE */}
              {activeTab === "view-profile" && (
                <div className="animate-fade-in-up">
                  <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', padding: '2rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                    
                    {/* Header with Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, boxShadow: '0 8px 20px rgba(139, 92, 246, 0.25)' }}>
                          {user.name ? user.name[0].toUpperCase() : "M"}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                          <h2 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-dark)', fontSize: '1.6rem', fontWeight: 800 }}>{user.name}</h2>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>MEMBER</span>
                              <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>{user.status || 'Active'}</span>
                          </div>
                      </div>
                    </div>

                    {/* Rich Details Panel */}
                    <div style={{ width: '100%', background: 'var(--bg-muted)', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}><FaUser /></div>
                            <div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Registered Email Address</div>
                                <div style={{ color: 'var(--text-dark)', fontSize: '1rem', fontWeight: 700 }}>{user.email}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div style={{ background: 'white', padding: '1rem 0.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaBookOpen /></div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>{dashboardData?.overviewStats?.totalSuccessfulBorrows || 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Books Read</div>
                            </div>
                            <div style={{ background: 'white', padding: '1rem 0.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaCheckCircle /></div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>{dashboardData?.overviewStats?.currentlyBorrowedBooksCount || 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Currently Borrowed</div>
                            </div>
                            <div style={{ background: 'white', padding: '1rem 0.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaClock /></div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>{dashboardData?.overviewStats?.totalPendingRequests || 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Pending Requests</div>
                            </div>
                            <div style={{ background: 'white', padding: '1rem 0.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaMoneyBillWave /></div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>₹{dashboardData?.overviewStats?.pendingPaymentsSum || 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Pending Dues</div>
                            </div>
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={() => setActiveTab('profile')} style={{ padding: '0.75rem 2rem', fontSize: '1rem', marginTop: '0.5rem', borderRadius: '12px', boxShadow: '0 6px 16px rgba(139, 92, 246, 0.25)' }}><FaUserEdit /> Edit Profile Information</button>
                  </div>
                </div>
              )}

              {/* HELPLINE */}
              {activeTab === "helpline" && (
                <div className="animate-fade-in-up">
                  <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                    
                    <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}><FaLifeRing /></div>
                        <h3 className="section-title" style={{ margin: '0 0 0.25rem 0', fontSize: '1.6rem', fontWeight: 800 }}>Help Desk & Support</h3>
                        <p className="text-muted" style={{ margin: 0 }}>We're here to help you with your reading journey.</p>
                    </div>
                    
                    <form className="settings-form" onSubmit={(e) => { e.preventDefault(); toast.success("Support ticket created! We will contact you soon."); e.target.reset(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Query Subject</label>
                        <select className="input" required style={{ padding: '0.85rem', borderRadius: '12px' }}>
                            <option value="">Select a subject...</option>
                            <option value="book">Book Request / Missing Book</option>
                            <option value="fine">Issue with Fines / Payments</option>
                            <option value="tech">Technical Issue</option>
                            <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Message Details</label>
                        <textarea className="input" required rows="4" placeholder="Describe your issue in detail..." style={{ padding: '0.85rem', borderRadius: '12px', resize: 'vertical' }}></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem', fontSize: '1.05rem', borderRadius: '12px', marginTop: '0.5rem', boxShadow: '0 6px 16px rgba(139, 92, 246, 0.25)' }}>Submit Ticket</button>
                    </form>
                    
                    <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'var(--bg-muted)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-dark)', fontSize: '1.1rem' }}>Frequently Asked Questions</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div><strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-dark)' }}>How long can I keep a borrowed book?</strong><span className="text-muted text-sm">Books can typically be borrowed for 14 days, with options to renew if there are no pending reservations.</span></div>
                            <div><strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-dark)' }}>What happens if I lose a book?</strong><span className="text-muted text-sm">Please navigate to the "Lost Book Request" tab to report it. You may be charged a replacement cost.</span></div>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* PAYMENT MODAL */}
      {paymentModal && (
        <div className="modal-bg" onClick={() => setPaymentModal(null)}>
          <div className="modal-card-v2 animate-scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', padding: '2rem' }}>
            <button className="modal-close-btn" onClick={() => setPaymentModal(null)}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>Complete Payment</h3>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                    {paymentModal.type === 'fine' ? 'Late Fee' : 'Replacement Cost'}: <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>₹{paymentModal.amount || '0'}</strong>
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', background: '#fff', border: '1.5px solid var(--primary-light)', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    {/* Real QR Code using public API */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=LibraryPaymentMock-${paymentModal.borrowId}`} alt="Payment QR Code" style={{ width: '160px', height: '160px', borderRadius: '8px' }} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Scan QR to Pay with any UPI App</p>
                
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                    <div style={{ flex: 1, height: '1.5px', background: 'rgba(0,0,0,0.05)' }}></div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>OR PAY USING</span>
                    <div style={{ flex: 1, height: '1.5px', background: 'rgba(0,0,0,0.05)' }}></div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem', borderRadius: '8px', border: '1.5px solid var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}>Card</button>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '0.65rem', fontSize: '0.9rem', borderRadius: '8px', border: '1.5px solid var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}>Net Banking</button>
                </div>
                
                <button className="btn btn-primary" onClick={confirmPayment} style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(110, 86, 207, 0.3)' }}>Verify & Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
      <ReceiptModal receiptData={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};

export default MemberDashboard;
