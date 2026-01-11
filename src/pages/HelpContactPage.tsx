import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export default function HelpContactPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, setValue } = useForm();

  const onSubmit = async (data: any) => { await new Promise(r => setTimeout(r, 1000)); setSent(true); };

  if (sent) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold mt-4">Mensagem enviada!</h1>
        <p className="text-muted-foreground mt-2">Nossa equipe responderá em até 24 horas.</p>
        <Button className="mt-6" onClick={() => setSent(false)}>Enviar outra mensagem</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8"><h1 className="text-3xl font-bold">Entre em Contato</h1><p className="text-muted-foreground mt-2">Estamos aqui para ajudar</p></div>
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card><CardContent className="pt-6 text-center"><Mail className="h-8 w-8 mx-auto text-primary" /><p className="font-medium mt-4">Email</p><p className="text-muted-foreground">suporte@sentinela.app</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><Phone className="h-8 w-8 mx-auto text-primary" /><p className="font-medium mt-4">Telefone</p><p className="text-muted-foreground">(11) 4002-8922</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><MapPin className="h-8 w-8 mx-auto text-primary" /><p className="font-medium mt-4">Endereço</p><p className="text-muted-foreground">São Paulo, SP</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Enviar Mensagem</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2"><Input label="Nome" {...register('name')} /><Input label="Email" type="email" {...register('email')} /></div>
            <div><label className="text-sm font-medium">Assunto</label><Select onValueChange={v => setValue('subject', v)}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="support">Suporte Técnico</SelectItem><SelectItem value="billing">Faturamento</SelectItem><SelectItem value="sales">Comercial</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent></Select></div>
            <Textarea label="Mensagem" {...register('message')} rows={5} />
          </CardContent>
          <CardFooter><Button type="submit" className="w-full"><Send className="mr-2 h-4 w-4" />Enviar Mensagem</Button></CardFooter>
        </form>
      </Card>
    </div>
  );
}