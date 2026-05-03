import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, UserPlus, Phone, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '', phone: '', age: '', weight: '', height: ''
  });

  const loadClients = async () => {
    const result = await (window as any).api.getClients();
    if (result.success) setClients(result.data);
  };

  useEffect(() => { loadClients(); }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const handleOpenModal = (client?: any) => {
    if (client) {
      setEditingId(client.id);
      setFormData({
        name: client.name,
        phone: client.phone || '',
        age: client.age?.toString() || '',
        weight: client.weight?.toString() || '',
        height: client.height?.toString() || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', age: '', weight: '', height: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = editingId 
      ? await (window as any).api.updateClient({ id: editingId, ...formData })
      : await (window as any).api.createClient(formData);

    if (result.success) {
      toast({ title: "¡Éxito!", description: "Datos actualizados" });
      setIsModalOpen(false);
      loadClients();
    }
  };

  const confirmDelete = (id: string) => {
    setClientToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const executeDelete = async () => {
    if (!clientToDelete) return;
    const result = await (window as any).api.deleteClient(clientToDelete);
    if (result.success) {
      toast({ title: "Eliminado", description: "Cliente borrado." });
      loadClients();
    }
    setIsDeleteAlertOpen(false);
    setClientToDelete(null);
    document.body.style.pointerEvents = 'auto';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administración de perfiles y métricas.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 shadow-lg shadow-primary/20">
          <UserPlus className="h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      {/* --- MODAL DE CREAR/EDITAR (Con Teléfono Reinsertado) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input 
                placeholder="Ej: Juan Pérez"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
                className="bg-background focus-visible:ring-primary"
              />
            </div>
            {/* AQUÍ VOLVIÓ EL TELÉFONO */}
            <div className="space-y-2">
              <Label>Teléfono / WhatsApp</Label>
              <Input 
                placeholder="2657..."
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                className="bg-background focus-visible:ring-primary"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Edad</Label><Input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="bg-background" /></div>
              <div className="space-y-2"><Label>Peso (kg)</Label><Input type="number" step="0.1" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="bg-background" /></div>
              <div className="space-y-2"><Label>Altura (cm)</Label><Input type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="bg-background" /></div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full">
                {editingId ? 'Guardar Cambios' : 'Registrar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <DialogContent className="sm:max-w-[400px] border-destructive/20 bg-card">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle>¿Confirmar eliminación?</DialogTitle>
            <DialogDescription>Esta acción es permanente.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center pt-4">
            <Button variant="ghost" onClick={() => setIsDeleteAlertOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={executeDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- BUSCADOR CORREGIDO (Con anillo naranja) --- */}
      <div className="flex gap-4 items-center bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar cliente..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border focus-visible:ring-primary focus-visible:ring-2"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Resultados: <span className="font-bold text-foreground">{filteredClients.length}</span>
        </p>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-card p-5 rounded-2xl border border-border hover:border-primary/40 transition-all group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => handleOpenModal(client)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => confirmDelete(client.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold mb-3">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-lg leading-tight">{client.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <Phone className="h-3 w-3" /> {client.phone || 'Sin contacto'}
            </p>
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50 text-center">
              <div><p className="text-[10px] font-bold text-muted-foreground uppercase">Edad</p><p className="text-sm font-semibold">{client.age || '-'}</p></div>
              <div><p className="text-[10px] font-bold text-muted-foreground uppercase">Peso</p><p className="text-sm font-semibold">{client.weight || '-'}</p></div>
              <div><p className="text-[10px] font-bold text-muted-foreground uppercase">Alt</p><p className="text-sm font-semibold">{client.height || '-'}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}