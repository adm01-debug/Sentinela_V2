export interface A11yIssue { type: string; severity: 'error' | 'warning' | 'info'; element: string; message: string; }
export class A11yChecker {
  check(element: HTMLElement = document.body): A11yIssue[] { const issues: A11yIssue[] = []; const imgs = element.querySelectorAll('img:not([alt])'); imgs.forEach(img => issues.push({ type: 'missing-alt', severity: 'error', element: 'img', message: 'Image missing alt attribute' })); const buttons = element.querySelectorAll('button:empty'); buttons.forEach(() => issues.push({ type: 'empty-button', severity: 'error', element: 'button', message: 'Button has no accessible text' })); const inputs = element.querySelectorAll('input:not([aria-label]):not([id])'); inputs.forEach(() => issues.push({ type: 'unlabeled-input', severity: 'warning', element: 'input', message: 'Input missing label' })); return issues; }
}
export const a11yChecker = new A11yChecker();
