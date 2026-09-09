export const PERSONAS = ['Mateo', 'Franco']

// Clave para recordar, por celular, qué persona usa ese equipo
export const PERSONA_STORAGE_KEY = 'waco_persona_dispositivo'

const DIA_LABELS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MES_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// Argentina está siempre en UTC-3, sin horario de verano. Mostramos y
// agrupamos todo en ese horario fijo en vez de confiar en el huso horario
// que tenga configurado cada celular (si un celular está mal configurado,
// antes se veían las horas corridas).
const OFFSET_ARGENTINA_MS = 3 * 60 * 60 * 1000

// Convierte un instante real (timestamp del fichaje) a un Date "espejo"
// cuyos valores UTC representan directamente la hora de pared en Argentina.
// Las funciones de abajo que reciben "fechaArg" esperan ya haber pasado por
// esta conversión (agruparPorPersonaYDia la hace una sola vez por fichaje).
function aHorarioArgentina(fechaReal) {
  return new Date(fechaReal.getTime() - OFFSET_ARGENTINA_MS)
}

export function formatHora(fechaReal) {
  return aHorarioArgentina(fechaReal).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  })
}

export function formatFechaLarga(fechaArg) {
  const dia = DIA_LABELS[fechaArg.getUTCDay()]
  const mes = MES_LABELS[fechaArg.getUTCMonth()]
  return `${dia} ${fechaArg.getUTCDate()} de ${mes}`
}

// Sin nombre del día, para rangos: "7 de septiembre"
export function formatFechaCorta(fechaArg) {
  const mes = MES_LABELS[fechaArg.getUTCMonth()]
  return `${fechaArg.getUTCDate()} de ${mes}`
}

// Clave de día en horario argentino, ej "2026-09-06"
export function claveDia(fechaArg) {
  const y = fechaArg.getUTCFullYear()
  const m = String(fechaArg.getUTCMonth() + 1).padStart(2, '0')
  const d = String(fechaArg.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Lunes de la semana a la que pertenece la fecha, como clave de día
export function claveSemana(fechaArg) {
  const d = new Date(fechaArg)
  const diaSemana = (d.getUTCDay() + 6) % 7 // 0 = lunes ... 6 = domingo
  d.setUTCDate(d.getUTCDate() - diaSemana)
  return claveDia(d)
}

export function formatDuracion(ms) {
  if (ms <= 0) return '0h 00m'
  const totalMin = Math.round(ms / 60000)
  const horas = Math.floor(totalMin / 60)
  const min = totalMin % 60
  return `${horas}h ${String(min).padStart(2, '0')}m`
}

// Agrupa fichajes (ya ordenados por persona) en pares entrada/salida por día,
// siempre en horario argentino. Devuelve:
// { [persona]: { [claveDia]: { fecha, pares: [{entrada, salida, abierto}], totalMs } } }
export function agruparPorPersonaYDia(fichajes) {
  const porPersona = {}

  for (const persona of PERSONAS) {
    const propios = fichajes
      .filter((f) => f.persona === persona)
      .map((f) => ({ ...f, fecha: aHorarioArgentina(new Date(f.timestamp)) }))
      .sort((a, b) => a.fecha - b.fecha)

    const dias = {}
    let entradaAbierta = null

    for (const f of propios) {
      const clave = claveDia(f.fecha)
      if (!dias[clave]) {
        dias[clave] = { fecha: f.fecha, pares: [], totalMs: 0 }
      }

      if (f.tipo === 'entrada') {
        if (entradaAbierta) {
          // Dos entradas seguidas: se registra la anterior como abierta (sin salida)
          const claveAnterior = claveDia(entradaAbierta.fecha)
          dias[claveAnterior].pares.push({ entrada: entradaAbierta, salida: null, abierto: true })
        }
        entradaAbierta = f
      } else if (f.tipo === 'salida') {
        if (entradaAbierta) {
          const claveEntrada = claveDia(entradaAbierta.fecha)
          const duracion = f.fecha - entradaAbierta.fecha
          dias[claveEntrada].pares.push({ entrada: entradaAbierta, salida: f, abierto: false })
          dias[claveEntrada].totalMs += duracion
          entradaAbierta = null
        } else {
          // Salida sin entrada previa registrada
          dias[clave].pares.push({ entrada: null, salida: f, abierto: false })
        }
      }
    }

    if (entradaAbierta) {
      const clave = claveDia(entradaAbierta.fecha)
      dias[clave].pares.push({ entrada: entradaAbierta, salida: null, abierto: true })
    }

    porPersona[persona] = dias
  }

  return porPersona
}

// inicio siempre es el lunes de esa semana; fin es el último día con
// fichajes esa semana (normalmente viernes, sábado si tocó trabajar ese día).
export function totalesPorSemana(dias) {
  const semanas = {}
  for (const clave of Object.keys(dias)) {
    const dia = dias[clave]
    const claveSem = claveSemana(dia.fecha)
    if (!semanas[claveSem]) {
      const [y, m, d] = claveSem.split('-').map(Number)
      semanas[claveSem] = { inicio: new Date(Date.UTC(y, m - 1, d)), fin: dia.fecha, totalMs: 0 }
    }
    if (dia.fecha > semanas[claveSem].fin) semanas[claveSem].fin = dia.fecha
    semanas[claveSem].totalMs += dia.totalMs
  }
  return semanas
}
