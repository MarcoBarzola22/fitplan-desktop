import { FileSpreadsheet, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
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
  const { exercises, routinePlan, setClientName, setDaysPerWeek, clearRoutinePlan } = useExerciseStore();
  const { toast } = useToast();

  const handleExportExcel = async () => {
    const hasExercises = routinePlan.days.some((day) => day.exercises.length > 0);
    
    if (!hasExercises) {
      toast({
        title: 'Rutina vacía',
        description: 'Agrega ejercicios antes de exportar.',
        variant: 'destructive',
      });
      return;
    }

    // 1. Preparamos los datos tal cual los espera nuestro backend de Electron
    const payload = {
      clientName: routinePlan.clientName,
      days: routinePlan.days.map((day) => ({
        dayNumber: day.dayNumber,
        // Agregamos los calentamientos buscando su nombre y video reales
        warmups: (day.warmups || []).map((w) => {
          const exerciseDef = exercises.find((e) => e.id === w.exerciseId);
          return {
            exerciseName: exerciseDef?.name || '',
            videoUrl: exerciseDef?.videoUrl || '',
            reps: w.reps,
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
      // 2. Llamamos al puente mágico de Electron
      const result = await window.api.exportExcel(payload);

      if (result.success) {
        toast({
          title: 'Exportación exitosa',
          description: 'El archivo Excel ha sido guardado correctamente.',
        });
      } else if (!result.canceled) {
        // Si falló pero NO fue porque el usuario cerró la ventana de guardar
        toast({
          title: 'Error al exportar',
          description: result.error || 'Ocurrió un error al generar el archivo.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Fallo la comunicación con Electron:", error);
      toast({
        title: 'Error de sistema',
        description: 'No se pudo comunicar con el generador de Excel.',
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Constructor de Rutinas
            </h1>
            <p className="mt-1 text-muted-foreground">
              Planifica la rutina semanal de tu cliente
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={clearRoutinePlan}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Limpiar Todo
          </Button>
        </div>

        {/* Plan Header - Client Info */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-foreground font-medium">
                Nombre del Cliente
              </Label>
              <Input
                id="clientName"
                placeholder="Ej: Juan Pérez"
                value={routinePlan.clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysPerWeek" className="text-foreground font-medium">
                Cantidad de Días por Semana
              </Label>
              <Select
                value={String(routinePlan.daysPerWeek)}
                onValueChange={(v) => setDaysPerWeek(parseInt(v))}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-foreground">
                      {n} {n === 1 ? 'día' : 'días'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Day Blocks */}
        <div className="space-y-6">
          {routinePlan.days.map((day) => (
            <DayBlock key={day.id} day={day} />
          ))}
        </div>

        {/* Export Button */}
        <div className="pt-4">
          <Button
            className="w-full gap-2 h-14 text-lg font-semibold"
            size="lg"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="h-5 w-5" />
            Exportar a Excel
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}