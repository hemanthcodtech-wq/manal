import React, { useState, useEffect } from 'react';
import { HiCurrencyRupee, HiUsers, HiChartBar, HiBriefcase } from 'react-icons/hi';
import './Admin.css';

export default function AdminSubscriptionReports() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/admin/reports?month=${month}&year=${year}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.report);
      }
    } catch (err) {
      console.error('Error fetching subscription reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [month, year]);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Monthly Reports</h1>
          <p>Analytics and revenue overview for subscriptions, users, and workers.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={month} 
            onChange={(e) => setMonth(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', fontWeight: '600' }}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px', fontWeight: '600' }}
          >
            {[currentYear-2, currentYear-1, currentYear, currentYear+1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="admin-card"><div className="ac-empty"><p>Loading reports...</p></div></div>
      ) : !reports ? (
        <div className="admin-card">
          <div className="ac-empty">
            <p>Insufficient data to generate reports at this time.</p>
          </div>
        </div>
      ) : (
        <div className="reports-grid">
          <div className="report-metric">
            <div className="rm-icon" style={{background: '#f5f3ff', color: '#8b5cf6', borderColor: '#ede9fe'}}><HiCurrencyRupee size={24} /></div>
            <strong>₹{(reports.revenue || 0).toLocaleString()}</strong>
            <span>Subscription Revenue</span>
          </div>
          <div className="report-metric">
            <div className="rm-icon" style={{background: '#f0fdf4', color: '#22c55e', borderColor: '#dcfce7'}}><HiBriefcase size={24} /></div>
            <strong>{reports.newWorkers || 0}</strong>
            <span>New Workers Joined</span>
          </div>
          <div className="report-metric">
            <div className="rm-icon" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#dbeafe'}}><HiUsers size={24} /></div>
            <strong>{reports.newUsers || 0}</strong>
            <span>New Users Joined</span>
          </div>
          <div className="report-metric">
            <div className="rm-icon" style={{background: '#fff7ed', color: '#f97316', borderColor: '#ffedd5'}}><HiChartBar size={24} /></div>
            <strong>{reports.subscriptionsCount || 0}</strong>
            <span>New Subscriptions</span>
          </div>
        </div>
      )}
    </div>
  );
}
