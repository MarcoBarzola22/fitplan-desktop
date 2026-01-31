import { create } from 'zustand';
import { Exercise, DayExercise, TrainingDay, RoutinePlan } from '@/types/exercise';

interface ExerciseStore {
  exercises: Exercise[];
  routinePlan: RoutinePlan;
  
  // Exercise library actions
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  
  // Routine plan actions
  setClientName: (name: string) => void;
  setDaysPerWeek: (days: number) => void;
  addExerciseToDay: (dayId: string) => void;
  updateDayExercise: (dayId: string, exerciseId: string, updates: Partial<DayExercise>) => void;
  removeExerciseFromDay: (dayId: string, exerciseId: string) => void;
  clearRoutinePlan: () => void;
}

const defaultExercises: Exercise[] = [
  { id: '1', name: 'Press de Banca', pattern: 'push', videoUrl: 'https://youtube.com/watch?v=example1' },
  { id: '2', name: 'Press Militar', pattern: 'push', videoUrl: 'https://youtube.com/watch?v=example2' },
  { id: '3', name: 'Fondos en Paralelas', pattern: 'push', videoUrl: 'https://youtube.com/watch?v=example3' },
  { id: '4', name: 'Dominadas', pattern: 'pull', videoUrl: 'https://youtube.com/watch?v=example4' },
  { id: '5', name: 'Remo con Barra', pattern: 'pull', videoUrl: 'https://youtube.com/watch?v=example5' },
  { id: '6', name: 'Face Pull', pattern: 'pull', videoUrl: 'https://youtube.com/watch?v=example6' },
  { id: '7', name: 'Sentadilla', pattern: 'knee-dominant', videoUrl: 'https://youtube.com/watch?v=example7' },
  { id: '8', name: 'Prensa de Piernas', pattern: 'knee-dominant', videoUrl: 'https://youtube.com/watch?v=example8' },
  { id: '9', name: 'Peso Muerto', pattern: 'hip-dominant', videoUrl: 'https://youtube.com/watch?v=example9' },
  { id: '10', name: 'Hip Thrust', pattern: 'hip-dominant', videoUrl: 'https://youtube.com/watch?v=example10' },
  { id: '11', name: 'Plancha', pattern: 'core', videoUrl: 'https://youtube.com/watch?v=example11' },
  { id: '12', name: 'Crunch Abdominal', pattern: 'core', videoUrl: 'https://youtube.com/watch?v=example12' },
  { id: '13', name: 'Farmer Walk', pattern: 'carry', videoUrl: 'https://youtube.com/watch?v=example13' },
  { id: '14', name: 'Pallof Press', pattern: 'rotation', videoUrl: 'https://youtube.com/watch?v=example14' },
];

const createEmptyDay = (dayNumber: number): TrainingDay => ({
  id: crypto.randomUUID(),
  dayNumber,
  exercises: [],
});

const createEmptyDayExercise = (): DayExercise => ({
  id: crypto.randomUUID(),
  exerciseId: '',
  patternFilter: '',
  sets: '3',
  reps: '10-12',
  rest: '90',
  weight: '',
  rpe: '',
});

const initialRoutinePlan: RoutinePlan = {
  clientName: '',
  daysPerWeek: 3,
  days: [createEmptyDay(1)],
};

export const useExerciseStore = create<ExerciseStore>((set) => ({
  exercises: defaultExercises,
  routinePlan: initialRoutinePlan,

  addExercise: (exercise) =>
    set((state) => ({ exercises: [...state.exercises, exercise] })),

  updateExercise: (id, updates) =>
    set((state) => ({
      exercises: state.exercises.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  deleteExercise: (id) =>
    set((state) => ({
      exercises: state.exercises.filter((e) => e.id !== id),
    })),

  setClientName: (name) =>
    set((state) => ({
      routinePlan: { ...state.routinePlan, clientName: name },
    })),

  setDaysPerWeek: (days) =>
    set((state) => ({
      routinePlan: { ...state.routinePlan, daysPerWeek: days },
    })),

  addExerciseToDay: (dayId) =>
    set((state) => ({
      routinePlan: {
        ...state.routinePlan,
        days: state.routinePlan.days.map((day) =>
          day.id === dayId
            ? { ...day, exercises: [...day.exercises, createEmptyDayExercise()] }
            : day
        ),
      },
    })),

  updateDayExercise: (dayId, exerciseId, updates) =>
    set((state) => ({
      routinePlan: {
        ...state.routinePlan,
        days: state.routinePlan.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                exercises: day.exercises.map((ex) =>
                  ex.id === exerciseId ? { ...ex, ...updates } : ex
                ),
              }
            : day
        ),
      },
    })),

  removeExerciseFromDay: (dayId, exerciseId) =>
    set((state) => ({
      routinePlan: {
        ...state.routinePlan,
        days: state.routinePlan.days.map((day) =>
          day.id === dayId
            ? { ...day, exercises: day.exercises.filter((ex) => ex.id !== exerciseId) }
            : day
        ),
      },
    })),

  clearRoutinePlan: () =>
    set({
      routinePlan: {
        clientName: '',
        daysPerWeek: 3,
        days: [createEmptyDay(1)],
      },
    }),
}));
