export const getAriaLabel = (element: HTMLElement): string | null => {
  return element.getAttribute('aria-label') || 
         element.getAttribute('aria-labelledby') ||
         element.textContent?.trim() || 
         null;
};

export const setAriaExpanded = (element: HTMLElement, expanded: boolean): void => {
  element.setAttribute('aria-expanded', String(expanded));
};

export const setAriaSelected = (element: HTMLElement, selected: boolean): void => {
  element.setAttribute('aria-selected', String(selected));
};

export const setAriaDisabled = (element: HTMLElement, disabled: boolean): void => {
  element.setAttribute('aria-disabled', String(disabled));
};

export const generateId = (prefix = 'a11y'): string => {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
};
