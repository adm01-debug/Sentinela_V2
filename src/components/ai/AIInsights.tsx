import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  RefreshCw,
  ChevronRight,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  MoreHorizontal,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// AI INSIGHT CARD COMPONENT
// ============================================
export type InsightType = 'positive' | 'negative' | 'warning' | 'suggestion' | 'neutral';
export type InsightPriority = 'critical' | 'high' | 'medium' | 'low';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: InsightType;
  priority: InsightPriority;
  metric?: {
    label: string;
    value: number;
    previousValue?: number;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  confidence?: number;
  generatedAt: Date;
  tags?: string[];
}

interface AIInsightCardProps {
  insight: AIInsight;
  onDismiss?: (id: string) => void;
  onFeedback?: (id: string, helpful: boolean) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

const insightIcons: Record<InsightType, React.ElementType> = {
  positive: TrendingUp,
  negative: TrendingDown,
  warning: AlertTriangle,
  suggestion: Lightbulb,
  neutral: Target,
};

const insightStyles: Record<InsightType, { bg: string; border: string; icon: string }> = {
  positive: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-500',
  },
  negative: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-500',
  },
  suggestion: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-500',
  },
  neutral: {
    bg: 'bg-muted/50',
    border: 'border-border',
    icon: 'text-muted-foreground',
  },
};

const priorityLabels: Record<InsightPriority, { label: string; color: string }> = {
  critical: { label: 'Crítico', color: 'bg-red-500' },
  high: { label: 'Alta', color: 'bg-orange-500' },
  medium: { label: 'Média', color: 'bg-yellow-500' },
  low: { label: 'Baixa', color: 'bg-green-500' },
};

