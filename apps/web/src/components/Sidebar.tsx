import { Link, useLocation } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import './Sidebar.css';

export function Sidebar() {
  const location = useLocation();
  const { workflow } = useWorkflow();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return 'completed';
      case 'in-progress':
        return 'in-progress';
      default:
        return 'not-started';
    }
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/api-validator', label: 'API Validator' },
    { path: '/psp-connector', label: 'PSP Connector' },
    { path: '/product-feed', label: 'Product Feed' },
    { path: '/ai-seo', label: 'AI SEO' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <Link to="/">
          <h1>Easy ACP</h1>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-nav-link ${isActive(link.path) ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* ACP Integration Roadmap */}
      <div className="sidebar-roadmap">
        <h3>ACP Integration</h3>
        <div className="roadmap-steps">
          {workflow.steps.map((step, index) => (
            <Link
              key={step.id}
              to={`/${step.tool}`}
              className={`roadmap-step ${getStatusDot(step.status)}`}
            >
              <span className="step-dot"></span>
              <span className="step-label">{step.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
