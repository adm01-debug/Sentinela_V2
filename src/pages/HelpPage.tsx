import { Link } from 'react-router-dom';
import { Search, Book, MessageCircle, FileText, Video, ExternalLink } from 'lucide-react';
import { Input  } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent  } from '@/components/ui/card';
import { Button  } from '@/components/ui/button';

const categories = [
  { icon: Book, title: 'Documentação', description: 'Guias completos do sistema', link: '/docs' },
  { icon: FileText, title: 'FAQ', description: 'Perguntas frequentes', link: '/help/faq' },
  { icon: Video, title: 'Tutoriais', description: 'Vídeos passo a passo', link: '/tutorials' },
  { icon: MessageCircle, title: 'Suporte', description: 'Fale com nossa equipe', link: '/help/contact' },
];

export default function HelpPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Como podemos ajudar?</h1>
        <p className="text-muted-foreground mt-2">Encontre respostas, tutoriais e suporte</p>
        <div className="relative mt-6"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Buscar na central de ajuda..." className="pl-12 h-12 text-lg" /></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
        {categories.map((cat, i) => (
          <Link key={i} to={cat.link}>
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader><cat.icon className="h-8 w-8 text-primary" /><CardTitle className="mt-4">{cat.title}</CardTitle><CardDescription>{cat.description}</CardDescription></CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <Card><CardHeader><CardTitle>Artigos Populares</CardTitle></CardHeader><CardContent className="space-y-4">
        {['Como começar com o Sentinela', 'Configurando o agente desktop', 'Gerenciando permissões de usuários', 'Criando relatórios personalizados'].map((article, i) => (
          <Link key={i} to="#" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"><span>{article}</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></Link>
        ))}
      </CardContent></Card>
    </div>
  );
}