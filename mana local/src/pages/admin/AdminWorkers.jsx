import { useState, useEffect } from 'react';
import { HiStar, HiPhone, HiPencilAlt, HiCheck, HiX, HiCurrencyRupee, HiLocationMarker, HiUser, HiMail, HiBadgeCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Skeleton';
import './Admin.css';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    aadhar_no: '',
    experience: '',
    location: '',
    rate_per_hour: 0,
    rate_per_day: 0,
    rate_per_week: 0,
    description: '',
    status: 'active',
    available: true
  });

  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/workers`);
      const data = await res.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const openWorkerDetails = (w) => {
    setSelectedWorker(w);
    setIsEditing(false);
    setEditForm({
      name: w.name || '',
      phone: w.phone || '',
      aadhar_no: w.aadhar_no || '',
      experience: w.experience || '',
      location: w.location || '',
      rate_per_hour: w.rate_per_hour || 0,
      rate_per_day: w.rate_per_day || 0,
      rate_per_week: w.rate_per_week || 0,
      description: w.description || '',
      status: w.status || 'active',
      available: w.available !== false,
      additional_services: Array.isArray(w.additional_services) 
        ? w.additional_services.map(s => ({ ...s })) 
        : []
    });
  };

  const handleSaveWorker = async () => {
    if (!selectedWorker) return;
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/workers/${selectedWorker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Worker details updated successfully!');
        const updated = { ...selectedWorker, ...editForm };
        setSelectedWorker(updated);
        setWorkers(workers.map(w => w.id === selectedWorker.id ? { ...w, ...editForm } : w));
        setIsEditing(false);
      } else {
        toast.error(data.error || 'Failed to update worker');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Error saving worker details');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (workerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'busy' : 'active';
    setWorkers(workers.map(w => w.id === workerId ? { ...w, status: newStatus } : w));
    if (selectedWorker && selectedWorker.id === workerId) {
      setSelectedWorker({ ...selectedWorker, status: newStatus });
    }
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/workers/${workerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success(newStatus === 'active' ? 'Worker set to Active' : 'Worker marked Busy (hidden from customers)');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update worker status');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <div>
            <Skeleton type="title" style={{ width: '200px' }} />
            <Skeleton type="text" style={{ width: '150px' }} />
          </div>
        </div>
        <div className="workers-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="worker-card">
              <div className="wc-top">
                <Skeleton type="avatar" style={{ width: '40px', height: '40px' }} />
                <Skeleton type="text" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
              </div>
              <Skeleton type="title" style={{ width: '120px', marginTop: '10px' }} />
              <Skeleton type="text" style={{ width: '140px' }} />
              <Skeleton type="text" style={{ width: '100px' }} />
              <div className="wc-stats">
                <Skeleton type="card" style={{ width: '100%', height: '40px' }} />
              </div>
              <Skeleton type="card" style={{ width: '100%', height: '36px', marginTop: '10px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div><h1>Worker Management</h1><p>Manage professionals, rates, and visibility</p></div>
      </div>

      <div className="workers-grid">
        {workers.length === 0 ? (
           <p className="empty-msg">No workers registered.</p>
        ) : (
          workers.map(w => {
            const displayName = w.name || 'Unnamed Worker';
            const displayEmail = w.email || 'No Email';
            const displayPhone = w.phone || 'No phone number provided';
            const isOnline = w.available !== false;
            const isActive = w.status === 'active';
            
            let planDisplay = w.plan_name || w.plan_id || 'Free';
            let daysLeftDisplay = 'N/A';
            if (w.plan_days && w.created_at) {
              const created = new Date(w.created_at);
              const expiry = new Date(created.getTime() + w.plan_days * 24 * 60 * 60 * 1000);
              const diff = expiry - new Date();
              const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
              daysLeftDisplay = daysLeft > 0 ? `${daysLeft} days` : 'Expired';
            }
            
            return (
              <div key={w.id} className="worker-card">
                <div className="wc-top">
                  <div className="wc-avatar">{displayName.charAt(0).toUpperCase()}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: '12px',
                        background: isOnline ? '#dcfce7' : '#f1f5f9',
                        color: isOnline ? '#15803d' : '#64748b',
                        border: `1px solid ${isOnline ? '#bbf7d0' : '#cbd5e1'}`
                      }}
                    >
                      {isOnline ? '● Online' : '○ Offline'}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '3px 8px', 
                        borderRadius: '12px',
                        background: isActive ? '#e0f2fe' : '#fef3c7',
                        color: isActive ? '#0369a1' : '#b45309',
                        border: `1px solid ${isActive ? '#bae6fd' : '#fde68a'}`
                      }}
                    >
                      {isActive ? 'Admin: Active' : 'Admin: Busy'}
                    </span>
                  </div>
                </div>
                <h3 style={{ marginBottom: '4px' }}>{displayName}</h3>
                <p className="wc-phone" style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                  {displayEmail}
                </p>
                <p className="wc-phone">
                  <HiPhone style={{ width: 13, height: 13, verticalAlign: 'middle', marginRight: 4 }} />
                  {displayPhone}
                </p>
                
                <div className="wc-stats">
                  <div>
                    <strong>
                      <HiStar style={{ width: 14, height: 14, color: '#f59e0b', verticalAlign: 'middle' }} /> {w.rating || '5.0'}
                    </strong>
                    <span>Rating</span>
                  </div>
                  <div><strong>{w.jobs_done || 0}</strong><span>Jobs Done</span></div>
                  <div><strong>{w.profile_views || 0}</strong><span>Views</span></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', marginTop: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Plan</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{planDisplay}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Expires In</span>
                    <strong style={{ fontSize: '13px', color: daysLeftDisplay === 'Expired' ? '#ef4444' : '#10b981' }}>{daysLeftDisplay}</strong>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                  <button
                    className={`toggle-avail ${w.status === 'active' ? 'set-busy' : 'set-avail'}`}
                    style={{ flex: 1 }}
                    onClick={() => toggleStatus(w.id, w.status)}
                  >
                    {w.status === 'active' ? 'Mark Busy' : 'Set Active'}
                  </button>
                  <button 
                    className="toggle-avail" 
                    style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: 600 }}
                    onClick={() => openWorkerDetails(w)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedWorker && (
        <div className="modal-overlay" onClick={() => setSelectedWorker(null)}>
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '720px', 
              width: '95%', 
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {isEditing ? 'Edit Worker Profile & Services' : 'Worker Profile & Details'}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  ID: #{selectedWorker.id} • Registered {selectedWorker.created_at ? new Date(selectedWorker.created_at).toLocaleDateString() : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: isEditing ? '#f1f5f9' : '#0284c7',
                    color: isEditing ? '#334155' : '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <HiPencilAlt style={{ width: 16, height: 16 }} />
                  {isEditing ? 'Cancel Edit' : 'Edit Worker'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWorker(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  <HiX style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>

            {isEditing ? (
              /* Edit Mode */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Phone Number</label>
                    <input 
                      type="text" 
                      value={editForm.phone} 
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Aadhar Number</label>
                    <input 
                      type="text" 
                      value={editForm.aadhar_no} 
                      onChange={e => setEditForm({ ...editForm, aadhar_no: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Experience</label>
                    <input 
                      type="text" 
                      value={editForm.experience} 
                      placeholder="e.g. 1-3 years"
                      onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Location / Address</label>
                  <input 
                    type="text" 
                    value={editForm.location} 
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                  />
                </div>

                {/* Primary Service Pricing Section */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                      Primary Service Pricing ({selectedWorker.category_name || 'General'} - {selectedWorker.subcategory_name || 'Worker'})
                    </h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Hourly Rate (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.rate_per_hour} 
                        onChange={e => setEditForm({ ...editForm, rate_per_hour: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Daily Rate (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.rate_per_day} 
                        onChange={e => setEditForm({ ...editForm, rate_per_day: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Weekly Rate (₹)</label>
                      <input 
                        type="number" 
                        value={editForm.rate_per_week} 
                        onChange={e => setEditForm({ ...editForm, rate_per_week: parseFloat(e.target.value) || 0 })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Primary Service Description</label>
                    <textarea 
                      rows={3}
                      value={editForm.description} 
                      placeholder="Enter description for primary service..."
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Additional Services Edit Section */}
                {editForm.additional_services && editForm.additional_services.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                      Additional Services ({editForm.additional_services.length})
                    </h4>
                    {editForm.additional_services.map((extra, idx) => (
                      <div key={extra.id || idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', marginBottom: '10px' }}>
                          #{idx + 1}: {extra.category_name || 'General'} - {extra.subcategory_name || 'Service'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Hourly Rate (₹)</label>
                            <input 
                              type="number" 
                              value={extra.rate_per_hour || 0} 
                              onChange={e => {
                                const updated = [...editForm.additional_services];
                                updated[idx].rate_per_hour = parseFloat(e.target.value) || 0;
                                setEditForm({ ...editForm, additional_services: updated });
                              }}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Daily Rate (₹)</label>
                            <input 
                              type="number" 
                              value={extra.rate_per_day || 0} 
                              onChange={e => {
                                const updated = [...editForm.additional_services];
                                updated[idx].rate_per_day = parseFloat(e.target.value) || 0;
                                setEditForm({ ...editForm, additional_services: updated });
                              }}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Weekly Rate (₹)</label>
                            <input 
                              type="number" 
                              value={extra.rate_per_week || 0} 
                              onChange={e => {
                                const updated = [...editForm.additional_services];
                                updated[idx].rate_per_week = parseFloat(e.target.value) || 0;
                                setEditForm({ ...editForm, additional_services: updated });
                              }}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Description</label>
                          <textarea 
                            rows={2}
                            value={extra.description || ''} 
                            placeholder="Service description..."
                            onChange={e => {
                              const updated = [...editForm.additional_services];
                              updated[idx].description = e.target.value;
                              setEditForm({ ...editForm, additional_services: updated });
                            }}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Admin Status</label>
                    <select 
                      value={editForm.status} 
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', background: '#fff' }}
                    >
                      <option value="active">Active (Visible to customers)</option>
                      <option value="busy">Busy (Hidden from customers)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Worker Availability</label>
                    <select 
                      value={editForm.available ? 'online' : 'offline'} 
                      onChange={e => setEditForm({ ...editForm, available: e.target.value === 'online' })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', background: '#fff' }}
                    >
                      <option value="online">● Online (Available)</option>
                      <option value="offline">○ Offline (Unavailable)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleSaveWorker}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <HiCheck style={{ width: 18, height: 18 }} />
                    {saving ? 'Saving Changes...' : 'Save Updates'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Details Mode - High Contrast, Clear Layout */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Worker Identity Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ 
                    width: '56px', height: '56px', borderRadius: '50%', background: '#0284c7', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, flexShrink: 0 
                  }}>
                    {(selectedWorker.name || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{selectedWorker.name || 'Unnamed Worker'}</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#475569' }}>
                      {selectedWorker.category_name || selectedWorker.category_id || 'General'} • <span style={{ color: '#0284c7', fontWeight: 600 }}>{selectedWorker.subcategory_name || selectedWorker.subcategory_id || 'Electrician'}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '6px 14px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      background: selectedWorker.available !== false ? '#dcfce7' : '#f1f5f9', 
                      color: selectedWorker.available !== false ? '#15803d' : '#64748b',
                      border: `1px solid ${selectedWorker.available !== false ? '#bbf7d0' : '#cbd5e1'}`
                    }}>
                      {selectedWorker.available !== false ? '● Worker: Online' : '○ Worker: Offline'}
                    </span>
                    <span style={{ 
                      padding: '6px 14px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 700, 
                      background: selectedWorker.status === 'active' ? '#e0f2fe' : '#fef3c7', 
                      color: selectedWorker.status === 'active' ? '#0369a1' : '#b45309',
                      border: `1px solid ${selectedWorker.status === 'active' ? '#bae6fd' : '#fde68a'}`
                    }}>
                      {selectedWorker.status === 'active' ? '● Admin: Active' : '● Admin: Busy'}
                    </span>
                  </div>
                </div>

                {/* Two-Column Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  
                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>{selectedWorker.email || 'Not Provided'}</div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Phone Number</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{selectedWorker.phone || 'Not Provided'}</div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Aadhar Card No.</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{selectedWorker.aadhar_no || 'Not Provided'}</div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Experience</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{selectedWorker.experience || 'Not Provided'}</div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Profile Views</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{selectedWorker.profile_views || 0}</div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Jobs Done & Rating</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      ⭐ {selectedWorker.rating || '5.0'} ({selectedWorker.jobs_done || 0} completed)
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Location</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    📍 {selectedWorker.location || 'Location not specified'}
                  </div>
                </div>

                {/* Primary Service Pricing Card */}
                <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                      <HiCurrencyRupee style={{ width: 18, height: 18 }} /> Primary Service Pricing
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>
                      {selectedWorker.category_name || 'General'} • {selectedWorker.subcategory_name || 'Worker'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Per Hour Rate</span>
                      <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                        ₹{selectedWorker.rate_per_hour || 0}<span style={{ fontSize: '11px', color: '#64748b' }}>/hr</span>
                      </strong>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Per Day Rate</span>
                      <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                        ₹{selectedWorker.rate_per_day || 0}<span style={{ fontSize: '11px', color: '#64748b' }}>/day</span>
                      </strong>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Per Week Rate</span>
                      <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                        ₹{selectedWorker.rate_per_week || 0}<span style={{ fontSize: '11px', color: '#64748b' }}>/wk</span>
                      </strong>
                    </div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Primary Description:
                    </span>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {selectedWorker.description || 'No description or bio added yet.'}
                    </p>
                  </div>
                </div>

                {/* Additional Services (if added) */}
                {selectedWorker.additional_services && selectedWorker.additional_services.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
                      Additional Services ({selectedWorker.additional_services.length})
                    </div>
                    {selectedWorker.additional_services.map((extra, idx) => (
                      <div key={extra.id || idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            {extra.category_name || 'General'} • <span style={{ color: '#0284c7' }}>{extra.subcategory_name || 'Service'}</span>
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: extra.description ? '10px' : '0' }}>
                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Per Hour</span>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{extra.rate_per_hour || 0}</strong>
                          </div>
                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Per Day</span>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{extra.rate_per_day || 0}</strong>
                          </div>
                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Per Week</span>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{extra.rate_per_week || 0}</strong>
                          </div>
                        </div>
                        {extra.description && (
                          <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Description:</span>
                            <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#334155' }}>{extra.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Subscription & Payment Card */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Subscription & Payment Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Plan Name</span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{selectedWorker.plan_name || selectedWorker.plan_id || 'Free'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Plan Amount</span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{selectedWorker.plan_amount ? `₹${selectedWorker.plan_amount}` : 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Payment ID</span>
                      <strong style={{ fontSize: '14px', color: '#0f172a', wordBreak: 'break-all' }}>{selectedWorker.payment_id || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Expires In</span>
                      <strong style={{ fontSize: '14px', color: '#10b981' }}>
                        {(() => {
                          if (!selectedWorker.plan_days || !selectedWorker.created_at) return 'N/A';
                          const created = new Date(selectedWorker.created_at);
                          const expiry = new Date(created.getTime() + selectedWorker.plan_days * 24 * 60 * 60 * 1000);
                          const diff = expiry - new Date();
                          const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                          return daysLeft > 0 ? `${daysLeft} days` : 'Expired';
                        })()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#0284c7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <HiPencilAlt style={{ width: 18, height: 18 }} />
                    Edit Worker & Pricing
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedWorker(null)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#0f172a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Close Details
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

