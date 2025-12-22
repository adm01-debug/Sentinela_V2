import React from 'react';
import { render } from '@testing-library/react-native';
import { Camera } from '../Camera';

describe('Camera', () => {
  it('renders', () => {
    const { toJSON } = render(<Camera />);
    expect(toJSON()).toBeTruthy();
  });
});