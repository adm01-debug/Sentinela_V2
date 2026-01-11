import { useForm } from 'react-hook-form';
import { User, Mail, Building, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile } from '@/hooks/useAuth';

export default function SettingsProfilePage() {
  const user = useAuthStore(s => s.user);
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name, email: user?.email, phone: user?.phone, company: user?.company } });

  const onSubmit = (data: any) => updateProfile.mutate(data);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline">Alterar foto</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative"><User className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" /><Input label="Nome" {...register('name')} className="pl-9" /></div>
              <div className="relative"><Mail className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" /><Input label="Email" {...register('email')} className="pl-9" /></div>
              <div className="relative"><Phone className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" /><Input label="Telefone" {...register('phone')} className="pl-9" /></div>
              <div className="relative"><Building className="absolute left-3 top-9 h-4 w-4 text-muted-foreground" /><Input label="Empresa" {...register('company')} className="pl-9" /></div>
            </div>
          </CardContent>
          <CardFooter><Button type="submit" loading={updateProfile.isPending}>Salvar alterações</Button></CardFooter>
        </form>
      </Card>
    </div>
  );
}