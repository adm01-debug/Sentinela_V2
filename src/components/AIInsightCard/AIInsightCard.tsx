import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Sparkles } from "lucide-react";

interface AIInsightCardProps {
  title: string;
  insight: string;
  confidence: number;
  category?: string;
  timestamp?: string;
}

export function AIInsightCard({ title, insight, confidence, category, timestamp }: AIInsightCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <CardTitle className="text-lg">{title}</CardTitle>
        {category && <Badge variant="outline">{category}</Badge>}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{insight}</p>
        <div className="flex items-center justify-between text-xs">
          <span>Confidence: {Math.round(confidence * 100)}%</span>
          {timestamp && <span className="text-muted-foreground">{timestamp}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
