import { useState, useCallback } from "react";

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  parentId?: string;
}

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);

  const add = useCallback((content: string, author: string, parentId?: string) => {
    const comment: Comment = {
      id: crypto.randomUUID(),
      content,
      author,
      createdAt: new Date(),
      parentId
    };
    setComments(prev => [...prev, comment]);
    return comment;
  }, []);

  const remove = useCallback((id: string) => {
    setComments(prev => prev.filter(c => c.id !== id && c.parentId !== id));
  }, []);

  const edit = useCallback((id: string, content: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, content } : c));
  }, []);

  return { comments, add, remove, edit };
}
