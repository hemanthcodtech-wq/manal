import React, { useState, useEffect } from 'react';
import './Admin.css';
import { HiPlus, HiTrash, HiPhotograph, HiCheckCircle, HiPencil } from 'react-icons/hi';
import Skeleton from '../../components/Skeleton';

export default function AdminPromotionalAds() {
  const [plans, setPlans] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPlan, setNewPlan] = useState({ id: null, name: '', price: '', duration_days: '', ad_type: 'both' });
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, adsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/promo-plans`),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/promo-ads`)
      ]);
      const plansData = await plansRes.json();
      const adsData = await adsRes.json();

      if (plansData.success) setPlans(plansData.plans);
      if (adsData.success) setAds(adsData.ads);
    } catch (error) {
      console.error('Error fetching promotional data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (newPlan.name && newPlan.price && newPlan.duration_days) {
      try {
        if (newPlan.id) {
          // Edit existing plan
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promo-plans/${newPlan.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPlan)
          });
          const data = await res.json();
          if (data.success) {
            setPlans(plans.map(p => p.id === newPlan.id ? data.plan : p));
            setNewPlan({ id: null, name: '', price: '', duration_days: '', ad_type: 'both' });
            setShowPlanModal(false);
          }
        } else {
          // Create new plan
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promo-plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPlan)
          });
          const data = await res.json();
          if (data.success) {
            setPlans([data.plan, ...plans]);
            setNewPlan({ id: null, name: '', price: '', duration_days: '', ad_type: 'both' });
            setShowPlanModal(false);
          }
        }
      } catch (error) {
        console.error('Error saving plan:', error);
      }
    }
  };

  const openEditModal = (plan) => {
    setNewPlan(plan);
    setShowPlanModal(true);
  };

  const deletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promo-plans/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPlans(plans.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const deleteAd = async (id) => {
    if (!window.confirm('Are you sure you want to remove this ad?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promo-ads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAds(ads.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  const updateAdStatus = async (adId, newStatus) => {
    try {
      const ad = ads.find(a => a.id === adId);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promo-ads/${adId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ad, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAds(ads.map(a => a.id === adId ? data.ad : a));
      }
    } catch (error) {
      console.error('Error updating ad status:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <Skeleton type="title" style={{ width: '40%' }} />
        <div style={{ marginTop: '2rem' }}>
          <Skeleton type="box" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Promotional Ads & Subscriptions</h1>
        <button className="btn-primary" onClick={() => { setNewPlan({ id: null, name: '', price: '', duration_days: '', ad_type: 'both' }); setShowPlanModal(true); }}>
          <HiPlus /> Create Plan
        </button>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Subscription Plans Section */}
        <section className="admin-card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Active Subscription Plans</h2>
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Media Type</th>
                  <th>Price (₹)</th>
                  <th>Duration (Days)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id}>
                    <td><strong>{plan.name}</strong></td>
                    <td>
                      <span className="status-chip" style={{ background: '#f1f5f9', color: '#475569' }}>
                        {plan.ad_type === 'image' ? 'Image Only' : plan.ad_type === 'video' ? 'Video Only' : 'Image & Video'}
                      </span>
                    </td>
                    <td>₹{plan.price}</td>
                    <td>{plan.duration_days} Days</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="act-btn assign" onClick={() => openEditModal(plan)}>
                          <HiPencil />
                        </button>
                        <button className="act-btn cancel" onClick={() => deletePlan(plan.id)}>
                          <HiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr><td colSpan="5" className="text-center" style={{ padding: '24px' }}>No plans created yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Subscribers Section */}
        <section className="admin-card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Active Promotional Ads</h2>
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Plan</th>
                  <th>Dates</th>
                  <th>Poster / Video</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.id}>
                    <td><strong>{ad.user_name || 'User ' + ad.user_id}</strong></td>
                    <td><span className="status-chip assigned">{ad.plan_name || 'Plan ' + ad.plan_id}</span></td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        Start: {new Date(ad.start_date).toLocaleDateString()}<br/>
                        End: {ad.end_date ? new Date(ad.end_date).toLocaleDateString() : 'Ongoing'}
                      </div>
                    </td>
                    <td>
                      {ad.ad_image_url ? (
                        ad.ad_image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={ad.ad_image_url} style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} controls />
                        ) : (
                          <a href={ad.ad_image_url} target="_blank" rel="noreferrer">
                            <img src={ad.ad_image_url} alt="Ad Poster" style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          </a>
                        )
                      ) : (
                        <span className="text-muted" style={{ fontSize: '12px' }}><HiPhotograph /> No Media</span>
                      )}
                    </td>
                    <td>
                      <select 
                        value={ad.status} 
                        onChange={(e) => updateAdStatus(ad.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600' }}
                      >
                        <option value="pending_review">Pending Review</option>
                        <option value="active">Active</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <button className="act-btn cancel" onClick={() => deleteAd(ad.id)}>
                        <HiTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {ads.length === 0 && (
                  <tr><td colSpan="7" className="text-center" style={{ padding: '24px' }}>No active ads right now.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Create / Edit Plan Modal */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{newPlan.id ? 'Edit Plan' : 'Create New Plan'}</h3>
            <p>{newPlan.id ? 'Modify your promotional ad package' : 'Define a new promotional ad package'}</p>
            <form onSubmit={handleAddPlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div className="premium-form">
                <label>Plan Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newPlan.name} 
                  onChange={e => setNewPlan({...newPlan, name: e.target.value})} 
                  placeholder="e.g. Featured Banner"
                  required 
                />
              </div>
              <div className="premium-form">
                <label>Price (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={newPlan.price} 
                  onChange={e => setNewPlan({...newPlan, price: e.target.value})} 
                  placeholder="499"
                  required 
                />
              </div>
              <div className="premium-form">
                <label>Duration (Days)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={newPlan.duration_days} 
                  onChange={e => setNewPlan({...newPlan, duration_days: e.target.value})} 
                  placeholder="15"
                  required 
                />
              </div>
              <div className="premium-form">
                <label>Ad Media Type Allowed</label>
                <select 
                  className="form-input" 
                  value={newPlan.ad_type} 
                  onChange={e => setNewPlan({...newPlan, ad_type: e.target.value})} 
                  required
                >
                  <option value="both">Image or Video</option>
                  <option value="image">Image Only</option>
                  <option value="video">Video Only</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="modal-close" style={{ flex: 1 }} onClick={() => setShowPlanModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, height: '100%' }}>{newPlan.id ? 'Update Plan' : 'Save Plan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
