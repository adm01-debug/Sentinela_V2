# Sentinela Component Library

## Overview

This document provides an overview of all UI components available in the Sentinela application.

## Component Categories

### Form Components

| Component | Description | Status |
|-----------|-------------|--------|
| `Button` | Primary action button with variants | ✅ Stable |
| `Input` | Text input with validation | ✅ Stable |
| `Select` | Dropdown selection | ✅ Stable |
| `Checkbox` | Boolean selection | ✅ Stable |
| `Radio` | Single selection from group | ✅ Stable |
| `Switch` | Toggle switch | ✅ Stable |
| `Textarea` | Multi-line text input | ✅ Stable |

### Feedback Components

| Component | Description | Status |
|-----------|-------------|--------|
| `Alert` | Inline alert messages | ✅ Stable |
| `Toast` | Toast notifications | ✅ Stable |
| `Progress` | Progress indicators | ✅ Stable |
| `Spinner` | Loading spinner | ✅ Stable |
| `Skeleton` | Loading placeholders | ✅ Stable |

### Data Display

| Component | Description | Status |
|-----------|-------------|--------|
| `Table` | Data table with sorting/filtering | ✅ Stable |
| `Card` | Content card container | ✅ Stable |
| `Badge` | Status badges | ✅ Stable |
| `Avatar` | User avatar | ✅ Stable |
| `StatCard` | Statistics display card | ✅ Stable |
| `DataCard` | Data display card | ✅ Stable |
| `Chart` | Data visualization | ✅ Stable |

### Navigation

| Component | Description | Status |
|-----------|-------------|--------|
| `Tabs` | Tab navigation | ✅ Stable |
| `Breadcrumb` | Breadcrumb navigation | ✅ Stable |
| `Pagination` | Page navigation | ✅ Stable |
| `Stepper` | Multi-step navigation | ✅ Stable |
| `Menu` | Navigation menu | ✅ Stable |

### Overlay Components

| Component | Description | Status |
|-----------|-------------|--------|
| `Modal` | Modal dialog | ✅ Stable |
| `Drawer` | Side drawer | ✅ Stable |
| `Dropdown` | Dropdown menu | ✅ Stable |
| `Tooltip` | Hover tooltip | ✅ Stable |
| `Popover` | Click popover | ✅ Stable |

### Layout Components

| Component | Description | Status |
|-----------|-------------|--------|
| `Accordion` | Collapsible content | ✅ Stable |
| `Collapse` | Animated collapse | ✅ Stable |
| `Divider` | Content divider | ✅ Stable |
| `List` | List container | ✅ Stable |
| `Timeline` | Timeline display | ✅ Stable |
| `Empty` | Empty state placeholder | ✅ Stable |

### Misc Components

| Component | Description | Status |
|-----------|-------------|--------|
| `Chip` | Tag/chip component | ✅ Stable |
| `LanguageSelector` | i18n language selector | ✅ Stable |

## Usage Examples

### Button

```tsx
import { Button } from '@/components/Button';

// Primary button
<Button variant="primary">Submit</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// Outline button
<Button variant="outline">Learn More</Button>

// Danger button
<Button variant="danger">Delete</Button>

// Loading state
<Button loading>Processing...</Button>

// Disabled state
<Button disabled>Unavailable</Button>
```

### Input

```tsx
import { Input } from '@/components/Input';

// Basic input
<Input placeholder="Enter your name" />

// With label
<Input label="Email" type="email" />

// With error
<Input label="Password" error="Password is required" />

// Disabled
<Input disabled value="Read only" />
```

### Modal

```tsx
import { Modal } from '@/components/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2 mt-4">
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleConfirm}>
      Confirm
    </Button>
  </div>
</Modal>
```

### Table

```tsx
import { Table } from '@/components/Table';

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email' },
  { key: 'status', title: 'Status' },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
];

<Table
  columns={columns}
  data={data}
  selectable
  hoverable
  striped
/>
```

## Storybook

All components are documented in Storybook. Run the following command to start Storybook:

```bash
npm run storybook
```

Visit `http://localhost:6006` to browse the component library.

## Testing

All components have comprehensive unit tests. Run tests with:

```bash
npm run test
```

## Contributing

When adding new components:

1. Create component in `src/components/ComponentName/`
2. Add Storybook stories in `ComponentName.stories.tsx`
3. Add unit tests in `__tests__/ComponentName.test.tsx`
4. Export from `src/components/index.ts`
5. Update this documentation
