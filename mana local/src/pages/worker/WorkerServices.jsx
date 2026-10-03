import React, { useState, useEffect } from 'react';
import { HiBriefcase, HiCurrencyRupee, HiPlus, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import './Worker.css';
import '../admin/Admin.css'; 

export default function WorkerServices() {
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  
  const [isAdding, setIsAdding] = useState(false);
  const [rates, setRates] = useState({
    rate_per_hour: user?.rate_per_hour || '',
    rate_per_day: user?.rate_per_day || '',
    rate_per_week: user?.rate_per_week || '',
    description: user?.description || '',
    available_from: user?.available_from || '',
    available_to: user?.available_to || '',
    available_days: user?.available_days || ''
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [isAddingExtra, setIsAddingExtra] = useState(false);
  const [extraForm, setExtraForm] = useState({ category_id: '', subcategory_id: '', rate_per_hour: '', rate_per_day: '', rate_per_week: '', description: '', available_from: '', available_to: '', available_days: '' });
  
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  const [loadingExtra, setLoadingExtra] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/profile`);
          const profData = await profRes.json();
          if (profData.success && profData.profile) {
            setUser({ ...user, ...profData.profile });
          }
          
          const catRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories`);
          const catData = await catRes.json();
          setCategories(catData.categories || []);
          
          const subRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subcategories`);
          const subData = await subRes.json();
          setSubcategories(subData.subcategories || []);
        } catch (err) {
          console.error(err);
        } finally {
          setInitialLoading(false);
        }
      }
    };
    fetchData();
  }, [user?.id, setUser]);

  const categoryStr = user?.category_name || user?.category_id || 'Not Available';
  const subcategoryStr = user?.subcategory_name || user?.subcategory_id || '';
  const hasRates = user?.rate_per_hour > 0 || user?.rate_per_day > 0 || user?.rate_per_week > 0;
  const additionalServices = user?.additional_services || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingPrimary(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_per_hour: Number(rates.rate_per_hour),
          rate_per_day: Number(rates.rate_per_day),
          rate_per_week: Number(rates.rate_per_week),
          description: rates.description,
          available_from: rates.available_from,
          available_to: rates.available_to,
          available_days: rates.available_days
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, ...data.profile });
        setIsAdding(false);
        toast.success('Primary pricing updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update pricing');
      }
    } catch (err) {
      console.error('Failed to update rates', err);
      toast.error('Server error updating pricing');
    } finally {
      setLoadingPrimary(false);
    }
  };

  const handleAddExtraService = async (e) => {
    e.preventDefault();
    if (!extraForm.category_id) {
      toast.error('Please select a category');
      return;
    }
    
    setLoadingExtra(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extraForm)
      });
      const data = await res.json();
      if (data.success) {
        const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/profile`);
        const profData = await profRes.json();
        if (profData.success) setUser({ ...user, ...profData.profile });
        setIsAddingExtra(false);
        setExtraForm({ category_id: '', subcategory_id: '', rate_per_hour: '', rate_per_day: '', rate_per_week: '', description: '', available_from: '', available_to: '', available_days: '' });
        toast.success('Additional service added successfully!');
      } else {
        toast.error(data.error || 'Failed to add service');
      }
    } catch (err) {
      console.error('Failed to add extra service', err);
      toast.error('Server error adding service');
    } finally {
      setLoadingExtra(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/services/${serviceId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/profile`);
        const profData = await profRes.json();
        if (profData.success) setUser({ ...user, ...profData.profile });
        toast.success('Service deleted successfully');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Failed to delete service', err);
      toast.error('Server error deleting service');
    }
  };
  
  const relevantSubcats = subcategories.filter(s => s.category_id == extraForm.category_id);

  return (
    <div className="worker-page">
      <div className="worker-header">
        <div className="wh-left">
          <div>
            <h1>My Services</h1>
            <p>Manage the services you offer and configure your pricing.</p>
          </div>
        </div>
      </div>
      
      <div className="admin-section" style={{ marginTop: 24, paddingBottom: 64 }}>
        {initialLoading ? (
          <>
            <div className="skeleton sk-card" style={{ height: 250 }}></div>
            <div className="skeleton sk-card" style={{ height: 350 }}></div>
          </>
        ) : (
          <>
            {/* Primary Service Block */}
            {!isAdding && !hasRates ? (
          <div className="admin-card ac-empty" style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontSize: '14px', fontWeight: '500', display: 'inline-block' }}>
              Your primary expertise: <strong style={{ color: '#0f172a' }}>{categoryStr}</strong> 
              {subcategoryStr && <>&gt; <strong style={{ color: '#0f172a' }}>{subcategoryStr}</strong></>}
            </div>
            <p>You haven't added your pricing details yet.</p>
            <button className="admin-btn-primary" style={{ marginTop: 12 }} onClick={() => setIsAdding(true)}>Add Primary Pricing</button>
          </div>
        ) : !isAdding && hasRates ? (
          <div className="admin-card" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20 }}>Primary Service Pricing</h2>
              <button className="admin-btn-primary" style={{ padding: '8px 16px', background: '#f1f5f9', color: '#0f172a' }} onClick={() => setIsAdding(true)}>Edit Pricing</button>
            </div>
            
            <div className="profile-info-grid">
              <div className="pi-card">
                <div className="pi-label"><HiBriefcase className="pi-icon" />Category</div>
                <div className="pi-val">{categoryStr}</div>
              </div>
              {subcategoryStr && (
                <div className="pi-card">
                  <div className="pi-label"><HiBriefcase className="pi-icon" />Sub Category</div>
                  <div className="pi-val">{subcategoryStr}</div>
                </div>
              )}
              <div className="pi-card">
                <div className="pi-label"><HiCurrencyRupee className="pi-icon" />Per Hour Rate</div>
                <div className="pi-val">₹{user.rate_per_hour || 0}</div>
              </div>
              <div className="pi-card">
                <div className="pi-label"><HiCurrencyRupee className="pi-icon" />Per Day Rate</div>
                <div className="pi-val">₹{user.rate_per_day || 0}</div>
              </div>
              <div className="pi-card">
                <div className="pi-label"><HiCurrencyRupee className="pi-icon" />Per Week Rate</div>
                <div className="pi-val">₹{user.rate_per_week || 0}</div>
              </div>
            </div>
            {(user.description || user.available_from || user.available_days) && (
              <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                {user.description && <div style={{ marginBottom: 12 }}><strong>Description:</strong> <p style={{ margin: '4px 0 0 0', color: '#475569' }}>{user.description}</p></div>}
                {(user.available_from || user.available_to) && <div><strong>Available Time:</strong> {user.available_from || 'N/A'} to {user.available_to || 'N/A'}</div>}
                {user.available_days && <div style={{ marginTop: 4 }}><strong>Available Days:</strong> {user.available_days}</div>}
              </div>
            )}
          </div>
        ) : (
          <div className="admin-card" style={{ marginBottom: 32 }}>
            <h2 style={{ marginBottom: 16, fontSize: 20 }}>Configure Primary Pricing</h2>
            <div style={{ marginBottom: 24, padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>
              Your primary expertise: <strong>{categoryStr}</strong> {subcategoryStr && <>&gt; <strong>{subcategoryStr}</strong></>}
            </div>

            <form className="premium-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Hourly Rate (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <HiCurrencyRupee style={{ position: 'absolute', top: 16, left: 16, color: '#94a3b8' }} />
                    <input type="number" className="form-input" placeholder="e.g. 500" value={rates.rate_per_hour} onChange={e => setRates({...rates, rate_per_hour: e.target.value})} style={{ paddingLeft: 44, width: '100%', boxSizing: 'border-box' }} required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Daily Rate (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <HiCurrencyRupee style={{ position: 'absolute', top: 16, left: 16, color: '#94a3b8' }} />
                    <input type="number" className="form-input" placeholder="e.g. 2000" value={rates.rate_per_day} onChange={e => setRates({...rates, rate_per_day: e.target.value})} style={{ paddingLeft: 44, width: '100%', boxSizing: 'border-box' }} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Weekly Rate (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <HiCurrencyRupee style={{ position: 'absolute', top: 16, left: 16, color: '#94a3b8' }} />
                    <input type="number" className="form-input" placeholder="e.g. 10000" value={rates.rate_per_week} onChange={e => setRates({...rates, rate_per_week: e.target.value})} style={{ paddingLeft: 44, width: '100%', boxSizing: 'border-box' }} required />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Description (Optional)</label>
                <textarea className="form-input" placeholder="Describe your service, experience, etc." value={rates.description} onChange={e => setRates({...rates, description: e.target.value})} style={{ minHeight: 80, width: '100%', boxSizing: 'border-box' }}></textarea>
              </div>

              <div className="form-row" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label>Available From Time</label>
                  <input type="time" className="form-input" value={rates.available_from} onChange={e => setRates({...rates, available_from: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Available To Time</label>
                  <input type="time" className="form-input" value={rates.available_to} onChange={e => setRates({...rates, available_to: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Available Days</label>
                  <input type="text" className="form-input" placeholder="e.g. Mon-Fri" value={rates.available_days} onChange={e => setRates({...rates, available_days: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                {hasRates && <button type="button" className="admin-btn-primary" style={{ background: '#f1f5f9', color: '#475569', flex: 1 }} onClick={() => setIsAdding(false)} disabled={loadingPrimary}>Cancel</button>}
                <button type="submit" className="submit-btn" style={{ margin: 0, flex: 2 }} disabled={loadingPrimary}>
                  {loadingPrimary ? 'Saving...' : 'Save Pricing'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Additional Services Block */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 20 }}>Additional Services</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginTop: 4 }}>Offer more skills to attract more customers.</p>
            </div>
            {!isAddingExtra && (
              <button className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setIsAddingExtra(true)}>
                <HiPlus /> Add Service
              </button>
            )}
          </div>

          {isAddingExtra && (
            <form className="premium-form" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: 24 }} onSubmit={handleAddExtraService}>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-input" value={extraForm.category_id} onChange={e => setExtraForm({...extraForm, category_id: e.target.value, subcategory_id: ''})} required>
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {relevantSubcats.length > 0 && (
                  <div className="form-group">
                    <label>Sub Category</label>
                    <select className="form-input" value={extraForm.subcategory_id} onChange={e => setExtraForm({...extraForm, subcategory_id: e.target.value})} required>
                      <option value="">Select Sub Category...</option>
                      {relevantSubcats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-row" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label>Hourly Rate (₹)</label>
                  <input type="number" className="form-input" placeholder="500" value={extraForm.rate_per_hour} onChange={e => setExtraForm({...extraForm, rate_per_hour: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Daily Rate (₹)</label>
                  <input type="number" className="form-input" placeholder="2000" value={extraForm.rate_per_day} onChange={e => setExtraForm({...extraForm, rate_per_day: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Weekly Rate (₹)</label>
                  <input type="number" className="form-input" placeholder="10000" value={extraForm.rate_per_week} onChange={e => setExtraForm({...extraForm, rate_per_week: e.target.value})} required />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Description (Optional)</label>
                <textarea className="form-input" placeholder="Describe this additional service..." value={extraForm.description} onChange={e => setExtraForm({...extraForm, description: e.target.value})} style={{ minHeight: 80, width: '100%', boxSizing: 'border-box' }}></textarea>
              </div>

              <div className="form-row" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label>Available From Time</label>
                  <input type="time" className="form-input" value={extraForm.available_from} onChange={e => setExtraForm({...extraForm, available_from: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Available To Time</label>
                  <input type="time" className="form-input" value={extraForm.available_to} onChange={e => setExtraForm({...extraForm, available_to: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Available Days</label>
                  <input type="text" className="form-input" placeholder="e.g. Weekends" value={extraForm.available_days} onChange={e => setExtraForm({...extraForm, available_days: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="admin-btn-primary" style={{ background: '#e2e8f0', color: '#475569', flex: 1 }} onClick={() => setIsAddingExtra(false)} disabled={loadingExtra}>Cancel</button>
                <button type="submit" className="submit-btn" style={{ margin: 0, flex: 2 }} disabled={loadingExtra}>
                  {loadingExtra ? 'Saving...' : 'Save Additional Service'}
                </button>
              </div>
            </form>
          )}

          {additionalServices.length === 0 && !isAddingExtra ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
              <p>You haven't added any additional services.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {additionalServices.map(srv => (
                <div key={srv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                      {srv.category_name} {srv.subcategory_name && <span style={{ color: '#64748b', fontWeight: '400' }}>&gt; {srv.subcategory_name}</span>}
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#475569' }}>
                      <span>Hourly: ₹{srv.rate_per_hour}</span>
                      <span>Daily: ₹{srv.rate_per_day}</span>
                      <span>Weekly: ₹{srv.rate_per_week}</span>
                    </div>
                    {(srv.description || srv.available_from || srv.available_days) && (
                      <div style={{ marginTop: 8, fontSize: '13px', color: '#64748b' }}>
                        {srv.description && <div style={{ marginBottom: 4 }}><strong>Desc:</strong> {srv.description}</div>}
                        <div style={{ display: 'flex', gap: 12 }}>
                          {(srv.available_from || srv.available_to) && <span><strong>Time:</strong> {srv.available_from || '-'} to {srv.available_to || '-'}</span>}
                          {srv.available_days && <span><strong>Days:</strong> {srv.available_days}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDeleteService(srv.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Service">
                    <HiTrash size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
