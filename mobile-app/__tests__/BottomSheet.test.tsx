import React from 'react';
import { render } from '@testing-library/react-native';
import { BottomSheet } from '../BottomSheet';

describe('BottomSheet', () => {
  it('renders', () => {
    const { toJSON } = render(<BottomSheet />);
    expect(toJSON()).toBeTruthy();
  });
});