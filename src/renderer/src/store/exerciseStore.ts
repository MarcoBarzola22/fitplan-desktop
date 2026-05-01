import { create } from 'zustand';
import { Exercise, DayExercise, TrainingDay, RoutinePlan } from '@/types/exercise';

interface ExerciseStore {
  exercises: Exercise[];
  routinePlan: RoutinePlan;
  
  // Acciones asíncronas para la Base de Datos
  fetchExercises: () => Promise<void>;
  
  // Exercise library actions
  addExercise: (exercise: Exercise) => Promise<void>;
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

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  // Empezamos con una lista vacía, porque la llenaremos desde la DB
  exercises: [],
  routinePlan: initialRoutinePlan,

  // --- NUEVA LÓGICA CON ELECTRON ---
  fetchExercises: async () => {
    try {
      // Pedimos los datos a SQLite a través de IPC
      const dbExercises = await window.api.getExercises();
      
      // Mapeamos los datos de Prisma al formato que espera tu Frontend
      const formattedExercises = dbExercises.map((dbEx: any) => ({
        id: String(dbEx.id),
        name: dbEx.name,
        pattern: dbEx.pattern.name, // Prisma nos devuelve la relación
        videoUrl: dbEx.videoUrl || undefined
      }));

      set({ exercises: formattedExercises });
    } catch (error) {
      console.error("Error al obtener ejercicios de la DB:", error);
    }
  },

  addExercise: async (exercise) => {
    try {
      // 1. Guardar en Base de Datos (SQLite)
      const result = await window.api.createExercise({
        name: exercise.name,
        videoUrl: exercise.videoUrl,
        patternName: exercise.pattern // Lo que el usuario eligió en el select
      });

      if (result.success && result.exercise) {
        // 2. Si se guardó en BD, lo agregamos a la pantalla
        const newExercise: Exercise = {
          id: String(result.exercise.id),
          name: result.exercise.name,
          pattern: exercise.pattern, // Mantenemos el nombre para la UI
          videoUrl: result.exercise.videoUrl || undefined
        };
        set((state) => ({ exercises: [...state.exercises, newExercise] }));
      } else {
        console.error("Error guardando:", result.error);
      }
    } catch (error) {
      console.error("Fallo la conexión con BD:", error);
    }
  },
  // ---------------------------------

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