import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

describe('HomeScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<HomeScreen />);
    expect(toJSON()).toBeTruthy();
  });
});