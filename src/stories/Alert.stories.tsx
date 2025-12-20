import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Informação</AlertTitle>
      <AlertDescription>Esta é uma mensagem informativa.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>Ocorreu um erro ao processar sua solicitação.</AlertDescription>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert className="border-yellow-500 text-yellow-700">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Atenção</AlertTitle>
      <AlertDescription>Esta ação não pode ser desfeita.</AlertDescription>
    </Alert>
  ),
};

export const Success: Story = {
  render: () => (
    <Alert className="border-green-500 text-green-700">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Sucesso</AlertTitle>
      <AlertDescription>Operação realizada com sucesso.</AlertDescription>
    </Alert>
  ),
};
