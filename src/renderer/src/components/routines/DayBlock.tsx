import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DayExerciseRow } from './DayExerciseRow';
import { TrainingDay, patternLabels } from '@/types/exercise'; // IMPORTANTE: patternLabels
import { useExerciseStore } from '@/store/exerciseStore';

interface DayBlockProps {
  day: TrainingDay;
}

export function DayBlock({ day }: DayBlockProps) {
  const { 
    exercises, 
    addExerciseToDay, 
    addWarmupToDay, 
    updateWarmupInDay, 
    removeWarmupFromDay 
  } = useExerciseStore();

  // FILTRO MÁGICO: Aquí solo pasan los que son de calentamiento
  const warmupExercises = exercises.filter(e => e.isWarmup);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in">
      <div className="bg-muted/70 border-b border-border px-4 py-3 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">
          DÍA {day.dayNumber}
        </h3>
      </div>

      {/* --- SECCIÓN: CALENTAMIENTO Y MOVILIDAD --- */}
      <div className="p-4 border-b border-border bg-blue-50/10 dark:bg-blue-900/10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            CALENTAMIENTO Y ZONA MEDIA
          </h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            onClick={() => addWarmupToDay(day.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Añadir Movilidad
          </Button>
        </div>
        
        {(!day.warmups || day.warmups.length === 0) ? (
          <p className="text-xs text-muted-foreground italic mb-2">No hay calentamientos definidos.</p>
        ) : (
          <div className="space-y-2">
            {day.warmups.map((warmup) => {
              // Buscamos el ejercicio para saber si es "Calentamiento" o "Movilidad"
              const selectedEx = exercises.find(e => e.id === warmup.exerciseId);
              const patternName = selectedEx ? patternLabels[selectedEx.pattern as keyof typeof patternLabels] : 'Tipo';

              return (
                <div key={warmup.id} className="flex gap-2 items-center">
                  
                  {/* ETIQUETA DE TIPO (Se llena sola al elegir el ejercicio) */}
                  <div className="w-28 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-1.5 rounded text-center truncate shrink-0">
                    {patternName}
                  </div>

                  {/* SELECTOR (Ya filtrado) */}
                  <Select
                    value={warmup.exerciseId}
                    onValueChange={(val) => updateWarmupInDay(day.id, warmup.id, { exerciseId: val })}
                  >
                    <SelectTrigger className="h-8 text-sm flex-1 bg-background border-border">
                      <SelectValue placeholder="Selecciona un ejercicio..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {warmupExercises.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id} className="text-foreground">
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* NUEVOS INPUTS */}
                  <Input 
                    placeholder="Series" 
                    className="h-8 text-sm w-16 bg-background border-border text-foreground text-center"
                    value={warmup.sets || ''}
                    onChange={(e) => updateWarmupInDay(day.id, warmup.id, { sets: e.target.value })}
                  />
                  <Input 
                    placeholder="Reps" 
                    className="h-8 text-sm w-20 bg-background border-border text-foreground text-center"
                    value={warmup.reps}
                    onChange={(e) => updateWarmupInDay(day.id, warmup.id, { reps: e.target.value })}
                  />
                  <Input 
                    placeholder="Peso" 
                    className="h-8 text-sm w-20 bg-background border-border text-foreground text-center"
                    value={warmup.weight || ''}
                    onChange={(e) => updateWarmupInDay(day.id, warmup.id, { weight: e.target.value })}
                  />

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeWarmupFromDay(day.id, warmup.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- TABLA PRINCIPAL --- */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Patrón</th>
              <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">Ejercicio</th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Sets</th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Reps</th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Rest (s)</th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Weight</th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">RPE</th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Acción</th>
            </tr>
          </thead>
          <tbody>
            {day.exercises.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No hay ejercicios en este día.</p>
                  <p className="text-xs mt-1">Usa el botón de abajo para agregar uno.</p>
                </td>
              </tr>
            ) : (
              day.exercises.map((exercise) => (
                <DayExerciseRow key={exercise.id} dayId={day.id} exercise={exercise} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border bg-muted/20">
        <Button
          variant="outline"
          className="w-full gap-2 border-dashed border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          onClick={() => addExerciseToDay(day.id)}
        >
          <Plus className="h-4 w-4" />
          Agregar Ejercicio Principal
        </Button>
      </div>
    </div>
  );
}