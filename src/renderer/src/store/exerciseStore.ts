import { create } from 'zustand';
import { Exercise, DayExercise, TrainingDay, RoutinePlan, WarmupExercise } from '@/types/exercise';

interface ExerciseStore {
  exercises: Exercise[];
  clients: any[];
  routinePlan: RoutinePlan;
  isTemplate: boolean; // <--- NUEVO
  setAsTemplate: (value: boolean) => void; // <--- NUEVO
  
  fetchExercises: () => Promise<void>;
  fetchClients: () => Promise<void>;
  
  addExercise: (exercise: Exercise) => Promise<void>;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  
  setClientName: (name: string, clientId?: string) => void;
  setDaysPerWeek: (days: number) => void;
  
  addExerciseToDay: (dayId: string) => void;
  updateDayExercise: (dayId: string, exerciseId: string, updates: Partial<DayExercise>) => void;
  removeExerciseFromDay: (dayId: string, exerciseId: string) => void;

  addWarmupToDay: (dayId: string) => void;
  updateWarmupInDay: (dayId: string, warmupId: string, updates: Partial<WarmupExercise>) => void;
  removeWarmupFromDay: (dayId: string, warmupId: string) => void;
  
  clearRoutinePlan: () => void;
  saveRoutine: () => Promise<{ success: boolean; error?: string }>;
  loadTemplate: (templateId: number) => Promise<void>; // <--- NUEVO: Para importar favoritos
}

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

const createEmptyWarmup = (): WarmupExercise => ({
  id: crypto.randomUUID(),
  exerciseId: '',
  reps: '',
  sets: '',   
  weight: '',
});

const createEmptyDay = (dayNumber: number): TrainingDay => ({
  id: crypto.randomUUID(),
  dayNumber,
  exercises: [],
  warmups: [],
});

