import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "../components/ui/toaster";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";

const meta: Meta<typeof Toaster> = {
  title: "UI/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  decorators: [(Story) => (
    <>
      <Story />
      <Toaster />
    </>
  )],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ToastDemo = ({ variant, title, description }: any) => {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ variant, title, description })}>
      Show {variant || "default"} toast
    </Button>
  );
};

export const Default: Story = {
  render: () => <ToastDemo title="Event created" description="Your event has been created successfully." />,
};

export const Destructive: Story = {
  render: () => <ToastDemo variant="destructive" title="Error" description="Something went wrong. Please try again." />,
};

export const WithAction: Story = {
  render: () => {
    const { toast } = useToast();
    return (
      <Button
        onClick={() =>
          toast({
            title: "Undo",
            description: "Your changes have been saved.",
            action: <Button variant="outline" size="sm">Undo</Button>,
          })
        }
      >
        Show with action
      </Button>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ToastDemo title="Default" description="This is a default toast" />
      <ToastDemo variant="destructive" title="Error" description="This is an error toast" />
    </div>
  ),
};
