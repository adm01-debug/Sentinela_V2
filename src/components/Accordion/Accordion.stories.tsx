import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <AccordionItem title="Section 1">Content for section 1</AccordionItem>
        <AccordionItem title="Section 2">Content for section 2</AccordionItem>
        <AccordionItem title="Section 3">Content for section 3</AccordionItem>
      </>
    ),
  },
};
export const Multiple: Story = { args: { ...Default.args, multiple: true } };
export const Bordered: Story = { args: { ...Default.args, bordered: true } };
export const DefaultExpanded: Story = { args: { ...Default.args, defaultExpanded: ['0'] } };
