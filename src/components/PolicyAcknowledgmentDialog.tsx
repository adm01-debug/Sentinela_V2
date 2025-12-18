import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Camera, MapPin, Check, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PolicyAcknowledgmentDialogProps {
  employeeName: string;
  onAcknowledged?: () => void;
}

export function PolicyAcknowledgmentDialog({ employeeName, onAcknowledged }: PolicyAcknowledgmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'intro' | 'camera' | 'confirm'>('intro');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataUrl);
      stopCamera();
      setStep('confirm');
    }
  }, [stopCamera]);

  const getLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      // Try to get address from coordinates using a free geocoding service
      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'pt-BR' } }
        );
        const data = await response.json();
        if (data.display_name) {
          address = data.display_name;
        }
      } catch (e) {
        console.warn('Geocoding failed, using coordinates:', e);
      }
      
      setLocation({ lat: latitude, lng: longitude, address });
    } catch (error) {
      console.error('Location error:', error);
      setLocationError('Não foi possível obter a localização. Verifique as permissões.');
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  const handleStartProcess = useCallback(() => {
    setStep('camera');
    startCamera();
    getLocation();
  }, [startCamera, getLocation]);

  const handleRetakePhoto = useCallback(() => {
    setPhotoData(null);
    setStep('camera');
    startCamera();
  }, [startCamera]);

  const handleSubmit = async () => {
    if (!photoData || !location) {
      toast({
        title: "Dados incompletos",
        description: "É necessário foto e localização para confirmar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert base64 to blob
      const response = await fetch(photoData);
      const blob = await response.blob();
      
      // Upload photo to storage
      const fileName = `${employeeName.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('acknowledgment-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('acknowledgment-photos')
        .getPublicUrl(fileName);

      // Insert acknowledgment record
      const { error: insertError } = await supabase
        .from('policy_acknowledgments')
        .insert({
          employee_name: employeeName,
          photo_url: urlData.publicUrl,
          latitude: location.lat,
          longitude: location.lng,
          location_address: location.address,
          device_name: navigator.userAgent.substring(0, 100),
          policy_version: '1.0'
        });

      if (insertError) throw insertError;

      toast({
        title: "Políticas aceitas",
        description: "Sua confirmação foi registrada com sucesso.",
      });

      setOpen(false);
      onAcknowledged?.();
      
      // Reset state
      setStep('intro');
      setPhotoData(null);
      setLocation(null);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível salvar a confirmação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      stopCamera();
      setStep('intro');
      setPhotoData(null);
      setLocation(null);
      setCameraError(null);
      setLocationError(null);
    }
  }, [open, stopCamera]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Check className="h-4 w-4" />
          Aceitar Políticas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmação de Políticas</DialogTitle>
          <DialogDescription>
            {step === 'intro' && 'Para confirmar que você leu e aceita as políticas de monitoramento, precisamos capturar sua foto e localização.'}
            {step === 'camera' && 'Posicione seu rosto na câmera e clique para capturar.'}
            {step === 'confirm' && 'Verifique os dados e confirme a aceitação.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'intro' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Foto</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Localização</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Esses dados são necessários para validar sua identidade e local de aceite das políticas.
              </p>
            </div>
          )}

          {step === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-destructive">
                    <AlertCircle className="h-8 w-8" />
                    <p className="text-sm text-center px-4">{cameraError}</p>
                    <Button variant="outline" size="sm" onClick={startCamera}>
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                {isLoadingLocation ? (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Obtendo localização...
                  </span>
                ) : locationError ? (
                  <span className="text-destructive flex items-center gap-1">
                    {locationError}
                    <Button variant="ghost" size="sm" className="h-auto p-1" onClick={getLocation}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </span>
                ) : location ? (
                  <span className="text-muted-foreground truncate">{location.address}</span>
                ) : null}
              </div>
            </div>
          )}

          {step === 'confirm' && photoData && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img src={photoData} alt="Foto capturada" className="w-full h-full object-cover" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 gap-1"
                  onClick={handleRetakePhoto}
                >
                  <RefreshCw className="h-3 w-3" />
                  Refazer
                </Button>
              </div>
              
              {location && (
                <div className="flex items-start gap-2 text-sm p-3 bg-muted rounded-lg">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{location.address}</span>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                <strong>Funcionário:</strong> {employeeName}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'intro' && (
            <Button onClick={handleStartProcess} className="w-full gap-2">
              <Camera className="h-4 w-4" />
              Iniciar Captura
            </Button>
          )}
          
          {step === 'camera' && !cameraError && (
            <Button 
              onClick={capturePhoto} 
              className="w-full gap-2"
              disabled={!location}
            >
              <Camera className="h-4 w-4" />
              Capturar Foto
            </Button>
          )}
          
          {step === 'confirm' && (
            <Button 
              onClick={handleSubmit} 
              className="w-full gap-2"
              disabled={isSubmitting || !photoData || !location}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirmar Aceitação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}