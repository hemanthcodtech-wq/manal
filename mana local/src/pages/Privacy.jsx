import React, { useEffect } from 'react';
import './Policy.css';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page">
      <div className="policy-header-container">
        <h1>Privacy Policy</h1>
        <p>Effective Date: December 2026</p>
      </div>
      <div className="policy-container">
        <div className="policy-section">
          <h2>1. Introduction</h2>
          <p>Mana Local values your privacy. This Privacy Policy details how we collect, use, and protect your information.</p>
        </div>
        <div className="policy-section">
          <h2>2. Information We Collect</h2>
          <p>We collect information directly from you when you register, make a booking, or interact with our platform.</p>
        </div>
        <div className="policy-section">
          <h2>3. Personal Data</h2>
          <p>This includes your name, email address, phone number, and physical address necessary for service delivery.</p>
        </div>
        <div className="policy-section">
          <h2>4. Usage Data</h2>
          <p>We automatically collect information about how you interact with our platform, such as pages visited and time spent.</p>
        </div>
        <div className="policy-section">
          <h2>5. Location Information</h2>
          <p>We collect precise or approximate location data to connect you with nearby workers and facilitate service delivery.</p>
        </div>
        <div className="policy-section">
          <h2>6. Device Information</h2>
          <p>We collect device specifics such as hardware model, operating system, and browser type to optimize our platform.</p>
        </div>
        <div className="policy-section">
          <h2>7. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar technologies to track activity on our service and hold certain information for improved user experience.</p>
        </div>
        <div className="policy-section">
          <h2>8. How We Use Your Information</h2>
          <p>Your data is used to provide, maintain, and improve our platform, and to process your requests securely.</p>
        </div>
        <div className="policy-section">
          <h2>9. Facilitating Services</h2>
          <p>We use your information strictly to connect you with independent professionals who can fulfill your requested services.</p>
        </div>
        <div className="policy-section">
          <h2>10. Communicating with You</h2>
          <p>We use your contact details to send service updates, security alerts, and support messages.</p>
        </div>
        <div className="policy-section">
          <h2>11. Improving Our Platform</h2>
          <p>Data analysis helps us understand usage patterns, debug issues, and develop new features.</p>
        </div>
        <div className="policy-section">
          <h2>12. Marketing and Promotions</h2>
          <p>With your consent, we may send promotional emails. You can opt-out of these communications at any time.</p>
        </div>
        <div className="policy-section">
          <h2>13. Information Sharing with Workers</h2>
          <p><strong>Crucial Note:</strong> We share your necessary details (address, phone number) with workers so they can provide the service. We are not responsible for how workers handle this information offline.</p>
        </div>
        <div className="policy-section">
          <h2>14. Limitation of Liability on Data Handling by Workers</h2>
          <p><strong>We provide the workers, but we are not responsible for all such things</strong> regarding their personal handling of your data once shared.</p>
        </div>
        <div className="policy-section">
          <h2>15. Third-Party Service Providers</h2>
          <p>We may share your data with trusted third parties for payment processing, analytics, and cloud storage.</p>
        </div>
        <div className="policy-section">
          <h2>16. Legal Compliance and Protection</h2>
          <p>We may disclose your information if required by law or to protect the rights, property, or safety of Mana Local or others.</p>
        </div>
        <div className="policy-section">
          <h2>17. Business Transfers</h2>
          <p>In the event of a merger, acquisition, or asset sale, your Personal Data may be transferred.</p>
        </div>
        <div className="policy-section">
          <h2>18. Data Retention</h2>
          <p>We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy.</p>
        </div>
        <div className="policy-section">
          <h2>19. Data Security</h2>
          <p>We use commercially acceptable means to protect your data, but no transmission method over the internet is 100% secure.</p>
        </div>
        <div className="policy-section">
          <h2>20. Your Privacy Rights</h2>
          <p>You have the right to request access, correction, or deletion of your personal data at any time.</p>
        </div>
        <div className="policy-section">
          <h2>21. Accessing and Updating Information</h2>
          <p>You can review and edit your personal information by logging into your account settings.</p>
        </div>
        <div className="policy-section">
          <h2>22. Opt-Out Options</h2>
          <p>You can opt-out of targeted advertising and marketing communications through your account preferences.</p>
        </div>
        <div className="policy-section">
          <h2>23. Children's Privacy</h2>
          <p>Our service does not address anyone under the age of 18. We do not knowingly collect data from children.</p>
        </div>
        <div className="policy-section">
          <h2>24. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy periodically. We will notify you of any changes by posting the new policy on this page.</p>
        </div>
        <div className="policy-section">
          <h2>25. Contact Us Regarding Privacy</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@ourlocal.in.</p>
        </div>
      </div>
    </div>
  );
}
