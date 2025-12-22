import React from 'react';
import { render } from '@testing-library/react-native';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('renders', () => {
    const { toJSON } = render(<Checkbox />);
    expect(toJSON()).toBeTruthy();
  });
});