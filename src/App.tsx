// src/App.tsx
import { IniciarSesion } from './vistas/IniciarSesion';
import { DashboardAdmin } from './vistas/DashboardAdmin';
import { useAutenticacion } from './contextos/ContextoAutenticacion';

function App() {
  const { usuario, cargando } = useAutenticacion();

  // Pantalla de carga mientras se verifica la sesión en Supabase
  if (cargando) {
    return (
      <div className="min-h-screen bg-gym-negro flex items-center justify-center text-gym-blanco font-sans">
        <div className="text-center">
          <p className="text-xl font-bold tracking-wider animate-pulse text-gym-rojo">
            GYM EVOLUTION
          </p>
          <p className="text-gym-gris text-sm mt-1">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostramos el login
  if (!usuario) {
    return <IniciarSesion />;
  }

  // Si hay usuario logueado, mostramos el Panel Principal
  return <DashboardAdmin />;
}

export default App;