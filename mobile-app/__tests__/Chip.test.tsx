import React from 'react';
import { render } from '@testing-library/react-native';
import { Chip } from '../Chip';

describe('Chip', () => {
  it('renders', () => {
    const { toJSON } = render(<Chip />);
    expect(toJSON()).toBeTruthy();
  });
});