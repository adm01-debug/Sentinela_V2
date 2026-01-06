import type { Meta, StoryObj } from "@storybook/react";
import { FileUpload } from "../components/ui/FileUpload";
import { useState } from "react";

const meta: Meta<typeof FileUpload> = {
  title: "UI/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accept: "image/*",
    maxSize: 5 * 1024 * 1024,
    onUpload: (files) => console.log("Files:", files),
  },
};

export const Multiple: Story = {
  args: {
    accept: "*/*",
    multiple: true,
    maxFiles: 5,
    onUpload: (files) => console.log("Files:", files),
  },
};

export const WithPreview: Story = {
  args: {
    accept: "image/*",
    showPreview: true,
    onUpload: (files) => console.log("Files:", files),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onUpload: (files) => console.log("Files:", files),
  },
};

export const CustomDropzone: Story = {
  args: {
    dropzoneText: "Arraste arquivos aqui ou clique para selecionar",
    accept: ".pdf,.doc,.docx",
    onUpload: (files) => console.log("Files:", files),
  },
};
