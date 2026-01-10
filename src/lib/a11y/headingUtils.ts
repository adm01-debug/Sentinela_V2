export interface HeadingLevel {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id?: string;
}

export const validateHeadingHierarchy = (headings: HeadingLevel[]): string[] => {
  const errors: string[] = [];
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    if (index === 0 && heading.level !== 1) {
      errors.push('First heading should be h1');
    }
    if (heading.level > previousLevel + 1) {
      errors.push(`Heading level skipped: h${previousLevel} to h${heading.level}`);
    }
    previousLevel = heading.level;
  });

  return errors;
};

export const createHeadingTree = (headings: HeadingLevel[]) => {
  return headings.map(h => ({ ...h, children: [] }));
};
