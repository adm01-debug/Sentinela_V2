import React from 'react';
import { render } from '@testing-library/react-native';
import { Alert } from '../Alert';

describe('Alert', () => {
  it('renders', () => {
    const { toJSON } = render(<Alert />);
    expect(toJSON()).toBeTruthy();
  });
});