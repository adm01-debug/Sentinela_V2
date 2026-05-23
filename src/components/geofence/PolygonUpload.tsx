import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PolygonUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (coordinates: number[][]) => void;
}

export function PolygonUpload({ isOpen, onClose, onUpload }: PolygonUploadProps) {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const validateAndUpload = (input: string) => {
    try {
      const data = JSON.parse(input);
      
      // Support GeoJSON format
      let coordinates: number[][] = [];
      
      if (data.type === 'Feature' && data.geometry?.type === 'Polygon') {
        coordinates = data.geometry.coordinates[0];
      } else if (data.type === 'Polygon' && Array.isArray(data.coordinates)) {
        coordinates = data.coordinates[0];
      } else if (data.type === 'FeatureCollection' && data.features?.[0]?.geometry?.type === 'Polygon') {
        coordinates = data.features[0].geometry.coordinates[0];
      } else if (Array.isArray(data)) {
        // Direct array of arrays [[lng, lat], ...]
        coordinates = data;
      } else {
        throw new Error('Formato de coordenadas inválido. Use um array de [longitude, latitude] ou GeoJSON (Polygon).');
      }

      // Basic coordinate validation
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
        throw new Error('O polígono deve ter pelo menos 3 pontos.');
      }

      if (!coordinates.every(coord => Array.isArray(coord) && coord.length >= 2)) {
        throw new Error('Cada ponto deve ter pelo menos [longitude, latitude].');
      }

      // Closure validation
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        // Automatically close it if it's missing the closure point
        coordinates = [...coordinates, [first[0], first[1]]];
      }

      // Validate lat/lng ranges
      coordinates.forEach(([lng, lat]) => {
        if (typeof lat !== 'number' || typeof lng !== 'number' || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          throw new Error(`Coordenadas inválidas detectadas. Latitude deve estar entre -90 e 90, e Longitude entre -180 e 180.`);
        }
      });

      onUpload(coordinates);
      setJsonInput('');
      onClose();
      toast({
        title: "Polígono carregado com sucesso!",
        description: `${coordinates.length} pontos processados.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro no processamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        validateAndUpload(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        validateAndUpload(content);
      };
      reader.readAsText(e.dataTransfer.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Polígono</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo .json ou .geojson contendo as coordenadas da área.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Arraste seu arquivo aqui</p>
            <p className="text-xs text-muted-foreground mb-4">Suporta arquivos .json e .geojson</p>
            <Input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".json,.geojson" 
              onChange={handleFileChange}
            />
            <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
              Selecionar Arquivo
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou cole o JSON</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="json-input">Conteúdo JSON</Label>
            <textarea
              id="json-input"
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder='[[ -46.6, -23.5 ], [ -46.7, -23.6 ], ...]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            disabled={!jsonInput.trim()} 
            onClick={() => validateAndUpload(jsonInput)}
            className="gap-2"
          >
            <FileCode className="h-4 w-4" />
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
