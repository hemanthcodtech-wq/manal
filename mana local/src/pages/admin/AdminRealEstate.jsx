import React, { useState, useEffect } from 'react';
import Skeleton from '../../components/Skeleton';

export default function AdminRealEstate() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const defaultForm = { 
    title: '', description: '', price: '', property_type: 'Sale', location: '', 
    bedrooms: '', bathrooms: '', area_sqft: '', contact_phone: '', contact_email: '', status: 'available',
    images: [], videos: []
  };
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/real-estate`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (property) => {
    setEditingId(property.id);
    setFormData({
      title: property.title || '', description: property.description || '', price: property.price || '', 
      property_type: property.property_type || 'Sale', location: property.location || '', 
      bedrooms: property.bedrooms || '', bathrooms: property.bathrooms || '', area_sqft: property.area_sqft || '', 
      contact_phone: property.contact_phone || '', contact_email: property.contact_email || '', 
      status: property.status || 'available',
      images: Array.isArray(property.images) ? property.images : (typeof property.images === 'string' ? JSON.parse(property.images || '[]') : []),
      videos: Array.isArray(property.videos) ? property.videos : (typeof property.videos === 'string' ? JSON.parse(property.videos || '[]') : [])
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/real-estate/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchProperties();
    } catch (err) {
      console.error('Error deleting property:', err);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingId ? `${import.meta.env.VITE_API_URL}/api/admin/real-estate/${editingId}` : `${import.meta.env.VITE_API_URL}/api/admin/real-estate`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData(defaultForm);
        fetchProperties();
      }
    } catch (err) {
      console.error('Error saving property:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = async (e, type) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsSubmitting(true);
    
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('files', files[i]);
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload-media`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.success) {
        if (type === 'image') {
          setFormData(prev => ({ ...prev, images: [...prev.images, ...result.urls] }));
        } else {
          setFormData(prev => ({ ...prev, videos: [...prev.videos, ...result.urls] }));
        }
      }
    } catch (err) {
      console.error('Media upload failed', err);
      alert('Media Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = (index, type) => {
    if (type === 'image') {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData({...formData, images: newImages});
    } else {
      const newVideos = [...formData.videos];
      newVideos.splice(index, 1);
      setFormData({...formData, videos: newVideos});
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Real Estate Management</h1>
          <p>Manage and review all property listings across the platform.</p>
        </div>
        <button className="admin-btn-primary" onClick={openCreateModal}>Add Property</button>
      </div>
      
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th><Skeleton type="text" style={{ width: '40px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '100px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '80px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '60px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '50px' }} /></th>
                  <th><Skeleton type="text" style={{ width: '80px' }} /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton type="text" style={{ width: '40px' }} /></td>
                    <td>
                      <Skeleton type="title" style={{ width: '120px', marginBottom: '4px' }} />
                      <Skeleton type="text" style={{ width: '150px' }} />
                    </td>
                    <td><Skeleton type="text" style={{ width: '100px' }} /></td>
                    <td><Skeleton type="text" style={{ width: '80px' }} /></td>
                    <td><Skeleton type="text" style={{ width: '60px', height: '24px', borderRadius: '12px' }} /></td>
                    <td>
                      <Skeleton type="text" style={{ width: '40px', height: '28px', display: 'inline-block', marginRight: '8px' }} />
                      <Skeleton type="text" style={{ width: '50px', height: '28px', display: 'inline-block' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : properties.length === 0 ? (
          <div className="ac-empty">
            <p>No properties available yet.</p>
            <button className="admin-btn-primary" onClick={openCreateModal}>Add Property</button>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title / Type</th>
                  <th>Location</th>
                  <th>Price (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id}>
                    <td className="mono">#{p.id}</td>
                    <td>
                      <strong>{p.title}</strong>
                      <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>{p.property_type} • {p.bedrooms} Beds • {p.bathrooms} Baths</div>
                    </td>
                    <td>{p.location || '—'}</td>
                    <td>{p.price ? `₹${parseFloat(p.price).toLocaleString()}` : '—'}</td>
                    <td>
                      <span className={`status-chip ${p.status === 'available' ? 'completed' : 'cancelled'}`}>{p.status}</span>
                    </td>
                    <td>
                      <button onClick={() => openEditModal(p)} style={{marginRight: '8px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer'}}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={{padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer'}}>Delete</button>
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
          <div className="modal" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingId ? 'Edit Property' : 'Add Property'}</h3>
            <p>Fill in the details for this property listing.</p>
            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Property Title</label>
                  <input type="text" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Type</label>
                  <select required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.property_type} onChange={e => setFormData({...formData, property_type: e.target.value})} disabled={isSubmitting}>
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Location</label>
                  <input type="text" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Price (₹)</label>
                  <input type="number" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Bedrooms</label>
                  <input type="number" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Bathrooms</label>
                  <input type="number" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Area (Sq Ft)</label>
                  <input type="number" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.area_sqft} onChange={e => setFormData({...formData, area_sqft: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Contact Phone</label>
                  <input type="text" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Contact Email</label>
                  <input type="email" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Status</label>
                  <select required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} disabled={isSubmitting}>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Property Images</label>
                  <input type="file" multiple accept="image/*" style={{marginBottom: '8px'}} onChange={(e) => handleMediaUpload(e, 'image')} disabled={isSubmitting} />
                  {formData.images.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {formData.images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={img} alt="Property" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                          <button type="button" onClick={() => removeMedia(idx, 'image')} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', border: 'none', cursor: 'pointer' }}>X</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Property Videos</label>
                  <input type="file" multiple accept="video/*" style={{marginBottom: '8px'}} onChange={(e) => handleMediaUpload(e, 'video')} disabled={isSubmitting} />
                  {formData.videos.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                      {formData.videos.map((vid, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}>
                          <a href={vid} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>Video {idx + 1}</a>
                          <button type="button" onClick={() => removeMedia(idx, 'video')} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Description</label>
                <textarea required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '100px'}} 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} disabled={isSubmitting} />
              </div>
              
              <div style={{display: 'flex', gap: '12px', marginTop: '12px'}}>
                <button type="submit" className="admin-btn-primary" style={{flex: 1}} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Property'}
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
