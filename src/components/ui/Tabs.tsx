import { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TabsContextType { value: string; setValue: (v: string) => void; }
const TabsContext = createContext<TabsContextType | null>(null);

export const Tabs = ({ defaultValue, children }: { defaultValue: string; children: ReactNode }) => {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}><div className="space-y-4">{children}</div></TabsContext.Provider>;
};

export const TabsList = ({ children }: { children: ReactNode }) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1">{children}</div>
);

export const TabsTrigger = ({ value, children }: { value: string; children: ReactNode }) => {
  const ctx = useContext(TabsContext)!;
  return (
    <button
      className={cn('inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', ctx.value === value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}
      onClick={() => ctx.setValue(value)}
    >{children}</button>
  );
};

export const TabsContent = ({ value, children }: { value: string; children: ReactNode }) => {
  const ctx = useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div className="mt-2">{children}</div>;
};