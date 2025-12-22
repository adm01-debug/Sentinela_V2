import React from 'react';
import { render } from '@testing-library/react-native';
import { OTPScreen } from '../OTPScreen';

describe('OTPScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<OTPScreen />);
    expect(toJSON()).toBeTruthy();
  });
});