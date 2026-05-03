import { Dumbbell, LayoutGrid, Library, Users, CreditCard, Settings, BarChart3, Moon, Sun } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { title: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { title: 'Clientes', icon: Users, path: '/clients' },
  { title: 'Constructor de Rutinas', icon: LayoutGrid, path: '/routine-builder' },
  { title: 'Biblioteca de Patrones', icon: Library, path: '/' },
  { title: 'Pagos y Finanzas', icon: CreditCard, path: '/payments' },
];

export function AppSidebar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border shadow-xl">
      <div className="flex h-full flex-col">
        {/* Header - Identidad Personal */}
        <div className="flex h-20 items-center gap-3 px-6 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Dumbbell className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">FitPlan</h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Personal Trainer</p>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 space-y-1 px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all group',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-sidebar-foreground group-hover:text-primary")} />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer con Switch de Tema y Perfil */}
        <div className="border-t border-sidebar-border p-4 space-y-4">
          
          {/* Nuevo Switch Estilizado */}
          <div className="flex items-center justify-between px-2 py-1 bg-sidebar-accent/20 rounded-xl border border-sidebar-border/30">
            <span className="text-xs font-medium text-sidebar-foreground">Modo {isDark ? 'Oscuro' : 'Claro'}</span>
            <button 
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-sidebar-accent transition-colors focus:outline-none ring-1 ring-sidebar-border"
            >
              <span className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-primary transition-transform duration-200 shadow-sm flex items-center justify-center",
                isDark ? "translate-x-6" : "translate-x-1"
              )}>
                {isDark ? <Moon className="h-2.5 w-2.5 text-white" /> : <Sun className="h-2.5 w-2.5 text-white" />}
              </span>
            </button>
          </div>

          <NavLink to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-all">
            <Settings className="h-5 w-5" />
            Configuración
          </NavLink>
          
          {/* Perfil Personal */}
          <div className="flex items-center gap-3 rounded-2xl bg-sidebar-accent/30 p-3 border border-sidebar-border/50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-md">
              MB
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-foreground">Marco Barzola</p>
              <p className="truncate text-[10px] font-medium text-primary uppercase">Ingeniería UNVIME</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}