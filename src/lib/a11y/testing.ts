// Accessibility testing utilities
import { describe, it, expect } from 'vitest';

export const a11yTests = {
  checkHeadingStructure: (container: HTMLElement) => {
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const levels = Array.from(headings).map(h => parseInt(h.tagName[1]));
    for (let i = 1; i < levels.length; i++) { if (levels[i] - levels[i - 1] > 1) return false; }
    return true;
  },
  checkImagesHaveAlt: (container: HTMLElement) => {
    const images = container.querySelectorAll('img');
    return Array.from(images).every(img => img.hasAttribute('alt'));
  },
  checkButtonsHaveAccessibleName: (container: HTMLElement) => {
    const buttons = container.querySelectorAll('button');
    return Array.from(buttons).every(btn => btn.textContent?.trim() || btn.getAttribute('aria-label'));
  },
  checkLinksHaveText: (container: HTMLElement) => {
    const links = container.querySelectorAll('a');
    return Array.from(links).every(link => link.textContent?.trim() || link.getAttribute('aria-label'));
  },
  checkFormLabels: (container: HTMLElement) => {
    const inputs = container.querySelectorAll('input:not([type="hidden"]), select, textarea');
    return Array.from(inputs).every(input => {
      const id = input.getAttribute('id');
      return id && container.querySelector(`label[for="${id}"]`) || input.getAttribute('aria-label');
    });
  },
  runAll: (container: HTMLElement) => ({
    headingStructure: a11yTests.checkHeadingStructure(container),
    imagesHaveAlt: a11yTests.checkImagesHaveAlt(container),
    buttonsAccessible: a11yTests.checkButtonsHaveAccessibleName(container),
    linksHaveText: a11yTests.checkLinksHaveText(container),
    formLabels: a11yTests.checkFormLabels(container),
  })
};
