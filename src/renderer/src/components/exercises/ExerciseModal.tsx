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
}

export function ExerciseModal({ open, onOpenChange, exercise }: ExerciseModalProps) {
  const { addExercise, updateExercise } = useExerciseStore();
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<Pattern>('push');
  const [videoUrl, setVideoUrl] = useState('');

  const isEditing = !!exercise;

  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setPattern(exercise.pattern);
      setVideoUrl(exercise.videoUrl);
    } else {
      setName('');
      setPattern('push');
      setVideoUrl('');
    }
  }, [exercise, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    if (isEditing && exercise) {
      updateExercise(exercise.id, { name, pattern, videoUrl });
    } else {
      addExercise({
        id: crypto.randomUUID(),
        name,
        pattern,
        videoUrl,
      });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nombre del ejercicio</Label>
            <Input
              id="name"
              placeholder="Ej: Press de Banca"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pattern" className="text-foreground">Patrón de movimiento</Label>
            <Select value={pattern} onValueChange={(v) => setPattern(v as Pattern)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Selecciona un patrón" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {(Object.keys(patternLabels) as Pattern[]).map((p) => (
                  <SelectItem key={p} value={p} className="text-foreground hover:bg-muted">
                    {patternLabels[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-foreground">URL del video</Label>
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
              {isEditing ? 'Guardar Cambios' : 'Crear Ejercicio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
