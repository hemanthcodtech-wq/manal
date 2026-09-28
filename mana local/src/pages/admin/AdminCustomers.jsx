import { useState, useEffect } from 'react';
import { HiUsers, HiPhone, HiMail } from 'react-icons/hi';
import Skeleton from '../../components/Skeleton';
import './Admin.css';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="admin-header">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} registered customers</p>
        </div>
      </div>

      <div className="customers-grid">
        {customers.length === 0 ? (
          <div className="empty-msg">No customers registered yet.</div>
        ) : (
          customers.map(c => {
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
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
