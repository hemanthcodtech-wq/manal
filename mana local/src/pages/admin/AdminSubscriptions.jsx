import React, { useState, useEffect } from 'react';
import Skeleton from '../../components/Skeleton';
import './Admin.css';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ user_id: '', plan: '', days: '30', amount: '', category_id: '', subcategory_id: '' });
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSub, resW, resC, resS] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions`),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/workers`),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories`),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/subcategories`)
      ]);
      const dataSub = await resSub.json();
      const dataW = await resW.json();
      const dataC = await resC.json();
      const dataS = await resS.json();

      if (dataSub.success) setSubscriptions(dataSub.subscriptions);
      if (dataW.success) setWorkers(dataW.workers);
      if (dataC.success) setCategories(dataC.categories);
      if (dataS.success) setSubcategories(dataS.subcategories);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [editingId, setEditingId] = useState(null);

  const openEditModal = (sub) => {
    setEditingId(sub.id);
    setFormData({
      user_id: sub.user_id || '',
      plan: sub.plan || '',
      days: sub.days || '30',
      amount: sub.amount || '',
      category_id: sub.category_id || '',
      subcategory_id: sub.subcategory_id || ''
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ user_id: '', plan: '', days: '30', amount: '', category_id: '', subcategory_id: '' });
    setShowModal(true);
  };

  const handleCreateSub = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        user_id: formData.user_id || null,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null
      };
      
      const url = editingId ? `${import.meta.env.VITE_API_URL}/api/admin/subscriptions/${editingId}` : `${import.meta.env.VITE_API_URL}/api/admin/subscriptions`;
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ user_id: '', plan: '', days: '30', amount: '', category_id: '', subcategory_id: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Error saving subscription:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting subscription:', err);
    }
  };

  // Filter subcategories based on selected category
  const relevantSubcategories = formData.category_id 
    ? subcategories.filter(s => s.category_id === parseInt(formData.category_id)) 
    : subcategories;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Subscriptions</h1>
          <p>Manage worker subscriptions, plans, and active memberships.</p>
        </div>
        <button className="admin-btn-primary" onClick={openCreateModal}>Add New Plan</button>
      </div>
      
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th><Skeleton type="text" style={{ width: '60px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '120px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '80px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '100px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '80px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '50px' }} /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton type="text" style={{ width: '40px' }} /></td>
                    <td><Skeleton type="title" style={{ width: '120px', marginBottom: '0' }} /></td>
                    <td><Skeleton type="text" style={{ width: '60px' }} /></td>
                    <td>
                      <Skeleton type="text" style={{ width: '100px', marginBottom: '4px' }} />
                      <Skeleton type="text" style={{ width: '80px' }} />
                    </td>
                    <td><Skeleton type="text" style={{ width: '80px' }} /></td>
                    <td><Skeleton type="text" style={{ width: '60px', height: '24px', borderRadius: '12px' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="ac-empty">
            <p>No active subscriptions to display.</p>
            <button className="admin-btn-primary" onClick={openCreateModal}>Add New Plan</button>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sub ID</th>
                  <th>Plan Name</th>
                  <th>Plan</th>
                  <th>Target Category</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(s => (
                  <tr key={s.id}>
                    <td className="mono">#{s.id}</td>
                    <td><strong>{s.name || s.email || 'General Plan'}</strong></td>
                    <td style={{textTransform: 'capitalize'}}>{s.plan} <br/><span style={{fontSize: '12px', color: '#64748b'}}>₹{s.amount || 0}</span></td>
                    <td>
                      {s.category_name ? (
                        <>
                          <div style={{fontWeight: 500}}>{s.category_name}</div>
                          {s.subcategory_name && <div style={{fontSize: '12px', color: '#64748b'}}>{s.subcategory_name}</div>}
                        </>
                      ) : (
                        <span style={{color: '#64748b'}}>All Categories</span>
                      )}
                    </td>
                    <td>{s.days || 30} Days</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openEditModal(s)} style={{padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease'}}>Edit</button>
                        <button onClick={() => handleDeleteSub(s.id)} style={{padding: '6px 12px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease'}}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '500px' }}>
            <h3>{editingId ? 'Edit Plan' : 'Add New Plan'}</h3>
            <p>{editingId ? 'Modify an existing subscription plan.' : 'Assign a subscription plan to a worker.'}</p>
            <form onSubmit={handleCreateSub} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Target Category</label>
                  <select required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value, subcategory_id: ''})} disabled={isSubmitting}>
                    <option value="">-- Select Category --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Target Subcategory</label>
                  <select required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.subcategory_id} onChange={e => setFormData({...formData, subcategory_id: e.target.value})} disabled={isSubmitting || !formData.category_id}>
                    <option value="">-- Select Subcategory --</option>
                    {relevantSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Plan Name</label>
                  <input type="text" required placeholder="e.g. Premium Access" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Amount (₹)</label>
                  <input type="number" required min="0" placeholder="e.g. 1999" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Duration (Days)</label>
                  <input type="number" min="1" required placeholder="e.g. 30" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.days} onChange={e => setFormData({...formData, days: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{display: 'flex', gap: '12px', marginTop: '12px'}}>
                <button type="submit" className="admin-btn-primary" style={{flex: 1}} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Submit'}
                </button>
                <button type="button" className="modal-close" style={{flex: 1}} onClick={() => setShowModal(false)} disabled={isSubmitting}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
