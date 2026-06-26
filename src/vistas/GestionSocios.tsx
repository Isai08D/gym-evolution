// src/vistas/GestionSocios.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../librerias/clienteSupabase';

interface SocioConMembresia {
  id: string;
  nombre: string;
  dni: string;
  estado: string;
  membresias: {
    tipo: string;
    fecha_fin: string;
    estado: string;
    pagado: boolean;
  }[] | null;
}

export const GestionSocios: React.FC = () => {
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [tipoMembresia, setTipoMembresia] = useState('Mensual');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pagado, setPagado] = useState(true);

  // Estados de la lista y carga
  const [socios, setSocios] = useState<SocioConMembresia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ texto: string; esError: boolean } | null>(null);

  useEffect(() => {
    cargarSocios();
  }, []);

  const cargarSocios = async () => {
    try {
      setCargando(true);
      // Consulta relacional para traer perfiles con sus respectivas membresías
      const { data, error } = await supabase
        .from('perfiles')
        .select(`
          id,
          nombre,
          dni,
          estado,
          membresias (
            tipo,
            fecha_fin,
            estado,
            pagado
          )
        `)
        .order('creado_at', { ascending: false });

      if (error) throw error;
      if (data) setSocios(data as any);
    } catch (error: any) {
      console.error('Error al cargar socios:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const guardarSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    try {
      // 1. Insertar el Perfil del nuevo socio
      const { data: nuevoPerfil, error: errorPerfil } = await supabase
        .from('perfiles')
        .insert([
          { 
            nombre: nombre, 
            dni: dni, 
            estado: 'Activo' 
          }
        ])
        .select()
        .single();

      if (errorPerfil) throw errorPerfil;

      // 2. Insertar la Membresía vinculada al ID del perfil recién creado
      if (nuevoPerfil) {
        const { error: errorMembresia } = await supabase
          .from('membresias')
          .insert([
            {
              perfil_id: nuevoPerfil.id,
              tipo: tipoMembresia,
              fecha_inicio: fechaInicio || new Date().toISOString().split('T')[0],
              fecha_fin: fechaFin,
              estado: 'Activo',
              pagado: pagado
            }
          ]);

        if (errorMembresia) throw errorMembresia;
      }

      setMensaje({ texto: 'Socio y membresía registrados correctamente.', esError: false });
      // Limpiar el formulario
      setNombre('');
      setDni('');
      setFechaInicio('');
      setFechaFin('');
      
      // Recargar la lista de la tabla
      cargarSocios();

    } catch (error: any) {
      setMensaje({ texto: error.message || 'Error al guardar el registro.', esError: true });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Socios</h2>
        <p className="text-gym-gris text-sm">Registra nuevos miembros y administra la vigencia de sus planes.</p>
      </div>

      {mensaje && (
        <div className={`p-4 rounded border text-sm ${
          mensaje.esError 
            ? 'bg-gym-rojo/10 border-gym-rojo text-gym-blanco' 
            : 'bg-green-500/10 border-green-500 text-green-400'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario de Registro */}
      <form onSubmit={guardarSocio} className="bg-[#242424] p-6 rounded-lg border border-gym-gris/30 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h3 className="text-lg font-semibold col-span-1 md:col-span-2 border-b border-gym-gris/20 pb-2 mb-2 text-gym-rojo">
          Inscripción de Nuevo Miembro
        </h3>
        
        <div>
          <label className="block text-xs font-medium text-gym-gris uppercase tracking-wider mb-1">Nombre Completo</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full bg-gym-negro border border-gym-gris/40 rounded p-2 text-gym-blanco focus:outline-none focus:border-gym-rojo text-sm"
            placeholder="Nombres y Apellidos"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gym-gris uppercase tracking-wider mb-1">Documento Nacional de Identidad (DNI)</label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
            maxLength={8}
            className="w-full bg-gym-negro border border-gym-gris/40 rounded p-2 text-gym-blanco focus:outline-none focus:border-gym-rojo text-sm font-mono"
            placeholder="8 dígitos"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gym-gris uppercase tracking-wider mb-1">Tipo de Membresía</label>
          <select
            value={tipoMembresia}
            onChange={(e) => setTipoMembresia(e.target.value)}
            className="w-full bg-gym-negro border border-gym-gris/40 rounded p-2 text-gym-blanco focus:outline-none focus:border-gym-rojo text-sm"
          >
            <option value="Mensual">Mensual (1 Mes)</option>
            <option value="Trimestral">Trimestral (3 Meses)</option>
            <option value="Semestral">Semestral (6 Meses)</option>
            <option value="Anual">Anual (1 Año)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gym-gris uppercase tracking-wider mb-1">¿Membresía Pagada?</label>
          <div className="flex items-center h-10">
            <input
              type="checkbox"
              id="pagado"
              checked={pagado}
              onChange={(e) => setPagado(e.target.checked)}
              className="w-4 h-4 text-gym-rojo bg-gym-negro border-gym-gris rounded focus:ring-0"
            />
            <label htmlFor="pagado" className="ml-2 text-sm text-gym-blanco cursor-pointer">Sí, registrar pago completo</label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gym-gris uppercase tracking-wider mb-1">Fecha de Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full bg-gym-negro border border-gym-gris/40 rounded p-2 text-gym-blanco focus:outline-none focus:border-gym-rojo text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gym-gris uppercase tracking-wider mb-1">Fecha de Vencimiento</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
            className="w-full bg-gym-negro border border-gym-gris/40 rounded p-2 text-gym-blanco focus:outline-none focus:border-gym-rojo text-sm"
          />
        </div>

        <div className="col-span-1 md:col-span-2 pt-2">
          <button
            type="submit"
            className="bg-gym-rojo text-gym-blanco font-semibold px-6 py-2 rounded text-sm hover:bg-opacity-90 transition cursor-pointer"
          >
            Registrar Socio e Iniciar Plan
          </button>
        </div>
      </form>

      {/* Tabla de Socios Registrados */}
      <div className="bg-[#242424] rounded-lg border border-gym-gris/30 p-6 overflow-x-auto">
        <h3 className="text-lg font-bold mb-4">Padrón de Socios y Estados</h3>
        
        {cargando ? (
          <div className="text-center py-8 text-gym-gris text-sm">Consultando padrón en la nube...</div>
        ) : socios.length === 0 ? (
          <div className="text-center py-8 text-gym-gris text-sm">No hay socios inscritos en el sistema.</div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gym-gris/20 text-gym-gris uppercase text-[11px] tracking-wider">
                <th className="pb-3 font-semibold">Socio</th>
                <th className="pb-3 font-semibold">DNI</th>
                <th className="pb-3 font-semibold">Plan Actual</th>
                <th className="pb-3 font-semibold">Vencimiento</th>
                <th className="pb-3 font-semibold text-center">Pago</th>
                <th className="pb-3 font-semibold text-right">Membresía</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-gris/10">
              {socios.map((socio) => {
                const planActivo = socio.membresias && socio.membresias[0];
                return (
                  <tr key={socio.id} className="hover:bg-white/[0.01] transition">
                    <td className="py-3 font-bold text-gym-blanco">{socio.nombre}</td>
                    <td className="py-3 font-mono text-gym-gris">{socio.dni}</td>
                    <td className="py-3 text-gym-blanco text-xs">{planActivo ? planActivo.tipo : 'Sin Plan'}</td>
                    <td className="py-3 font-mono text-xs text-gym-gris">
                      {planActivo ? planActivo.fecha_fin : '---'}
                    </td>
                    <td className="py-3 text-center">
                      {planActivo ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          planActivo.pagado 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {planActivo.pagado ? 'PAGADO' : 'PENDIENTE'}
                        </span>
                      ) : '---'}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        planActivo?.estado === 'Activo'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-gym-rojo/10 text-gym-rojo border border-gym-rojo/30'
                      }`}>
                        {planActivo ? planActivo.estado : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};