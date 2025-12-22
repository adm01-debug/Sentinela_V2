import type { Meta, StoryObj } from '@storybook/react';
import { FaceVerification } from './FaceVerification';

const meta: Meta<typeof FaceVerification> = {
  title: 'Components/FaceVerification',
  component: FaceVerification,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FaceVerification>;

export const Default: Story = {};
