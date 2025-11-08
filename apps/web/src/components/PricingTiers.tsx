import './PricingTiers.css';

export function PricingTiers() {
  return (
    <div className="pricing-tiers">
      <h2>Choose Your Plan</h2>
      <p className="pricing-subtitle">Select the option that works best for you</p>

      <div className="tiers-grid">
        {/* Free Tier */}
        <div className="tier-card free">
          <div className="tier-badge">Most Popular</div>
          <h3>DIY (Free)</h3>
          <div className="tier-price">
            <span className="price">$0</span>
            <span className="period">forever</span>
          </div>

          <p className="tier-description">
            Perfect for developers and technical teams who want full control
          </p>

          <ul className="tier-features">
            <li>
              <span className="check">✓</span> Upload CSV files
            </li>
            <li>
              <span className="check">✓</span> AI-powered field mapping
            </li>
            <li>
              <span className="check">✓</span> ACP compliance validation
            </li>
            <li>
              <span className="check">✓</span> Export to CSV/JSON
            </li>
            <li>
              <span className="check">✓</span> Unlimited products
            </li>
            <li>
              <span className="check">✓</span> Manual integration
            </li>
          </ul>

          <div className="tier-note">
            <strong>You integrate it yourself</strong>
            <p>Download the ACP-compliant feed and integrate it with your OpenAI Commerce setup</p>
          </div>
        </div>

        {/* Managed Tier */}
        <div className="tier-card managed">
          <div className="tier-badge premium">Premium</div>
          <h3>Managed Service</h3>
          <div className="tier-price">
            <span className="price">Contact Us</span>
          </div>

          <p className="tier-description">
            Let us handle everything - just upload and forget
          </p>

          <ul className="tier-features">
            <li>
              <span className="check">✓</span> Everything in Free tier
            </li>
            <li>
              <span className="check">✓</span> Automatic deployment
            </li>
            <li>
              <span className="check">✓</span> Feed hosting & management
            </li>
            <li>
              <span className="check">✓</span> Auto-sync (every 15 min)
            </li>
            <li>
              <span className="check">✓</span> ChatGPT integration
            </li>
            <li>
              <span className="check">✓</span> Priority support
            </li>
            <li>
              <span className="check">✓</span> Performance monitoring
            </li>
            <li>
              <span className="check">✓</span> Custom webhooks
            </li>
          </ul>

          <div className="tier-note premium">
            <strong>Fire and Forget</strong>
            <p>We deploy, manage, and maintain your ACP feed. You don't need to do anything else!</p>
          </div>

          <button className="tier-cta">Contact Sales</button>
        </div>
      </div>

      <div className="comparison-note">
        <p>
          <strong>Not sure which to choose?</strong> Start with the free tier and upgrade to managed
          service anytime when you need hands-off automation.
        </p>
      </div>
    </div>
  );
}
