// src/components/ProgressBar/ProgressBar.tsx
import React from 'react';
import { Progress } from '@heroui/react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showStepNumbers?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  showStepNumbers = true,
  className = ""
}) => {
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className={`w-full max-w-2xl mx-auto mb-8 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progresso
        </span>
        {showStepNumbers && (
          <span className="text-sm text-gray-500">
            {currentStep} de {totalSteps}
          </span>
        )}
      </div>
      <Progress
        value={progressPercentage}
        color="primary"
        size="md"
        className="w-full"
        showValueLabel={true}
        formatOptions={{
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Início</span>
        <span>Finalização</span>
      </div>
    </div>
  );
};

export default ProgressBar;
