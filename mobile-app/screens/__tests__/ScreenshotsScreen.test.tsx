import React from 'react';
import { render } from '@testing-library/react-native';
import { ScreenshotsScreen } from '../ScreenshotsScreen';

describe('ScreenshotsScreen', () => {
  it('renders', () => {
    const { toJSON } = render(<ScreenshotsScreen />);
    expect(toJSON()).toBeTruthy();
  });
});