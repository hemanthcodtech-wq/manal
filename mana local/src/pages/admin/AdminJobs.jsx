import React, { useState, useEffect } from 'react';
import Skeleton from '../../components/Skeleton';
import './Admin.css';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const defaultForm = { 
    title: '', description: '', amount: '', skills: '', location: '', experience: '', job_type: 'Full-time',
    company_name: '', job_description_pdf: '', year_of_passing: '', departments_allowed: '', conditions: '',
    apply_link: '', hr_phone: '', hr_email: '', urgency: 'Medium', status: 'available', expiration_date: ''
  };
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/jobs`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setEditingId(job.id);
    setFormData({
      title: job.title || '', description: job.description || '', amount: job.amount || '', skills: job.skills || '',
      location: job.location || '', experience: job.experience || '', job_type: job.job_type || 'Full-time',
      company_name: job.company_name || '', job_description_pdf: job.job_description_pdf || '', year_of_passing: job.year_of_passing || '',
      departments_allowed: job.departments_allowed || '', conditions: job.conditions || '', apply_link: job.apply_link || '',
      hr_phone: job.hr_phone || '', hr_email: job.hr_email || '', urgency: job.urgency || 'Medium', status: job.status || 'available',
      expiration_date: job.expiration_date ? new Date(job.expiration_date).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/jobs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const handleCreateOrUpdateJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingId ? `${import.meta.env.VITE_API_URL}/api/admin/jobs/${editingId}` : `${import.meta.env.VITE_API_URL}/api/admin/jobs`;
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
        fetchJobs(); // Refresh jobs
      }
    } catch (err) {
      console.error('Error saving job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Jobs Posting</h1>
          <p>Manage and review all job postings across the platform.</p>
        </div>
        <button className="admin-btn-primary" onClick={openCreateModal}>Create Job Posting</button>
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
                      <Skeleton type="title" style={{ width: '150px', marginBottom: '4px' }} />
                      <Skeleton type="text" style={{ width: '100px' }} />
                    </td>
                    <td><Skeleton type="text" style={{ width: '80px' }} /></td>
                    <td><Skeleton type="text" style={{ width: '60px' }} /></td>
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
        ) : jobs.length === 0 ? (
          <div className="ac-empty">
            <p>No job postings available yet.</p>
            <button className="admin-btn-primary" onClick={openCreateModal}>Create Job Posting</button>
          </div>
        ) : (
          <div className="orders-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Title / Company</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => {
                  let isExpired = j.status === 'expired' || (j.expiration_date && new Date(j.expiration_date) < new Date());
                  let displayStatus = isExpired ? 'expired' : (j.status || 'available');
                  return (
                  <tr key={j.id}>
                    <td className="mono">#{j.id}</td>
                    <td>
                      <strong>{j.title}</strong> {j.company_name && <span style={{color: '#64748b'}}>at {j.company_name}</span>}
                      <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>{j.job_type} • {j.experience}</div>
                    </td>
                    <td>{j.location || '—'}</td>
                    <td>{j.amount ? `₹${parseFloat(j.amount).toLocaleString()}` : '—'}</td>
                    <td>
                      <span className={`status-chip ${displayStatus === 'available' ? 'completed' : 'cancelled'}`}>{displayStatus}</span>
                    </td>
                    <td>
                      <button onClick={() => openEditModal(j)} style={{marginRight: '8px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer'}}>Edit</button>
                      <button onClick={() => handleDelete(j.id)} style={{padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#ef4444', cursor: 'pointer'}}>Delete</button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingId ? 'Edit Job Posting' : 'Create Job Posting'}</h3>
            <p>Fill in the detailed requirements to {editingId ? 'update' : 'create'} a job posting.</p>
            <form onSubmit={handleCreateOrUpdateJob} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Job Title</label>
                  <input type="text" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Company Name</label>
                  <input type="text" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Job Type</label>
                  <select required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})} disabled={isSubmitting}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Urgency</label>
                  <select required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})} disabled={isSubmitting}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
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
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Salary/Amount (₹)</label>
                  <input type="number" required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Experience Required</label>
                  <input type="text" required placeholder="e.g. 2+ years" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Skills Required</label>
                  <input type="text" required placeholder="e.g. React, Node.js" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Year of Passing</label>
                  <input type="text" required placeholder="e.g. 2023, 2024" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.year_of_passing} onChange={e => setFormData({...formData, year_of_passing: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Departments Allowed</label>
                  <input type="text" required placeholder="e.g. CSE, IT, ECE" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.departments_allowed} onChange={e => setFormData({...formData, departments_allowed: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Status</label>
                  <select required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} disabled={isSubmitting}>
                    <option value="available">Available</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Expiration Date</label>
                  <input type="date" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.expiration_date} onChange={e => setFormData({...formData, expiration_date: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Apply Link</label>
                  <input type="text" placeholder="https://example.com/apply" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.apply_link} onChange={e => setFormData({...formData, apply_link: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>HR Phone</label>
                  <input type="text" placeholder="e.g. 9876543210" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.hr_phone} onChange={e => setFormData({...formData, hr_phone: e.target.value})} disabled={isSubmitting} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>HR Email</label>
                  <input type="email" placeholder="hr@company.com" style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} 
                    value={formData.hr_email} onChange={e => setFormData({...formData, hr_email: e.target.value})} disabled={isSubmitting} />
                </div>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Job Description PDF Upload</label>
                <input type="file" accept="application/pdf" style={{marginBottom: '8px'}} onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setIsSubmitting(true);
                  const data = new FormData();
                  data.append('file', file);
                  try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload-pdf`, {
                      method: 'POST',
                      body: data
                    });
                    const result = await res.json();
                    if (result.success) {
                      setFormData({...formData, job_description_pdf: result.url});
                    }
                  } catch (err) {
                    console.error('Upload failed', err);
                    alert('PDF Upload failed.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }} disabled={isSubmitting} />
                {formData.job_description_pdf && (
                  <div style={{fontSize: '13px', color: '#10b981', fontWeight: 600}}>✓ Uploaded: <a href={formData.job_description_pdf} target="_blank" rel="noreferrer">View PDF</a></div>
                )}
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Terms & Conditions</label>
                <textarea required placeholder="Any specific conditions..." style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '80px'}} 
                  value={formData.conditions} onChange={e => setFormData({...formData, conditions: e.target.value})} disabled={isSubmitting} />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600}}>Full Description</label>
                <textarea required style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '100px'}} 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} disabled={isSubmitting} />
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
