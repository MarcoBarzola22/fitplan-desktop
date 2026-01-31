export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  videoUrl: string;
}

export interface DayExercise {
  id: string;
  exerciseId: string;
  patternFilter: Pattern | '';
  sets: string;
  reps: string;
  rest: string;
  weight: string;
  rpe: string;
}

export interface TrainingDay {
  id: string;
  dayNumber: number;
  exercises: DayExercise[];
}

export interface RoutinePlan {
  clientName: string;
  daysPerWeek: number;
  days: TrainingDay[];
}

export type Pattern =
  | 'push'
  | 'pull'
  | 'knee-dominant'
  | 'hip-dominant'
  | 'core'
  | 'carry'
  | 'rotation'
  | 'cardio';

export const patternLabels: Record<Pattern, string> = {
  push: 'Empuje',
  pull: 'Tracción',
  'knee-dominant': 'Dominante Rodilla',
  'hip-dominant': 'Dominante Cadera',
  core: 'Core',
  carry: 'Acarreo',
  rotation: 'Rotación',
  cardio: 'Cardio',
};

export const patternColors: Record<Pattern, string> = {
  push: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pull: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'knee-dominant': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'hip-dominant': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  core: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  carry: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  rotation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  cardio: 'bg-green-500/20 text-green-400 border-green-500/30',
};
