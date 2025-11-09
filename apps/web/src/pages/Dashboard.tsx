import { useWorkflow } from '../context/WorkflowContext';
import { motion } from 'framer-motion';
import './Dashboard.css';

export function Dashboard() {
  const { workflow } = useWorkflow();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="dashboard">
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            {...fadeInUp}
          >
            Simplify Your E-commerce Integration
          </motion.h1>
          <motion.p 
            className="hero-description"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Transform your online store into an AI-ready commerce platform effortlessly
          </motion.p>
        </div>
      </motion.div>

      <div className="key-features">
        <motion.div 
          className="feature-card"
          {...fadeInUp}
          transition={{ delay: 0.3 }}
        >
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <path d="M12 22.08V12"/>
            </svg>
          </div>
          <h3>AI Compatibility</h3>
          <p>Make your products instantly discoverable and purchasable through AI agents</p>
        </motion.div>

        <motion.div 
          className="feature-card"
          {...fadeInUp}
          transition={{ delay: 0.4 }}
        >
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3>Automation-Driven</h3>
          <p>Auto-map and validate product fields with minimal human input</p>
        </motion.div>

        <motion.div 
          className="feature-card"
          {...fadeInUp}
          transition={{ delay: 0.5 }}
        >
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
          </div>
          <h3>AI-Powered Insights</h3>
          <p>Get smart recommendations for missing fields and SEO optimization</p>
        </motion.div>

        <motion.div 
          className="feature-card"
          {...fadeInUp}
          transition={{ delay: 0.6 }}
        >
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
          <h3>Multi-Commerce Ready</h3>
          <p>Export to major commerce APIs beyond ACP</p>
        </motion.div>
      </div>
    </div>
  );
}
