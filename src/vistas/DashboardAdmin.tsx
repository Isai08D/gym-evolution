// src/vistas/DashboardAdmin.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../librerias/clienteSupabase';
import { useAutenticacion } from '../contextos/ContextoAutenticacion';

// Definición estricta de la estructura relacional que nos devolverá Supabase
interface FilaAsistencia {
  id: number;
  metodo_usado: string;
  resultado: string;
  creado_at: string;
  perfiles: {
    nombre: string;
    dni: string;
  } | null;
}

export const DashboardAdmin: React.FC = () => {
  const { usuario, perfil } = useAutenticacion();
  
  // Estados para almacenar las métricas vivas
  const [asistenciasHoy, setAsistenciasHoy] = useState<number>(0);
  const [membresiasActivas, setMembresiasActivas] = useState<number>(0);
  const [listaAccesos, setListaAccesos] = useState<FilaAsistencia[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(true);

  useEffect(() => {
    cargarMetricas();

    // CANAL EN TIEMPO REAL: Escucha inserciones de hardware en la tabla 'asistencias'
    const canalSuscripcion = supabase
      .channel('cambios-en-asistencias')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'asistencias' },
        () => {
          cargarMetricas(); // Si alguien pasa la tarjeta, refrescamos la pantalla automáticamente
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalSuscripcion);
    };
  }, []);

  const cargarMetricas = async () => {
    try {
      // Calcular la marca de tiempo de las 00:00:00 de hoy
      const inicioDiaHoy = new Date();
      inicioDiaHoy.setHours(0, 0, 0, 0);
      const hoyFormatoISO = inicioDiaHoy.toISOString();

      // 1. Consulta optimizada de conteo de asistencias del día
      const { count: conteoAsistencias } = await supabase
        .from('asistencias')
        .select('*', { count: 'exact', head: true })
        .gte('creado_at', hoyFormatoISO);

      // 2. Consulta optimizada de membresías vigentes
      const { count: conteoMembresias } = await supabase
        .from('membresias')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'Activo');

      // 3. Consulta relacional: Traer asistencias unidas con los nombres del perfil
      const { data: ultimosAccesos, error } = await supabase
        .from('asistencias')
        .select(`
          id,
          metodo_usado,
          resultado,
          creado_at,
          perfiles (
            nombre,
            dni
          )
        `)
        .order('creado_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      setAsistenciasHoy(conteoAsistencias || 0);
      setMembresiasActivas(conteoMembresias || 0);
      if (ultimosAccesos) setListaAccesos(ultimosAccesos as any);

    } catch (error) {
      console.error('Error al sincronizar métricas del Dashboard:', error);
    } finally {
      setCargandoDatos(false);
    }
  };

  // Convertir formato de fecha de la base de datos a hora local entendible
  const formatearHoraLocal = (textoISO: string) => {
    const fecha = new Date(textoISO);
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const manejarCierreSesion = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gym-negro text-gym-blanco font-sans flex flex-col">
      {/* Cabecera Superior */}
      <header className="bg-[#242424] border-b border-gym-gris/30 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tighter">
            GYM <span className="text-gym-rojo">EVOLUTION</span>
          </h1>
          <span className="bg-gym-rojo/20 text-gym-rojo px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-gym-rojo/50">
            {perfil?.rol || 'Administrador'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-gym-gris text-sm hidden md:inline font-mono">
            {usuario?.email}
          </span>
          <button 
            onClick={manejarCierreSesion}
            className="bg-gym-rojo text-gym-blanco px-4 py-2 rounded text-sm font-semibold hover:bg-opacity-90 transition cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Panel Central */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Centro de Control</h2>
          <p className="text-gym-gris text-sm">Sincronización directa con base de datos en la nube.</p>
        </div>

        {/* Tarjetas Indicadoras (Grid de 3 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#242424] p-6 rounded-lg border border-gym-gris/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-gym-rojo"></div>
            <h3 className="text-gym-gris text-xs font-semibold uppercase tracking-wider">Asistencias de Hoy</h3>
            <p className="text-4xl font-extrabold mt-2 text-gym-blanco">
              {cargandoDatos ? '...' : asistenciasHoy}
            </p>
          </div>
          
          <div className="bg-[#242424] p-6 rounded-lg border border-gym-gris/30">
            <h3 className="text-gym-gris text-xs font-semibold uppercase tracking-wider">Membresías Activas</h3>
            <p className="text-4xl font-extrabold mt-2 text-gym-blanco">
              {cargandoDatos ? '...' : membresiasActivas}
            </p>
          </div>

          <div className="bg-[#242424] p-6 rounded-lg border border-gym-gris/30 flex flex-col justify-between">
            <h3 className="text-gym-gris text-xs font-semibold uppercase tracking-wider">Lector Biométrico / RFID</h3>
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-lg font-bold text-green-400">Sistema En Línea</p>
            </div>
          </div>
        </div>

        {/* Tabla Dinámica de Accesos */}
        <div className="bg-[#242424] rounded-lg border border-gym-gris/30 p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>Últimos Accesos Registrados</span>
              <span className="text-[10px] bg-gym-rojo/20 text-gym-rojo px-2 py-0.5 rounded border border-gym-rojo/40 uppercase tracking-widest animate-pulse">En vivo</span>
            </h3>
            <button onClick={cargarMetricas} className="text-xs text-gym-gris hover:text-gym-blanco underline cursor-pointer">Sincronizar manual</button>
          </div>

          {cargandoDatos ? (
            <div className="text-center py-12 text-gym-gris text-sm">Consultando registros en el servidor...</div>
          ) : listaAccesos.length === 0 ? (
            <div className="text-center py-12 text-gym-gris text-sm border border-dashed border-gym-gris/20 rounded">
              No hay lecturas de asistencia registradas todavía.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gym-gris/20 text-gym-gris uppercase text-[11px] tracking-wider">
                  <th className="pb-3 font-semibold">Hora</th>
                  <th className="pb-3 font-semibold">Miembro</th>
                  <th className="pb-3 font-semibold">Documento (DNI)</th>
                  <th className="pb-3 font-semibold">Tecnología</th>
                  <th className="pb-3 font-semibold text-right">Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gym-gris/10">
                {listaAccesos.map((fila) => (
                  <tr key={fila.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 text-gym-gris font-mono text-xs">{formatearHoraLocal(fila.creado_at)}</td>
                    <td className="py-3.5 font-bold text-gym-blanco">{fila.perfiles?.nombre || 'Usuario Desconocido'}</td>
                    <td className="py-3.5 text-gym-gris font-mono">{fila.perfiles?.dni || '---'}</td>
                    <td className="py-3.5 text-gym-gris text-xs">{fila.metodo_usado}</td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        fila.resultado === 'Permitido' || fila.resultado === 'Aprobado' || fila.resultado === 'Concedido' || fila.resultado === 'Exitoso'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-gym-rojo/10 text-gym-rojo border border-gym-rojo/30'
                      }`}>
                        {fila.resultado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};