import { useState, useCallback } from "react";

interface ScheduledTask {
  id: string;
  name: string;
  scheduledAt: Date;
  completed: boolean;
}

export function useSchedule() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);

  const schedule = useCallback((name: string, at: Date) => {
    const task: ScheduledTask = { id: crypto.randomUUID(), name, scheduledAt: at, completed: false };
    setTasks(prev => [...prev, task].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()));
    return task;
  }, []);

  const complete = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
  }, []);

  const remove = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const upcoming = tasks.filter(t => !t.completed && t.scheduledAt > new Date());

  return { tasks, upcoming, schedule, complete, remove };
}
