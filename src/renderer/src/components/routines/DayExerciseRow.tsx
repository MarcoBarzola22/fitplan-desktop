import { useMemo } from 'react';
import { Trash2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DayExercise, Pattern, patternLabels } from '@/types/exercise';
import { useExerciseStore } from '@/store/exerciseStore';

interface DayExerciseRowProps {
  dayId: string;
  exercise: DayExercise;
}

export function DayExerciseRow({ dayId, exercise }: DayExerciseRowProps) {
  const { exercises, updateDayExercise, removeExerciseFromDay } = useExerciseStore();

  const filteredExercises = useMemo(() => {
    if (!exercise.patternFilter) return exercises;
    return exercises.filter((e) => e.pattern === exercise.patternFilter);
  }, [exercises, exercise.patternFilter]);

  const selectedExercise = exercises.find((e) => e.id === exercise.exerciseId);

  const handlePatternChange = (value: string) => {
    updateDayExercise(dayId, exercise.id, { 
      patternFilter: value === 'all' ? '' : value as Pattern,
      exerciseId: '' // Reset exercise when pattern changes
    });
  };

  const handleExerciseChange = (value: string) => {
    updateDayExercise(dayId, exercise.id, { exerciseId: value });
  };

  return (
    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
      {/* Pattern Filter */}
      <td className="p-2">
        <Select value={exercise.patternFilter || 'all'} onValueChange={handlePatternChange}>
          <SelectTrigger className="h-9 w-full bg-input border-border text-sm">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all" className="text-foreground">Todos</SelectItem>
            {(Object.keys(patternLabels) as Pattern[]).map((p) => (
              <SelectItem key={p} value={p} className="text-foreground">
                {patternLabels[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>

      {/* Exercise Select */}
      <td className="p-2">
        <div className="flex items-center gap-2">
          <Select value={exercise.exerciseId || 'none'} onValueChange={handleExerciseChange}>
            <SelectTrigger className="h-9 flex-1 bg-input border-border text-sm">
              <SelectValue placeholder="Seleccionar ejercicio..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-60">
              <SelectItem value="none" className="text-muted-foreground">
                Seleccionar ejercicio...
              </SelectItem>
              {filteredExercises.map((ex) => (
                <SelectItem key={ex.id} value={ex.id} className="text-foreground">
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedExercise?.videoUrl && (
            <a
              href={selectedExercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Video className="h-4 w-4" />
            </a>
          )}
        </div>
      </td>

      {/* Sets */}
      <td className="p-2">
        <Input
          type="number"
          min={1}
          max={20}
          value={exercise.sets}
          onChange={(e) => updateDayExercise(dayId, exercise.id, { sets: e.target.value })}
          className="h-9 w-16 text-center bg-input border-border text-sm"
        />
      </td>

      {/* Reps */}
      <td className="p-2">
        <Input
          type="text"
          placeholder="10-12"
          value={exercise.reps}
          onChange={(e) => updateDayExercise(dayId, exercise.id, { reps: e.target.value })}
          className="h-9 w-20 text-center bg-input border-border text-sm"
        />
      </td>

      {/* Rest */}
      <td className="p-2">
        <Input
          type="number"
          min={0}
          max={600}
          value={exercise.rest}
          onChange={(e) => updateDayExercise(dayId, exercise.id, { rest: e.target.value })}
          className="h-9 w-16 text-center bg-input border-border text-sm"
        />
      </td>

      {/* Weight */}
      <td className="p-2">
        <Input
          type="text"
          placeholder="—"
          value={exercise.weight}
          onChange={(e) => updateDayExercise(dayId, exercise.id, { weight: e.target.value })}
          className="h-9 w-20 text-center bg-input border-border text-sm"
        />
      </td>

      {/* RPE */}
      <td className="p-2">
        <Input
          type="number"
          min={1}
          max={10}
          placeholder="—"
          value={exercise.rpe}
          onChange={(e) => updateDayExercise(dayId, exercise.id, { rpe: e.target.value })}
          className="h-9 w-14 text-center bg-input border-border text-sm"
        />
      </td>

      {/* Actions */}
      <td className="p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => removeExerciseFromDay(dayId, exercise.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
