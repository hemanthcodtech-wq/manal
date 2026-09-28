import React, { useEffect } from 'react';
import './Policy.css';

export default function Disclaimer() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page">
      <div className="policy-header-container">
        <h1>Disclaimer</h1>
        <p>Effective Date: December 2026</p>
      </div>
      <div className="policy-container">
        <div className="policy-section">
          <h2>1. General Information</h2>
          <p>The information and services provided by Mana Local are for general informational and matching purposes only.</p>
        </div>
        <div className="policy-section">
          <h2>2. Not an Employer</h2>
          <p>Mana Local is purely a technology platform. We are not an employer, agency, or contractor of the workers listed on the site.</p>
        </div>
        <div className="policy-section">
          <h2>3. Independent Service Providers</h2>
          <p>All professionals and workers on our platform operate as independent contractors and run their own separate businesses.</p>
        </div>
        <div className="policy-section">
          <h2>4. Explicit Disclaimer of Worker Actions</h2>
          <p><strong>We provide a platform for workers, but we are not responsible for all such things</strong> relating to the actual service execution.</p>
        </div>
        <div className="policy-section">
          <h2>5. No Guarantee of Service Quality</h2>
          <p>We make no representations or warranties regarding the quality, reliability, or timing of the services provided by the workers.</p>
        </div>
        <div className="policy-section">
          <h2>6. Background Checks and Verification</h2>
          <p>While we may perform basic checks, we do not guarantee the accuracy of worker backgrounds. Users must exercise their own judgment.</p>
        </div>
        <div className="policy-section">
          <h2>7. Assumption of Risk</h2>
          <p>You agree that using the platform and booking services carries inherent risks, which you assume entirely by using the service.</p>
        </div>
        <div className="policy-section">
          <h2>8. Dispute Resolution Between Users</h2>
          <p>Any disputes regarding service quality or payment must be resolved directly between the customer and the worker.</p>
        </div>
        <div className="policy-section">
          <h2>9. Financial Transactions</h2>
          <p>Mana Local is not liable for any financial disputes, overcharges, or losses incurred during transactions between you and the worker.</p>
        </div>
        <div className="policy-section">
          <h2>10. Property Damage</h2>
          <p>We are strictly not liable for any damage caused to your property by any worker booked through our platform.</p>
        </div>
        <div className="policy-section">
          <h2>11. Personal Injury</h2>
          <p>Mana Local holds no liability for any personal injury sustained by you or the worker during the provision of services.</p>
        </div>
        <div className="policy-section">
          <h2>12. Compliance with Laws</h2>
          <p>Workers are solely responsible for ensuring they have the necessary licenses and comply with local laws and regulations.</p>
        </div>
        <div className="policy-section">
          <h2>13. Content Accuracy</h2>
          <p>We do not warrant that descriptions, pricing, or other content provided by workers on our platform is accurate or complete.</p>
        </div>
        <div className="policy-section">
          <h2>14. Platform Availability</h2>
          <p>We do not guarantee uninterrupted access to the platform and will not be liable for any downtime or technical failures.</p>
        </div>
        <div className="policy-section">
          <h2>15. Third-Party Links</h2>
          <p>Links to external websites are provided for convenience only and do not constitute an endorsement by Mana Local.</p>
        </div>
        <div className="policy-section">
          <h2>16. Endorsement Disclaimer</h2>
          <p>Listing a worker on our platform does not constitute an endorsement or recommendation of their specific services by Mana Local.</p>
        </div>
        <div className="policy-section">
          <h2>17. Warranty Disclaimer</h2>
          <p>The platform is provided entirely "as is". We disclaim all implied warranties, including merchantability and fitness for a particular purpose.</p>
        </div>
        <div className="policy-section">
          <h2>18. Indemnification</h2>
          <p>You agree to indemnify Mana Local against any claims made by third parties arising from your interactions with workers.</p>
        </div>
        <div className="policy-section">
          <h2>19. Tax Liabilities</h2>
          <p>Users and workers are solely responsible for their own tax reporting and liabilities regarding payments made for services.</p>
        </div>
        <div className="policy-section">
          <h2>20. Insurance Coverage</h2>
          <p>Mana Local does not provide insurance coverage for services. Users should verify if workers carry adequate liability insurance.</p>
        </div>
        <div className="policy-section">
          <h2>21. Emergency Situations</h2>
          <p>Our platform is not designed for emergency services. In emergencies, please contact local authorities immediately.</p>
        </div>
        <div className="policy-section">
          <h2>22. Unforeseen Circumstances (Force Majeure)</h2>
          <p>We are not liable for any failure to perform obligations due to natural disasters, strikes, or other events beyond our control.</p>
        </div>
        <div className="policy-section">
          <h2>23. Changes to Platform</h2>
          <p>We reserve the right to modify, suspend, or discontinue any part of the platform without prior notice.</p>
        </div>
        <div className="policy-section">
          <h2>24. Severability</h2>
          <p>If any provision of this disclaimer is found to be unenforceable, the remaining provisions will continue in full force.</p>
        </div>
        <div className="policy-section">
          <h2>25. Acknowledgement of Disclaimer</h2>
          <p>By using Mana Local, you acknowledge that you have read, understood, and agreed to all terms within this disclaimer.</p>
        </div>
      </div>
    </div>
  );
}
