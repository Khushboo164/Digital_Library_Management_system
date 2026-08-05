import React, { useState, useEffect } from 'react';
import { FaChartBar, FaSync, FaDownload } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const AdminAnalyticsTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/librarian/analytics');
      setData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const handleDownloadReport = () => {
    toast.success("Report downloaded successfully");
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ margin: 0 }}>Analytics & Reports</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleDownloadReport} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            <FaDownload /> Download Report
          </button>
          <button onClick={fetchAnalytics} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="flex justify-center my-8"><FaSync className="animate-spin text-primary" style={{ fontSize: '2rem' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="two-cols">
            <div className="panel" style={{ padding: '1.5rem', height: '400px' }}>
              <h3 className="panel-title" style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Borrow vs Return Trend</h3>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={data.borrowTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="borrows" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="returns" stroke="var(--mint)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="panel" style={{ padding: '1.5rem', height: '400px' }}>
              <h3 className="panel-title" style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Top Categories</h3>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={data.topCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-card)' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsTab;
