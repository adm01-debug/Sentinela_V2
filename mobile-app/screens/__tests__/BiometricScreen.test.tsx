import React from 'react';
import { render } from '@testing-library/react-native';
import { BiometricScreen } from '../BiometricScreen';

describe('BiometricScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<BiometricScreen />);
    expect(toJSON()).toBeTruthy();
  });
});