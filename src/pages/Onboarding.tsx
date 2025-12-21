import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const steps = ['Welcome', 'Setup', 'Configure', 'Complete'];
  return (
    <div className='container mx-auto p-6 max-w-xl'>
      <h1 className='text-2xl font-bold mb-6'>Getting Started</h1>
      <Progress value={(step / steps.length) * 100} className='mb-6' />
      <h2 className='text-xl mb-4'>{steps[step - 1]}</h2>
      <div className='flex gap-2'>
        <Button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</Button>
        <Button onClick={() => setStep(Math.min(steps.length, step + 1))} disabled={step === steps.length}>Next</Button>
      </div>
    </div>
  );
}