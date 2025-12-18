import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthMFAEnrollResponse, Factor } from '@supabase/supabase-js';

export interface MFAState {
  isEnrolled: boolean;
  isVerified: boolean;
  factors: Factor[];
  loading: boolean;
}

export function useMFA() {
  const [state, setState] = useState<MFAState>({
    isEnrolled: false,
    isVerified: false,
    factors: [],
    loading: true,
  });

  const checkMFAStatus = useCallback(async () => {
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error('Error listing MFA factors:', factorsError);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const totpFactors = factorsData?.totp || [];
      const verifiedFactors = totpFactors.filter(f => f.status === 'verified');
      
      // Check AAL level to see if MFA is verified in current session
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const isVerified = aalData?.currentLevel === 'aal2';

      setState({
        isEnrolled: verifiedFactors.length > 0,
        isVerified,
        factors: totpFactors,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking MFA status:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus]);

  const enroll = async (friendlyName?: string): Promise<AuthMFAEnrollResponse> => {
    const response = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: friendlyName || 'Authenticator App',
    });
    return response;
  };

  const verify = async (factorId: string, code: string): Promise<{ error: Error | null }> => {
    try {
      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      
      if (challengeError) {
        return { error: challengeError };
      }

      // Verify with challenge
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });

      if (!verifyError) {
        await checkMFAStatus();
      }

      return { error: verifyError };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const unenroll = async (factorId: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    
    if (!error) {
      await checkMFAStatus();
    }
    
    return { error };
  };

  const needsMFAVerification = async (): Promise<boolean> => {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    // If next level is aal2 but current is aal1, user has MFA enabled but needs to verify
    return aalData?.nextLevel === 'aal2' && aalData?.currentLevel === 'aal1';
  };

  return {
    ...state,
    enroll,
    verify,
    unenroll,
    checkMFAStatus,
    needsMFAVerification,
  };
}
