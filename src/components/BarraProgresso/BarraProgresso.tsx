// src/components/ProgressBar/ProgressBar.tsx
import React from 'react';
import { Progress } from '@heroui/react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  showStepNumbers?: boolean;
  className?: string;
  /**
   * Modo correção (deep link / um campo): evita barra em 100% como se o processo estivesse concluído.
   */
  variant?: "default" | "correction";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  showStepNumbers = true,
  className = "",
  variant = "default",
}) => {
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  if (variant === "correction") {
    return (
      <div
        className={`w-full max-w-2xl mx-auto mb-8 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-amber-900">
            Correção de resposta
          </span>
          <span className="text-xs text-amber-800 sm:text-sm">
            Revise o campo indicado e envie — não é o formulário completo.
          </span>
        </div>
      </div>
    );
  }

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
          style: "percent",
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
