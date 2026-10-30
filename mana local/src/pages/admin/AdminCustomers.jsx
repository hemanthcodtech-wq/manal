import { useState, useEffect } from 'react';
import { HiUsers, HiPhone, HiMail, HiDownload, HiDocumentText, HiCalendar, HiSearch } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Skeleton';
import { exportToExcelFile, exportToPdfPrint } from '../../utils/exportUtils';
import './Admin.css';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/customers`);
        const data = await res.json();
        if (data.success) {
          setCustomers(data.customers);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Filter customers by date, month, year and search
  const filteredCustomers = customers.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').toLowerCase().includes(q);
      const matchEmail = (c.email || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }

    if (!c.created_at) return true;
    const d = new Date(c.created_at);
    const itemYear = d.getFullYear();
    const itemMonth = d.getMonth() + 1;
    const itemDate = d.toISOString().split('T')[0];

    if (selectedYear !== 'all' && itemYear !== parseInt(selectedYear)) return false;
    if (selectedMonth !== 'all' && itemMonth !== parseInt(selectedMonth)) return false;
    if (selectedDate && itemDate !== selectedDate) return false;

    return true;
  });

  const headers = [
    { label: 'Customer Name', key: (c) => c.name || 'Unnamed' },
    { label: 'Email Address', key: 'email' },
    { label: 'Phone Number', key: (c) => c.phone || 'N/A' },
    { label: 'Registration Date', key: (c) => c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A' },
    { label: 'Status', key: (c) => c.status || 'Active' }
  ];

  const handleDownloadExcel = () => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers match the selected filter to export.');
      return;
    }
    const success = exportToExcelFile({
      filename: `ManaLocal_Customers_${selectedYear}_${selectedMonth}_${selectedDate || 'all'}`,
      headers,
      data: filteredCustomers
    });
    if (success) toast.success(`Exported ${filteredCustomers.length} customers to Excel!`);
  };

  const handleDownloadPdf = () => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers match the selected filter to export.');
      return;
    }
    const subtitle = `Filter: ${selectedMonth !== 'all' ? `Month: ${selectedMonth}, ` : ''}${selectedYear !== 'all' ? `Year: ${selectedYear}, ` : ''}${selectedDate ? `Date: ${selectedDate}, ` : ''}Total Customers: ${filteredCustomers.length}`;
    const success = exportToPdfPrint({
      title: 'Customer Directory Report',
      subtitle,
      headers,
      data: filteredCustomers
    });
    if (success) toast.success('Opened PDF printable document!');
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <Skeleton type="title" style={{ width: '150px' }} />
            <Skeleton type="text" style={{ width: '100px' }} />
          </div>
        </div>
        <div className="customers-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="customer-card">
              <div className="cc-top">
                <Skeleton type="avatar" style={{ width: '40px', height: '40px' }} />
                <Skeleton type="text" style={{ width: '60px', height: '24px', borderRadius: '12px' }} />
              </div>
              <Skeleton type="title" style={{ width: '120px', marginTop: '10px' }} />
              <div className="cc-info">
                <Skeleton type="text" style={{ width: '180px' }} />
                <Skeleton type="text" style={{ width: '140px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Customers Directory</h1>
          <p>{filteredCustomers.length} registered customers shown ({customers.length} total)</p>
        </div>

        {/* Download Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadExcel}
            className="admin-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', padding: '9px 16px', fontSize: '13px' }}
          >
            <HiDownload style={{ fontSize: '16px' }} />
            <span>Download Excel</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="admin-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#dc2626', padding: '9px 16px', fontSize: '13px' }}
          >
            <HiDocumentText style={{ fontSize: '16px' }} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Date & Month Filter Bar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HiCalendar style={{ color: '#64748b', fontSize: '18px' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Filter By:</span>
        </div>

        {/* Specific Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          />
        </div>

        {/* Month Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Month:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            <option value="all">All Months</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
          >
            <option value="all">All Years</option>
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Search by Name/Phone/Email */}
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', background: '#fff', marginLeft: 'auto', minWidth: '220px' }}>
          <HiSearch style={{ color: '#94a3b8', marginRight: '6px' }} />
          <input
            type="text"
            placeholder="Search name, phone, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
          />
        </div>

        {(selectedDate || selectedMonth !== 'all' || selectedYear !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedDate('');
              setSelectedMonth('all');
              setSelectedYear('all');
              setSearchQuery('');
            }}
            style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="customers-grid">
        {filteredCustomers.length === 0 ? (
          <div className="empty-msg" style={{ gridColumn: '1 / -1' }}>No customers found matching the filters.</div>
        ) : (
          filteredCustomers.map(c => {
            return (
              <div key={c.id} className="customer-card">
                <div className="cc-top">
                  <div className="cc-avatar">{c.name ? c.name.charAt(0) : 'C'}</div>
                  <span className="role-tag customer">Customer</span>
                </div>
                <h3>{c.name || c.email}</h3>
                <div className="cc-info">
                  <div className="cc-row"><HiMail className="cc-icon" />{c.email}</div>
                  <div className="cc-row"><HiPhone className="cc-icon" />{c.phone || '—'}</div>
                  {c.created_at && (
                    <div className="cc-row" style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      <HiCalendar className="cc-icon" />
                      Joined: {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
