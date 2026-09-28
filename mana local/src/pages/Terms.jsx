import React, { useEffect } from 'react';
import './Policy.css';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page">
      <div className="policy-header-container">
        <h1>Terms & Conditions</h1>
        <p>Effective Date: December 2026</p>
      </div>
      <div className="policy-container">
        <div className="policy-section">
          <h2>1. Introduction</h2>
          <p>Welcome to Mana Local. These terms govern your use of our website, application, and platform services. By accessing our platform, you signify your agreement to these terms.</p>
        </div>
        <div className="policy-section">
          <h2>2. Definitions</h2>
          <p>"Platform" refers to the Mana Local website and mobile application. "User" refers to customers. "Worker" refers to independent professionals providing services.</p>
        </div>
        <div className="policy-section">
          <h2>3. Acceptance of Terms</h2>
          <p>By creating an account or using any part of the platform, you legally bind yourself to these Terms and Conditions. If you do not agree, please do not use the service.</p>
        </div>
        <div className="policy-section">
          <h2>4. Modification of Terms</h2>
          <p>We reserve the right to modify these terms at any time. Changes will be posted on this page, and continued use constitutes acceptance of the new terms.</p>
        </div>
        <div className="policy-section">
          <h2>5. Eligibility</h2>
          <p>You must be at least 18 years old to use this platform and form a legally binding contract.</p>
        </div>
        <div className="policy-section">
          <h2>6. User Accounts and Registration</h2>
          <p>You agree to provide accurate, current, and complete information during registration and keep your account details updated.</p>
        </div>
        <div className="policy-section">
          <h2>7. Platform Role and Services</h2>
          <p>Mana Local is exclusively a technology platform that connects users seeking services with independent workers providing those services.</p>
        </div>
        <div className="policy-section">
          <h2>8. Independent Contractor Status of Workers</h2>
          <p><strong>Workers are strictly independent contractors.</strong> They are not employees, partners, representatives, or agents of Mana Local.</p>
        </div>
        <div className="policy-section">
          <h2>9. Limitation of Liability for Worker Actions</h2>
          <p><strong>We are not responsible for the quality, timing, safety, or legality of the services provided. All such matters are entirely between you and the worker.</strong></p>
        </div>
        <div className="policy-section">
          <h2>10. Booking and Scheduling</h2>
          <p>Bookings made through the platform are requests. The actual scheduling and confirmation are dependent on the worker's availability.</p>
        </div>
        <div className="policy-section">
          <h2>11. Payments and Fees</h2>
          <p>Payment terms must be agreed upon between the user and the worker. Mana Local is not responsible for payment disputes.</p>
        </div>
        <div className="policy-section">
          <h2>12. Cancellations and Refunds</h2>
          <p>Cancellation policies are determined by the individual workers. Mana Local does not guarantee any refunds for services rendered or cancelled.</p>
        </div>
        <div className="policy-section">
          <h2>13. Customer Responsibilities</h2>
          <p>Users must provide a safe environment for workers and accurately describe the scope of work required before the worker arrives.</p>
        </div>
        <div className="policy-section">
          <h2>14. Worker Responsibilities</h2>
          <p>Workers are expected to act professionally and safely, but Mana Local bears no liability if they fail to do so.</p>
        </div>
        <div className="policy-section">
          <h2>15. Reviews and Ratings</h2>
          <p>Users may leave reviews. We are not responsible for the content of these reviews but reserve the right to remove inappropriate content.</p>
        </div>
        <div className="policy-section">
          <h2>16. Prohibited Conduct</h2>
          <p>Users may not use the platform for any illegal activities, harassment, fraud, or circumvention of the platform's systems.</p>
        </div>
        <div className="policy-section">
          <h2>17. Intellectual Property</h2>
          <p>All content on the platform, including logos and text, is the property of Mana Local and is protected by copyright laws.</p>
        </div>
        <div className="policy-section">
          <h2>18. User Content</h2>
          <p>By posting content, you grant Mana Local a non-exclusive license to use, modify, and display that content on the platform.</p>
        </div>
        <div className="policy-section">
          <h2>19. Third-Party Links</h2>
          <p>Our platform may contain links to third-party sites. We are not responsible for the content or practices of these external sites.</p>
        </div>
        <div className="policy-section">
          <h2>20. Disclaimer of Warranties</h2>
          <p>The platform is provided "as is" and "as available" without any warranties, express or implied.</p>
        </div>
        <div className="policy-section">
          <h2>21. Platform Availability</h2>
          <p>We do not guarantee that the platform will always be available, secure, or free from bugs or viruses.</p>
        </div>
        <div className="policy-section">
          <h2>22. Indemnification</h2>
          <p>You agree to indemnify and hold harmless Mana Local against any claims or damages arising from your use of the platform or your interactions with workers.</p>
        </div>
        <div className="policy-section">
          <h2>23. Dispute Resolution</h2>
          <p>Any disputes arising out of your use of the platform shall be resolved through binding arbitration.</p>
        </div>
        <div className="policy-section">
          <h2>24. Governing Law</h2>
          <p>These terms shall be governed by the laws of India, without regard to its conflict of law provisions.</p>
        </div>
        <div className="policy-section">
          <h2>25. Contact Information</h2>
          <p>For any questions regarding these Terms, please contact us at info@ourlocal.in.</p>
        </div>
      </div>
    </div>
  );
}
