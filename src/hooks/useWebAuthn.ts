import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

// Utility functions for WebAuthn
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return bufferToBase64(array.buffer);
}

export interface WebAuthnCredential {
  id: string;
  credential_id: string;
  device_type: string | null;
  friendly_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

export function useWebAuthn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check WebAuthn support
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 
        window.PublicKeyCredential !== undefined &&
        typeof window.PublicKeyCredential === 'function';
      
      if (supported) {
        try {
          // Check if platform authenticator is available (biometric)
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsSupported(available);
        } catch {
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };
    
    checkSupport();
  }, []);

  // Fetch user's WebAuthn credentials
  const { data: credentials = [], isLoading: credentialsLoading } = useQuery({
    queryKey: ['webauthn', 'credentials'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('webauthn_credentials')
        .select('id, credential_id, device_type, friendly_name, created_at, last_used_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WebAuthnCredential[];
    },
  });

  // Register a new passkey
  const registerPasskey = useCallback(async (friendlyName?: string) => {
    if (!isSupported) {
      toast({
        title: 'WebAuthn não suportado',
        description: 'Seu dispositivo não suporta autenticação biométrica.',
        variant: 'destructive',
      });
      return { success: false, error: 'Not supported' };
    }

    setIsRegistering(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Generate challenge
      const challenge = generateChallenge();

      // Store challenge in database
      const { error: challengeError } = await supabase
        .from('webauthn_challenges')
        .insert({
          user_id: user.id,
          challenge,
          type: 'registration',
        });

      if (challengeError) throw challengeError;

      // Get RP ID from current origin
      const rpId = window.location.hostname;

      // Create credential options
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64ToBuffer(challenge),
        rp: {
          name: 'Sistema de Segurança',
          id: rpId,
        },
        user: {
          id: new TextEncoder().encode(user.id),
          name: user.email || user.id,
          displayName: user.email?.split('@')[0] || 'Usuário',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'required',
          requireResidentKey: true,
        },
        timeout: 60000,
        attestation: 'none',
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Falha ao criar credencial');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Extract public key and credential ID
      const credentialId = bufferToBase64(credential.rawId);
      const publicKey = bufferToBase64(response.getPublicKey() || new ArrayBuffer(0));
      const transports = response.getTransports?.() || [];

      // Determine device type
      let deviceType = 'unknown';
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        deviceType = 'iOS';
      } else if (/Android/.test(navigator.userAgent)) {
        deviceType = 'Android';
      } else if (/Mac/.test(navigator.userAgent)) {
        deviceType = 'macOS';
      } else if (/Windows/.test(navigator.userAgent)) {
        deviceType = 'Windows';
      } else if (/Linux/.test(navigator.userAgent)) {
        deviceType = 'Linux';
      }

      // Store credential in database
      const { error: storeError } = await supabase
        .from('webauthn_credentials')
        .insert({
          user_id: user.id,
          credential_id: credentialId,
          public_key: publicKey,
          counter: 0,
          device_type: deviceType,
          transports,
          friendly_name: friendlyName || `${deviceType} Passkey`,
        });

      if (storeError) throw storeError;

      // Clean up challenge
      await supabase
        .from('webauthn_challenges')
        .delete()
        .eq('user_id', user.id)
        .eq('type', 'registration');

      queryClient.invalidateQueries({ queryKey: ['webauthn', 'credentials'] });

      toast({
        title: 'Passkey registrada',
        description: 'Autenticação biométrica configurada com sucesso.',
      });

      return { success: true };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const errWithName = err as Error & { name: string };
      let errorMessage = 'Falha ao registrar passkey.';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Operação cancelada ou não permitida.';
      } else if (err.name === 'InvalidStateError') {
        errorMessage = 'Este dispositivo já está registrado.';
      }

      toast({
        title: 'Erro no registro',
        description: errorMessage,
        variant: 'destructive',
      });

      return { success: false, error: err.message || 'Unknown error' };
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported, toast, queryClient]);

  // Authenticate with passkey
  const authenticateWithPasskey = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: 'WebAuthn não suportado',
        description: 'Seu dispositivo não suporta autenticação biométrica.',
        variant: 'destructive',
      });
      return { success: false, error: 'Not supported' };
    }

    setIsAuthenticating(true);

    try {
      // Generate challenge
      const challenge = generateChallenge();
      const rpId = window.location.hostname;

      // Create assertion options
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64ToBuffer(challenge),
        rpId,
        userVerification: 'required',
        timeout: 60000,
      };

      // Get assertion
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('Falha na autenticação');
      }

      const credentialId = bufferToBase64(assertion.rawId);

      // Verify credential exists in database
      const { data: credential, error: fetchError } = await supabase
        .from('webauthn_credentials')
        .select('*')
        .eq('credential_id', credentialId)
        .maybeSingle();

      if (fetchError || !credential) {
        throw new Error('Credencial não encontrada');
      }

      // Update last used timestamp
      await supabase
        .from('webauthn_credentials')
        .update({ 
          last_used_at: new Date().toISOString(),
          counter: (credential.counter || 0) + 1,
        })
        .eq('id', credential.id);

      toast({
        title: 'Autenticação bem-sucedida',
        description: 'Login biométrico realizado com sucesso.',
      });

      return { success: true, userId: credential.user_id };
    } catch (error) {
      logger.error('WebAuthn authentication error:', error);
      const err = error as Error & { name?: string; message?: string };

      let errorMessage = 'Falha na autenticação biométrica.';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Operação cancelada ou não permitida.';
      }

      toast({
        title: 'Erro na autenticação',
        description: errorMessage,
        variant: 'destructive',
      });

      return { success: false, error: err.message };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isSupported, toast]);

  // Delete a passkey
  const deletePasskeyMutation = useMutation({
    mutationFn: async (credentialId: string) => {
      const { error } = await supabase
        .from('webauthn_credentials')
        .delete()
        .eq('id', credentialId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webauthn', 'credentials'] });
      toast({
        title: 'Passkey removida',
        description: 'A credencial foi removida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Rename a passkey
  const renamePasskeyMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from('webauthn_credentials')
        .update({ friendly_name: name })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webauthn', 'credentials'] });
      toast({
        title: 'Nome atualizado',
        description: 'O nome da passkey foi atualizado.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao renomear',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    isSupported,
    isRegistering,
    isAuthenticating,
    credentials,
    credentialsLoading,
    hasPasskeys: credentials.length > 0,
    registerPasskey,
    authenticateWithPasskey,
    deletePasskey: deletePasskeyMutation.mutate,
    renamePasskey: renamePasskeyMutation.mutate,
  };
}
