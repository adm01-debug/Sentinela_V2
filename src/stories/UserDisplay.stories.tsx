import type { Meta } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";

const meta: Meta = {
  title: "UI/UserDisplay",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;

export const AvatarSizes = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar className="h-10 w-10">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar className="h-12 w-12">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>XL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const UserWithInfo = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">John Doe</p>
        <p className="text-sm text-muted-foreground">john@example.com</p>
      </div>
    </div>
  ),
};

export const UserWithStatus = {
  render: () => (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
      </div>
      <div>
        <p className="font-medium">John Doe</p>
        <Badge variant="secondary" className="text-xs">Online</Badge>
      </div>
    </div>
  ),
};

export const AvatarGroup = {
  render: () => (
    <div className="flex -space-x-2">
      {[1, 2, 3, 4].map((i) => (
        <Avatar key={i} className="border-2 border-background">
          <AvatarFallback>U{i}</AvatarFallback>
        </Avatar>
      ))}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-background text-xs font-medium">
        +5
      </div>
    </div>
  ),
};
