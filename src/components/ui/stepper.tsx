'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface StepItem {
  number: number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
}) => {
  return (
    <div className={clsx('w-full', className)}>
      {/* Desktop Stepper */}
      <div className="hidden lg:grid grid-cols-6 gap-2 bg-white border border-[#E5EAF1] rounded-2xl p-4 shadow-xs">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div
              key={step.number}
              onClick={() => isCompleted && onStepClick?.(step.number)}
              className={clsx(
                'flex items-center gap-3 p-2 rounded-xl transition-all',
                isCompleted && onStepClick && 'cursor-pointer hover:bg-[#F8FAFC]',
                isCurrent && 'bg-[#EFF6FF] border border-[#BFDBFE]',
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                  isCompleted
                    ? 'bg-[#10B981] text-white'
                    : isCurrent
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]',
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
              </div>
              <div className="min-w-0">
                <p
                  className={clsx(
                    'text-xs font-bold truncate leading-tight',
                    isCurrent
                      ? 'text-[#2563EB]'
                      : isCompleted
                      ? 'text-[#172033]'
                      : 'text-[#64748B]',
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-[10px] text-[#98A2B3] truncate">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Compact Stepper */}
      <div className="lg:hidden bg-white border border-[#E5EAF1] rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#2563EB]">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-xs font-semibold text-[#172033]">
            {steps.find((s) => s.number === currentStep)?.title}
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {steps.map((step) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <div
                key={step.number}
                className={clsx(
                  'h-1.5 rounded-full transition-all',
                  isCompleted
                    ? 'bg-[#10B981]'
                    : isCurrent
                    ? 'bg-[#2563EB]'
                    : 'bg-[#E2E8F0]',
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
