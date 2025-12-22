import React from 'react';
import { render } from '@testing-library/react-native';
import { DatePicker } from '../DatePicker';

describe('DatePicker', () => {
  it('renders', () => {
    const { toJSON } = render(<DatePicker />);
    expect(toJSON()).toBeTruthy();
  });
});