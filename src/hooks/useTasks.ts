import { useState, useCallback } from "react";

interface Task { id: string; title: string; completed: boolean; priority: "low" | "medium" | "high"; }

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const add = useCallback((title: string, priority: Task["priority"] = "medium") => {
    const task: Task = { id: crypto.randomUUID(), title, completed: false, priority };
    setTasks(prev => [...prev, task]);
    return task;
  }, []);

  const toggle = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const remove = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return { tasks, pending, completed, add, toggle, remove };
}
