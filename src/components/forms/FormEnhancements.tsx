import React, { memo, useState, useCallback, useEffect } from 'react';
import { Check, AlertCircle, Info, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Inline Validation Component
interface InlineValidationProps {
  isValid?: boolean;
  isValidating?: boolean;
  errorMessage?: string;
  successMessage?: string;
  className?: string;
}

export const InlineValidation = memo(function InlineValidation({
  isValid,
  isValidating,
  errorMessage,
  successMessage = 'Válido',
  className,
}: InlineValidationProps) {
  if (isValidating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('flex items-center gap-1 text-muted-foreground text-sm', className)}
      >
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Validando...</span>
      </motion.div>
    );
  }

  if (isValid === undefined) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isValid ? 'valid' : 'invalid'}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          'flex items-center gap-1 text-sm',
          isValid ? 'text-green-600 dark:text-green-400' : 'text-destructive',
          className
        )}
      >
        {isValid ? (
          <>
            <Check className="h-3 w-3" />
            <span>{successMessage}</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-3 w-3" />
            <span>{errorMessage}</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

// Auto-Save Draft Indicator
interface AutoSaveDraftProps {
  isSaving?: boolean;
  lastSaved?: Date;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
}

export const AutoSaveDraft = memo(function AutoSaveDraft({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  onSave,
}: AutoSaveDraftProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isSaving ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Salvando...</span>
        </motion.div>
      ) : hasUnsavedChanges ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Alterações não salvas</span>
          {onSave && (
            <Button variant="ghost" size="sm" onClick={onSave}>
              <Save className="h-3 w-3 mr-1" />
              Salvar
            </Button>
          )}
        </motion.div>
      ) : lastSaved ? (
        <span>Salvo às {formatTime(lastSaved)}</span>
      ) : null}
    </div>
  );
});

// Multi-Step Wizard
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  isOptional?: boolean;
}

interface MultiStepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  allowNavigation?: boolean;
  className?: string;
}

export const MultiStepWizard = memo(function MultiStepWizard({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
  className,
}: MultiStepWizardProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = allowNavigation && index <= currentStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(index)}
              className={cn(
                'flex flex-col items-center gap-2 transition-colors',
                isClickable && 'cursor-pointer hover:opacity-80',
                !isClickable && 'cursor-default'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20 text-primary border-2 border-primary',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <div className="text-center">
                <div
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </div>
                {step.isOptional && (
                  <div className="text-xs text-muted-foreground">Opcional</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// Field Help Tooltip
interface FieldHelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const FieldHelpTooltip = memo(function FieldHelpTooltip({
  content,
  side = 'right',
}: FieldHelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full h-4 w-4 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Info className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
});

// Form Actions
interface FormQuickActionsProps {
  onDuplicate?: () => void;
  onClear?: () => void;
  onReset?: () => void;
  disabled?: boolean;
}

export const FormQuickActions = memo(function FormQuickActions({
  onDuplicate,
  onClear,
  onReset,
  disabled,
}: FormQuickActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {onDuplicate && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          disabled={disabled}
        >
          Duplicar
        </Button>
      )}
      {onClear && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={disabled}
        >
          Limpar
        </Button>
      )}
      {onReset && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={disabled}
        >
          Resetar
        </Button>
      )}
    </div>
  );
});

// Use Auto Save Hook
export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay = 2000
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(true);
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [data, onSave, delay]);

  const manualSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave]);

  return { isSaving, lastSaved, hasUnsavedChanges, manualSave };
}

// Conditional Field Wrapper
interface ConditionalFieldProps {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConditionalField = memo(function ConditionalField({
  condition,
  children,
  fallback,
}: ConditionalFieldProps) {
  return (
    <AnimatePresence mode="wait">
      {condition ? (
        <motion.div
          key="visible"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      ) : fallback ? (
        <motion.div
          key="fallback"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {fallback}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
});
