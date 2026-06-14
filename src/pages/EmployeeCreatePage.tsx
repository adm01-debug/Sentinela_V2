import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, Briefcase, Mail, Building2, User, Phone, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { useCreateEmployee } from "@/hooks/useEmployees";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { ROUTES } from "@/constants/routes";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  department: z.string().min(1, "Departamento é obrigatório"),
  position: z.string().min(1, "Cargo é obrigatório"),
  status: z.enum(["active", "inactive", "vacation", "leave"]),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EmployeeCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "active",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createEmployee.mutateAsync({
        name: data.name,
        full_name: data.name,
        email: data.email,
        department: data.department,
        position: data.position,
        status: data.status,
        phone: data.phone,
        notes: data.notes,
        hire_date: new Date().toISOString(),
      });
      navigate(ROUTES.EMPLOYEES);
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title={t("employees.addEmployee")}
          description="Cadastre um novo funcionário no sistema"
          showBackButton={true}
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Informações Pessoais */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>Dados básicos de identificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Ex: João Silva"
                        className="pl-10"
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="joao@empresa.com"
                        className="pl-10"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        {...register("phone")}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      id="notes"
                      className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-10 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Informações adicionais..."
                      {...register("notes")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Cargo e Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="department"
                      placeholder="Ex: Engenharia"
                      className="pl-10"
                      {...register("department")}
                    />
                  </div>
                  {errors.department && (
                    <p className="text-xs text-destructive">{errors.department.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="position"
                      placeholder="Ex: Desenvolvedor Senior"
                      className="pl-10"
                      {...register("position")}
                    />
                  </div>
                  {errors.position && (
                    <p className="text-xs text-destructive">{errors.position.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    defaultValue="active"
                    onValueChange={(v) => setValue("status", v as FormData["status"])}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="vacation">Em Férias</SelectItem>
                      <SelectItem value="leave">Afastado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-0">
                <Button type="submit" className="w-full gap-2" disabled={createEmployee.isPending}>
                  {createEmployee.isPending ? (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4 animate-pulse" />
                      Salvando...
                    </span>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Funcionário
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground"
                  onClick={() => navigate(ROUTES.EMPLOYEES)}
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
