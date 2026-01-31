import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
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

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return exercises;
    const query = searchQuery.toLowerCase();
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.pattern.toLowerCase().includes(query)
    );
  }, [exercises, searchQuery]);

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
            Biblioteca de Patrones
          </h1>
          <p className="mt-1 text-muted-foreground">
            Administra todos tus ejercicios organizados por patrón de movimiento
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-input border-border"
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Ejercicio
          </Button>
        </div>

        {/* Table */}
        <ExerciseTable exercises={filteredExercises} onEdit={handleEdit} />

        {/* Stats */}
        <div className="mt-6 text-sm text-muted-foreground">
          {filteredExercises.length} de {exercises.length} ejercicios
        </div>
      </div>

      <ExerciseModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        exercise={editingExercise}
      />
    </MainLayout>
  );
}
