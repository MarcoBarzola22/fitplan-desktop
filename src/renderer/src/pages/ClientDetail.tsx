import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Dumbbell, Ruler, Weight, History, 
  ExternalLink, Clock, Target, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  
  // Estados para el Modal de Detalle de Rutina
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const loadDetail = async () => {
    const result = await (window as any).api.getClientDetail(id);
    if (result.success) setClient(result.data);
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleViewRoutine = async (routineId: number) => {
    const result = await (window as any).api.invoke('get-routine-detail', routineId);
    if (result.success) {
      setSelectedRoutine(result.data);
      setIsViewModalOpen(true);
    }
  };

  if (!client) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Button 
        variant="ghost" 
        className="gap-2 -ml-2" 
        onClick={() => navigate('/clients')}
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Clientes
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/30">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
            <p className="text-muted-foreground italic">
              Miembro desde {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Weight className="h-4 w-4 text-primary"/>
            <CardTitle className="text-sm font-medium">Peso Actual</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{client.weight || '-'} kg</div></CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Ruler className="h-4 w-4 text-primary"/>
            <CardTitle className="text-sm font-medium">Altura</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{client.height || '-'} cm</div></CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center space-x-2 pb-2">
            <Calendar className="h-4 w-4 text-primary"/>
            <CardTitle className="text-sm font-medium">Edad</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{client.age || '-'} años</div></CardContent>
        </Card>
      </div>

      {/* Historial de Rutinas */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary"/> Historial de Rutinas
        </h2>
        {client.routines?.length > 0 ? (
          <div className="grid gap-3">
            {client.routines.map((routine: any) => (
              <div key={routine.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-2 rounded-lg"><Dumbbell className="h-4 w-4"/></div>
                  <div>
                    <p className="font-semibold text-foreground">Rutina de {routine.daysCount} días</p>
                    <p className="text-xs text-muted-foreground">{new Date(routine.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewRoutine(routine.id)}>
                  Ver Detalles
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border text-muted-foreground">
            Este alumno aún no tiene rutinas asignadas.
          </div>
        )}
      </div>

      {/* --- MODAL DE VISTA PREVIA DE RUTINA (SOLO LECTURA) --- */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b bg-muted/30">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              Detalle de Rutina - {selectedRoutine && new Date(selectedRoutine.createdAt).toLocaleDateString()}
            </DialogTitle>
            <DialogDescription>
              Resumen completo del entrenamiento asignado a {client.name}.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {selectedRoutine?.days.map((day: any) => (
                <div key={day.id} className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-primary">
                    DÍA {day.dayNumber}
                  </h3>
                  
                  {/* Calentamientos */}
                  {day.warmups?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Movilidad / Calentamiento</p>
                      <div className="grid gap-2">
                        {day.warmups.map((w: any) => (
                          <div key={w.id} className="bg-muted/50 p-3 rounded-lg flex justify-between items-center border border-border">
                            <span className="font-medium text-sm">{w.exercise.name}</span>
                            <div className="flex gap-3 text-xs">
                              <span className="bg-background px-2 py-1 rounded border">{w.sets} Series</span>
                              <span className="bg-background px-2 py-1 rounded border">{w.reps} Reps</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ejercicios Principales */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Entrenamiento Principal</p>
                    <div className="grid gap-3">
                      {day.exercises?.map((ex: any) => (
                        <Card key={ex.id} className="border-border/60 bg-card overflow-hidden">
                          <div className="flex items-center gap-4 p-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-[10px] h-4">
                                  {ex.exercise.pattern.name}
                                </Badge>
                                <span className="font-bold text-sm">{ex.exercise.name}</span>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" /> {ex.sets}x{ex.reps}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Weight className="h-3 w-3" /> {ex.weight || '-'}kg
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Target className="h-3 w-3" /> RPE {ex.rpe || '-'}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Info className="h-3 w-3" /> {ex.rest}" Desc.
                                </div>
                              </div>
                            </div>
                            {ex.exercise.videoUrl && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" asChild>
                                <a href={ex.exercise.videoUrl} target="_blank" rel="noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}