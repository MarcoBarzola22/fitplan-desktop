import { useEffect } from 'react';
import { useExerciseStore } from '@/store/exerciseStore';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";

// Layout y Páginas
import { MainLayout } from "./components/layout/MainLayout";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import RoutineBuilder from "./pages/RoutineBuilder";
import ClientsPage from "./pages/ClientsPage"; // <--- Importamos la nueva página
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const fetchExercises = useExerciseStore((state) => state.fetchExercises);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          {/* Envolvemos las rutas con MainLayout para que el Sidebar sea global */}
          <MainLayout>
            <Routes>
              <Route path="/" element={<ExerciseLibrary />} />
              <Route path="/clients" element={<ClientsPage />} /> {/* <--- Nueva Ruta */}
              <Route path="/routine-builder" element={<RoutineBuilder />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;