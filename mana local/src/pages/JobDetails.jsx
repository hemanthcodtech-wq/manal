import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { HiChevronLeft, HiBriefcase, HiLocationMarker, HiClock, HiCurrencyRupee, HiAcademicCap, HiDocumentText, HiLightningBolt, HiPhone, HiMail, HiExclamationCircle } from 'react-icons/hi';
import './WorkerDetails.css'; // Reusing WorkerDetails CSS for consistency

export default function JobDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!job) {
    return (
      <div className="wd-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Job details not found</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>Please select a job from the jobs list.</p>
        <button onClick={() => navigate('/jobs')} className="wd-btn wd-btn-call" style={{ maxWidth: 200, margin: '0 auto' }}>Go Back</button>
      </div>
    );
  }

  const coverImageUrl = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80';
  const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.employer)}&background=0284c7&color=fff&size=128`;

  return (
    <div className="wd-container">
      <div className="wd-top-bar">
        <div className="wd-top-bar-inner">
          <button onClick={() => navigate(-1)} className="wd-back-btn">
            <HiChevronLeft />
          </button>
          <span style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}>Job Details</span>
        </div>
      </div>

      <div className="wd-content">
        <div className="wd-cover">
          <img src={coverImageUrl} alt="Cover" />
          <div className="wd-badge-location">
             <HiLocationMarker style={{ color: '#0284c7' }} /> {job.location}
          </div>
        </div>

        <div className="wd-details-card">
          <div className="wd-profile-header">
            <img src={logoUrl} alt={job.employer} className="wd-avatar" style={{ borderRadius: '16px' }} />
            <div>
              <h1 className="wd-name" style={{ fontSize: '24px' }}>{job.title}</h1>
              <p className="wd-category">{job.employer}</p>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px', fontSize: '15px', color: '#475569', lineHeight: '1.7' }}>
            <p>{job.description}</p>
          </div>

          {job.conditions && job.conditions !== 'None' && (
            <div style={{ margin: '0 24px 24px', padding: '16px', background: '#fef2f2', color: '#991b1b', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6' }}>
              <strong>Important Conditions: </strong> {job.conditions}
            </div>
          )}

          <div className="wd-info-grid">
            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹</span>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Salary / Pay</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{job.pay}</div>
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <HiBriefcase />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Job Type</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{job.type}</div>
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#fce7f3', color: '#be185d' }}>
                <HiClock />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Experience Req.</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{job.experience}</div>
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <HiLightningBolt />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Skills Required</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{job.skills}</div>
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                <HiAcademicCap />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Passing Year</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{job.yearOfPassing}</div>
              </div>
            </div>

            <div className="wd-info-item">
              <div className="wd-info-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                <HiDocumentText />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>Departments</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{job.departments}</div>
              </div>
            </div>
          </div>

          <hr className="wd-divider" />
          
          <div style={{ padding: '0 24px 24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <HiPhone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Phone</div>
                  <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{job.phone}</div>
                </div>
              </div>

              {job.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <HiMail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Email</div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '500' }}>{job.email}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '24px' }}>
              <span>Posted on {job.postedAt}</span>
              <span>{job.urgency} Urgency</span>
            </div>
          </div>
        </div>
      </div>

      <div className="wd-bottom-bar">
        {job.isExpired ? (
          <div style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
            <HiExclamationCircle /> This position is no longer accepting applications.
          </div>
        ) : (
          <>
            {job.applyLink ? (
              <a href={job.applyLink} target="_blank" rel="noreferrer" className="wd-btn wd-btn-chat" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                Apply Link
              </a>
            ) : (
              <a href={`tel:${job.phone}`} className="wd-btn wd-btn-chat" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                <HiPhone /> Apply Now
              </a>
            )}
            
            {job.pdf ? (
              <a href={job.pdf} target="_blank" rel="noreferrer" className="wd-btn wd-btn-call" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                <HiDocumentText /> View JD
              </a>
            ) : (
              <button className="wd-btn wd-btn-call" style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }}>
                No JD PDF
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
