import React from 'react';
import { render } from '@testing-library/react-native';
import { PinScreen } from '../PinScreen';

describe('PinScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<PinScreen />);
    expect(toJSON()).toBeTruthy();
  });
});