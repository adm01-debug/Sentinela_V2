// ARIA utilities for accessibility
export const ariaUtils = {
  setLabel: (element: HTMLElement, label: string) => element.setAttribute('aria-label', label),
  setDescribedBy: (element: HTMLElement, id: string) => element.setAttribute('aria-describedby', id),
  setExpanded: (element: HTMLElement, expanded: boolean) => element.setAttribute('aria-expanded', String(expanded)),
  setHidden: (element: HTMLElement, hidden: boolean) => element.setAttribute('aria-hidden', String(hidden)),
  setLive: (element: HTMLElement, politeness: 'polite' | 'assertive' | 'off') => element.setAttribute('aria-live', politeness),
  setRole: (element: HTMLElement, role: string) => element.setAttribute('role', role),
  setDisabled: (element: HTMLElement, disabled: boolean) => element.setAttribute('aria-disabled', String(disabled)),
  setSelected: (element: HTMLElement, selected: boolean) => element.setAttribute('aria-selected', String(selected)),
  setChecked: (element: HTMLElement, checked: boolean) => element.setAttribute('aria-checked', String(checked)),
  setCurrent: (element: HTMLElement, current: boolean | string) => element.setAttribute('aria-current', String(current)),
};

export const announceToScreenReader = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', politeness);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;
  document.body.appendChild(announcer);
  setTimeout(() => announcer.remove(), 1000);
};

export const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
