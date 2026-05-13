import { useState, useCallback } from "react";

interface Project {
  id: string;
  name: string;
  status: "active" | "completed" | "archived";
  createdAt: Date;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const create = useCallback((name) => {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      status: "active",
      createdAt: new Date()
    };
    setProjects(prev => [...prev, project]);
    return project;
  }, []);

  const updateStatus = useCallback((id) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }, []);

  const remove = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  return { projects, create, updateStatus, remove };
}
