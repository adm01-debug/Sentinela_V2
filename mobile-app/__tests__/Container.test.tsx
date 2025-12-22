import React from 'react';
import { render } from '@testing-library/react-native';
import { Container } from '../Container';

describe('Container', () => {
  it('renders', () => {
    const { toJSON } = render(<Container />);
    expect(toJSON()).toBeTruthy();
  });
});