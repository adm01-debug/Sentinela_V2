export const domHelpers = {
  qs: <T extends Element>(selector: string, parent: ParentNode = document): T | null => parent.querySelector<T>(selector),
  qsa: <T extends Element>(selector: string, parent: ParentNode = document): T[] => Array.from(parent.querySelectorAll<T>(selector)),
  addClass: (el: Element, ...classes: string[]): void => el.classList.add(...classes),
  removeClass: (el: Element, ...classes: string[]): void => el.classList.remove(...classes),
  toggleClass: (el: Element, className: string): void => el.classList.toggle(className),
  hasClass: (el: Element, className: string): boolean => el.classList.contains(className),
  scrollTo: (el: Element, options?: ScrollIntoViewOptions): void => el.scrollIntoView({ behavior: 'smooth', ...options }),
  copyToClipboard: async (text: string): Promise<void> => navigator.clipboard.writeText(text),
};
