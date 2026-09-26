import React, { useState, useEffect } from 'react';
import { HiLocationMarker, HiMap, HiClock, HiCurrencyRupee, HiBriefcase, HiSearch, HiPhone, HiChip, HiLightningBolt, HiDocumentText, HiOfficeBuilding, HiAcademicCap, HiMail, HiExclamationCircle } from 'react-icons/hi';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Jobs.css';

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useScrollReveal([searchQuery, jobs]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/admin/jobs');
        const data = await res.json();
        if (data.success) {
          // Map backend jobs to frontend format
          const formatted = data.jobs.map(j => {
            const isExpired = j.status === 'expired' || (j.expiration_date && new Date(j.expiration_date) < new Date());
            return {
              id: j.id,
              title: j.title,
              type: j.job_type || 'Full-time',
              location: j.location || 'Remote / Local',
              urgency: j.urgency || 'Medium',
              employer: j.company_name || j.customer_name || 'Anonymous',
              pay: j.amount ? `₹${parseFloat(j.amount).toLocaleString()}` : 'Negotiable',
              description: j.description || 'No description provided.',
              distance: '2.5',
              postedAt: new Date(j.created_at).toLocaleDateString(),
              phone: j.hr_phone || 'Not provided',
              email: j.hr_email || '',
              skills: j.skills || 'Not specified',
              experience: j.experience || 'Not specified',
              pdf: j.job_description_pdf || null,
              yearOfPassing: j.year_of_passing || 'Any',
              departments: j.departments_allowed || 'Any',
              conditions: j.conditions || 'None',
              applyLink: j.apply_link || '',
              isExpired: isExpired,
              displayStatus: isExpired ? 'Expired' : 'Available'
            };
          });
          setJobs(formatted);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(lowerQuery) ||
      job.type.toLowerCase().includes(lowerQuery) ||
      job.location.toLowerCase().includes(lowerQuery) ||
      job.skills.toLowerCase().includes(lowerQuery) ||
      job.employer.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="jobs-page" ref={containerRef}>
      <div className="jobs-header reveal-fade-in">
        <div className="jh-content">
          <h1>Find Local Jobs & Internships</h1>
          <p>Browse {filteredJobs.length} active opportunities across different companies</p>
        </div>
        <div className="jh-search">
          <HiSearch className="jh-search-icon" />
          <input 
            type="text" 
            placeholder="Search by title, skills, company, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="jobs-grid">
        {loading ? (
          <p style={{ textAlign: 'center', width: '100%' }}>Loading jobs...</p>
        ) : filteredJobs.map(job => (
          <div key={job.id} className={`job-card reveal-on-scroll ${job.isExpired ? 'expired-card' : ''}`}>
            <div className="jc-header">
              <div>
                {job.isExpired ? (
                  <span className="urgency-badge" style={{background: '#f1f5f9', color: '#64748b'}}>Expired</span>
                ) : (
                  <span className={`urgency-badge ${job.urgency.toLowerCase()}`}>{job.urgency} Urgency</span>
                )}
                <h3>{job.title}</h3>
                <span className="jc-employer"><HiOfficeBuilding style={{marginBottom: '-2px'}}/> {job.employer}</span>
              </div>
              <div className="jc-pay">
                <HiCurrencyRupee className="pay-icon" />
                <strong>{job.pay}</strong>
              </div>
            </div>

            <p className="jc-desc">{job.description}</p>
            {job.conditions && job.conditions !== 'None' && (
               <div style={{fontSize: '12px', color: '#64748b', marginBottom: '16px', padding: '8px', background: '#f8fafc', borderRadius: '8px'}}>
                 <strong>Conditions:</strong> {job.conditions}
               </div>
            )}

            <div className="jc-meta">
              <div className="jc-meta-item">
                <HiBriefcase className="jc-icon" />
                <span>{job.type}</span>
              </div>
              <div className="jc-meta-item">
                <HiLocationMarker className="jc-icon" />
                <span>{job.location}</span>
              </div>
              <div className="jc-meta-item">
                <HiClock className="jc-icon" />
                <span>Exp: {job.experience}</span>
              </div>
              <div className="jc-meta-item">
                <HiAcademicCap className="jc-icon" />
                <span>Pass Year: {job.yearOfPassing}</span>
              </div>
              <div className="jc-meta-item" style={{ flex: '1 1 100%' }}>
                <HiDocumentText className="jc-icon" />
                <span><strong>Depts:</strong> {job.departments}</span>
              </div>
              <div className="jc-meta-item" style={{ flex: '1 1 100%' }}>
                <HiLightningBolt className="jc-icon" />
                <span><strong>Skills:</strong> {job.skills}</span>
              </div>
              {job.phone && job.phone !== 'Not provided' && (
                <div className="jc-meta-item" style={{ flex: '1 1 100%' }}>
                  <HiPhone className="jc-icon" />
                  <span><strong>HR Phone:</strong> <a href={`tel:${job.phone}`}>{job.phone}</a></span>
                </div>
              )}
              {job.email && (
                <div className="jc-meta-item" style={{ flex: '1 1 100%' }}>
                  <HiMail className="jc-icon" />
                  <span><strong>HR Email:</strong> <a href={`mailto:${job.email}`}>{job.email}</a></span>
                </div>
              )}
            </div>

            <div className="jc-footer">
              {job.isExpired ? (
                <div style={{color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 0'}}>
                  <HiExclamationCircle /> This position is no longer accepting applications.
                </div>
              ) : (
                <>
                  {job.applyLink ? (
                    <a href={job.applyLink} target="_blank" rel="noreferrer" className="apply-btn">
                      Apply Link
                    </a>
                  ) : (
                    <a href={`tel:${job.phone}`} className="apply-btn">
                      <HiPhone /> Apply Now
                    </a>
                  )}
                  {job.pdf && (
                    <a href={job.pdf} target="_blank" rel="noreferrer" className="apply-btn" style={{background: '#fff', color: '#3b82f6', border: '1px solid #3b82f6'}}>
                      <HiDocumentText /> View JD (PDF)
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {!loading && filteredJobs.length === 0 && (
          <div className="no-jobs">
            <p>No jobs found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
