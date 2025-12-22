import type { Meta, StoryObj } from '@storybook/react';
import { StepWizard } from './StepWizard';
const meta: Meta<typeof StepWizard> = { title: 'Components/StepWizard', component: StepWizard };
export default meta;
type Story = StoryObj<typeof StepWizard>;
export const Default: Story = {};
