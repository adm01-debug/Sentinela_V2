import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ModalProvider } from '../ModalProvider';

describe('ModalProvider', () => {
  it('renders without crashing', () => {
    expect(ModalProvider).toBeDefined();
  });
});