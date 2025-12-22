import React from 'react';
import { render } from '@testing-library/react-native';
import { CodeInput } from '../CodeInput';

describe('CodeInput', () => {
  it('renders', () => {
    const { toJSON } = render(<CodeInput />);
    expect(toJSON()).toBeTruthy();
  });
});