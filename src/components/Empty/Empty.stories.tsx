import type { Meta, StoryObj } from '@storybook/react';
import { Empty } from './Empty';
import { Button } from '@/components/ui/button';
import { Inbox, Search, FileX } from 'lucide-react';

const meta: Meta<typeof Empty> = {
  title: 'Components/Empty',
  component: Empty,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { 
  args: { 
    title: 'Nenhum item',
  } 
};

export const WithDescription: Story = { 
  args: { 
    title: 'Nenhum dado encontrado',
    description: 'Não há dados disponíveis no momento' 
  } 
};

export const WithAction: Story = {
  args: { 
    title: 'Nenhum item',
    description: 'Adicione seu primeiro item para começar', 
    action: <Button>Adicionar Item</Button> 
  },
};

export const CustomIcon: Story = { 
  args: { 
    icon: <Inbox className="h-12 w-12" />,
    title: 'Caixa de entrada vazia',
    description: 'Nenhuma mensagem recebida' 
  } 
};

export const NoResults: Story = { 
  args: { 
    icon: <Search className="h-12 w-12" />,
    title: 'Nenhum resultado',
    description: 'Nenhum resultado encontrado para sua busca', 
    action: <Button variant="outline">Limpar filtros</Button> 
  } 
};

export const NoFile: Story = { 
  args: { 
    icon: <FileX className="h-12 w-12" />,
    title: 'Arquivo não encontrado',
    description: 'O arquivo que você está procurando não existe ou foi removido' 
  } 
};
