import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { HiUser, HiPhone, HiMail, HiStar, HiBriefcase, HiLogout, HiCurrencyRupee } from 'react-icons/hi';
import { MdDirectionsCar } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

export default function WorkerProfile() {
  const user = useAuthStore(s => s.user);
  const updateWorkerAvailability = useAuthStore(s => s.updateWorkerAvailability);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showcaseImages, setShowcaseImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Artificial delay for smooth skeleton transition
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  // Clean fallback mechanism: if the clean data exists, use it. Otherwise, parse legacy string.
  let categoryStr = user.category_name || user.category_id || 'Not Available';
  let subcategoryStr = user.subcategory_name || user.subcategory_id || 'Not Available';
  let aadharNo = user.aadhar_no || 'Not Available';

  // Fallback for legacy local storage accounts without explicit fields
  if (!user.category_name && user.vehicle) {
    if (user.vehicle.includes('Category:')) {
      const aadharMatch = user.vehicle.match(/Aadhar:\s*(.*)/);
      aadharNo = aadharMatch ? aadharMatch[1] : 'Not Available';
      const categoryMatch = user.vehicle.match(/Category:\s*(.*?)\s*•/);
      categoryStr = categoryMatch ? categoryMatch[1] : 'Not Available';
    } else if (user.vehicle.includes('•')) {
      const parts = user.vehicle.split('•');
      categoryStr = parts[0].trim();
      aadharNo = parts[1].trim();
    }
  }

  const INFO = [
    { Icon: HiUser,          label: 'Full Name',       val: user.name },
    { Icon: HiPhone,         label: 'Phone',           val: user.phone },
    { Icon: HiMail,          label: 'Email',           val: user.email },
    { Icon: HiBriefcase,     label: 'Category',        val: categoryStr },
    { Icon: HiBriefcase,     label: 'Sub Category',    val: subcategoryStr },
    { Icon: HiUser,          label: 'Aadhar No.',      val: aadharNo },
    { Icon: HiBriefcase,     label: 'Experience',      val: user.experience || 'Not Specified' },
    { Icon: MdDirectionsCar, label: 'Location',        val: user.location || user.address || 'Not Specified' },
    { Icon: HiCurrencyRupee, label: 'Plan ID',         val: user.plan_id || 'Free' },
    { Icon: HiCurrencyRupee, label: 'Payment ID',      val: user.payment_id || 'N/A' },
    { Icon: HiStar,          label: 'Rating',          val: `${user.rating || 5.0} ★` },
    { Icon: HiBriefcase,     label: 'Jobs Done',       val: user.jobsDone || 0 },
  ];

  if (loading) {
    return (
      <div className="worker-page">
        <div className="wp-title">
          <HiUser className="wp-title-icon" />
          <h1>Profile</h1>
        </div>
        <div className="profile-layout">
          <div className="profile-left">
            <div className="skeleton sk-card" style={{ height: '350px' }}></div>
          </div>
          <div className="profile-right">
            <div className="skeleton sk-card" style={{ height: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const handleShowcaseUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      // In a real app, we would have a specific endpoint for uploading showcase images.
      // For now, we mock the success and add it to local state.
      const fakeUrl = URL.createObjectURL(file);
      setShowcaseImages(prev => [...prev, fakeUrl]);
    } catch (error) {
      console.error('Failed to upload showcase image', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="worker-page">
      <div className="wp-title">
        <HiUser className="wp-title-icon" />
        <h1>Profile</h1>
      </div>

      <div className="profile-layout">
        {/* Left Column: Hero & Actions */}
        <div className="profile-left">
          <div className="profile-hero">
            <label className="profile-avatar" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setIsUploading(true);
                const fd = new FormData();
                fd.append('avatar', file);
                try {
                  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/upload-avatar`, { method: 'POST', body: fd });
                  const d = await res.json();
                  if (d.success) {
                    const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/profile`, {
                      method: 'PUT', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: user.name, phone: user.phone, avatar: d.url })
                    });
                    const profD = await profRes.json();
                    if (profD.success) {
                      useAuthStore.getState().setUser({ ...user, avatar: d.url });
                    }
                  }
                } catch(e) {}
                setIsUploading(false);
              }} disabled={isUploading} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '4px', textAlign: 'center' }}>
                {isUploading ? '...' : 'Change'}
              </div>
            </label>
            <h2>{user.name}</h2>
            <span className="profile-role">Worker</span>
            <div className="avail-toggle" style={{ justifyContent: 'center', margin: '16px 0' }}>
              <span>Status:</span>
              <button
                className={`toggle-btn ${user.available ? 'on' : 'off'}`}
                onClick={() => updateWorkerAvailability(user.id, !user.available)}
              >
                {user.available ? '● Online' : '○ Offline'}
              </button>
            </div>
            {/* Logout moved to hero column on desktop */}
            <button className="logout-btn" onClick={() => setShowLogout(true)}>
              <HiLogout style={{ width: 18, height: 18 }} /> Logout
            </button>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="profile-right">
          <div className="worker-section">
            <h2>Personal & Professional Info</h2>
            <div className="profile-info-grid">
              {INFO.map(({ Icon, label, val }) => (
                <div key={label} className="pi-card">
                  <div className="pi-label"><Icon className="pi-icon" />{label}</div>
                  <div className="pi-val">{val}</div>
                </div>
              ))}
            </div>
          </div>
          
          {user.allow_showcase_images && (
            <div className="worker-section" style={{ marginTop: '24px' }}>
              <h2>Portfolio & Showcase Images</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                Upload photos of your past work to attract more customers.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {showcaseImages.map((src, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', background: '#e2e8f0' }}>
                    <img src={src} alt="Showcase" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                
                <label style={{ aspectRatio: '1', borderRadius: '12px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', color: '#64748b' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleShowcaseUpload} disabled={isUploading} />
                  <span style={{ fontSize: '24px', marginBottom: '4px' }}>+</span>
                  <span style={{ fontSize: '12px' }}>{isUploading ? 'Uploading...' : 'Add Image'}</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLogout && createPortal(
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Logout?</h3>
            <p>Are you sure you want to logout?</p>
            <div className="cm-actions">
              <button className="cm-cancel" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="cm-confirm" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
