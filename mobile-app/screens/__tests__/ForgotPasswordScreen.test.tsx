import React from 'react';
import { render } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../ForgotPasswordScreen';

describe('ForgotPasswordScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<ForgotPasswordScreen />);
    expect(toJSON()).toBeTruthy();
  });
});