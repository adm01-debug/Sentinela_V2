// ============================================================
// MFA Status Tab
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, ShieldCheck, ShieldAlert, Smartphone } from 'lucide-react';

type MFAFactorType = 'totp' | 'phone' | (string & {});
type MFAFactorStatus = 'verified' | 'unverified' | (string & {});

interface MFAFactor {
  id: string;
  friendly_name?: string | null;
  factor_type: MFAFactorType;
  status: MFAFactorStatus;
}

interface MFAStatusTabProps {
  isEnrolled: boolean;
  factors: MFAFactor[];
}

function factorTypeLabel(type: MFAFactorType): string {
  switch (type) {
    case 'totp': return 'App Autenticador (TOTP)';
    case 'phone': return 'SMS';
    default: return type.toUpperCase();
  }
}

function factorTypeIcon(type: MFAFactorType) {
  if (type === 'phone') return Smartphone;
  return Key;
}

export const MFAStatusTab = React.memo(function MFAStatusTab({ isEnrolled, factors }: MFAStatusTabProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" aria-hidden="true" />
          Autenticação Multi-Fator
        </CardTitle>
        <CardDescription>Gerencie seus métodos de autenticação de dois fatores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {isEnrolled ? (
              <ShieldCheck className="h-10 w-10 text-success" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-10 w-10 text-warning" aria-hidden="true" />
            )}
            <div>
              <p className="font-medium">Status do MFA</p>
              <p className="text-sm text-muted-foreground">
                {isEnrolled ? 'Sua conta está protegida com MFA' : 'MFA não está configurado'}
              </p>
            </div>
          </div>
          <Badge variant={isEnrolled ? 'default' : 'destructive'}>
            {isEnrolled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        {factors.length > 0 && (
          <section aria-label="Fatores configurados" className="space-y-3">
            <h4 className="font-medium">Fatores Configurados</h4>
            <ul className="space-y-2">
              {factors.map((factor) => {
                const Icon = factorTypeIcon(factor.factor_type);
                const verified = factor.status === 'verified';
                return (
                  <li
                    key={factor.id}
                    className="flex items-center justify-between p-3 border rounded-lg gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {factor.friendly_name || 'App Autenticador'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {factorTypeLabel(factor.factor_type)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={verified ? 'default' : 'secondary'}>
                      {verified ? 'Verificado' : 'Pendente'}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {!isEnrolled && (
          <Button
            className="w-full"
            onClick={() => navigate('/settings?tab=security')}
            aria-label="Configurar autenticação multi-fator"
          >
            <Key className="h-4 w-4 mr-2" aria-hidden="true" />
            Configurar MFA
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
