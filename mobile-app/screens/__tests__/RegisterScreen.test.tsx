import React from 'react';
import { render } from '@testing-library/react-native';
import { RegisterScreen } from '../RegisterScreen';

describe('RegisterScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<RegisterScreen />);
    expect(toJSON()).toBeTruthy();
  });
});