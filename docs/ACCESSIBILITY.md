# Accessibility (a11y) Documentation

## Overview

Sentinela follows WCAG 2.1 Level AA guidelines for accessibility.

## Key Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators are visible
- Skip links for main content

### Screen Readers
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content

### Visual
- Sufficient color contrast (4.5:1 minimum)
- Resizable text up to 200%
- No content relies solely on color

## Components

### FocusTrap
Traps focus within modals and dialogs.

### LiveRegion
Announces dynamic content changes.

### SkipLink
Allows skipping to main content.

### VisuallyHidden
Hides content visually but keeps it accessible.

## Testing

```bash
# Run accessibility tests
npm run test:a11y

# Lighthouse accessibility audit
npm run lighthouse
```

## Best Practices

1. Use semantic HTML elements
2. Provide alt text for images
3. Ensure sufficient color contrast
4. Support keyboard navigation
5. Test with screen readers
