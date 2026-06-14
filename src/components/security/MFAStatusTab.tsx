// ============================================================
// MFA Status Tab
// ============================================================

import React from 'react';
import { Key, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MFAFactor {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: string;
}

interface MFAStatusTabProps {
  isEnrolled: boolean;
  factors: MFAFactor[];
}

export const MFAStatusTab = React.memo(function MFAStatusTab({ isEnrolled, factors }: MFAStatusTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Autenticação Multi-Fator
        </CardTitle>
        <CardDescription>Gerencie seus métodos de autenticação de dois fatores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {isEnrolled ? <ShieldCheck className="h-10 w-10 text-green-500" /> : <ShieldAlert className="h-10 w-10 text-yellow-500" />}
            <div>
              <p className="font-medium">Status do MFA</p>
              <p className="text-sm text-muted-foreground">
                {isEnrolled ? 'Sua conta está protegida com MFA' : 'MFA não está configurado'}
              </p>
            </div>
          </div>
          <Badge variant={isEnrolled ? 'default' : 'destructive'}>{isEnrolled ? 'Ativo' : 'Inativo'}</Badge>
        </div>

        {factors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Fatores Configurados</h4>
            {factors.map((factor) => (
              <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{factor.friendly_name || 'Authenticator App'}</p>
                    <p className="text-sm text-muted-foreground">Tipo: {factor.factor_type.toUpperCase()}</p>
                  </div>
                </div>
                <Badge variant={factor.status === 'verified' ? 'default' : 'secondary'}>
                  {factor.status === 'verified' ? 'Verificado' : 'Pendente'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {!isEnrolled && (
          <Button className="w-full" onClick={() => window.location.href = '/settings?tab=security'}>
            <Key className="h-4 w-4 mr-2" />
            Configurar MFA
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
