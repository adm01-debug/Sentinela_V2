import React from 'react';
import { render } from '@testing-library/react-native';
import { CurrencyInput } from '../CurrencyInput';

describe('CurrencyInput', () => {
  it('renders', () => {
    const { toJSON } = render(<CurrencyInput />);
    expect(toJSON()).toBeTruthy();
  });
});