import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

export async function checkA11y(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

export const a11yConfig = {
  rules: {
    "color-contrast": { enabled: true },
    "label": { enabled: true },
    "button-name": { enabled: true },
    "image-alt": { enabled: true },
    "link-name": { enabled: true },
  },
};

export function getByRole(container: HTMLElement, role: string) {
  return container.querySelector(`[role="${role}"]`);
}

export function getAllByRole(container: HTMLElement, role: string) {
  return container.querySelectorAll(`[role="${role}"]`);
}
