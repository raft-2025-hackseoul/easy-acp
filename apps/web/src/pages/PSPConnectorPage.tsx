import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import './PSPConnectorPage.css';

export function PSPConnectorPage() {
  const { workflow, workflowData, updateStep, updatePSPConnector, currentUser } = useWorkflow();
  const [selectedPSP, setSelectedPSP] = useState<'stripe' | 'own-psp' | ''>('');
  const [checklist, setChecklist] = useState({
    docs_reviewed: false,
    pci_compliant: false,
    integration_ready: false,
  });

  const pspStep = workflow.steps.find((s) => s.tool === 'psp-connector');

  const handlePSPSelection = (psp: 'stripe' | 'own-psp') => {
    setSelectedPSP(psp);
    updatePSPConnector({
      pspType: psp,
      status: 'in-progress',
    });

    if (pspStep) {
      updateStep(pspStep.id, {
        status: 'in-progress',
      });
    }
  };

  const handleChecklistChange = (key: keyof typeof checklist) => {
    const newChecklist = { ...checklist, [key]: !checklist[key] };
    setChecklist(newChecklist);

    const allChecked = Object.values(newChecklist).every((v) => v);
    if (allChecked) {
      updatePSPConnector({
        status: 'completed',
        documentsReviewed: true,
        completedBy: currentUser,
        completedAt: new Date(),
      });

      if (pspStep) {
        updateStep(pspStep.id, {
          status: 'completed',
          completedBy: currentUser,
          completedAt: new Date(),
        });
      }
    }
  };

  return (
    <div className="psp-connector-page">
      <div className="page-header">
        <h1>💳 PSP Connector</h1>
        <p className="page-subtitle">Connect your payment service provider</p>
      </div>

      <div className="psp-selection">
        <h2>Choose Your Payment Provider</h2>
        <div className="psp-options">
          <div
            className={`psp-option ${selectedPSP === 'stripe' ? 'selected' : ''}`}
            onClick={() => handlePSPSelection('stripe')}
          >
            <h3>Stripe</h3>
            <p>Recommended for most merchants</p>
            <ul>
              <li>Fast setup</li>
              <li>ACP-ready integration</li>
              <li>Built-in PCI compliance</li>
            </ul>
          </div>

          <div
            className={`psp-option ${selectedPSP === 'own-psp' ? 'selected' : ''}`}
            onClick={() => handlePSPSelection('own-psp')}
          >
            <h3>Own PSP / PCI DSS</h3>
            <p>For enterprises with existing payment systems</p>
            <ul>
              <li>Custom integration</li>
              <li>Requires PCI DSS compliance</li>
              <li>More control</li>
            </ul>
          </div>
        </div>
      </div>

      {selectedPSP && (
        <div className="psp-checklist">
          <h3>Integration Checklist</h3>
          <div className="checklist-items">
            <label className="checklist-item">
              <input
                type="checkbox"
                checked={checklist.docs_reviewed}
                onChange={() => handleChecklistChange('docs_reviewed')}
              />
              <span>Review {selectedPSP === 'stripe' ? 'Stripe' : 'PSP'} documentation</span>
            </label>

            <label className="checklist-item">
              <input
                type="checkbox"
                checked={checklist.pci_compliant}
                onChange={() => handleChecklistChange('pci_compliant')}
              />
              <span>Ensure PCI compliance</span>
            </label>

            <label className="checklist-item">
              <input
                type="checkbox"
                checked={checklist.integration_ready}
                onChange={() => handleChecklistChange('integration_ready')}
              />
              <span>Integration ready for deployment</span>
            </label>
          </div>
        </div>
      )}

      <div className="psp-resources">
        <h3>📚 Resources</h3>
        {selectedPSP === 'stripe' ? (
          <ul>
            <li>
              <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer">
                Stripe Documentation
              </a>
            </li>
            <li>
              <a href="https://stripe.com/docs/connect" target="_blank" rel="noopener noreferrer">
                Stripe Connect for ACP
              </a>
            </li>
          </ul>
        ) : selectedPSP === 'own-psp' ? (
          <ul>
            <li>
              <a
                href="https://www.pcisecuritystandards.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                PCI DSS Standards
              </a>
            </li>
            <li>
              <a
                href="https://developers.openai.com/commerce"
                target="_blank"
                rel="noopener noreferrer"
              >
                ACP Payment Integration Guide
              </a>
            </li>
          </ul>
        ) : null}
      </div>

      {workflowData.pspConnector.completedBy && (
        <div className="completion-info">
          <p>
            <strong>Completed by:</strong> {workflowData.pspConnector.completedBy.name}
          </p>
          {workflowData.pspConnector.completedAt && (
            <p>
              <strong>Completed on:</strong>{' '}
              {new Date(workflowData.pspConnector.completedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
