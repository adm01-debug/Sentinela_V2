import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const meta: Meta = {
  title: "UI/Cards",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const BasicCard = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with any elements you want to display.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const StatCard = {
  render: () => (
    <Card className="w-64">
      <CardHeader className="pb-2">
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className="text-3xl">$45,231.89</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
  ),
};

export const UserCard = {
  render: () => (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">John Doe</CardTitle>
          <CardDescription>Senior Developer</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Badge>React</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="outline">Node.js</Badge>
        </div>
      </CardContent>
    </Card>
  ),
};

export const ActionCard = {
  render: () => (
    <Card className="w-80 hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle>Quick Action</CardTitle>
        <CardDescription>Click to perform this action</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">This card is clickable and can trigger an action.</p>
      </CardContent>
    </Card>
  ),
};
