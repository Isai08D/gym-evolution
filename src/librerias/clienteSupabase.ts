// src/librerias/clienteSupabase.ts
import { createClient } from '@supabase/supabase-js'

// URL de tu proyecto en la nube
const urlSupabase = 'https://rscfasfljuaxbpxuflsz.supabase.co'

// Aquí pegas la clave completa que empieza con "sb_publishable_"
const claveAnonimaSupabase = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzY2Zhc2ZsanVheGJweHVmbHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODQzNDIsImV4cCI6MjA5ODA2MDM0Mn0.dbjtgC3QDelAP2GGLI-tdnVji7GtB55rmlXLyUuzi6I' 

if (!urlSupabase || !claveAnonimaSupabase) {
  throw new Error('Faltan las credenciales de Supabase en clienteSupabase.ts');
}

export const supabase = createClient(urlSupabase, claveAnonimaSupabase)