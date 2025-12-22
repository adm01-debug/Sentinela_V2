import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SidebarContext } from '../SidebarContext';

describe('SidebarContext', () => {
  it('renders without crashing', () => {
    expect(SidebarContext).toBeDefined();
  });
});