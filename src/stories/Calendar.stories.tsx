import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

const meta: Meta<typeof Calendar> = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const CalendarDemo = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />;
};

export const Default: Story = {
  render: () => <CalendarDemo />,
};
