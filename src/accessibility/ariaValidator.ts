export class AriaValidator {
  validateRole(element: HTMLElement): boolean { const role = element.getAttribute('role'); const validRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'tabpanel', 'menu', 'menuitem', 'dialog', 'alert', 'alertdialog', 'navigation', 'main', 'banner', 'contentinfo', 'search', 'form']; return !role || validRoles.includes(role); }
  hasRequiredAria(element: HTMLElement): boolean { const role = element.getAttribute('role'); if (role === 'checkbox' || role === 'radio') return element.hasAttribute('aria-checked'); if (role === 'tab') return element.hasAttribute('aria-selected'); return true; }
  validateAriaLabel(element: HTMLElement): boolean { const label = element.getAttribute('aria-label'); const labelledBy = element.getAttribute('aria-labelledby'); return !!label || !!labelledBy || !!element.textContent?.trim(); }
}
export const ariaValidator = new AriaValidator();
