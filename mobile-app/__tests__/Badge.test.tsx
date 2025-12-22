import React from 'react';
import { render } from '@testing-library/react-native';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders', () => {
    const { toJSON } = render(<Badge />);
    expect(toJSON()).toBeTruthy();
  });
});