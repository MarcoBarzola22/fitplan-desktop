import { FileSpreadsheet, Save, Trash2 } from 'lucide-react';
import { DayBlock } from '@/components/routines/DayBlock';
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
import { useExerciseStore } from '@/store/exerciseStore';
import { useToast } from '@/hooks/use-toast';
import { patternLabels } from '@/types/exercise';

export default function RoutineBuilder() {
  const { exercises, routinePlan, setClientName, setDaysPerWeek, clearRoutinePlan, saveRoutine } = useExerciseStore();
  const { toast } = useToast();

  const handleSaveToDB = async () => {
    const result = await saveRoutine();
    if (result.success) {
      toast({ title: '¡Éxito!', description: 'Rutina guardada en la base de datos.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleExportExcel = async () => {
    const hasExercises = routinePlan.days.some((day) => day.exercises.length > 0);
    
    if (!hasExercises) {
      toast({ title: 'Rutina vacía', description: 'Agrega ejercicios antes de exportar.', variant: 'destructive' });
      return;
    }

    const payload = {
      clientName: routinePlan.clientName,
      days: routinePlan.days.map((day) => ({
        dayNumber: day.dayNumber,
        warmups: (day.warmups || []).map((w) => {
          const exerciseDef = exercises.find((e) => e.id === w.exerciseId);
          return {
            exerciseName: exerciseDef?.name || '',
            videoUrl: exerciseDef?.videoUrl || '',
            reps: w.reps,
            sets: w.sets,
            weight: w.weight
          };
        }),
        exercises: day.exercises.map((ex) => {
          const exerciseDef = exercises.find((e) => e.id === ex.exerciseId);
          return {
            patternName: ex.patternFilter ? patternLabels[ex.patternFilter as keyof typeof patternLabels] : '',
            exerciseName: exerciseDef?.name || '',
            videoUrl: exerciseDef?.videoUrl || '',
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            weight: ex.weight,
            rpe: ex.rpe,
          };
        }),
      })),
    };

    try {
      const result = await window.api.exportExcel(payload);
      if (result.success) {
        toast({ title: 'Exportación exitosa', description: 'El archivo Excel ha sido guardado.' });
      } else if (!result.canceled) {
        toast({ title: 'Error al exportar', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error de sistema', description: 'Falló la comunicación con Excel.', variant: 'destructive' });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Constructor de Rutinas</h1>
          <p className="mt-1 text-muted-foreground">Planifica la rutina semanal de tu cliente</p>
        </div>
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={clearRoutinePlan}>
          <Trash2 className="mr-1 h-4 w-4" />
          Limpiar Todo
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre del Cliente</Label>
            <Input
              id="clientName"
              placeholder="Ej: Juan Pérez"
              value={routinePlan.clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="daysPerWeek">Días por Semana</Label>
            <Select value={String(routinePlan.daysPerWeek)} onValueChange={(v) => setDaysPerWeek(parseInt(v))}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'día' : 'días'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {routinePlan.days.map((day) => (
          <DayBlock key={day.id} day={day} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <Button variant="outline" className="h-14 text-lg font-semibold gap-2 border-primary/20 hover:bg-primary/5" onClick={handleSaveToDB}>
          <Save className="h-5 w-5" />
          Guardar en Base de Datos
        </Button>
        <Button className="h-14 text-lg font-semibold gap-2 shadow-lg shadow-primary/20" onClick={handleExportExcel}>
          <FileSpreadsheet className="h-5 w-5" />
          Exportar a Excel
        </Button>
      </div>
    </div>
  );
}