import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Textarea';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile } from '@/hooks/useAuth';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name, email: user?.email, phone: user?.phone, bio: user?.bio } });

  const onSubmit = async (data: any) => { await updateProfile.mutateAsync(data); navigate('/profile'); };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
      <Card>
        <CardHeader><CardTitle>Editar Perfil</CardTitle></CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20"><AvatarImage src={user?.avatar} /><AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback></Avatar>
              <div><Button type="button" variant="outline"><Upload className="mr-2 h-4 w-4" />Alterar foto</Button><p className="text-sm text-muted-foreground mt-2">JPG, PNG. Máximo 2MB</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nome" {...register('name')} />
              <Input label="Email" type="email" {...register('email')} />
              <Input label="Telefone" {...register('phone')} />
            </div>
            <Textarea label="Bio" {...register('bio')} placeholder="Conte um pouco sobre você..." />
          </CardContent>
          <CardFooter className="gap-2"><Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button><Button type="submit" loading={updateProfile.isPending}>Salvar</Button></CardFooter>
        </form>
      </Card>
    </div>
  );
}