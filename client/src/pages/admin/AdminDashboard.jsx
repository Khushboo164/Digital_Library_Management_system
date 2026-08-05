import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBook, FaUsers, FaCoins, FaSignOutAlt, FaChartBar, FaExchangeAlt, 
  FaUserSlash, FaEnvelope, FaHistory, FaUser, FaUserEdit, FaBell,
  FaCog, FaShieldAlt, FaUserTie, FaSync, FaBookOpen, FaBookDead, FaBookmark
} from 'react-icons/fa';

import api from "../../utils/api";
import { toast } from "react-toastify";
import "../../styles/DashboardLayout.css";

import AdminDashboardOverview from "./AdminDashboardOverview";
import AdminUserManagementTab from "./AdminUserManagementTab";
import AdminLibrarianManagementTab from "./AdminLibrarianManagementTab";
import AdminMemberManagementTab from "./AdminMemberManagementTab";
import AdminBookCatalogTab from "./AdminBookCatalogTab";
import AdminBorrowReservationsTab from "./AdminBorrowReservationsTab";
import AdminFinanceTab from "./AdminFinanceTab";
import AdminAnalyticsTab from "./AdminAnalyticsTab";
import AdminMyActivitiesTab from "./AdminMyActivitiesTab";
import AdminEmailHistoryTab from "./AdminEmailHistoryTab";
import AdminSystemSettingsTab from "./AdminSystemSettingsTab";
import AdminAuditTab from "./AdminAuditTab";
import AdminLostBooksTab from "./AdminLostBooksTab";
import LibrarianReservationsTab from "../librarian/LibrarianReservationsTab";
import AdminOverdueTab from "./AdminOverdueTab";

// Tab imports will go here as we create them
const PlaceholderTab = ({ name }) => (
    <div className="panel" style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
        <h2>{name} Placeholder</h2>
        <p className="text-muted">This section is currently under construction.</p>
    </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboardData();
    }
  }, [activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      // Admin shares the same profile update logic in the backend
      const res = await api.put("/librarian/profile", profileData);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { id: "overview", label: "Dashboard", icon: <FaChartBar /> },
    { id: "my-activities", label: "My Activity", icon: <FaHistory /> },
    { id: "users", label: "Members", icon: <FaUsers /> },
    { id: "librarians", label: "Librarians", icon: <FaUserTie /> },
    { id: "overdue", label: "Overdue Members", icon: <FaUserSlash /> },
    { id: "catalog", label: "Book & Catalog", icon: <FaBook /> },
    { id: "workspace", label: "Borrow Workspace", icon: <FaExchangeAlt /> },
    { id: "reservations", label: "Reservations", icon: <FaBookmark /> },
    { id: "lost-books", label: "Lost Books", icon: <FaBookDead /> },
    { id: "finance", label: "Fines & Replacement", icon: <FaCoins /> },
    { id: "email-history", label: "Email History", icon: <FaEnvelope /> },
    { id: "settings", label: "System Settings", icon: <FaCog /> }
  ];

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon"><FaBookOpen /></div>
          <div>
            <div className="brand-name">Book<span>Sphere</span></div>
            <span className="brand-sub">Admin Portal</span>
          </div>
        </div>

        <div className="dash-user-card">
          <div className="dash-user-avatar" style={{ background: 'var(--primary)', color: '#fff' }}>
            {user.name ? user.name[0].toUpperCase() : "A"}
          </div>
          <div className="dash-user-meta">
            <h3>{user.name || 'Admin'}</h3>
            <span className="dash-user-role">Admin</span>
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
            <span className="topbar-label">Admin</span>
            <h3 className="topbar-title">
              {activeTab === "profile" && "Update Profile"}
              {activeTab === "view-profile" && "Admin Profile"}
              {navItems.find(i => i.id === activeTab)?.label || (activeTab === "overview" && "Dashboard")}
            </h3>
          </div>
          <div className="topbar-right">
             <div className="topbar-date">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
             <div className="dash-user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem', background: 'var(--primary)', color: '#fff' }}>
                {user.name ? user.name[0].toUpperCase() : "A"}
             </div>
          </div>
        </header>

        <div className="dash-workspace">
          {activeTab === "overview" && (loading ? <div className="flex justify-center mt-4"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div> : <AdminDashboardOverview data={dashboardData} setActiveTab={setActiveTab} />)}
          {activeTab === "my-activities" && <AdminMyActivitiesTab setActiveTab={setActiveTab} />}
          { activeTab === "users" && <AdminUserManagementTab /> }
          { activeTab === "librarians" && <AdminLibrarianManagementTab /> }
          { activeTab === "overdue" && <AdminOverdueTab /> }
          { activeTab === "catalog" && <AdminBookCatalogTab /> }
          {activeTab === "workspace" && <AdminBorrowReservationsTab />}
          {activeTab === "reservations" && <LibrarianReservationsTab readOnly={true} />}
          {activeTab === "lost-books" && <AdminLostBooksTab />}
          {activeTab === "finance" && <AdminFinanceTab />}
          {activeTab === "email-history" && <AdminEmailHistoryTab />}
          {activeTab === "settings" && <AdminSystemSettingsTab />}
          {/* PROFILE (Update) */}
          {activeTab === "profile" && (
            <div className="animate-fade-in-up">
              <div className="settings-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1rem' }}><FaUserEdit /></div>
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
                  <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ padding: '0.85rem', fontSize: '1.05rem', borderRadius: '12px', marginTop: '0.5rem', boxShadow: '0 6px 16px rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, boxShadow: '0 8px 20px rgba(139, 92, 246, 0.25)' }}>
                      {user.name ? user.name[0].toUpperCase() : "A"}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                      <h2 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-dark)', fontSize: '1.6rem', fontWeight: 800 }}>{user.name}</h2>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>ADMIN</span>
                          <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>{user.status || 'Active'}</span>
                      </div>
                  </div>
                </div>

                <div style={{ width: '100%', background: 'var(--bg-muted)', padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}><FaEnvelope /></div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Registered Email Address</div>
                            <div style={{ color: 'var(--text-dark)', fontSize: '1rem', fontWeight: 700 }}>{user.email}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div style={{ background: 'white', padding: '1rem 0.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaUsers /></div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>{dashboardData?.overview?.totalMembers || 0}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Total Members</div>
                        </div>
                        <div style={{ background: 'white', padding: '1rem 0.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}><FaBook /></div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>{dashboardData?.overview?.totalBooks || 0}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Total Books</div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
