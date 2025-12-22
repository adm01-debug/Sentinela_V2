import React from 'react';
import { render } from '@testing-library/react-native';
import { ActivityScreen } from '../ActivityScreen';

describe('ActivityScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<ActivityScreen />);
    expect(toJSON()).toBeTruthy();
  });
});