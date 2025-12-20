import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

describe('Accessibility', () => {
  describe('Button components', () => {
    it('should have accessible button', () => {
      const { getByRole } = render(<button>Click me</button>);
      expect(getByRole('button')).toBeInTheDocument();
    });

    it('button should have accessible name', () => {
      const { getByRole } = render(<button aria-label="Submit form">Submit</button>);
      expect(getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });

  describe('Form elements', () => {
    it('input should have label', () => {
      const { getByLabelText } = render(
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
        </div>
      );
      expect(getByLabelText('Email')).toBeInTheDocument();
    });

    it('required fields should be marked', () => {
      const { getByRole } = render(
        <input type="text" required aria-required="true" />
      );
      expect(getByRole('textbox')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Navigation', () => {
    it('should have navigation landmark', () => {
      const { getByRole } = render(<nav>Menu</nav>);
      expect(getByRole('navigation')).toBeInTheDocument();
    });

    it('should have main content landmark', () => {
      const { getByRole } = render(<main>Content</main>);
      expect(getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Images', () => {
    it('images should have alt text', () => {
      const { getByRole } = render(<img alt="Description" src="test.jpg" />);
      expect(getByRole('img')).toHaveAttribute('alt', 'Description');
    });
  });

  describe('Headings', () => {
    it('should have proper heading hierarchy', () => {
      const { getByRole } = render(
        <div>
          <h1>Main Title</h1>
          <h2>Section</h2>
        </div>
      );
      expect(getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});
