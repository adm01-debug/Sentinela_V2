import { useForm } from 'react-hook-form';
import { User, Mail, Building, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, useUpdateProfile } from '@/hooks/useAuth';

export default function SettingsProfilePage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name, email: user?.email } });

  const onSubmit = (data: any) => updateProfile.mutateAsync(data);

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
              <div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input {...register('name')} className="pl-9" placeholder="Nome" /></div>
              <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input {...register('email')} className="pl-9" placeholder="Email" /></div>
            </div>
          </CardContent>
          <CardFooter><Button type="submit">Salvar alterações</Button></CardFooter>
        </form>
      </Card>
    </div>
  );
}