const initialRoutinePlan: RoutinePlan = {
  clientName: '',
  clientId: '',
  daysPerWeek: 3,
  days: [createEmptyDay(1), createEmptyDay(2), createEmptyDay(3)],
};

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  exercises: [],
  clients: [],
  routinePlan: initialRoutinePlan,
  isTemplate: false, // <--- Inicializamos en false

  setAsTemplate: (value) => {
    if (value) {
      set((state) => ({ 
        isTemplate: value,
        routinePlan: { ...state.routinePlan, clientId: '', clientName: '' } 
      }));
    } else {
      set({ isTemplate: value });
    }
  },

  fetchExercises: async () => {
    try {
      const dbExercises = await window.api.getExercises();
      const formattedExercises = dbExercises.map((dbEx: any) => ({
        id: String(dbEx.id),
        name: dbEx.name,
        pattern: dbEx.pattern.name,
        videoUrl: dbEx.videoUrl || undefined,
        isWarmup: dbEx.isWarmup || false
      }));
      set({ exercises: formattedExercises });
    } catch (error) {
      console.error("Error al obtener ejercicios de la DB:", error);
    }
  },

  fetchClients: async () => {
    try {
      const result = await (window as any).api.getClients();
      if (result.success) {
        set({ clients: result.data });
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  },

  addExercise: async (exercise) => {
    try {
      const result = await window.api.createExercise({
        name: exercise.name,
        videoUrl: exercise.videoUrl,
        patternName: exercise.pattern,
        isWarmup: exercise.isWarmup
      });

      if (result.success && result.exercise) {
        const newExercise: Exercise = {
          id: String(result.exercise.id),
          name: result.exercise.name,
          pattern: exercise.pattern,
          videoUrl: result.exercise.videoUrl || undefined,
          isWarmup: result.exercise.isWarmup
        };
        set((state) => ({ exercises: [...state.exercises, newExercise] }));
      }
    } catch (error) {
      console.error("Fallo la conexión con BD:", error);
    }
  },

  updateExercise: (id, updates) =>
    set((state) => ({
      exercises: state.exercises.map((e) => e.id === id ? { ...e, ...updates } : e),
    })),

  deleteExercise: (id) =>
    set((state) => ({
      exercises: state.exercises.filter((e) => e.id !== id),
    })),

  setClientName: (name, clientId) =>
    set((state) => ({
      routinePlan: { 
        ...state.routinePlan, 
        clientName: name, 
        clientId: clientId !== undefined ? clientId : state.routinePlan.clientId 
      },
    })),

  setDaysPerWeek: (daysCount) =>
    set((state) => {
      const currentDays = state.routinePlan.days;
      let newDays = [...currentDays];
      if (daysCount > currentDays.length) {
        for (let i = currentDays.length + 1; i <= daysCount; i++) {
          newDays.push(createEmptyDay(i));
        }
      } else if (daysCount < currentDays.length) {
        newDays = newDays.slice(0, daysCount);
      }
      return {
        routinePlan: { ...state.routinePlan, daysPerWeek: daysCount, days: newDays },
      };
    }),

  addExerciseToDay: (dayId) =>
    set((state) => ({
      routinePlan: {
        ...state.routinePlan,
        days: state.routinePlan.days.map((day) =>
          day.id === dayId ? { ...day, exercises: [...day.exercises, createEmptyDayExercise()] } : day
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
                exercises: day.exercises.map((ex) => ex.id === exerciseId ? { ...ex, ...updates } : ex),
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
          day.id === dayId ? { ...day, exercises: day.exercises.filter((ex) => ex.id !== exerciseId) } : day
        ),
      },
    })),

  addWarmupToDay: (dayId) =>
    set((state) => ({
      routinePlan: {
        ...state.routinePlan,
        days: state.routinePlan.days.map((day) =>
          day.id === dayId ? { ...day, warmups: [...(day.warmups || []), createEmptyWarmup()] } : day
        ),
      },
    })),

  updateWarmupInDay: (dayId, warmupId, updates) =>
    set((state) => ({
      routinePlan: {
        ...state.routinePlan,
        days: state.routinePlan.days.map((day) =>
          day.id === dayId
            ? {
                ...day,
                warmups: day.warmups.map((w) => w.id === warmupId ? { ...w, ...updates } : w),
              }
            : day
        ),
      },
    })),

  removeWarmupFromDay: (dayId, warmupId) =>
    set((state) => ({
      routinePlan: {
        ...state.routinePlan,
        days: state.routinePlan.days.map((day) =>
          day.id === dayId ? { ...day, warmups: day.warmups.filter((w) => w.id !== warmupId) } : day
        ),
      },
    })),

  clearRoutinePlan: () =>
    set({
      isTemplate: false,
      routinePlan: {
        clientName: '',
        clientId: '',
        daysPerWeek: 3,
        days: [createEmptyDay(1), createEmptyDay(2), createEmptyDay(3)],
      },
    }),

  saveRoutine: async () => {
    const { routinePlan, isTemplate } = get();
    
    // Validación: debe haber cliente O ser una plantilla favorita
    if (!routinePlan.clientId && !isTemplate) {
      return { success: false, error: "Debes seleccionar un cliente o marcar como plantilla" };
    }
    
    try {
      // Enviamos el objeto con el flag isTemplate
      const result = await window.api.saveRoutine({
        ...routinePlan,
        isTemplate: isTemplate
      });
      return result;
    } catch (error) {
      return { success: false, error: "Error de conexión" };
    }
  },

  // Carga una plantilla existente en el constructor
  loadTemplate: async (templateId: number) => {
    // CAMBIO: Usar la función directa expuesta en el preload
    const result = await (window as any).api.getRoutineDetail(templateId);
    
    if (result.success) {
      const template = result.data;
      set({
        // Al cargar una plantilla, desactivamos el modo template para que el 
        // usuario elija a qué cliente asignársela.
        isTemplate: false, 
        routinePlan: {
          clientName: get().routinePlan.clientName, 
          clientId: get().routinePlan.clientId,
          daysPerWeek: template.daysCount,
          days: template.days.map((d: any) => ({
            id: crypto.randomUUID(),
            dayNumber: d.dayNumber,
            exercises: d.exercises.map((ex: any) => ({
              id: crypto.randomUUID(),
              exerciseId: String(ex.exerciseId),
              patternFilter: ex.exercise.pattern.name,
              sets: ex.sets,
              reps: ex.reps,
              rest: ex.rest,
              weight: ex.weight,
              rpe: ex.rpe
            })),
            warmups: d.warmups.map((w: any) => ({
              id: crypto.randomUUID(),
              exerciseId: String(w.exerciseId),
              reps: w.reps,
              sets: w.sets,
              weight: w.weight
            }))
          }))
        }
      });
    }
  }
}));