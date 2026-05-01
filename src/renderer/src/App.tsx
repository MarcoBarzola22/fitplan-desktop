import { useEffect } from 'react';
import { useExerciseStore } from '@/store/exerciseStore';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import RoutineBuilder from "./pages/RoutineBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // 1. Extraemos la función de nuestro store
  const fetchExercises = useExerciseStore((state) => state.fetchExercises);

  // 2. Ejecutamos la función apenas la app arranca
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ExerciseLibrary />} />
            <Route path="/routine-builder" element={<RoutineBuilder />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;