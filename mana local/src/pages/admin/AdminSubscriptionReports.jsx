import React, { useState, useEffect } from 'react';
import { 
  HiCurrencyRupee, HiUsers, HiChartBar, HiBriefcase, 
  HiDownload, HiSearch, HiCalendar, HiFilter, HiPhone, HiMail, HiTag 
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminSubscriptionReports() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [reports, setReports] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [records, setRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Categories for Filter & Grouping
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setCategories(d.categories || []);
      })
      .catch(console.error);
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/admin/reports?month=${month}&year=${year}`;
      if (selectedDate) url += `&date=${encodeURIComponent(selectedDate)}`;
      if (selectedRole !== 'all') url += `&role=${encodeURIComponent(selectedRole)}`;
      if (selectedCategory !== 'all') url += `&category_id=${encodeURIComponent(selectedCategory)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReports(data.report);
        setDailyBreakdown(data.dailyBreakdown || []);
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error('Error fetching subscription reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [month, year, selectedDate, selectedRole, selectedCategory]);

  // Client-side search filtering by Name, Phone, Email
  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (r.name || '').toLowerCase().includes(q);
    const phoneMatch = (r.phone || '').toLowerCase().includes(q);
    const emailMatch = (r.email || '').toLowerCase().includes(q);
    const catMatch = (r.category_name || '').toLowerCase().includes(q);
    return nameMatch || phoneMatch || emailMatch || catMatch;
  });

  // Export to Excel-compatible CSV format
  const exportToExcel = (specificCategoryId = null, specificCategoryName = null) => {
    let rowsToExport = filteredRecords;
    let fileNameCategory = 'All_Categories';

    if (specificCategoryId && specificCategoryId !== 'all') {
      rowsToExport = rowsToExport.filter(r => String(r.category_id) === String(specificCategoryId));
      fileNameCategory = specificCategoryName ? specificCategoryName.replace(/[^a-zA-Z0-9]/g, '_') : `Category_${specificCategoryId}`;
    }

    if (rowsToExport.length === 0) {
      toast.error('No records available to export for this selection.');
      return;
    }

    // CSV Headers
    const headers = [
      'Name',
      'Mobile Number',
      'Email',
      'Role',
      'Category',
      'Sub Category',
      'Joined Date',
      'Location',
      'Plan Name',
      'Status'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [
      headers.join(','),
      ...rowsToExport.map(r => [
        escapeCsv(r.name || 'N/A'),
        escapeCsv(r.phone || 'N/A'),
        escapeCsv(r.email || 'N/A'),
        escapeCsv(r.role === 'worker' ? 'Worker' : 'Customer'),
        escapeCsv(r.category_name || 'General / Customer'),
        escapeCsv(r.subcategory_name || 'N/A'),
        escapeCsv(r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'),
        escapeCsv(r.location || 'N/A'),
        escapeCsv(r.plan_name || 'None'),
        escapeCsv(r.status || 'Active')
      ].join(','))
    ];

    const csvContent = '\uFEFF' + csvRows.join('\r\n'); // UTF-8 BOM for Excel support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ManaLocal_Report_${fileNameCategory}_${year}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rowsToExport.length} contacts for ${fileNameCategory}!`);
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-header">
        <div>
          <h1>Reports & User Directory</h1>
          <p>Day-wise & month-wise analytics, worker/customer contact list, and category bulk export.</p>
        </div>

        {/* Global Month/Year Filters & Main Export */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={month} 
            onChange={(e) => { setMonth(e.target.value); setSelectedDate(''); }}
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '600' }}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>

          <select 
            value={year} 
            onChange={(e) => { setYear(e.target.value); setSelectedDate(''); }}
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: '600' }}
          >
            {[currentYear-2, currentYear-1, currentYear, currentYear+1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button 
            className="admin-btn-primary"
            onClick={() => exportToExcel(selectedCategory, categories.find(c => String(c.id) === String(selectedCategory))?.name)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '13px' }}
          >
            <HiDownload style={{ fontSize: '16px' }} />
            <span>Download Excel</span>
          </button>
        </div>
      </div>
      
      {/* 4 Metric Cards */}
      {reports && (
        <div className="reports-grid" style={{ marginBottom: '24px' }}>
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

      {/* Daily Breakdown Chips (Ye Date Entamandi) */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px', color: '#0f172a' }}>
              Daily Registration Breakdown ({new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Select a date to filter the table below</span>
          </div>
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate('')}
              style={{ padding: '4px 10px', fontSize: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: 600 }}
            >
              Clear Date Filter (Show All Month)
            </button>
          )}
        </div>

        {dailyBreakdown.length === 0 ? (
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>No registrations recorded for this month.</p>
        ) : (
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
            {dailyBreakdown.map((d) => {
              const isSelected = selectedDate === d.join_date;
              return (
                <div 
                  key={d.join_date}
                  onClick={() => setSelectedDate(isSelected ? '' : d.join_date)}
                  style={{
                    flex: '0 0 auto',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--primary, #2563eb)' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? 'var(--primary, #2563eb)' : '#334155' }}>
                    {new Date(d.join_date).toLocaleDateString('default', { day: '2-digit', month: 'short' })}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                    {d.total_count} Joined
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    👷 {d.workers_count} | 👤 {d.customers_count}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Wise Quick Export Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiTag style={{ color: 'var(--primary, #2563eb)', fontSize: '20px' }} />
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Category-Wise Export for Bulk Email / SMS:</strong>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Quick download contacts filtered by professional trade</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.slice(0, 6).map(c => (
              <button
                key={c.id}
                onClick={() => exportToExcel(c.id, c.name)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#1e293b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{c.name}</span>
                <HiDownload style={{ color: '#64748b' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Member Directory List */}
      <div className="admin-card" style={{ padding: '24px' }}>
        {/* Table Filters & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Members List ({filteredRecords.length})
            </h2>
            {selectedDate && (
              <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                Date: {selectedDate}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', background: '#fff', width: '220px' }}>
              <HiSearch style={{ color: '#94a3b8', marginRight: '6px' }} />
              <input 
                type="text"
                placeholder="Search name, phone, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 500 }}
            >
              <option value="all">All Roles (Workers & Customers)</option>
              <option value="worker">Workers Only</option>
              <option value="customer">Customers Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 500 }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading records...</div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            No members found matching the selected criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 14px' }}>Name</th>
                  <th style={{ padding: '12px 14px' }}>Phone / Mobile</th>
                  <th style={{ padding: '12px 14px' }}>Email</th>
                  <th style={{ padding: '12px 14px' }}>Role</th>
                  <th style={{ padding: '12px 14px' }}>Category</th>
                  <th style={{ padding: '12px 14px' }}>Joined Date</th>
                  <th style={{ padding: '12px 14px' }}>Plan / Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                      {r.name || 'Unnamed'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#0284c7', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HiPhone style={{ color: '#0284c7' }} />
                        <a href={`tel:${r.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {r.phone || 'No phone'}
                        </a>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HiMail style={{ color: '#94a3b8' }} />
                        <span>{r.email || 'No email'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        background: r.role === 'worker' ? '#f0fdf4' : '#eff6ff', 
                        color: r.role === 'worker' ? '#166534' : '#1e40af' 
                      }}>
                        {r.role === 'worker' ? 'Worker' : 'Customer'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>
                      {r.category_name ? (
                        <div>
                          <strong>{r.category_name}</strong>
                          {r.subcategory_name && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{r.subcategory_name}</div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {r.plan_name ? (
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {r.plan_name}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
