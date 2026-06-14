import * as React from 'react';
import { useState } from 'react';
import { ListTodo, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface Task { id: string; text: string; completed: boolean; }

export function QuickTasksWidget({ initialTasks = [], onTasksChange, className }: { initialTasks?: Task[]; onTasksChange?: (tasks: Task[]) => void; className?: string }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState('');

  const addTask = () => { if (!newTask.trim()) return; const updated = [...tasks, { id: crypto.randomUUID(), text: newTask, completed: false }]; setTasks(updated); onTasksChange?.(updated); setNewTask(''); };
  const toggleTask = (id: string) => { const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); setTasks(updated); onTasksChange?.(updated); };
  const deleteTask = (id: string) => { const updated = tasks.filter(t => t.id !== id); setTasks(updated); onTasksChange?.(updated); };

  return (
    <Card className={className}>
      <CardHeader><CardTitle className="flex items-center gap-2"><ListTodo className="h-5 w-5" />Quick Tasks</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4"><Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a task..." onKeyDown={(e) => e.key === 'Enter' && addTask()} className="flex-1" /><Button size="icon" onClick={addTask}><Plus className="h-4 w-4" /></Button></div>
        <div className="space-y-2 max-h-[200px] overflow-auto">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
              <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
              <span className={task.completed ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>{task.text}</span>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-6 w-6" onClick={() => deleteTask(task.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>}
        </div>
        {tasks.length > 0 && <p className="text-xs text-muted-foreground mt-2">{tasks.filter(t => t.completed).length}/{tasks.length} completed</p>}
      </CardContent>
    </Card>
  );
}
export default QuickTasksWidget;
