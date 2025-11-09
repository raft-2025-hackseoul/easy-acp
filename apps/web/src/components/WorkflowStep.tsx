import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkflowStepProps {
  title: string;
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function WorkflowStep({ 
  title, 
  stepNumber, 
  isActive, 
  isCompleted, 
  children,
  defaultExpanded = false 
}: WorkflowStepProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || isActive);

  return (
    <div className={`workflow-step mb-6 rounded-lg border ${
      isActive ? 'border-blue-500' : isCompleted ? 'border-green-500' : 'border-gray-200'
    } ${!isActive && !isCompleted ? 'opacity-75' : ''}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${
          !isActive && !isCompleted ? 'cursor-default' : 'cursor-pointer'
        }`}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className={`rounded-full w-8 h-8 flex items-center justify-center ${
            isCompleted ? 'bg-green-500 text-white' : 
            isActive ? 'bg-blue-500 text-white' : 
            'bg-gray-100 text-gray-500 border border-gray-300'
          }`}>
            {stepNumber}
          </span>
          <h2 className={`text-lg ${
            isCompleted ? 'text-green-700' :
            isActive ? 'text-blue-700' :
            'text-gray-500'
          } font-medium`}>
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="text-green-600 text-sm">Completed</span>
          )}
          {(isActive || isCompleted) && (
            isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )
          )}
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (isActive || isCompleted) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}