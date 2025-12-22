import React from 'react';
import { render } from '@testing-library/react-native';
import { ViolationsScreen } from '../ViolationsScreen';

describe('ViolationsScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<ViolationsScreen />);
    expect(toJSON()).toBeTruthy();
  });
});