import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { HiUser, HiPhone, HiMail, HiStar, HiBriefcase, HiLogout, HiCurrencyRupee } from 'react-icons/hi';
import { MdDirectionsCar } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function WorkerProfile() {
  const user = useAuthStore(s => s.user);
  const updateWorkerAvailability = useAuthStore(s => s.updateWorkerAvailability);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(true);

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
            <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
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
        </div>
      </div>

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Logout?</h3>
            <p>Are you sure you want to logout?</p>
            <div className="cm-actions">
              <button className="cm-cancel" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="cm-confirm" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
