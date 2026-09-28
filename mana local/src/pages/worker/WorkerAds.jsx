import React, { useState, useEffect } from 'react';
import { HiPhotograph, HiVideoCamera, HiCheckCircle, HiExclamationCircle, HiUpload } from 'react-icons/hi';
import { useAuthStore } from '../../store/useAuthStore';
import Skeleton from '../../components/Skeleton';
import { toast, Toaster } from 'react-hot-toast';
import './Worker.css';

export default function WorkerAds() {
  const user = useAuthStore(s => s.user);
  const [plans, setPlans] = useState([]);
  const [myAd, setMyAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // We can fetch plans from the open endpoint or admin endpoint if it doesn't check auth
      const plansRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promo-plans`);
      const plansData = await plansRes.json();
      
      const myAdRes = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/promo-ad`);
      const myAdData = await myAdRes.json();

      if (plansData.success) setPlans(plansData.plans);
      if (myAdData.success) setMyAd(myAdData.ad);
    } catch (error) {
      console.error('Error fetching ads data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error('Failed to load Razorpay. Please check your connection.');
      return;
    }

    try {
      const toastId = toast.loading('Initializing payment...');
      
      // Create order
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price, plan_id: plan.id })
      });
      const orderData = await orderRes.json();
      
      toast.dismiss(toastId);

      if (!orderData.success) {
        toast.error('Failed to create order');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Mana Local',
        description: `Subscription to ${plan.name}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          const verifyToast = toast.loading('Verifying payment...');
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              // Proceed with activating the promo ad
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/promo-ad`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: plan.id })
              });
              const data = await res.json();
              if (data.success) {
                setMyAd(data.ad);
                toast.success('Subscription successful!', { id: verifyToast });
              } else {
                toast.error('Failed to activate ad subscription.', { id: verifyToast });
              }
            } else {
              toast.error('Payment verification failed!', { id: verifyToast });
            }
          } catch (err) {
            console.error(err);
            toast.error('Payment error', { id: verifyToast });
          }
        },
        prefill: {
          name: user.name,
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#2563eb'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error('Something went wrong!');
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Constraints validation
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (myAd?.plan_ad_type === 'image' && !isImage) {
      toast.error('This plan only allows Banner Images.');
      return;
    }
    if (myAd?.plan_ad_type === 'video' && !isVideo) {
      toast.error('This plan only allows Video Ads.');
      return;
    }
    if (!isVideo && !isImage) {
      toast.error('Only image or video files are allowed.');
      return;
    }
    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 50 * 1024 * 1024; // 50MB
    if (isImage && file.size > maxImageSize) {
      toast.error('Image size should be less than 5MB.');
      return;
    }
    if (isVideo && file.size > maxVideoSize) {
      toast.error('Video size should be less than 50MB.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('files', file);

    try {
      // Upload media
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload-media`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (uploadData.success && uploadData.urls.length > 0) {
        const mediaUrl = uploadData.urls[0];
        
        // Update Ad
        const updateRes = await fetch(`${import.meta.env.VITE_API_URL}/api/worker/${user.id}/promo-ad/${myAd.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ad_image_url: mediaUrl, status: 'pending_review' })
        });
        const updateData = await updateRes.json();
        
        if (updateData.success) {
          setMyAd({ ...myAd, ad_image_url: mediaUrl, status: 'pending_review' });
          toast.success('Media uploaded successfully!');
        }
      }
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Media upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="worker-page">
        <Skeleton type="title" style={{ width: '40%' }} />
        <Skeleton type="box" style={{ height: '200px', marginTop: '20px' }} />
      </div>
    );
  }

  return (
    <div className="worker-page">
      <Toaster position="top-right" />
      <div className="wp-title">
        <HiPhotograph className="wp-title-icon" />
        <h1>Promotional Ads</h1>
      </div>

      {!myAd ? (
        <div className="worker-section">
          <h2>Available Subscription Plans</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Subscribe to a plan to promote your services and get more jobs!</p>
          <div className="sk-grid-3">
            {plans.map(plan => (
              <div key={plan.id} className="pi-card" style={{ textAlign: 'center', padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{plan.name}</h3>
                <span className="status-chip" style={{ background: '#f1f5f9', color: '#475569', marginBottom: '16px' }}>
                  {plan.ad_type === 'image' ? 'Image Only' : plan.ad_type === 'video' ? 'Video Only' : 'Image & Video'}
                </span>
                <strong style={{ fontSize: '24px', color: 'var(--primary)', display: 'block', marginBottom: '16px' }}>₹{plan.price}</strong>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Valid for {plan.duration_days} days</p>
                <button className="submit-btn" onClick={() => handleSubscribe(plan)}>Subscribe</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="worker-section">
          <h2>Your Active Ad Subscription</h2>
          <div className="pi-card" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <strong>{myAd.plan_name}</strong>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: myAd.status === 'active' ? 'green' : 'orange' }}>{myAd.status.replace('_', ' ')}</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Subscribed on</span>
                <strong>{new Date(myAd.start_date).toLocaleDateString()}</strong>
              </div>
            </div>

            <div style={{ padding: '24px', background: '#f1f5f9', borderRadius: '12px', textAlign: 'center' }}>
              {myAd.ad_image_url ? (
                <div>
                  {myAd.ad_image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={myAd.ad_image_url} controls style={{ width: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                  ) : (
                    <img src={myAd.ad_image_url} alt="My Ad Poster" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
                  )}
                  <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748b' }}>
                    {myAd.status === 'pending_review' ? <><HiExclamationCircle /> Waiting for Admin Approval</> : <><HiCheckCircle color="green" /> Ad is Live</>}
                  </p>
                </div>
              ) : (
                <div style={{ padding: '30px 10px' }}>
                  <HiVideoCamera style={{ fontSize: '48px', color: '#94a3b8', margin: '0 auto 12px' }} />
                  <h3 style={{ marginBottom: '8px' }}>
                    {myAd.plan_ad_type === 'image' ? 'Upload Your Banner Image' : myAd.plan_ad_type === 'video' ? 'Upload Your Video Ad' : 'Upload Your Poster or Video'}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                    {myAd.plan_ad_type === 'image' ? 'Please upload an image to display in your ad.' : myAd.plan_ad_type === 'video' ? 'Please upload a video to display in your ad.' : 'Please upload an image or video to display in your ad.'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
                    {myAd.plan_ad_type === 'image' ? '(Images: Max 5MB)' : myAd.plan_ad_type === 'video' ? '(Videos: Max 50MB)' : '(Images: Max 5MB | Videos: Max 50MB)'}
                  </p>
                  
                  <label className="submit-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', width: 'auto' }}>
                    <HiUpload /> {uploading ? 'Uploading...' : 'Choose File'}
                    <input type="file" style={{ display: 'none' }} 
                      accept={myAd.plan_ad_type === 'image' ? 'image/*' : myAd.plan_ad_type === 'video' ? 'video/*' : 'image/*,video/*'} 
                      onChange={handleMediaUpload} 
                      disabled={uploading} 
                    />
                  </label>
                </div>
              )}
            </div>
            
            {myAd.ad_image_url && (
               <div style={{ marginTop: '16px', textAlign: 'center' }}>
                 <label style={{ fontSize: '14px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                   Change {myAd.plan_ad_type === 'image' ? 'Banner' : myAd.plan_ad_type === 'video' ? 'Video' : 'Poster/Video'}
                   <input type="file" style={{ display: 'none' }} 
                     accept={myAd.plan_ad_type === 'image' ? 'image/*' : myAd.plan_ad_type === 'video' ? 'video/*' : 'image/*,video/*'} 
                     onChange={handleMediaUpload} 
                     disabled={uploading} 
                   />
                 </label>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
