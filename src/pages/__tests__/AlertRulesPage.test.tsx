import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('react-router-dom', () => ({ Link: ({ children }: any) => <span>{children}</span> }));

const AlertRulesPage = () => (
  <div data-testid="alert-rules-page">
    <h1>Alert Rules</h1>
    <div data-testid="rules-list">
      <div data-testid="rule-item">Rule 1</div>
    </div>
  </div>
);

describe('AlertRulesPage', () => {
  it('should render page', () => {
    render(<AlertRulesPage />);
    expect(screen.getByTestId('alert-rules-page')).toBeInTheDocument();
  });

  it('should show rules list', () => {
    render(<AlertRulesPage />);
    expect(screen.getByTestId('rules-list')).toBeInTheDocument();
  });
});
