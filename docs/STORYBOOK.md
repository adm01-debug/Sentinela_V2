# Storybook Documentation

## Overview

Sentinela uses Storybook for component development and documentation.

## Getting Started

```bash
# Start Storybook
npm run storybook

# Build static version
npm run build-storybook
```

## Structure

```
src/stories/
├── components/         # Component stories
├── ui/                # UI component stories
└── Introduction.mdx   # Documentation
```

## Writing Stories

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};
```

## Decorators

```tsx
// Global decorator
export const decorators = [
  (Story) => (
    <ThemeProvider>
      <Story />
    </ThemeProvider>
  ),
];
```

## Addons

- **Controls:** Interactive props editing
- **Actions:** Event logging
- **Docs:** Auto-generated documentation
- **Viewport:** Responsive testing
- **A11y:** Accessibility checks

## Best Practices

1. Write stories for all components
2. Include edge cases and states
3. Document props with JSDoc
4. Use meaningful story names
5. Group related components
