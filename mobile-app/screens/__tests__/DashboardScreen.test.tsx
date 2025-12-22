import React from 'react';
import { render } from '@testing-library/react-native';
import { DashboardScreen } from '../DashboardScreen';

describe('DashboardScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<DashboardScreen />);
    expect(toJSON()).toBeTruthy();
  });
});