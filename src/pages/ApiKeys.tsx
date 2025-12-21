import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ApiKeys() {
  const [keys, setKeys] = useState<string[]>([]);
  const generateKey = () => setKeys([...keys, 'sk_' + Math.random().toString(36).slice(2)]);
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>API Keys</h1>
      <Button onClick={generateKey}>Generate New Key</Button>
      <ul className='mt-4 space-y-2'>{keys.map((k, i) => <li key={i} className='p-2 bg-muted rounded'>{k}</li>)}</ul>
    </div>
  );
}