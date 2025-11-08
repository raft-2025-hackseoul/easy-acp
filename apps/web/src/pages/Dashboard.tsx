import { WorkflowRoadmap } from '../components/workflow/WorkflowRoadmap';
import { useWorkflow } from '../context/WorkflowContext';
import './Dashboard.css';

export function Dashboard() {
  const { workflow, workflowData } = useWorkflow();

  const completedSteps = workflow.steps.filter(
    (step) => step.status === 'completed' || step.status === 'verified'
  ).length;
  const totalSteps = workflow.steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🚀 Easy ACP Platform</h1>
        <p className="dashboard-tagline">Complete ACP Integration in 3 Simple Steps</p>
      </div>

      <div className="dashboard-progress">
        <h3>Overall Progress</h3>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-stats">
          <span>
            {completedSteps} of {totalSteps} steps completed
          </span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
      </div>

      <WorkflowRoadmap />

      <div className="tool-cards">
        <div className="tool-card">
          <div className="tool-icon">🔌</div>
          <h3>API Validator</h3>
          <p>Create and validate your ACP-compliant API endpoints</p>
          <div className="tool-status">
            Status:{' '}
            <span className={`status-badge ${workflowData.apiValidator.status}`}>
              {workflowData.apiValidator.status}
            </span>
          </div>
        </div>

        <div className="tool-card">
          <div className="tool-icon">💳</div>
          <h3>PSP Connector</h3>
          <p>Connect your payment service provider (Stripe or own PSP)</p>
          <div className="tool-status">
            Status:{' '}
            <span className={`status-badge ${workflowData.pspConnector.status}`}>
              {workflowData.pspConnector.status}
            </span>
          </div>
        </div>

        <div className="tool-card">
          <div className="tool-icon">📦</div>
          <h3>Product Feed Automator</h3>
          <p>Convert your product catalog to ACP-compliant format</p>
          <div className="tool-status">
            Status:{' '}
            <span className={`status-badge ${workflowData.productFeed.status}`}>
              {workflowData.productFeed.status}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="help-section">
          <h4>Need Help?</h4>
          <p>Check out our <a href="#docs">ACP Guidelines</a> or contact support</p>
        </div>
      </div>
    </div>
  );
}
