import { useState, useMemo } from 'react';
import { Plus, Search, Dumbbell, Activity } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'main' | 'warmup'>('main');

  const filteredExercises = useMemo(() => {
    let filtered = exercises.filter(e => 
      viewMode === 'warmup' ? e.isWarmup : !e.isWarmup
    );

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
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
          Biblioteca de Ejercicios
        </h1>
        <p className="mt-1 text-muted-foreground">
          Administra tu catálogo de ejercicios y movimientos de entrada en calor
        </p>
      </div>

      {/* Selector de Vistas */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit border border-border/50">
        <Button 
          variant={viewMode === 'main' ? 'default' : 'ghost'} 
          onClick={() => setViewMode('main')}
          className="gap-2 rounded-lg"
          size="sm"
        >
          <Dumbbell className="h-4 w-4" />
          Ejercicios Principales
        </Button>
        <Button 
          variant={viewMode === 'warmup' ? 'default' : 'ghost'} 
          onClick={() => setViewMode('warmup')}
          className="gap-2 rounded-lg"
          size="sm"
        >
          <Activity className="h-4 w-4" />
          Calentamiento / Movilidad
        </Button>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Buscar en ${viewMode === 'main' ? 'ejercicios' : 'calentamientos'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background border-border"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Nuevo {viewMode === 'main' ? 'Ejercicio' : 'Calentamiento'}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <ExerciseTable exercises={filteredExercises} onEdit={handleEdit} />
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground px-2">
        Mostrando <span className="font-bold text-foreground">{filteredExercises.length}</span> registros
      </div>

      <ExerciseModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        exercise={editingExercise}
        defaultIsWarmup={viewMode === 'warmup'} 
      />
    </div>
  );
}