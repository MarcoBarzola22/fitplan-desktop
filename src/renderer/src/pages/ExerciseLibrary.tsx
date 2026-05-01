import { useState, useMemo } from 'react';
import { Plus, Search, Dumbbell, Activity } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ExerciseTable } from '@/components/exercises/ExerciseTable';
import { ExerciseModal } from '@/components/exercises/ExerciseModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExerciseStore } from '@/store/exerciseStore';
import { Exercise } from '@/types/exercise';

export default function ExerciseLibrary() {
  const { exercises } = useExerciseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // NUEVO: Estado para saber qué pestaña estamos viendo
  const [viewMode, setViewMode] = useState<'main' | 'warmup'>('main');

  const filteredExercises = useMemo(() => {
    // 1. Primero filtramos por el tipo (Principal vs Calentamiento)
    let filtered = exercises.filter(e => 
      viewMode === 'warmup' ? e.isWarmup : !e.isWarmup
    );

    // 2. Luego aplicamos la búsqueda por texto si existe
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.pattern.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [exercises, searchQuery, viewMode]);

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingExercise(null);
    }
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Biblioteca de Ejercicios
          </h1>
          <p className="mt-1 text-muted-foreground">
            Administra tu catálogo de ejercicios y movimientos de entrada en calor
          </p>
        </div>

        {/* NUEVO: Selector de Vistas */}
        <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-lg w-fit">
          <Button 
            variant={viewMode === 'main' ? 'default' : 'ghost'} 
            onClick={() => setViewMode('main')}
            className="gap-2"
          >
            <Dumbbell className="h-4 w-4" />
            Ejercicios Principales
          </Button>
          <Button 
            variant={viewMode === 'warmup' ? 'default' : 'ghost'} 
            onClick={() => setViewMode('warmup')}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Calentamiento / Movilidad
          </Button>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Buscar en ${viewMode === 'main' ? 'ejercicios' : 'calentamientos'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo {viewMode === 'main' ? 'Ejercicio' : 'Calentamiento'}
          </Button>
        </div>

        {/* Table */}
        <ExerciseTable exercises={filteredExercises} onEdit={handleEdit} />

        {/* Stats */}
        <div className="mt-6 text-sm text-muted-foreground">
          Mostrando {filteredExercises.length} registros
        </div>
      </div>

      <ExerciseModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        exercise={editingExercise}
        // Le pasamos el viewMode actual por si queremos que el switch se marque por defecto
        defaultIsWarmup={viewMode === 'warmup'} 
      />
    </MainLayout>
  );
}