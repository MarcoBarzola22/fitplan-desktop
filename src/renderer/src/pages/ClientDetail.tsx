import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Dumbbell, Ruler, Weight, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // Aquí se inicializa para usarlo abajo
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const loadDetail = async () => {
      // Usamos el nombre del handler que pusimos en db.ts
      const result = await (window as any).api.getClientDetail(id);
      if (result.success) setClient(result.data);
    };
    loadDetail();
  }, [id]);

  if (!client) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* CORRECCIÓN: onClick debe ser una función flecha */}
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
            <p className="text-muted-foreground italic">Miembro desde {new Date(client.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

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

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary"/> Historial de Rutinas
        </h2>
        {client.routines?.length > 0 ? (
          <div className="grid gap-3">
            {client.routines.map((routine) => (
              <div key={routine.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-muted p-2 rounded-lg"><Dumbbell className="h-4 w-4"/></div>
                  <div>
                    <p className="font-semibold text-foreground">Rutina de {routine.daysCount} días</p>
                    <p className="text-xs text-muted-foreground">{new Date(routine.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Ver Detalles</Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border text-muted-foreground">
            Este alumno aún no tiene rutinas asignadas.
          </div>
        )}
      </div>
    </div>
  );
}