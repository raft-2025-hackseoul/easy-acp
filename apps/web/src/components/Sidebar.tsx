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
    { 
      path: '/', 
      label: 'Dashboard',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    { 
      path: '/product-feed', 
      label: 'Product Feed',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    },
    { 
      path: '/ai-seo', 
      label: 'AI SEO',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    }
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
            <div className="nav-icon-container">
              {link.icon}
            </div>
            <span className="nav-label">{link.label}</span>
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
