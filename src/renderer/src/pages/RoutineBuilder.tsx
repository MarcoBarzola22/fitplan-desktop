import { useEffect, useState } from 'react';
import { FileSpreadsheet, Save, Trash2, FolderOpen, Star } from 'lucide-react';
import { DayBlock } from '@/components/routines/DayBlock';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExerciseStore } from '@/store/exerciseStore';
import { useToast } from '@/hooks/use-toast';
import { patternLabels } from '@/types/exercise';

export default function RoutineBuilder() {
  const { 
    exercises, 
    clients, 
    fetchClients, 
    routinePlan, 
    setClientName, 
    setDaysPerWeek, 
    clearRoutinePlan, 
    saveRoutine,
    isTemplate,
    setAsTemplate,
    loadTemplate
  } = useExerciseStore();
  
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenImport = async () => {
    // Aquí podrías crear un handler 'get-templates' en db.ts o filtrar get-all-routines
    const result = await (window as any).api.invoke('db:get-all-routines');
    // En una versión final, deberías filtrar por isTemplate: true en el backend
    setTemplates(result || []);
    setIsImportModalOpen(true);
  };

  const handleSaveToDB = async () => {
    const result = await saveRoutine();
    if (result.success) {
      toast({ 
        title: isTemplate ? '¡Plantilla guardada!' : '¡Rutina guardada!', 
        description: 'Se ha guardado correctamente en la base de datos.' 
      });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleExportExcel = async () => {
    const hasExercises = routinePlan.days.some((day) => day.exercises.length > 0);
    if (!hasExercises) {
      toast({ title: 'Rutina vacía', description: 'Agrega ejercicios antes de exportar.', variant: 'destructive' });
      return;
    }

    const payload = {
      clientName: isTemplate ? "PLANTILLA" : routinePlan.clientName,
      days: routinePlan.days.map((day) => ({
        dayNumber: day.dayNumber,
        warmups: (day.warmups || []).map((w) => {
          const exerciseDef = exercises.find((e) => e.id === w.exerciseId);
          return {
            exerciseName: exerciseDef?.name || '',
            videoUrl: exerciseDef?.videoUrl || '',
            reps: w.reps,
            sets: w.sets,
            weight: w.weight
          };
        }),
        exercises: day.exercises.map((ex) => {
          const exerciseDef = exercises.find((e) => e.id === ex.exerciseId);
          return {
            patternName: ex.patternFilter ? patternLabels[ex.patternFilter as keyof typeof patternLabels] : '',
            exerciseName: exerciseDef?.name || '',
            videoUrl: exerciseDef?.videoUrl || '',
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            weight: ex.weight,
            rpe: ex.rpe,
          };
        }),
      })),
    };

    try {
      const result = await window.api.exportExcel(payload);
      if (result.success) {
        toast({ title: 'Exportación exitosa', description: 'El archivo Excel ha sido guardado.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Falló la exportación.', variant: 'destructive' });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Constructor de Rutinas</h1>
          <p className="mt-1 text-muted-foreground">Planifica o crea plantillas favoritas</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={handleOpenImport}>
              <FolderOpen className="mr-1 h-4 w-4" />
              Importar Favorita
           </Button>
           <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={clearRoutinePlan}>
            <Trash2 className="mr-1 h-4 w-4" />
            Limpiar Todo
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* MODO PLANTILLA / FAVORITO */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-dashed border-border">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Star className={`h-4 w-4 ${isTemplate ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                Guardar como Plantilla
              </Label>
              <p className="text-xs text-muted-foreground italic">
                No requiere alumno. Se guarda como favorito.
              </p>
            </div>
            <Switch checked={isTemplate} onCheckedChange={setAsTemplate} />
          </div>

          <div className="space-y-2">
            <Label className={isTemplate ? "opacity-50" : ""}>Seleccionar Alumno</Label>
            <Select 
              disabled={isTemplate}
              value={routinePlan.clientId || ""} 
              onValueChange={(id) => {
                const selected = clients.find(c => c.id === id);
                if (selected) setClientName(selected.name, selected.id);
              }}
            >
              <SelectTrigger className="bg-background focus:ring-primary">
                <SelectValue placeholder={isTemplate ? "Modo Plantilla Activo" : "Buscá un alumno..."} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <Label>Días por Semana</Label>
          <Select value={String(routinePlan.daysPerWeek)} onValueChange={(v) => setDaysPerWeek(parseInt(v))}>
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'día' : 'días'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {routinePlan.days.map((day) => (
          <DayBlock key={day.id} day={day} />
        ))}
      </div>

      {/* MODAL PARA IMPORTAR PLANTILLAS */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tus Rutinas Favoritas</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {templates.length > 0 ? (
              templates.map((t) => (
                <Button 
                  key={t.id} 
                  variant="outline" 
                  className="justify-start h-auto py-3 px-4 flex flex-col items-start gap-1"
                  onClick={() => {
                    loadTemplate(t.id);
                    setIsImportModalOpen(false);
                    toast({ title: "Plantilla cargada", description: "Ya podés editarla o asignarla." });
                  }}
                >
                  <span className="font-bold">{t.clientName || "Sin Nombre"}</span>
                  <span className="text-xs text-muted-foreground">{t.daysCount} días - {new Date(t.createdAt).toLocaleDateString()}</span>
                </Button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">No tenés plantillas guardadas.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <Button variant="outline" className="h-14 text-lg font-semibold gap-2 border-primary/20 hover:bg-primary/5" onClick={handleSaveToDB}>
          <Save className="h-5 w-5" />
          {isTemplate ? "Guardar Plantilla" : "Guardar en Base de Datos"}
        </Button>
        <Button className="h-14 text-lg font-semibold gap-2 shadow-lg shadow-primary/20" onClick={handleExportExcel}>
          <FileSpreadsheet className="h-5 w-5" />
          Exportar a Excel
        </Button>
      </div>
    </div>
  );
}