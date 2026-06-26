// src/contextos/ContextoAutenticacion.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../librerias/clienteSupabase';
import type { Session, User } from '@supabase/supabase-js'; // <-- Agregamos "type" aquí

interface PerfilUsuario {
  id: string;
  email: string;
  rol: 'Administrador' | 'Usuario';
}

interface TipoContextoAutenticacion {
  sesion: Session | null;
  usuario: User | null;
  perfil: PerfilUsuario | null;
  cargando: boolean;
  esAdministrador: boolean;
}

const ContextoAutenticacion = createContext<TipoContextoAutenticacion | undefined>(undefined);

export const ProveedorAutenticacion: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setUsuario(session?.user ?? null);
      if (session?.user) obtenerPerfilPublico(session.user.id);
      else setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSesion(session);
      setUsuario(session?.user ?? null);
      if (session?.user) obtenerPerfilPublico(session.user.id);
      else {
        setPerfil(null);
        setCargando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const obtenerPerfilPublico = async (usuarioId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioId)
        .single();

      if (error) throw error;
      setPerfil(data as PerfilUsuario);
    } catch (error) {
      console.error('Error al obtener el perfil público:', error);
    } finally {
      setCargando(false);
    }
  };

  const esAdministrador = perfil?.rol === 'Administrador';

  return (
    <ContextoAutenticacion.Provider value={{ sesion, usuario, perfil, cargando, esAdministrador }}>
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const useAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacion);
  if (contexto === undefined) {
    throw new Error('useAutenticacion debe ser utilizado dentro de un ProveedorAutenticacion');
  }
  return contexto;
}; 