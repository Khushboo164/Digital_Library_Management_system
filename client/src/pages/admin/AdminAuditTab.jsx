import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaSearch } from "react-icons/fa";
import api from "../../utils/api";
import { toast } from "react-toastify";

const AdminAuditTab = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/activities");
      setActivities(res.data.activities || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      (activity.action && activity.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity.admin?.name && activity.admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (activity.details && activity.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="text-center py-10">Loading audit logs...</div>;
  }

  const categories = ["User Management", "Librarian Management", "Member Management", "Finance", "System Settings", "Authentication", "Other"];

  return (
    <div className="animate-fade-in-up">
      {/* Standard Header Panel */}
      <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="panel-title" style={{ fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaShieldAlt color="#ef4444" /> Security & Audit Logs
          </h3>
          <button onClick={fetchActivities} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input & Button */}
            <div style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', background: '#f8fafc', transition: 'all 0.3s' }}
                />
              </div>
              <button type="button" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={loading}>
                <FaSearch /> {loading ? 'Searching...' : 'Search'}
              </button>
              {searchTerm && (
                <button type="button" className="btn btn-outline" onClick={() => setSearchTerm('')} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
                  Clear
                </button>
              )}
            </div>

            {/* Select Dropdown Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pill-select"
                style={{ padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {(categoryFilter !== 'all') && (
                <button onClick={() => setCategoryFilter("all")} className="btn btn-outline btn-sm" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}>Clear Filters</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="panel" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Admin</th>
              <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Action</th>
              <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length > 0 ? filteredActivities.map((activity) => (
              <tr key={activity._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>
                    {new Date(activity.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>
                    {activity.admin?.name || 'System'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                    {activity.category}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#0f172a' }}>{activity.action}</td>
                <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>{activity.details || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No audit logs found matching criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAuditTab;
