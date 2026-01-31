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

  const handleExportExcel = () => {
    const hasExercises = routinePlan.days.some((day) => day.exercises.length > 0);
    
    if (!hasExercises) {
      toast({
        title: 'Rutina vacía',
        description: 'Agrega ejercicios antes de exportar.',
        variant: 'destructive',
      });
      return;
    }

    // Generate CSV content
    const headers = ['Día', 'Patrón', 'Ejercicio', 'Sets', 'Reps', 'Rest (s)', 'Weight', 'RPE'];
    const rows: string[][] = [];

    routinePlan.days.forEach((day) => {
      day.exercises.forEach((ex) => {
        const exerciseData = exercises.find((e) => e.id === ex.exerciseId);
        rows.push([
          `Día ${day.dayNumber}`,
          ex.patternFilter ? patternLabels[ex.patternFilter] : '',
          exerciseData?.name || '',
          ex.sets,
          ex.reps,
          ex.rest,
          ex.weight,
          ex.rpe,
        ]);
      });
    });

    const csvContent = [
      `Cliente: ${routinePlan.clientName || 'Sin nombre'}`,
      `Días por semana: ${routinePlan.daysPerWeek}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rutina_${routinePlan.clientName || 'cliente'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Exportación exitosa',
      description: 'La rutina ha sido exportada como archivo CSV.',
    });
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
