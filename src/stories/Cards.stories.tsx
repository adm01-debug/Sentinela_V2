import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const meta: Meta = {
  title: 'UI/Cards',
  tags: ['autodocs'],
};
export default meta;

export const BasicCard: StoryObj = {
  render: () => (
    <Card className="w-80">
      <CardHeader><CardTitle>Card Title</CardTitle><CardDescription>Card description here</CardDescription></CardHeader>
      <CardContent><p>Card content goes here.</p></CardContent>
      <CardFooter><Button>Action</Button></CardFooter>
    </Card>
  ),
};

export const StatCard: StoryObj = {
  render: () => (
    <Card className="w-64">
      <CardHeader className="pb-2"><CardDescription>Total Revenue</CardDescription><CardTitle className="text-3xl">$45,231.89</CardTitle></CardHeader>
      <CardContent><p className="text-xs text-green-500">+20.1% from last month</p></CardContent>
    </Card>
  ),
};

export const ImageCard: StoryObj = {
  render: () => (
    <Card className="w-80 overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600" />
      <CardHeader><CardTitle>Featured Item</CardTitle><CardDescription>A beautiful gradient card</CardDescription></CardHeader>
      <CardFooter className="gap-2"><Badge>New</Badge><Badge variant="outline">Featured</Badge></CardFooter>
    </Card>
  ),
};

export const InteractiveCard: StoryObj = {
  render: () => (
    <Card className="w-80 cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader><CardTitle>Clickable Card</CardTitle><CardDescription>Hover to see effect</CardDescription></CardHeader>
      <CardContent><p>This card has hover effects.</p></CardContent>
    </Card>
  ),
};
