import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { Progress } from "../ui/Progress";

interface Step {
  title: string;
  description: string;
  content: React.ReactNode;
}

interface OnboardingWizardProps {
  steps: Step[];
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingWizard({ steps, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
          {onSkip && <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>}
        </div>
        <Progress value={progress} />
        <CardTitle className="mt-4">{step.title}</CardTitle>
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
      <CardContent>{step.content}</CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>Previous</Button>
        <Button onClick={handleNext}>{currentStep === steps.length - 1 ? "Complete" : "Next"}</Button>
      </CardFooter>
    </Card>
  );
}
