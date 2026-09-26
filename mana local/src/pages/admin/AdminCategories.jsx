import React, { useState, useEffect } from 'react';
import Skeleton from '../../components/Skeleton';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);

  const [showSubModal, setShowSubModal] = useState(false);
  const [subName, setSubName] = useState('');
  const [subCatId, setSubCatId] = useState('');
  const [editingSubId, setEditingSubId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, subRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/categories'),
        fetch('http://localhost:3000/api/admin/subcategories')
      ]);
      const catData = await catRes.json();
      const subData = await subRes.json();
      if (catData.success) setCategories(catData.categories);
      if (subData.success) setSubcategories(subData.subcategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCatId(cat.id);
      setCatName(cat.name);
    } else {
      setEditingCatId(null);
      setCatName('');
    }
    setShowCatModal(true);
  };

  const openSubModal = (sub = null) => {
    if (sub) {
      setEditingSubId(sub.id);
      setSubName(sub.name);
      setSubCatId(sub.category_id);
    } else {
      setEditingSubId(null);
      setSubName('');
      setSubCatId(categories.length > 0 ? categories[0].id : '');
    }
    setShowSubModal(true);
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = editingCatId ? `http://localhost:3000/api/admin/categories/${editingCatId}` : 'http://localhost:3000/api/admin/categories';
    const method = editingCatId ? 'PUT' : 'POST';
    try {
      await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: catName }) });
      setShowCatModal(false);
      fetchData();
    } catch(err) {}
    setIsSubmitting(false);
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!subCatId) return alert('Select a category');
    setIsSubmitting(true);
    const url = editingSubId ? `http://localhost:3000/api/admin/subcategories/${editingSubId}` : 'http://localhost:3000/api/admin/subcategories';
    const method = editingSubId ? 'PUT' : 'POST';
    try {
      await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: subName, category_id: subCatId }) });
      setShowSubModal(false);
      fetchData();
    } catch(err) {}
    setIsSubmitting(false);
  };

  const handleDeleteCat = async (id) => {
    if(!window.confirm('Delete this category? All its subcategories will be deleted!')) return;
    try {
      await fetch(`http://localhost:3000/api/admin/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch(err) {}
  };

  const handleDeleteSub = async (id) => {
    if(!window.confirm('Delete this subcategory?')) return;
    try {
      await fetch(`http://localhost:3000/api/admin/subcategories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch(err) {}
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Categories & Subcategories</h1>
          <p>Organize your platform's taxonomy.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Categories */}
        <div className="admin-card" style={{ padding: 0 }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Categories</h2>
            <button className="admin-btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => openCatModal()}>Add Category</button>
          </div>
          {loading ? (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', alignItems: 'center' }}>
                  <Skeleton type="text" style={{ width: '120px' }} />
                  <div>
                    <Skeleton type="text" style={{ width: '40px', display: 'inline-block', marginRight: '8px' }} />
                    <Skeleton type="text" style={{ width: '40px', display: 'inline-block' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No categories found.</div>
          ) : (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>{c.name}</span>
                  <div>
                    <button onClick={() => openCatModal(c)} style={{marginRight: '8px', color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer'}}>Edit</button>
                    <button onClick={() => handleDeleteCat(c.id)} style={{color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subcategories */}
        <div className="admin-card" style={{ padding: 0 }}>
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Subcategories</h2>
            <button className="admin-btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => openSubModal()}>Add Subcategory</button>
          </div>
          {loading ? (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', alignItems: 'center' }}>
                  <div>
                    <Skeleton type="title" style={{ width: '100px', marginBottom: '4px' }} />
                    <Skeleton type="text" style={{ width: '80px' }} />
                  </div>
                  <div>
                    <Skeleton type="text" style={{ width: '40px', display: 'inline-block', marginRight: '8px' }} />
                    <Skeleton type="text" style={{ width: '40px', display: 'inline-block' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : subcategories.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No subcategories found.</div>
          ) : (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {subcategories.map(s => {
                const parent = categories.find(c => c.id === s.category_id);
                return (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>in {parent ? parent.name : 'Unknown'}</div>
                    </div>
                    <div>
                      <button onClick={() => openSubModal(s)} style={{marginRight: '8px', color: '#3b82f6', border: 'none', background: 'none', cursor: 'pointer'}}>Edit</button>
                      <button onClick={() => handleDeleteSub(s.id)} style={{color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer'}}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCatModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '400px' }}>
            <h3>{editingCatId ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSaveCat} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Category Name</label>
                <input type="text" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                  value={catName} onChange={e => setCatName(e.target.value)} disabled={isSubmitting} />
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button type="submit" className="admin-btn-primary" style={{flex: 1}} disabled={isSubmitting}>Save</button>
                <button type="button" className="modal-close" style={{flex: 1}} onClick={() => setShowCatModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '400px' }}>
            <h3>{editingSubId ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
            <form onSubmit={handleSaveSub} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Parent Category</label>
                <select required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                  value={subCatId} onChange={e => setSubCatId(e.target.value)} disabled={isSubmitting}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Subcategory Name</label>
                <input type="text" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                  value={subName} onChange={e => setSubName(e.target.value)} disabled={isSubmitting} />
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button type="submit" className="admin-btn-primary" style={{flex: 1}} disabled={isSubmitting}>Save</button>
                <button type="button" className="modal-close" style={{flex: 1}} onClick={() => setShowSubModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
