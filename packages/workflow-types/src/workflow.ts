/**
 * Workflow and User Tracking Types for ACP Compliance Platform
 */

export type ToolType = 'api-validator' | 'psp-connector' | 'product-feed';

export type StepStatus = 'not-started' | 'in-progress' | 'completed' | 'verified';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'product-manager' | 'non-technical' | 'admin';
}

export interface WorkflowStep {
  id: string;
  tool: ToolType;
  title: string;
  description: string;
  status: StepStatus;
  assignedTo?: User;
  completedBy?: User;
  completedAt?: Date;
  order: number;
  required: boolean;
}

export interface Workflow {
  id: string;
  projectName: string;
  createdAt: Date;
  updatedAt: Date;
  steps: WorkflowStep[];
  currentStep: number;
}

export interface APIValidatorData {
  status: StepStatus;
  apiCreated: boolean;
  apiResponse?: string;
  isValid?: boolean;
  validationErrors?: string[];
  completedBy?: User;
  completedAt?: Date;
}

export interface PSPConnectorData {
  status: StepStatus;
  pspType?: 'stripe' | 'own-psp';
  stripeConnected?: boolean;
  documentsReviewed?: boolean;
  completedBy?: User;
  completedAt?: Date;
}

export interface ProductFeedData {
  status: StepStatus;
  uploadedFile?: string;
  validationResult?: {
    totalRows: number;
    validProducts: number;
    invalidProducts: number;
    missingRequired: string[];
    missingRecommended: string[];
  };
  exportedFeed?: boolean;
  tier?: 'free' | 'managed';
  completedBy?: User;
  completedAt?: Date;
}

export interface WorkflowData {
  apiValidator: APIValidatorData;
  pspConnector: PSPConnectorData;
  productFeed: ProductFeedData;
}
