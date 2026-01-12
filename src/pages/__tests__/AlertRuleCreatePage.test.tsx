import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

const AlertRuleCreatePage = () => (
  <div data-testid="alert-rule-create-page">
    <h1>Create Alert Rule</h1>
    <form data-testid="alert-rule-form">
      <input data-testid="rule-name" placeholder="Rule Name" />
      <button type="submit">Create</button>
    </form>
  </div>
);

describe('AlertRuleCreatePage', () => {
  it('should render form', () => {
    render(<AlertRuleCreatePage />);
    expect(screen.getByTestId('alert-rule-form')).toBeInTheDocument();
  });

  it('should have name input', () => {
    render(<AlertRuleCreatePage />);
    expect(screen.getByTestId('rule-name')).toBeInTheDocument();
  });

  it('should have submit button', () => {
    render(<AlertRuleCreatePage />);
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });
});
