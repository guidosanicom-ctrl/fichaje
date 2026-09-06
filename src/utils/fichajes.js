export const PERSONAS = ['Mateo', 'Franco']

const DIA_LABELS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MES_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function formatHora(fecha) {
  return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export function formatFechaLarga(fecha) {
  const dia = DIA_LABELS[fecha.getDay()]
  const mes = MES_LABELS[fecha.getMonth()]
  return `${dia} ${fecha.getDate()} de ${mes}`
}

// Clave de día en horario local, ej "2026-09-06"
export function claveDia(fecha) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Lunes de la semana ISO a la que pertenece la fecha, como clave de día
export function claveSemana(fecha) {
  const d = new Date(fecha)
  const diaSemana = (d.getDay() + 6) % 7 // 0 = lunes ... 6 = domingo
  d.setDate(d.getDate() - diaSemana)
  return claveDia(d)
}

export function formatDuracion(ms) {
  if (ms <= 0) return '0h 00m'
  const totalMin = Math.round(ms / 60000)
  const horas = Math.floor(totalMin / 60)
  const min = totalMin % 60
  return `${horas}h ${String(min).padStart(2, '0')}m`
}

// Agrupa fichajes (ya ordenados por persona) en pares entrada/salida por día.
// Devuelve: { [persona]: { [claveDia]: { fecha, pares: [{entrada, salida, abierto}], totalMs } } }
export function agruparPorPersonaYDia(fichajes) {
  const porPersona = {}

  for (const persona of PERSONAS) {
    const propios = fichajes
      .filter((f) => f.persona === persona)
      .map((f) => ({ ...f, fecha: new Date(f.timestamp) }))
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

export function totalesPorSemana(dias) {
  const semanas = {}
  for (const clave of Object.keys(dias)) {
    const dia = dias[clave]
    const claveSem = claveSemana(dia.fecha)
    if (!semanas[claveSem]) {
      const [y, m, d] = claveSem.split('-').map(Number)
      semanas[claveSem] = { inicio: new Date(y, m - 1, d), totalMs: 0 }
    }
    semanas[claveSem].totalMs += dia.totalMs
  }
  return semanas
}
