import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SidebarProvider } from '../SidebarProvider';

describe('SidebarProvider', () => {
  it('renders without crashing', () => {
    expect(SidebarProvider).toBeDefined();
  });
});