export function AIInsightCard({
  insight,
  onDismiss,
  onFeedback,
  onSave,
  onShare,
  className,
  compact = false,
}: AIInsightCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const Icon = insightIcons[insight.type];
  const styles = insightStyles[insight.type];
  const priority = priorityLabels[insight.priority];

  const handleFeedback = useCallback((helpful: boolean) => {
    setFeedbackGiven(helpful);
    setShowFeedback(false);
    onFeedback?.(insight.id, helpful);
  }, [insight.id, onFeedback]);

  const percentageChange = useMemo(() => {
    if (!insight.metric?.previousValue || insight.metric.previousValue === 0) return null;
    const change = ((insight.metric.value - insight.metric.previousValue) / insight.metric.previousValue) * 100;
    return change.toFixed(1);
  }, [insight.metric]);

  const TrendIcon = insight.metric?.trend === 'up' ? ArrowUp : 
                    insight.metric?.trend === 'down' ? ArrowDown : Minus;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border',
          styles.bg,
          styles.border,
          className
        )}
      >
        <div className={cn('p-1.5 rounded-md', styles.bg)}>
          <Icon className={cn('h-4 w-4', styles.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{insight.title}</p>
          {insight.metric && (
            <p className="text-xs text-muted-foreground">
              {insight.metric.value}{insight.metric.unit} {percentageChange && `(${percentageChange}%)`}
            </p>
          )}
        </div>
        {insight.action && (
          <Button variant="ghost" size="sm" onClick={insight.action.onClick}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'relative overflow-hidden rounded-xl border',
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn('p-2 rounded-lg', styles.bg)}
          >
            <Icon className={cn('h-5 w-5', styles.icon)} />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{insight.title}</h4>
              <Badge 
                variant="outline" 
                className={cn('text-[10px] px-1.5', priority.color, 'text-white border-0')}
              >
                {priority.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {insight.confidence && `${insight.confidence}% confiança • `}
              Gerado {formatRelativeTime(insight.generatedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onDismiss(insight.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onSave && (
                <DropdownMenuItem onClick={() => onSave(insight.id)}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Salvar insight
                </DropdownMenuItem>
              )}
              {onShare && (
                <DropdownMenuItem onClick={() => onShare(insight.id)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setShowFeedback(true)}>
                <ThumbsUp className="h-4 w-4 mr-2" />
                Dar feedback
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <p className="text-sm text-muted-foreground">{insight.description}</p>
      </div>

      {/* Metric */}
      {insight.metric && (
        <div className="px-4 py-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{insight.metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {insight.metric.value.toLocaleString()}{insight.metric.unit}
                </span>
                {percentageChange && (
                  <span className={cn(
                    'text-sm flex items-center gap-0.5',
                    Number(percentageChange) > 0 ? 'text-emerald-500' : 
                    Number(percentageChange) < 0 ? 'text-red-500' : 'text-muted-foreground'
                  )}>
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(Number(percentageChange))}%
                  </span>
                )}
              </div>
            </div>
            {insight.confidence && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Confiança</p>
                <div className="w-16">
                  <Progress value={insight.confidence} className="h-1.5" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {insight.tags && insight.tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {insight.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Action */}
      {insight.action && (
        <div className="px-4 pb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={insight.action.onClick}
            className="w-full justify-between"
          >
            {insight.action.label}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Feedback overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          >
            <p className="text-sm font-medium mb-4">Este insight foi útil?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(true)}
                className="gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                Sim
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback(false)}
                className="gap-2"
              >
                <ThumbsDown className="h-4 w-4" />
                Não
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeedback(false)}
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback confirmation */}
      {feedbackGiven !== null && (
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="text-xs">
            {feedbackGiven ? 'Obrigado!' : 'Feedback enviado'}
          </Badge>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// AI INSIGHTS PANEL COMPONENT
// ============================================
interface AIInsightsPanelProps {
  insights: AIInsight[];
  onRefresh?: () => void;
  isLoading?: boolean;
  title?: string;
  className?: string;
}

export function AIInsightsPanel({
  insights,
  onRefresh,
  isLoading = false,
  title = 'Insights de IA',
  className,
}: AIInsightsPanelProps) {
  const [filter, setFilter] = useState<InsightType | 'all'>('all');

  const filteredInsights = useMemo(() => {
    if (filter === 'all') return insights;
    return insights.filter(i => i.type === filter);
  }, [insights, filter]);

  const filterCounts = useMemo(() => {
    return {
      all: insights.length,
      positive: insights.filter(i => i.type === 'positive').length,
      negative: insights.filter(i => i.type === 'negative').length,
      warning: insights.filter(i => i.type === 'warning').length,
      suggestion: insights.filter(i => i.type === 'suggestion').length,
      neutral: insights.filter(i => i.type === 'neutral').length,
    };
  }, [insights]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        )}
      </CardHeader>

      <div className="px-6 pb-2 flex gap-1 overflow-x-auto">
        {(['all', 'positive', 'negative', 'warning', 'suggestion'] as const).map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(type)}
            className="shrink-0"
          >
            {type === 'all' ? 'Todos' : 
             type === 'positive' ? 'Positivos' :
             type === 'negative' ? 'Negativos' :
             type === 'warning' ? 'Alertas' : 'Sugestões'}
            <Badge variant="secondary" className="ml-1 text-xs">
              {filterCounts[type]}
            </Badge>
          </Button>
        ))}
      </div>

      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredInsights.length > 0 ? (
            filteredInsights.map((insight) => (
              <AIInsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-muted-foreground"
            >
              <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum insight disponível</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ============================================
// ANOMALY DETECTION HIGHLIGHT COMPONENT
// ============================================
interface AnomalyHighlightProps {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  affectedMetric?: string;
  expectedValue?: number;
  actualValue?: number;
  onInvestigate?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const severityStyles = {
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-500' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500' },
};

export function AnomalyHighlight({
  title,
  description,
  severity,
  detectedAt,
  affectedMetric,
  expectedValue,
  actualValue,
  onInvestigate,
  onDismiss,
  className,
}: AnomalyHighlightProps) {
  const styles = severityStyles[severity];
  const deviation = expectedValue && actualValue 
    ? ((actualValue - expectedValue) / expectedValue * 100).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'relative rounded-xl border-2 p-4',
        styles.bg,
        styles.border,
        className
      )}
    >
      {/* Pulse indicator */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          'absolute top-4 right-4 w-3 h-3 rounded-full',
          severity === 'critical' ? 'bg-red-500' :
          severity === 'high' ? 'bg-orange-500' :
          severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
        )}
      />

      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', styles.bg)}>
          <Zap className={cn('h-5 w-5', styles.text)} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{title}</h4>
            <Badge variant="outline" className={cn('text-xs', styles.text)}>
              Anomalia {severity === 'critical' ? 'Crítica' : 
                        severity === 'high' ? 'Alta' :
                        severity === 'medium' ? 'Média' : 'Baixa'}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          {affectedMetric && expectedValue !== undefined && actualValue !== undefined && (
            <div className="flex items-center gap-4 mb-3 p-3 rounded-lg bg-background/50">
              <div>
                <p className="text-xs text-muted-foreground">Métrica</p>
                <p className="text-sm font-medium">{affectedMetric}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Esperado</p>
                <p className="text-sm">{expectedValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Atual</p>
                <p className={cn('text-sm font-medium', styles.text)}>
                  {actualValue.toLocaleString()}
                </p>
              </div>
              {deviation && (
                <div>
                  <p className="text-xs text-muted-foreground">Desvio</p>
                  <p className={cn('text-sm font-medium', styles.text)}>
                    {Number(deviation) > 0 ? '+' : ''}{deviation}%
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Detectado {formatRelativeTime(detectedAt)}
            </p>
            <div className="flex gap-2">
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  Ignorar
                </Button>
              )}
              {onInvestigate && (
                <Button variant="default" size="sm" onClick={onInvestigate}>
                  Investigar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// SMART RECOMMENDATIONS COMPONENT
// ============================================
interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: string;
  estimatedBenefit?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SmartRecommendationsProps {
  recommendations: Recommendation[];
  title?: string;
  className?: string;
}

const impactColors = {
  high: 'bg-emerald-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

const effortColors = {
  high: 'bg-red-500',
  medium: 'bg-orange-500',
  low: 'bg-green-500',
};

export function SmartRecommendations({
  recommendations,
  title = 'Recomendações Inteligentes',
  className,
}: SmartRecommendationsProps) {
  const sortedRecommendations = useMemo(() => {
    const impactScore = { high: 3, medium: 2, low: 1 };
    const effortScore = { high: 1, medium: 2, low: 3 };
    
    return [...recommendations].sort((a, b) => {
      const scoreA = impactScore[a.impact] + effortScore[a.effort];
      const scoreB = impactScore[b.impact] + effortScore[b.effort];
      return scoreB - scoreA;
    });
  }, [recommendations]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {rec.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>
                <h4 className="font-medium">{rec.title}</h4>
              </div>
              {rec.action && (
                <Button variant="ghost" size="sm" onClick={rec.action.onClick}>
                  {rec.action.label}
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Impacto:</span>
                <Badge className={cn('text-white', impactColors[rec.impact])}>
                  {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Esforço:</span>
                <Badge className={cn('text-white', effortColors[rec.effort])}>
                  {rec.effort === 'high' ? 'Alto' : rec.effort === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
              </div>
              {rec.estimatedBenefit && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Benefício:</span>
                  <span className="font-medium text-emerald-500">{rec.estimatedBenefit}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'agora';
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
  return date.toLocaleDateString('pt-BR');
}

// Export types
export type { AIInsight, Recommendation };
