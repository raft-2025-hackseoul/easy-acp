import { useState } from 'react';
import './EcommerceIntegration.css';

interface EcommerceIntegrationProps {
  onConnect: (provider: string, apiToken: string) => void;
  isLoading: boolean;
}

export function EcommerceIntegration({ onConnect, isLoading }: EcommerceIntegrationProps) {
  const [apiToken, setApiToken] = useState('');

  const handleConnect = () => {
    if (apiToken.trim()) {
      onConnect('woocommerce', apiToken.trim());
    }
  };

  return (
    <div className="ecommerce-integration">
      <div className="integration-card">
        <div className="card-header">
          <h3>WooCommerce Integration</h3>
          <p>Connect your store to sync products</p>
        </div>

        <div className="card-content">
          <div className="input-group">
            <label htmlFor="api-token" className="input-label">
              API Token
            </label>
            <input
              id="api-token"
              type="text"
              className="input-field"
              placeholder="Enter your API token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              disabled={isLoading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && apiToken.trim()) {
                  handleConnect();
                }
              }}
            />
            <p className="input-help">Demo mode: any token will work</p>
          </div>

          <button
            onClick={handleConnect}
            className="connect-button"
            disabled={!apiToken.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Fetching Products...
              </>
            ) : (
              'Connect & Fetch Products'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
