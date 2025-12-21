import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function FeatureFlags() {
  const [flags, setFlags] = useState({ darkMode: true, betaFeatures: false });
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Feature Flags</h1>
      <div className='space-y-4'>
        <div className='flex items-center gap-4'><Switch checked={flags.darkMode} onCheckedChange={v => setFlags({ ...flags, darkMode: v })} /><Label>Dark Mode</Label></div>
        <div className='flex items-center gap-4'><Switch checked={flags.betaFeatures} onCheckedChange={v => setFlags({ ...flags, betaFeatures: v })} /><Label>Beta Features</Label></div>
      </div>
    </div>
  );
}