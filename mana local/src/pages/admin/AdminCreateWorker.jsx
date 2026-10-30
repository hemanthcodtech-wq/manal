import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiMail, HiLockClosed, HiUser, HiPhone, HiArrowRight,
  HiIdentification, HiBriefcase, HiCheckCircle
} from 'react-icons/hi';
import { MdEngineering } from 'react-icons/md';
import toast from 'react-hot-toast';
import LocationPicker from '../../components/LocationPicker';
import './Admin.css';

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'];

export default function AdminCreateWorker() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Basic & Credentials, 2: Professional Details, 3: Plan (Optional)
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: ''
  });

  const [workerForm, setWorkerForm] = useState({
    category_id: '',
    subcategory_id: '',
    licenseNo: '',
    experience: '',
    address: '',
    latitude: null,
    longitude: null,
    plan_id: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL}/api/admin/subcategories`)
      .then(r => r.json())
      .then(d => setSubcategories(d.subcategories || []))
      .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions`)
      .then(r => r.json())
      .then(d => setPlans(d.subscriptions || []))
      .catch(console.error);
  }, []);

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value }))
  });

  const w = (key) => ({
    value: workerForm[key],
    onChange: (e) => setWorkerForm((p) => ({ ...p, [key]: e.target.value }))
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    setError('');
    if (!workerForm.category_id) {
      setError('Please select a category');
      return;
    }

    const relevantSubcategories = subcategories.filter(s => s.category_id == workerForm.category_id);
    if (relevantSubcategories.length > 0 && !workerForm.subcategory_id) {
      setError('Please select a subcategory');
      return;
    }

    if (!workerForm.licenseNo) {
      setError('Aadhar / Government ID number is required');
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    let uploadedAvatarUrl = null;
    if (avatarFile) {
      try {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/upload-avatar`, {
          method: 'POST',
          body: fd
        });
        const d = await res.json();
        if (d.success) {
          uploadedAvatarUrl = d.url;
        }
      } catch (err) {
        console.error('Avatar upload failed', err);
      }
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      category_id: workerForm.category_id ? parseInt(workerForm.category_id) : null,
      subcategory_id: workerForm.subcategory_id ? parseInt(workerForm.subcategory_id) : null,
      aadhar_no: workerForm.licenseNo,
      experience: workerForm.experience,
      address: workerForm.address,
      latitude: workerForm.latitude,
      longitude: workerForm.longitude,
      is_location_fixed: true,
      avatar: uploadedAvatarUrl,
      plan_id: workerForm.plan_id ? parseInt(workerForm.plan_id) : null
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to create worker');
        return;
      }

      toast.success('Worker created successfully!');
      navigate('/admin/workers');
    } catch (err) {
      setLoading(false);
      setError('Server connection error. Please try again.');
    }
  };

  const relevantSubcategories = workerForm.category_id
    ? subcategories.filter(s => s.category_id === parseInt(workerForm.category_id))
    : [];

  const relevantPlans = plans.filter(p =>
    (!p.category_id || p.category_id === parseInt(workerForm.category_id)) &&
    (!p.subcategory_id || p.subcategory_id === parseInt(workerForm.subcategory_id))
  );

  const STEPS = ['Account Details', 'Professional Info', 'Subscription Plan'];
  const currentStep = step - 1;

  return (
    <div className="admin-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="admin-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>Create Worker</h1>
          <p>Directly onboard a worker without email verification or Razorpay payment</p>
        </div>
        <button
          type="button"
          className="admin-btn-secondary"
          onClick={() => navigate('/admin/workers')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          Back to Workers
        </button>
      </div>

      <div className="admin-card" style={{ padding: '32px' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 2
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: i < currentStep ? '#10b981' : i === currentStep ? 'var(--primary, #2563eb)' : '#f1f5f9',
                  color: i <= currentStep ? '#fff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '8px',
                  boxShadow: i === currentStep ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '12px', fontWeight: i === currentStep ? 600 : 500, color: i === currentStep ? '#0f172a' : '#64748b', textAlign: 'center' }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}

        {/* Step 1: Basic Credentials */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Basic & Login Details</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>Worker account credentials used to log into their dashboard.</p>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full Name *</label>
              <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                <HiUser style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  {...f('name')}
                  required
                  style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email Address *</label>
                <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                  <HiMail style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                  <input
                    type="email"
                    placeholder="worker@example.com"
                    {...f('email')}
                    required
                    style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Phone Number *</label>
                <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                  <HiPhone style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...f('phone')}
                    required
                    style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Set Password *</label>
                <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                  <HiLockClosed style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    {...f('password')}
                    required
                    style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Confirm Password *</label>
                <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                  <HiLockClosed style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                  <input
                    type="password"
                    placeholder="Repeat password"
                    {...f('confirm')}
                    required
                    style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Next: Professional Info</span>
                <HiArrowRight />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Professional Details */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Professional Details</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>Category, expertise, identification, and location.</p>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Profile Photo (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '24px' }}>
                    <HiUser />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ fontSize: '13px', color: '#475569' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: relevantSubcategories.length > 0 ? '1fr 1fr' : '1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Category *</label>
                <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                  <HiBriefcase style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                  <select
                    value={workerForm.category_id}
                    onChange={(e) => setWorkerForm(p => ({ ...p, category_id: e.target.value, subcategory_id: '' }))}
                    required
                    style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px', background: 'transparent' }}
                  >
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {relevantSubcategories.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Sub Category *</label>
                  <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                    <HiBriefcase style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                    <select
                      value={workerForm.subcategory_id}
                      onChange={(e) => setWorkerForm(p => ({ ...p, subcategory_id: e.target.value }))}
                      required
                      style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px', background: 'transparent' }}
                    >
                      <option value="">Select sub category...</option>
                      {relevantSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Aadhar / Govt ID No. *</label>
                <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                  <HiIdentification style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                  <input
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    {...w('licenseNo')}
                    required
                    style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Years of Experience *</label>
                <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff' }}>
                  <HiBriefcase style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                  <select
                    value={workerForm.experience}
                    onChange={(e) => setWorkerForm(p => ({ ...p, experience: e.target.value }))}
                    required
                    style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px', background: 'transparent' }}
                  >
                    <option value="">Select experience...</option>
                    {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Workshop / Base Address *</label>
              <div className="input-wrap" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 12px', background: '#fff', marginBottom: '10px' }}>
                <MdEngineering style={{ color: '#94a3b8', fontSize: '18px', marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Locality / Area, City (or pin on map below)"
                  value={workerForm.address}
                  onChange={(e) => setWorkerForm(p => ({ ...p, address: e.target.value }))}
                  required
                  style={{ border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px' }}
                />
              </div>

              <LocationPicker
                value={{
                  address: workerForm.address,
                  latitude: workerForm.latitude,
                  longitude: workerForm.longitude
                }}
                onChange={(loc) => {
                  setWorkerForm(p => ({
                    ...p,
                    address: loc.address || p.address,
                    latitude: loc.latitude,
                    longitude: loc.longitude
                  }));
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#475569'
                }}
              >
                ← Back
              </button>
              <button type="submit" className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Next: Assign Plan</span>
                <HiArrowRight />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Subscription Plan & Final Creation */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Subscription Plan</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>
              Select a subscription plan for this worker (payment is bypassed for admin-created workers).
            </p>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  border: workerForm.plan_id === '' ? '2px solid var(--primary, #2563eb)' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: workerForm.plan_id === '' ? '#eff6ff' : '#fff'
                }}
              >
                <input
                  type="radio"
                  name="plan_id"
                  value=""
                  checked={workerForm.plan_id === ''}
                  onChange={() => setWorkerForm(p => ({ ...p, plan_id: '' }))}
                  style={{ width: 'auto', margin: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>No Plan / Free Tier</div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Standard listing without an active subscription package</div>
                </div>
                <div style={{ fontWeight: 700, color: '#64748b' }}>₹0</div>
              </label>

              {relevantPlans.map((p) => {
                const isSelected = workerForm.plan_id == p.id;
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      border: isSelected ? '2px solid var(--primary, #2563eb)' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : '#fff'
                    }}
                  >
                    <input
                      type="radio"
                      name="plan_id"
                      value={p.id}
                      checked={isSelected}
                      onChange={(e) => setWorkerForm(prev => ({ ...prev, plan_id: e.target.value }))}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', textTransform: 'capitalize' }}>
                        {p.plan} Plan
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        Valid for {p.days || 30} days
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary, #2563eb)', fontSize: '16px' }}>
                      ₹{p.amount || 0}
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>Admin Creation Summary:</div>
              <div>• Worker will be marked as <strong>Verified</strong> automatically.</div>
              <div>• Worker status will be set to <strong>Active</strong> with instant access.</div>
              <div>• No OTP verification or payment gateway checkout required.</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => { setStep(2); setError(''); }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#475569'
                }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading ? 'Creating Worker...' : <><span>Complete & Create Worker</span> <HiCheckCircle style={{ width: 18, height: 18 }} /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

