import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  HiMail, HiLockClosed, HiUser, HiPhone, HiArrowRight,
  HiIdentification, HiTruck, HiBriefcase, HiStar,
} from 'react-icons/hi';
import { MdConstruction, MdEngineering } from 'react-icons/md';
import logo from '../../assets/logo.png';
import './Auth.css';

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'];

export default function Register() {
  const role = 'worker'; // Hardcoded to worker for this app
  const [step, setStep] = useState(1);  // 1: form, 2: worker details, 3: plan, 4: otp
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [workerForm, setWorkerForm] = useState({ category_id: '', subcategory_id: '', licenseNo: '', experience: '', address: '', plan_id: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
    fetch('http://localhost:3000/api/admin/subcategories').then(r => r.json()).then(d => setSubcategories(d.subcategories || []));
    fetch('http://localhost:3000/api/admin/subscriptions').then(r => r.json()).then(d => setPlans(d.subscriptions || []));
  }, []);

  const { register, users } = useAuthStore();
  const navigate = useNavigate();

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });
  const w = (key) => ({ value: workerForm[key], onChange: e => setWorkerForm(p => ({ ...p, [key]: e.target.value })) });

  const handleRoleSelect = (r) => { setRole(r); setStep(1); };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    
    // PRE-CHECK: Don't let them proceed if email is already used
    if (users.some(u => u.email === form.email)) {
      setError('Email is already registered. Please login instead.');
      return;
    }

    if (role === 'worker') { setStep(2); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setStep(3);
  };

  const handleWorkerNext = (e) => {
    e.preventDefault();
    setError('');
    if (!workerForm.category_id) { setError('Please select a category'); return; }
    
    const relevantSubcategories = subcategories.filter(s => s.category_id == workerForm.category_id);
    if (relevantSubcategories.length > 0 && !workerForm.subcategory_id) {
      setError('Please select a sub category');
      return;
    }
    
    if (!workerForm.licenseNo) { setError('Aadhar / ID number is required'); return; }
    setStep(3);
  };

  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      setLoading(false);
      
      if (data.success) {
        setResendCooldown(30);
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to connect to server to resend OTP');
    }
  };

  const handlePlanSelect = async (e) => {
    e.preventDefault();
    setError('');
    if (!workerForm.plan_id) { setError('Please select a subscription plan'); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      setLoading(false);
      
      if (data.success) {
        setResendCooldown(30);
        setStep(4);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to connect to server to send OTP');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!isOtpVerified) {
      if (otp.length !== 6) { setError('Please enter a 6-digit OTP'); return; }
      setLoading(true);
      try {
        const verifyRes = await fetch('http://localhost:3000/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, otp })
        });
        const verifyData = await verifyRes.json();
        
        if (!verifyData.success) {
          setError(verifyData.error || 'Invalid OTP');
          setLoading(false);
          return;
        }
        setIsOtpVerified(true);
      } catch (err) {
        setError('Failed to verify OTP');
        setLoading(false);
        return;
      }
    }

    triggerPayment();
  };

  const triggerPayment = async () => {
    const selectedPlan = plans.find(p => p.id === parseInt(workerForm.plan_id));
    const amount = selectedPlan ? parseFloat(selectedPlan.amount) : 0;

    if (amount > 0) {
      setLoading(true);
      const res = await loadRazorpay();
      if (!res) {
        setError('Razorpay SDK failed to load');
        setLoading(false);
        return;
      }
      
      try {
        const orderRes = await fetch('http://localhost:3000/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, plan_id: workerForm.plan_id })
        });
        const orderData = await orderRes.json();
        
        if (!orderData.success) {
          setError('Failed to create payment order');
          setLoading(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: 'Mana Local',
          description: 'Professional Subscription Plan',
          order_id: orderData.order.id,
          handler: async function (response) {
            const verifyRes = await fetch('http://localhost:3000/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response)
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
               finalizeRegistration(response.razorpay_payment_id);
            } else {
               setError('Payment verification failed. You can retry payment.');
               setLoading(false);
            }
          },
          modal: {
            ondismiss: function() {
              setError('Payment was cancelled. You can retry to complete registration.');
              setLoading(false);
            }
          },
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone
          },
          theme: {
            color: '#2563eb'
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function () {
           setError('Payment failed. You can retry to complete registration.');
           setLoading(false);
        });
        paymentObject.open();
      } catch (err) {
        setError('Something went wrong with the payment gateway');
        setLoading(false);
      }
    } else {
      finalizeRegistration();
    }
  };

  const finalizeRegistration = async (paymentId = null) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const data = {
      name: form.name, email: form.email,
      phone: form.phone, password: form.password,
      role,
      ...(role === 'worker' && {
        // Keep vehicle for backwards compatibility with any other screens relying on it
        vehicle: `Category: ${workerForm.category_id} • Aadhar: ${workerForm.licenseNo}`,
        category_id: workerForm.category_id,
        subcategory_id: workerForm.subcategory_id,
        category_name: categories.find(c => c.id == workerForm.category_id)?.name || workerForm.category_id,
        subcategory_name: subcategories.find(s => s.id == workerForm.subcategory_id)?.name || 'None',
        aadhar_no: workerForm.licenseNo,
        experience: workerForm.experience,
        address: workerForm.address,
        rating: 4.5,
        jobsDone: 0,
        available: false,
        plan_id: workerForm.plan_id,
        payment_id: paymentId
      }),
    };
    
    try {
      const endpoint = role === 'admin' ? 'http://localhost:3000/api/auth/admin/signup' : 'http://localhost:3000/api/auth/worker/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resultData = await res.json();
      
      setLoading(false);
      if (!res.ok || resultData.error) {
        setError(resultData.error || 'Failed to register account on server');
        setStep(1);
        return;
      }
      
      // Successfully registered on DB
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setError('Server connection error. Please try again.');
      setStep(1);
    }
  };

  const STEPS = ['Details', 'Professional Info', 'Subscription Plan', 'OTP'];
  const currentStep = step - 1;

  const relevantSubcategories = workerForm.category_id 
    ? subcategories.filter(s => s.category_id === parseInt(workerForm.category_id))
    : [];

  const relevantPlans = plans.filter(p => 
    (!p.category_id || p.category_id === parseInt(workerForm.category_id)) && 
    (!p.subcategory_id || p.subcategory_id === parseInt(workerForm.subcategory_id))
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <Link to="/">
            <img src={logo} alt="Mana Local" className="auth-logo" />
          </Link>
        </div>

        {/* Step indicator */}
        <div className="reg-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`reg-step ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}>
              <div className="rs-dot">{i < currentStep ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Basic Details */}
        {step === 1 && (
          <>
            <h1>Professional Registration</h1>
            <p className="auth-sub">Enter your basic details</p>
            <form onSubmit={handleFormSubmit}>
              <label>Full Name
                <div className="input-wrap"><HiUser className="input-icon" /><input placeholder="Arjun Sharma" {...f('name')} required /></div>
              </label>
              <label>Email
                <div className="input-wrap"><HiMail className="input-icon" /><input type="email" placeholder="you@example.com" {...f('email')} required /></div>
              </label>
              <label>Phone
                <div className="input-wrap"><HiPhone className="input-icon" /><input type="tel" placeholder="+91 98765 43210" {...f('phone')} required /></div>
              </label>
              <label>Password
                <div className="input-wrap"><HiLockClosed className="input-icon" /><input type="password" placeholder="Min. 6 characters" {...f('password')} required /></div>
              </label>
              <label>Confirm Password
                <div className="input-wrap"><HiLockClosed className="input-icon" /><input type="password" placeholder="Repeat password" {...f('confirm')} required /></div>
              </label>
              {error && <div className="auth-error">⚠️ {error}</div>}
              <button type="submit" className="auth-submit" disabled={loading}>
                <span>Next: Professional Details</span>
                <HiArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
            </form>
          </>
        )}

        {/* Step 2: Worker Details */}
        {step === 2 && (
          <>
            <h1>Professional Details</h1>
            <p className="auth-sub">Tell us about your skills & experience</p>
            <form onSubmit={handleWorkerNext}>
              <label>Category
                <div className="input-wrap">
                  <HiBriefcase className="input-icon" />
                  <select className="auth-select" value={workerForm.category_id} onChange={e => setWorkerForm(p => ({ ...p, category_id: e.target.value, subcategory_id: '' }))} required>
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </label>

              {relevantSubcategories.length > 0 && (
                <label>Sub Category
                  <div className="input-wrap">
                    <HiBriefcase className="input-icon" />
                    <select className="auth-select" value={workerForm.subcategory_id} onChange={e => setWorkerForm(p => ({ ...p, subcategory_id: e.target.value }))} required>
                      <option value="">Select sub category...</option>
                      {relevantSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </label>
              )}
              <label>Aadhar / Government ID No.
                <div className="input-wrap"><HiIdentification className="input-icon" /><input placeholder="XXXX XXXX XXXX" {...w('licenseNo')} required /></div>
              </label>
              <label>Years of Experience
                <div className="input-wrap">
                  <HiBriefcase className="input-icon" />
                  <select className="auth-select" value={workerForm.experience} onChange={e => setWorkerForm(p => ({ ...p, experience: e.target.value }))} required>
                    <option value="">Select experience...</option>
                    {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </label>
              <label>Current City
                <div className="input-wrap">
                  <MdEngineering className="input-icon" />
                  <input placeholder="City, State" {...w('address')} />
                </div>
              </label>
              {error && <div className="auth-error">⚠️ {error}</div>}
              <button type="submit" className="auth-submit">
                <span>Choose Plan</span> <HiArrowRight style={{ width: 16, height: 16 }} />
              </button>
              <button type="button" className="auth-back" onClick={() => { setStep(1); setError(''); }}>← Back</button>
            </form>
          </>
        )}

        {/* Step 3: Subscription Plan */}
        {step === 3 && (
          <>
            <h1>Choose Your Plan</h1>
            <p className="auth-sub">Select a subscription plan to get started</p>
            <form onSubmit={handlePlanSelect}>
              <div className="plans-grid" style={{ display: 'grid', gap: '16px', marginBottom: '8px' }}>
                {relevantPlans.length > 0 ? relevantPlans.map(p => (
                  <label key={p.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px', padding: '16px', border: workerForm.plan_id == p.id ? '2px solid var(--auth-primary)' : '1px solid var(--auth-border)', borderRadius: '12px', cursor: 'pointer', background: workerForm.plan_id == p.id ? '#eff6ff' : '#fff', transition: 'all 0.2s' }}>
                    <input type="radio" name="plan_id" value={p.id} checked={workerForm.plan_id == p.id} onChange={e => setWorkerForm(prev => ({ ...prev, plan_id: e.target.value }))} style={{ width: 'auto', margin: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', textTransform: 'capitalize' }}>{p.plan} Plan</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Valid for {p.days || 30} days</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--auth-primary)' }}>₹{p.amount || 0}</div>
                  </label>
                )) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    No specific plans found for this category.
                  </div>
                )}
              </div>
              
              {error && <div className="auth-error">⚠️ {error}</div>}
              <button type="submit" className="auth-submit" disabled={!workerForm.plan_id || loading}>
                {loading ? 'Sending OTP...' : <><span>Send OTP</span> <HiArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
              <button type="button" className="auth-back" onClick={() => { setStep(2); setError(''); }}>← Back</button>
            </form>
          </>
        )}

        {/* Step 4: OTP */}
        {step === 4 && (
          <>
            <h1>Verify Email</h1>
            <p className="auth-sub">OTP sent to {form.email}</p>
            <form onSubmit={handleVerifyOtp}>
              <div className="otp-info">
                <HiMail className="otp-info-icon" />
                <div>
                  <strong>OTP sent to {form.email}</strong>
                  <p>Enter the 6-digit code to verify</p>
                </div>
              </div>
              {!isOtpVerified && (
                <>
                  <label>Enter OTP
                    <div className="input-wrap">
                      <HiLockClosed className="input-icon" />
                      <input
                        type="text" placeholder="123456" value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6} required autoFocus
                      />
                    </div>
                  </label>
                  <div className="otp-hint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>💡 Check your email for the code.</span>
                    <button 
                      type="button" 
                      onClick={handleResendOtp} 
                      disabled={resendCooldown > 0 || loading} 
                      style={{ 
                        background: 'none', border: 'none', color: resendCooldown > 0 ? '#94a3b8' : 'var(--auth-primary)', 
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontWeight: 600, padding: 0, fontSize: '13px' 
                      }}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </>
              )}
              {error && <div className="auth-error">⚠️ {error}</div>}
              {isOtpVerified && !error && <div className="otp-hint" style={{ background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}>✅ OTP Verified. Proceed to payment.</div>}
              
              <button type="submit" className="auth-submit" disabled={loading || (!isOtpVerified && otp.length !== 6)}>
                {loading ? (isOtpVerified ? 'Processing...' : 'Verifying OTP...') : (isOtpVerified ? <><span>Complete Registration (Pay)</span> <HiArrowRight style={{ width: 16, height: 16 }} /></> : <><span>Verify OTP & Pay</span> <HiArrowRight style={{ width: 16, height: 16 }} /></>)}
              </button>
              <button type="button" className="auth-back" onClick={() => { setStep(role === 'worker' ? 3 : 1); setOtp(''); setError(''); setIsOtpVerified(false); }}>← Back</button>
            </form>
          </>
        )}
      </div>

      <div className="auth-visual">
        <div className="av-content">
          <div className="av-icon">👨‍🔧</div>
          <h2>Grow Your Business with Mana Local</h2>
          <p>Join thousands of verified professionals getting direct leads and jobs daily.</p>
          <div className="av-features">
            <div>✅ Get jobs directly from customers</div>
            <div>✅ Zero commission on your earnings</div>
            <div>✅ Build your local reputation</div>
            <div>✅ Choose when and where you work</div>
          </div>
        </div>
      </div>
    </div>
  );
}
