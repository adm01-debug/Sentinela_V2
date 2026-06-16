import { useState, useCallback } from "react";

export function useTags(initial: string[] = []) {
  const [tags, setTags] = useState(initial);

  const add = useCallback(
    (tag) => {
      const trimmed = tag.trim().toLowerCase();
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
    },
    [tags]
  );

  const remove = useCallback((tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const toggle = useCallback(
    (tag) => {
      tags.includes(tag) ? remove(tag) : add(tag);
    },
    [tags, add, remove]
  );

  const clear = useCallback(() => setTags([]), []);

  return { tags, add, remove, toggle, clear };
}
