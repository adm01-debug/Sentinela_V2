import React from 'react';
import { render } from '@testing-library/react-native';
import { DateTimePicker } from '../DateTimePicker';

describe('DateTimePicker', () => {
  it('renders', () => {
    const { toJSON } = render(<DateTimePicker />);
    expect(toJSON()).toBeTruthy();
  });
});