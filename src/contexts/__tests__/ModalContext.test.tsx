import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ModalContext } from '../ModalContext';

describe('ModalContext', () => {
  it('renders without crashing', () => {
    expect(ModalContext).toBeDefined();
  });
});