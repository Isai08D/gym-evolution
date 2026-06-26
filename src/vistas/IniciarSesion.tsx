// src/vistas/IniciarSesion.tsx
import React, { useState } from 'react';
import { supabase } from '../librerias/clienteSupabase';

export const IniciarSesion: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [esRegistro, setEsRegistro] = useState(false); // <-- Nuevo estado para alternar vistas

  const manejarAutenticacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError(null);

    try {
      if (esRegistro) {
        // FLUJO DE CREAR CUENTA
        const { error } = await supabase.auth.signUp({
          email: correo,
          password: contrasena,
        });
        if (error) throw error;
        alert('¡Cuenta creada exitosamente! Ahora inicia sesión.');
        setEsRegistro(false); // Volver a la vista de login tras registrarse
        setContrasena('');
      } else {
        // FLUJO DE INICIAR SESIÓN
        const { error } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena,
        });
        if (error) throw error;
        // Si hay éxito, App.tsx detectará la sesión automáticamente
      }
    } catch (err: any) {
      setMensajeError(err.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const iniciarSesionConGoogleSimulado = () => {
    alert('Simulando autenticación con Google API para el rol de Administrador.');
  };

  return (
    <div className="min-h-screen bg-gym-negro flex items-center justify-center p-4">
      <div className="bg-[#242424] p-8 rounded-lg border border-gym-gris max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gym-blanco tracking-tighter">
            GYM <span className="text-gym-rojo">EVOLUTION</span>
          </h1>
          <p className="text-gym-gris text-sm mt-2">
            {esRegistro ? 'Crea una cuenta nueva' : 'Control de acceso y gestión de membresías'}
          </p>
        </div>

        {mensajeError && (
          <div className="bg-gym-rojo/10 border border-gym-rojo text-gym-blanco text-sm p-3 rounded mb-4">
            {mensajeError}
          </div>
        )}

        <form onSubmit={manejarAutenticacion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gym-blanco mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full bg-gym-negro border border-gym-gris rounded p-2 text-gym-blanco focus:outline-none focus:border-gym-rojo text-sm"
              placeholder="ejemplo@gym.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gym-blanco mb-1">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gym-negro border border-gym-gris rounded p-2 text-gym-blanco focus:outline-none focus:border-gym-rojo text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-gym-rojo text-gym-blanco font-semibold p-2 rounded text-sm hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {cargando ? 'Procesando...' : (esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        {/* Botón para alternar entre Crear Cuenta e Iniciar Sesión */}
        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => { setEsRegistro(!esRegistro); setMensajeError(null); }}
            className="text-gym-gris text-sm hover:text-gym-blanco transition"
          >
            {esRegistro ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gym-gris/30"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#242424] px-2 text-gym-gris">O continuar con</span></div>
        </div>

        <button
          onClick={iniciarSesionConGoogleSimulado}
          className="w-full bg-gym-blanco text-gym-negro font-semibold p-2 rounded text-sm hover:bg-opacity-90 transition flex items-center justify-center gap-2"
        >
          <span>Acceder con Google (Admin)</span>
        </button>
      </div>
    </div>
  );
};