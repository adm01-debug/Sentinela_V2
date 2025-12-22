import React from 'react';
import { render } from '@testing-library/react-native';
import { Chart } from '../Chart';

describe('Chart', () => {
  it('renders', () => {
    const { toJSON } = render(<Chart />);
    expect(toJSON()).toBeTruthy();
  });
});