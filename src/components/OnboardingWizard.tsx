import { memo, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ============================================================
// TYPES
// ============================================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  content?: ReactNode;
  action?: {
    label: string;
    onClick: () => void | Promise<void>;
  };
  optional?: boolean;
  completed?: boolean;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  title?: string;
  subtitle?: string;
  variant?: 'modal' | 'inline' | 'sidebar';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// ============================================================
// STEP INDICATOR
// ============================================================

interface StepIndicatorProps {
  steps: OnboardingStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  variant?: 'dots' | 'numbers' | 'progress';
}

const StepIndicator = memo(function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  variant = 'dots',
}: StepIndicatorProps) {
  if (variant === 'progress') {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Passo {currentStep + 1} de {steps.length}</span>
          <span>{Math.round(progress)}% completo</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = step.completed || index < currentStep;
        const isCurrent = index === currentStep;

        if (variant === 'numbers') {
          return (
            <button
              key={step.id}
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick}
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-all',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && !isCompleted && 'bg-primary/20 text-primary ring-2 ring-primary',
                !isCurrent && !isCompleted && 'bg-muted text-muted-foreground',
                onStepClick && 'cursor-pointer hover:scale-110'
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
            </button>
          );
        }

        // Dots variant
        return (
          <button
            key={step.id}
            onClick={() => onStepClick?.(index)}
            disabled={!onStepClick}
            className={cn(
              'h-2 rounded-full transition-all',
              isCurrent ? 'w-6 bg-primary' : 'w-2',
              isCompleted && !isCurrent && 'bg-primary/50',
              !isCurrent && !isCompleted && 'bg-muted-foreground/30',
              onStepClick && 'cursor-pointer hover:bg-primary/70'
            )}
          />
        );
      })}
    </div>
  );
});

// ============================================================
// STEP CONTENT
// ============================================================

interface StepContentProps {
  step: OnboardingStep;
  isLoading?: boolean;
}

const StepContent = memo(function StepContent({
  step,
  isLoading = false,
}: StepContentProps) {
  const Icon = step.icon || Sparkles;

  return (
    <div className="text-center space-y-6 py-6">
      {/* Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-10 w-10 text-primary" />
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{step.title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">{step.description}</p>
      </div>

      {/* Custom Content */}
      {step.content && <div className="py-4">{step.content}</div>}

      {/* Step Action */}
      {step.action && (
        <Button
          onClick={step.action.onClick}
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? 'Processando...' : step.action.label}
        </Button>
      )}

      {/* Optional indicator */}
      {step.optional && (
        <p className="text-xs text-muted-foreground">
          Este passo é opcional
        </p>
      )}
    </div>
  );
});

// ============================================================
// INLINE WIZARD
// ============================================================

interface InlineWizardProps {
  steps: OnboardingStep[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip?: () => void;
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

const InlineWizard = memo(function InlineWizard({
  steps,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  title,
  subtitle,
  className,
}: InlineWizardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = useCallback(async () => {
    if (step.action) {
      setIsLoading(true);
      try {
        await step.action.onClick();
      } finally {
        setIsLoading(false);
      }
    }
    
    if (isLast) {
      onComplete();
    } else {
      onNext();
    }
  }, [step, isLast, onNext, onComplete]);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center space-y-1">
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        {/* Progress */}
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          variant="progress"
        />

        {/* Step Content */}
        <StepContent step={step} isLoading={isLoading} />

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {!isFirst && (
              <Button variant="ghost" onClick={onPrev} disabled={isLoading}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            )}
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} variant="dots" />

          <div className="flex items-center gap-2">
            {step.optional && onSkip && (
              <Button variant="ghost" onClick={onSkip} disabled={isLoading}>
                Pular
              </Button>
            )}
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? 'Processando...' : isLast ? 'Concluir' : 'Próximo'}
              {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ============================================================
// MODAL WIZARD
// ============================================================

interface ModalWizardProps extends InlineWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ModalWizard = memo(function ModalWizard({
  open,
  onOpenChange,
  ...props
}: ModalWizardProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <InlineWizard {...props} className="border-0 shadow-none" />
      </DialogContent>
    </Dialog>
  );
});

// ============================================================
// SIDEBAR WIZARD
// ============================================================

interface SidebarWizardProps {
  steps: OnboardingStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  onComplete: () => void;
  title?: string;
  className?: string;
}

const SidebarWizard = memo(function SidebarWizard({
  steps,
  currentStep,
  onStepClick,
  onComplete,
  title,
  className,
}: SidebarWizardProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="space-y-2">
        {title && <h3 className="font-semibold">{title}</h3>}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{completedCount} de {steps.length} completos</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Steps List */}
      <div className="space-y-1">
        {steps.map((step, index) => {
          const Icon = step.icon || Sparkles;
          const isCompleted = step.completed;
          const isCurrent = index === currentStep;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(index)}
              className={cn(
                'flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors',
                isCurrent && 'bg-primary/10',
                !isCurrent && 'hover:bg-muted/50'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  isCompleted && 'bg-success text-success-foreground',
                  isCurrent && !isCompleted && 'bg-primary text-primary-foreground',
                  !isCurrent && !isCompleted && 'bg-muted'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'text-sm font-medium',
                  isCompleted && 'text-muted-foreground line-through'
                )}>
                  {step.title}
                </div>
                {step.optional && (
                  <span className="text-xs text-muted-foreground">Opcional</span>
                )}
              </div>
              {isCurrent && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          );
        })}
      </div>

      {/* Complete Button */}
      {completedCount === steps.length && (
        <Button onClick={onComplete} className="w-full">
          <Check className="mr-2 h-4 w-4" />
          Concluir configuração
        </Button>
      )}
    </div>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================

function OnboardingWizardComponent({
  steps,
  currentStep: controlledStep,
  onStepChange,
  onComplete,
  onSkip,
  title = 'Bem-vindo!',
  subtitle = 'Vamos configurar sua conta em alguns passos',
  variant = 'modal',
  open = true,
  onOpenChange,
  className,
}: OnboardingWizardProps) {
  const [internalStep, setInternalStep] = useState(0);
  const currentStep = controlledStep ?? internalStep;

  const handleStepChange = useCallback((step: number) => {
    if (onStepChange) {
      onStepChange(step);
    } else {
      setInternalStep(step);
    }
  }, [onStepChange]);

  const handleNext = useCallback(() => {
    handleStepChange(currentStep + 1);
  }, [currentStep, handleStepChange]);

  const handlePrev = useCallback(() => {
    handleStepChange(currentStep - 1);
  }, [currentStep, handleStepChange]);

  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  if (variant === 'sidebar') {
    return (
      <SidebarWizard
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepChange}
        onComplete={handleComplete}
        title={title}
        className={className}
      />
    );
  }

  if (variant === 'modal' && onOpenChange) {
    return (
      <ModalWizard
        open={open}
        onOpenChange={onOpenChange}
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={onSkip}
        onComplete={handleComplete}
        title={title}
        subtitle={subtitle}
        className={className}
      />
    );
  }

  return (
    <InlineWizard
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={onSkip}
      onComplete={handleComplete}
      title={title}
      subtitle={subtitle}
      className={className}
    />
  );
}

export const OnboardingWizard = memo(OnboardingWizardComponent);
