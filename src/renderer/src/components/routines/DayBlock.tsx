import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayExerciseRow } from './DayExerciseRow';
import { TrainingDay } from '@/types/exercise';
import { useExerciseStore } from '@/store/exerciseStore';

interface DayBlockProps {
  day: TrainingDay;
}

export function DayBlock({ day }: DayBlockProps) {
  const { addExerciseToDay } = useExerciseStore();

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden animate-fade-in">
      {/* Day Header - Tab Style */}
      <div className="bg-muted/70 border-b border-border px-4 py-3">
        <h3 className="text-lg font-semibold text-foreground">
          DÍA {day.dayNumber}
        </h3>
      </div>

      {/* Exercise Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">
                Patrón
              </th>
              <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">
                Ejercicio
              </th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                Sets
              </th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                Reps
              </th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                Rest (s)
              </th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                Weight
              </th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                RPE
              </th>
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                Acción
              </th>
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
                <DayExerciseRow
                  key={exercise.id}
                  dayId={day.id}
                  exercise={exercise}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Exercise Button */}
      <div className="p-4 border-t border-border bg-muted/20">
        <Button
          variant="outline"
          className="w-full gap-2 border-dashed border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          onClick={() => addExerciseToDay(day.id)}
        >
          <Plus className="h-4 w-4" />
          Agregar Ejercicio a este Día
        </Button>
      </div>
    </div>
  );
}
