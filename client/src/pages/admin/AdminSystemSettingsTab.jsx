import React, { useState, useEffect } from "react";
import { FaSave, FaCog, FaUndo, FaBook, FaCalendarCheck, FaMoneyBillWave, FaBell, FaShieldAlt, FaSync } from "react-icons/fa";
import api from "../../utils/api";
import { toast } from "react-toastify";

const AdminSystemSettingsTab = () => {
  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/settings");
      if (res.data && Array.isArray(res.data)) {
        const settingsObj = {};
        res.data.forEach(item => {
          settingsObj[item.key] = { value: item.value, description: item.description, category: item.category, updatedAt: item.updatedAt };
        });
        setSettings(settingsObj);
        setOriginalSettings(JSON.parse(JSON.stringify(settingsObj)));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const settingsArray = Object.keys(settings).map(key => ({
        key,
        value: settings[key].value,
        category: settings[key].category,
        description: settings[key].description
      }));
      
      const res = await api.put("/admin/settings", { settings: settingsArray });
      toast.success(res.data.message || "Settings updated successfully");
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
  };

  if (loading) {
    return <div className="text-center py-10">Loading settings...</div>;
  }

  // Helper to render a numeric input
  const renderNumericInput = (key, label, description, min = 0, unit = null) => {
    if (!settings[key]) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div>
            <h4 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>{label}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{description}</p>
            {settings[key].updatedAt && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Updated on {new Date(settings[key].updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            )}
        </div>
        <div>
            <div style={{ position: 'relative' }}>
                {unit === '₹' && <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}>₹</span>}
                <input 
                    type="number" 
                    value={settings[key].value} 
                    onChange={e => handleChange(key, parseInt(e.target.value) || 0)} 
                    style={{ width: '100%', padding: `0.75rem ${unit && unit !== '₹' ? '3.5rem' : '0.75rem'} 0.75rem ${unit === '₹' ? '2rem' : '0.75rem'}`, borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    min={min}
                    required
                />
                {unit && unit !== '₹' && <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>{unit}</span>}
            </div>
        </div>
      </div>
    );
  };

  // Helper to render a toggle
  const renderToggle = (key, label, description) => {
    if (!settings[key]) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div>
            <h4 style={{ margin: '0 0 0.25rem', color: '#1e293b' }}>{label}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{description}</p>
            {settings[key].updatedAt && (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Updated on {new Date(settings[key].updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
            )}
        </div>
        <div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: 'fit-content' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type="checkbox" style={{ display: 'none' }} checked={settings[key].value} onChange={(e) => handleChange(key, e.target.checked)} />
                    <div style={{ width: '44px', height: '24px', backgroundColor: settings[key].value ? 'var(--primary)' : '#cbd5e1', borderRadius: '9999px', transition: 'background-color 0.2s', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: settings[key].value ? '22px' : '2px', top: '2px', backgroundColor: 'white', width: '20px', height: '20px', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
                    </div>
                </div>
                <span style={{ marginLeft: '1rem', fontWeight: 600, color: settings[key].value ? 'var(--primary)' : '#64748b' }}>{settings[key].value ? 'ON' : 'OFF'}</span>
            </label>
        </div>
      </div>
    );
  };

  const sectionStyle = { background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', marginBottom: '1.5rem' };
  const headerStyle = { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '2px solid var(--bg-muted)', paddingBottom: '1rem' };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Standard Header Panel */}
      <div className="panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="panel-title" style={{ fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCog color="var(--primary)" /> Global System Settings
          </h3>
          <button onClick={fetchSettings} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        
        {/* Section 1: Borrowing Rules */}
        <div className="panel" style={sectionStyle}>
          <div style={headerStyle}>
             <FaBook size={20} color="var(--primary)" />
             <h3 style={{ margin: 0, color: '#0f172a' }}>Borrowing Rules</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {renderNumericInput("maximumBorrowLimit", "Maximum Books Per Member", "Controls how many books a member can have borrowed simultaneously.", 1)}
            {renderNumericInput("borrowDuration", "Borrow Duration", "Controls how long a member can keep a book before it becomes overdue.", 1, "Days")}
            {renderNumericInput("maximumRenewals", "Maximum Renewals", "Controls how many times a member can renew a borrowed book.", 0)}
            {renderNumericInput("renewalDuration", "Renewal Duration", "Controls how many additional days each renewal provides.", 1, "Days")}
          </div>
        </div>

        {/* Section 2: Reservation Rules */}
        <div className="panel" style={sectionStyle}>
          <div style={headerStyle}>
             <FaCalendarCheck size={20} color="var(--primary)" />
             <h3 style={{ margin: 0, color: '#0f172a' }}>Reservation Rules</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {renderNumericInput("maximumReservations", "Maximum Active Reservations", "Max active reservations a member can hold at once.", 0)}
            {renderNumericInput("reservationHoldPeriod", "Reservation Hold Period", "How long a member has to collect a reserved book after it becomes available.", 1, "Days")}
            {renderToggle("autoExpireReservations", "Automatically Expire Reservations", "If enabled, uncollected reservations will automatically expire.")}
          </div>
        </div>

        {/* Section 3: Fine & Replacement Rules */}
        <div className="panel" style={sectionStyle}>
          <div style={headerStyle}>
             <FaMoneyBillWave size={20} color="var(--primary)" />
             <h3 style={{ margin: 0, color: '#0f172a' }}>Fine & Replacement</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {renderNumericInput("finePerDay", "Fine Per Day", "Amount charged per day for overdue books.", 0, "₹")}
            {renderNumericInput("gracePeriod", "Grace Period", "Number of days after the due date before the fine starts.", 0, "Days")}
            {renderNumericInput("maximumFinePerBook", "Maximum Fine Per Book", "Prevents the fine for a single book from exceeding this amount.", 0, "₹")}
            {renderToggle("autoBlockUnpaidFine", "Automatic Block for Unpaid Fine", "If enabled, members with unpaid fines are blocked from borrowing.")}
            {renderToggle("autoBlockLostBook", "Automatic Block for Lost Book", "If enabled, members with unpaid replacement costs are blocked.")}
          </div>
        </div>

        {/* Section 4: Notification Rules */}
        <div className="panel" style={sectionStyle}>
          <div style={headerStyle}>
             <FaBell size={20} color="var(--primary)" />
             <h3 style={{ margin: 0, color: '#0f172a' }}>Notification Rules</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {renderToggle("notifyDueDate", "Due Date Reminder", "Automatically send a reminder before a book is due.")}
            {renderNumericInput("reminderDaysBeforeDue", "Reminder Before Due Date", "Number of days before the due date to send the reminder.", 1, "Days")}
            {renderToggle("notifyOverdue", "Overdue Reminder", "Automatically send reminders for overdue books.")}
            {renderToggle("notifyReservation", "Reservation Available Notification", "Notify members when their reserved book is available.")}
            {renderToggle("notifyReturn", "Book Return Confirmation", "Send a confirmation when a book is successfully returned.")}
            {renderToggle("notifyFine", "Fine Generated Notification", "Notify members when a fine is applied to their account.")}
            {renderToggle("notifyBlock", "Member Blocked Notification", "Notify members when their account gets blocked.")}
          </div>
        </div>

        {/* Section 5: Account & Security */}
        <div className="panel" style={sectionStyle}>
          <div style={headerStyle}>
             <FaShieldAlt size={20} color="var(--primary)" />
             <h3 style={{ margin: 0, color: '#0f172a' }}>Account & Security</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {renderToggle("requireEmailVerification", "Require Email Verification", "Require users to verify their email address before logging in.")}
            {renderNumericInput("maximumLoginAttempts", "Maximum Login Attempts", "Maximum failed login attempts before account lockout.", 1)}
            {renderNumericInput("sessionTimeout", "Session Timeout", "Number of minutes before an inactive session is terminated.", 5, "Minutes")}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', marginBottom: '4rem' }}>
            <button 
                type="button" 
                onClick={handleReset} 
                className="btn btn-outline"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                disabled={saving}
            >
                <FaUndo /> Reset Changes
            </button>
            <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
                disabled={saving}
            >
                <FaSave /> {saving ? "Saving..." : "Save Settings"}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSystemSettingsTab;
