import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerTodosLosFichajes } from '../lib/fichajesApi'
import {
  agruparPorPersonaYDia,
  formatDuracion,
  formatFechaLarga,
  formatHora,
  PERSONA_STORAGE_KEY,
  PERSONAS,
  totalesPorSemana,
} from '../utils/fichajes'

export default function Resumen() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const personaDelCelular = localStorage.getItem(PERSONA_STORAGE_KEY)
  const esCelularDeUnaPersona = PERSONAS.includes(personaDelCelular)
  const [verTodos, setVerTodos] = useState(!esCelularDeUnaPersona)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const fichajes = await obtenerTodosLosFichajes()
      setDatos(agruparPorPersonaYDia(fichajes))
    } catch (e) {
      setError('No se pudo cargar el resumen. Probá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const entradas = datos
    ? Object.entries(datos).filter(([persona]) => verTodos || persona === personaDelCelular)
    : []

  return (
    <div className="pantalla pantalla--resumen">
      <button className="boton-volver" onClick={() => navigate('/')}>
        ← Volver
      </button>

      <h1 className="titulo titulo--resumen">
        {verTodos || !esCelularDeUnaPersona ? 'Resumen de horas' : `Tus horas, ${personaDelCelular}`}
      </h1>

      {cargando && <p className="texto-info">Cargando...</p>}
      {error && <p className="texto-error">{error}</p>}

      {esCelularDeUnaPersona && (
        <button className="enlace-cambiar" onClick={() => setVerTodos(!verTodos)}>
          {verTodos ? 'Ver solo mis horas' : 'Ver el resumen de todos (para Pablo)'}
        </button>
      )}

      {entradas.map(([persona, dias]) => (
        <PersonaResumen key={persona} persona={persona} dias={dias} />
      ))}
    </div>
  )
}

function PersonaResumen({ persona, dias }) {
  const clavesDias = Object.keys(dias).sort((a, b) => (a < b ? 1 : -1))
  const semanas = totalesPorSemana(dias)
  const clavesSemanas = Object.keys(semanas).sort((a, b) => (a < b ? 1 : -1))

  if (clavesDias.length === 0) {
    return (
      <section className="tarjeta-persona">
        <h2 className="subtitulo">{persona}</h2>
        <p className="texto-info">Todavía no hay fichajes.</p>
      </section>
    )
  }

  return (
    <section className="tarjeta-persona">
      <h2 className="subtitulo">{persona}</h2>

      <div className="bloque-semanas">
        <h3 className="etiqueta-seccion">Totales por semana</h3>
        {clavesSemanas.map((clave) => (
          <div className="fila-semana" key={clave}>
            <span>Semana del {formatFechaLarga(semanas[clave].inicio)}</span>
            <strong>{formatDuracion(semanas[clave].totalMs)}</strong>
          </div>
        ))}
      </div>

      <div className="bloque-dias">
        <h3 className="etiqueta-seccion">Detalle por día</h3>
        {clavesDias.map((clave) => {
          const dia = dias[clave]
          return (
            <details className="dia-detalle" key={clave} open>
              <summary>
                <span className="dia-fecha">{formatFechaLarga(dia.fecha)}</span>
                <span className="dia-total">{formatDuracion(dia.totalMs)}</span>
              </summary>
              <ul className="lista-pares">
                {dia.pares.map((par, i) => (
                  <li key={i} className="fila-par">
                    <span className="hora-entrada">
                      {par.entrada ? `Entrada ${formatHora(new Date(par.entrada.timestamp))}` : 'Sin entrada'}
                    </span>
                    <span className="hora-salida">
                      {par.salida
                        ? `Salida ${formatHora(new Date(par.salida.timestamp))}`
                        : 'Sin salida todavía'}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )
        })}
      </div>
    </section>
  )
}
