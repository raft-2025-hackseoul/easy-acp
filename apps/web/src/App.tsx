import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { WorkflowProvider } from './context/WorkflowContext';
import { Dashboard } from './pages/Dashboard';
import { APIValidatorPage } from './pages/APIValidatorPage';
import { PSPConnectorPage } from './pages/PSPConnectorPage';
import { ProductFeedPage } from './pages/ProductFeedPage';
import './App.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="main-nav">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          🚀 Easy ACP
        </Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/api-validator" className={location.pathname === '/api-validator' ? 'active' : ''}>
            API Validator
          </Link>
          <Link to="/psp-connector" className={location.pathname === '/psp-connector' ? 'active' : ''}>
            PSP Connector
          </Link>
          <Link to="/product-feed" className={location.pathname === '/product-feed' ? 'active' : ''}>
            Product Feed
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <WorkflowProvider>
        <div className="App">
          <Navigation />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/api-validator" element={<APIValidatorPage />} />
              <Route path="/psp-connector" element={<PSPConnectorPage />} />
              <Route path="/product-feed" element={<ProductFeedPage />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <p>
              Built with ❤️ for merchants | <a href="#docs">Documentation</a> | <a href="#support">Support</a>
            </p>
            <p className="footer-note">
              Powered by OpenAI Agentic Commerce Protocol (ACP) |{' '}
              <a href="https://developers.openai.com/commerce" target="_blank" rel="noopener noreferrer">
                Learn More
              </a>
            </p>
          </footer>
        </div>
      </WorkflowProvider>
    </Router>
  );
}

export default App;
