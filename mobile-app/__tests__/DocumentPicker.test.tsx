import React from 'react';
import { render } from '@testing-library/react-native';
import { DocumentPicker } from '../DocumentPicker';

describe('DocumentPicker', () => {
  it('renders', () => {
    const { toJSON } = render(<DocumentPicker />);
    expect(toJSON()).toBeTruthy();
  });
});