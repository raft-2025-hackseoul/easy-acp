import { useWorkflow } from '../../context/WorkflowContext';
import { Link } from 'react-router-dom';
import './WorkflowRoadmap.css';

export function WorkflowRoadmap() {
  const { workflow } = useWorkflow();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'verified':
        return '✓✓';
      case 'in-progress':
        return '⏳';
      default:
        return '○';
    }
  };

  const getStatusClass = (status: string) => {
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

  const getToolPath = (tool: string) => {
    return `/${tool}`;
  };

  return (
    <div className="workflow-roadmap">
      <h2>ACP Integration Roadmap</h2>
      <p className="roadmap-subtitle">Follow these steps to complete your ACP integration</p>

      <div className="roadmap-steps">
        {workflow.steps.map((step, index) => (
          <div key={step.id} className="roadmap-step-wrapper">
            <Link to={getToolPath(step.tool)} className="roadmap-step">
              <div className={`step-indicator ${getStatusClass(step.status)}`}>
                <div className="step-number">{index + 1}</div>
                <div className="step-status-icon">{getStatusIcon(step.status)}</div>
              </div>

              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>

                {step.assignedTo && (
                  <div className="step-assignment">
                    <span className="assignment-label">Assigned to:</span>
                    <span className="assignment-user">{step.assignedTo.name}</span>
                  </div>
                )}

                {step.completedBy && step.completedAt && (
                  <div className="step-completion">
                    <span className="completion-label">Completed by:</span>
                    <span className="completion-user">{step.completedBy.name}</span>
                    <span className="completion-time">
                      on {new Date(step.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className={`step-badge ${getStatusClass(step.status)}`}>
                {step.status.replace('-', ' ')}
              </div>
            </Link>

            {index < workflow.steps.length - 1 && (
              <div className="step-connector">
                <div className="connector-line"></div>
                <div className="connector-arrow">↓</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
