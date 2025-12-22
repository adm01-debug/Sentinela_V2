import React from 'react';
import { render } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';

describe('LoginScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<LoginScreen />);
    expect(toJSON()).toBeTruthy();
  });
});