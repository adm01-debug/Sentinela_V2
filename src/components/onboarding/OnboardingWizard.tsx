import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Settings, 
  MapPin, 
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Building2,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  action: {
    label: string;
    href: string;
  };
  tips: string[];
}

const steps: OnboardingStep[] = [
  {
    id: 'employees',
    title: 'Adicione Funcionários',
    description: 'Cadastre os membros da sua equipe para começar o monitoramento.',
    icon: Users,
    color: 'primary',
    action: {
      label: 'Adicionar Funcionários',
      href: '/employees/create',
    },
    tips: [
      'Importe em massa via CSV',
      'Configure departamentos e equipes',
      'Defina níveis de acesso',
    ],
  },
  {
    id: 'devices',
    title: 'Configure Dispositivos',
    description: 'Instale o agente de monitoramento nos computadores da equipe.',
    icon: Monitor,
    color: 'info',
    action: {
      label: 'Gerar Chave de Agente',
      href: '/agent-keys',
    },
    tips: [
      'Windows, macOS e Linux suportados',
      'Instalação silenciosa disponível',
      'Atualizações automáticas',
    ],
  },
  {
    id: 'policies',
    title: 'Defina Políticas',
    description: 'Configure regras de segurança e monitoramento para sua organização.',
    icon: Shield,
    color: 'success',
    action: {
      label: 'Criar Política',
      href: '/policies/create',
    },
    tips: [
      'Bloqueio de sites e aplicativos',
      'Horários de trabalho',
      'Palavras-chave sensíveis',
    ],
  },
  {
    id: 'geofences',
    title: 'Configure Geofences',
    description: 'Defina áreas geográficas permitidas para trabalho remoto.',
    icon: MapPin,
    color: 'warning',
    action: {
      label: 'Criar Geofence',
      href: '/geofences/create',
    },
    tips: [
      'Raio personalizável',
      'Múltiplas localizações',
      'Alertas de violação',
    ],
  },
  {
    id: 'alerts',
    title: 'Configure Alertas',
    description: 'Receba notificações sobre eventos importantes em tempo real.',
    icon: Bell,
    color: 'destructive',
    action: {
      label: 'Configurar Alertas',
      href: '/settings/notifications',
    },
    tips: [
      'Email, WhatsApp e Webhook',
      'Filtros por severidade',
      'Relatórios agendados',
    ],
  },
];

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  completedSteps?: string[];
  onComplete?: () => void;
}

export const OnboardingWizard = ({ 
  isOpen, 
  onClose, 
  completedSteps = [],
  onComplete 
}: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  
  const progress = (completedSteps.length / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const isStepCompleted = completedSteps.includes(currentStepData?.id);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.();
      onClose();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleAction = () => {
    navigate(currentStepData.action.href);
    onClose();
  };
  
  const handleSkip = () => {
    localStorage.setItem('onboarding_skipped', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl"
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-primary via-primary to-accent p-6 text-primary-foreground">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Bem-vindo ao Sentinela!</h2>
                  <p className="text-primary-foreground/80 text-sm">Configure sua conta em poucos passos</p>
                </div>
              </div>
              
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{completedSteps.length} de {steps.length} completos</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/20" />
              </div>
            </div>
            
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 py-4 bg-muted/30">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = index === currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                      isCompleted && 'bg-success text-success-foreground',
                      isCurrent && !isCompleted && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                      !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Step header */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-3 rounded-xl',
                      currentStepData.color === 'primary' && 'bg-primary/10',
                      currentStepData.color === 'success' && 'bg-success/10',
                      currentStepData.color === 'warning' && 'bg-warning/10',
                      currentStepData.color === 'destructive' && 'bg-destructive/10',
                      currentStepData.color === 'info' && 'bg-info/10'
                    )}>
                      <currentStepData.icon className={cn(
                        'h-8 w-8',
                        currentStepData.color === 'primary' && 'text-primary',
                        currentStepData.color === 'success' && 'text-success',
                        currentStepData.color === 'warning' && 'text-warning',
                        currentStepData.color === 'destructive' && 'text-destructive',
                        currentStepData.color === 'info' && 'text-info'
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
                        {isStepCompleted && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-success/10 text-success rounded-full">
                            Concluído
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1">{currentStepData.description}</p>
                    </div>
                  </div>
                  
                  {/* Tips */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm font-medium mb-3">Dicas rápidas:</p>
                    <ul className="space-y-2">
                      {currentStepData.tips.map((tip, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Action button */}
                  <Button 
                    onClick={handleAction}
                    className="w-full h-12"
                    size="lg"
                  >
                    {currentStepData.action.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                Pular tutorial
              </Button>
              
              <Button
                variant="outline"
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Welcome Banner for Dashboard
export const OnboardingBanner = ({ 
  onOpenWizard,
  completedSteps = [],
  onDismiss
}: { 
  onOpenWizard: () => void;
  completedSteps?: string[];
  onDismiss?: () => void;
}) => {
  const remainingSteps = steps.length - completedSteps.length;
  
  if (remainingSteps === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-accent p-6 text-primary-foreground mb-6"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Complete a configuração da sua conta</h3>
            <p className="text-primary-foreground/80">
              {remainingSteps} {remainingSteps === 1 ? 'passo restante' : 'passos restantes'} para configurar o Sentinela
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
            >
              Depois
            </Button>
          )}
          <Button 
            onClick={onOpenWizard}
            className="bg-white text-primary hover:bg-white/90"
          >
            Continuar Setup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-4">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              completedSteps.includes(step.id) ? 'bg-white' : 'bg-white/30'
            )}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default OnboardingWizard;
