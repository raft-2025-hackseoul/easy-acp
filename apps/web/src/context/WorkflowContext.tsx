import { createContext, useContext, useState, ReactNode } from 'react';
import type { Workflow, WorkflowStep, User, WorkflowData } from '@repo/workflow-types';

interface WorkflowContextType {
  workflow: Workflow;
  workflowData: WorkflowData;
  updateStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
  updateAPIValidator: (data: Partial<WorkflowData['apiValidator']>) => void;
  updatePSPConnector: (data: Partial<WorkflowData['pspConnector']>) => void;
  updateProductFeed: (data: Partial<WorkflowData['productFeed']>) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const initialWorkflow: Workflow = {
  id: 'workflow-1',
  projectName: 'ACP Integration',
  createdAt: new Date(),
  updatedAt: new Date(),
  currentStep: 0,
  steps: [
    {
      id: 'step-api',
      tool: 'api-validator',
      title: 'API Validator',
      description: 'Create and validate your ACP-compliant API',
      status: 'not-started',
      order: 1,
      required: true,
    },
    {
      id: 'step-psp',
      tool: 'psp-connector',
      title: 'PSP Connector',
      description: 'Connect your payment service provider',
      status: 'not-started',
      order: 2,
      required: true,
    },
    {
      id: 'step-feed',
      tool: 'product-feed',
      title: 'Product Feed Automator',
      description: 'Convert your product catalog to ACP format',
      status: 'not-started',
      order: 3,
      required: true,
    },
  ],
};

const initialWorkflowData: WorkflowData = {
  apiValidator: {
    status: 'not-started',
    apiCreated: false,
  },
  pspConnector: {
    status: 'not-started',
  },
  productFeed: {
    status: 'not-started',
  },
};

const defaultUser: User = {
  id: 'user-1',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'developer',
};

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
  const [workflowData, setWorkflowData] = useState<WorkflowData>(initialWorkflowData);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow((prev) => ({
      ...prev,
      steps: prev.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
      updatedAt: new Date(),
    }));
  };

  const updateAPIValidator = (data: Partial<WorkflowData['apiValidator']>) => {
    setWorkflowData((prev) => ({
      ...prev,
      apiValidator: { ...prev.apiValidator, ...data },
    }));
  };

  const updatePSPConnector = (data: Partial<WorkflowData['pspConnector']>) => {
    setWorkflowData((prev) => ({
      ...prev,
      pspConnector: { ...prev.pspConnector, ...data },
    }));
  };

  const updateProductFeed = (data: Partial<WorkflowData['productFeed']>) => {
    setWorkflowData((prev) => ({
      ...prev,
      productFeed: { ...prev.productFeed, ...data },
    }));
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflow,
        workflowData,
        updateStep,
        updateAPIValidator,
        updatePSPConnector,
        updateProductFeed,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
}
