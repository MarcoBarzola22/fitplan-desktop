import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Exercise, Pattern, patternLabels } from '@/types/exercise';
import { useExerciseStore } from '@/store/exerciseStore';

interface ExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise?: Exercise | null;
  defaultIsWarmup?: boolean; 
}

export function ExerciseModal({ open, onOpenChange, exercise, defaultIsWarmup = false }: ExerciseModalProps) {
  const { addExercise, updateExercise } = useExerciseStore();
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<Pattern>('push');
  const [videoUrl, setVideoUrl] = useState('');
  
  // Guardamos internamente si es calentamiento o no (ya no se muestra en pantalla)
  const [isWarmup, setIsWarmup] = useState(defaultIsWarmup); 

  const isEditing = !!exercise;

  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setPattern(exercise.pattern as Pattern);
      setVideoUrl(exercise.videoUrl || '');
      setIsWarmup(exercise.isWarmup || false);
    } else {
      setName('');
      setVideoUrl('');
      setIsWarmup(defaultIsWarmup); 
      // Seleccionamos el primer valor lógico por defecto
      setPattern(defaultIsWarmup ? 'warmup' : 'push'); 
    }
  }, [exercise, open, defaultIsWarmup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    if (isEditing && exercise) {
      updateExercise(exercise.id, { name, pattern, videoUrl, isWarmup });
    } else {
      addExercise({
        id: crypto.randomUUID(),
        name,
        pattern,
        videoUrl,
        isWarmup, 
      });
    }
    
    onOpenChange(false);
  };

  // ESTA ES LA MAGIA: Filtramos estrictamente qué opciones se muestran
  const patternOptions = (Object.keys(patternLabels) as Pattern[]).filter((p) => {
    if (isWarmup) {
      // Si estamos en la pestaña Calentamiento, SOLO mostramos estos dos
      return p === 'warmup' || p === 'mobility';
    } else {
      // Si estamos en Ejercicios Principales, mostramos TODOS MENOS los de calentamiento
      return p !== 'warmup' && p !== 'mobility';
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing 
              ? `Editar ${isWarmup ? 'Calentamiento' : 'Ejercicio'}` 
              : `Nuevo ${isWarmup ? 'Calentamiento' : 'Ejercicio'}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nombre</Label>
            <Input
              id="name"
              placeholder={isWarmup ? "Ej: Movilidad de Cadera" : "Ej: Press de Banca"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pattern" className="text-foreground">
              {isWarmup ? "Tipo de entrada en calor" : "Patrón de movimiento"}
            </Label>
            <Select value={pattern} onValueChange={(v) => setPattern(v as Pattern)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Selecciona un patrón" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {patternOptions.map((p) => (
                  <SelectItem key={p} value={p} className="text-foreground hover:bg-muted">
                    {patternLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-foreground">URL del video (Opcional)</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Guardar Cambios' : 'Crear Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}