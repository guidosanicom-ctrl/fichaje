import { supabase } from './supabase'

export async function obtenerUltimoFichaje(persona) {
  const { data, error } = await supabase
    .from('fichajes')
    .select('*')
    .eq('persona', persona)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function registrarFichaje(persona, tipo) {
  const { data, error } = await supabase
    .from('fichajes')
    .insert({ persona, tipo, timestamp: new Date().toISOString() })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function obtenerTodosLosFichajes() {
  const { data, error } = await supabase
    .from('fichajes')
    .select('*')
    .order('timestamp', { ascending: true })

  if (error) throw error
  return data
}
