import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Tabs, Tab } from '../Tabs';

describe('Tabs', () => {
  it('renders tab labels', () => {
    render(
      <Tabs>
        <Tab label="Tab 1">Content 1</Tab>
        <Tab label="Tab 2">Content 2</Tab>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('shows active tab content', () => {
    render(
      <Tabs>
        <Tab label="Tab 1">Content 1</Tab>
        <Tab label="Tab 2">Content 2</Tab>
      </Tabs>
    );
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('switches tabs on click', () => {
    render(
      <Tabs>
        <Tab label="Tab 1">Content 1</Tab>
        <Tab label="Tab 2">Content 2</Tab>
      </Tabs>
    );
    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('handles disabled tabs', () => {
    render(
      <Tabs>
        <Tab label="Active">Content</Tab>
        <Tab label="Disabled" disabled>Hidden</Tab>
      </Tabs>
    );
    expect(screen.getByText('Disabled')).toHaveAttribute('aria-disabled', 'true');
  });
});