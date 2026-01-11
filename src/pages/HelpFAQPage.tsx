import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

const faqs = {
  geral: [
    { q: 'O que é o Sentinela?', a: 'O Sentinela é uma plataforma de monitoramento de produtividade que ajuda empresas a acompanhar e melhorar o desempenho de suas equipes.' },
    { q: 'Como funciona o monitoramento?', a: 'O agente desktop coleta informações sobre as aplicações utilizadas e o tempo ativo, respeitando a privacidade do usuário.' },
    { q: 'Posso usar em múltiplos dispositivos?', a: 'Sim, cada usuário pode instalar o agente em todos os dispositivos que utiliza para trabalho.' },
  ],
  instalacao: [
    { q: 'Quais sistemas são suportados?', a: 'Windows 10+, macOS 10.15+ e as principais distribuições Linux.' },
    { q: 'Como instalar o agente?', a: 'Baixe o instalador na área de downloads e siga as instruções. O processo leva menos de 5 minutos.' },
  ],
  privacidade: [
    { q: 'Quais dados são coletados?', a: 'Coletamos apenas informações sobre aplicações ativas e tempo de uso. Não capturamos conteúdo de telas ou teclas digitadas.' },
    { q: 'Os dados são seguros?', a: 'Sim, todos os dados são criptografados em trânsito e em repouso, seguindo as melhores práticas de segurança.' },
  ],
};

export default function HelpFAQPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center"><h1 className="text-3xl font-bold">Perguntas Frequentes</h1><p className="text-muted-foreground mt-2">Encontre respostas para as dúvidas mais comuns</p></div>
      <div className="relative max-w-md mx-auto"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar pergunta..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Tabs defaultValue="geral" className="mt-8">
        <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="geral">Geral</TabsTrigger><TabsTrigger value="instalacao">Instalação</TabsTrigger><TabsTrigger value="privacidade">Privacidade</TabsTrigger></TabsList>
        {Object.entries(faqs).map(([key, items]) => (
          <TabsContent key={key} value={key}>
            <Accordion type="single" collapsible className="w-full">
              {items.filter(faq => faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase())).map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}><AccordionTrigger>{faq.q}</AccordionTrigger><AccordionContent>{faq.a}</AccordionContent></AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}