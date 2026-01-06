// ARIA Utilities for accessibility
export const ariaUtils = {
  // Live region announcements
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    setTimeout(() => { region.textContent = message; }, 100);
    setTimeout(() => { document.body.removeChild(region); }, 1000);
  },

  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'aria') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,

  // Create ARIA describedby/labelledby attributes
  createDescribedBy: (...ids: (string | undefined)[]) => ids.filter(Boolean).join(' ') || undefined,

  // Check if element is focusable
  isFocusable: (element: HTMLElement) => {
    if (element.tabIndex < 0) return false;
    if (element.hasAttribute('disabled')) return false;
    const { display, visibility } = getComputedStyle(element);
    return display !== 'none' && visibility !== 'hidden';
  },

  // Get role from element
  getRole: (element: HTMLElement) => element.getAttribute('role') || element.tagName.toLowerCase(),

  // Set ARIA expanded state
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', String(expanded));
  },

  // Set ARIA selected state
  setSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', String(selected));
  },

  // Set ARIA pressed state (for toggle buttons)
  setPressed: (element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', String(pressed));
  },

  // Set ARIA busy state
  setBusy: (element: HTMLElement, busy: boolean) => {
    element.setAttribute('aria-busy', String(busy));
  },

  // Create ARIA attributes object for a component
  getAriaProps: (props: {
    label?: string;
    labelledBy?: string;
    describedBy?: string;
    expanded?: boolean;
    selected?: boolean;
    pressed?: boolean;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    busy?: boolean;
    controls?: string;
    owns?: string;
    haspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  }) => ({
    'aria-label': props.label,
    'aria-labelledby': props.labelledBy,
    'aria-describedby': props.describedBy,
    'aria-expanded': props.expanded,
    'aria-selected': props.selected,
    'aria-pressed': props.pressed,
    'aria-disabled': props.disabled,
    'aria-required': props.required,
    'aria-invalid': props.invalid,
    'aria-busy': props.busy,
    'aria-controls': props.controls,
    'aria-owns': props.owns,
    'aria-haspopup': props.haspopup,
  }),
};

export default ariaUtils;
