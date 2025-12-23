export const domHelpers = {
  getElement: <T extends HTMLElement>(selector: string): T | null => document.querySelector<T>(selector),
  getElements: <T extends HTMLElement>(selector: string): T[] => Array.from(document.querySelectorAll<T>(selector)),
  addClass: (el: HTMLElement, className: string): void => el.classList.add(className),
  removeClass: (el: HTMLElement, className: string): void => el.classList.remove(className),
  toggleClass: (el: HTMLElement, className: string): void => el.classList.toggle(className),
  hasClass: (el: HTMLElement, className: string): boolean => el.classList.contains(className),
  scrollTo: (el: HTMLElement, options?: ScrollIntoViewOptions): void => el.scrollIntoView({ behavior: 'smooth', ...options }),
  copyToClipboard: async (text: string): Promise<void> => navigator.clipboard.writeText(text),
};
