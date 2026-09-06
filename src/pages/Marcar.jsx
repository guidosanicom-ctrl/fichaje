import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { obtenerUltimoFichaje, registrarFichaje } from '../lib/fichajesApi'
import { formatHora, PERSONA_STORAGE_KEY, PERSONAS } from '../utils/fichajes'

export default function Marcar() {
  const { persona } = useParams()
  const navigate = useNavigate()

  const [proximoTipo, setProximoTipo] = useState(null) // 'entrada' | 'salida'
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)
  const [confirmandoCambio, setConfirmandoCambio] = useState(false)

  const personaValida = PERSONAS.includes(persona)

  useEffect(() => {
    if (!personaValida) return

    // Este celular ya tiene otra persona asignada: no dejamos marcar para
    // una distinta aunque alguien fuerce la URL a mano.
    const guardada = localStorage.getItem(PERSONA_STORAGE_KEY)
    if (guardada && guardada !== persona) {
      navigate(`/marcar/${guardada}`, { replace: true })
      return
    }
    if (!guardada) {
      localStorage.setItem(PERSONA_STORAGE_KEY, persona)
    }

    cargarEstado()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persona])

  async function cargarEstado() {
    setCargando(true)
    setError(null)
    try {
      const ultimo = await obtenerUltimoFichaje(persona)
      setProximoTipo(!ultimo || ultimo.tipo === 'salida' ? 'entrada' : 'salida')
    } catch (e) {
      setError('No se pudo conectar con la base de datos. Probá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  async function marcar() {
    if (!proximoTipo || enviando) return
    setEnviando(true)
    setError(null)
    try {
      const registro = await registrarFichaje(persona, proximoTipo)
      setConfirmacion({ tipo: registro.tipo, hora: formatHora(new Date(registro.timestamp)) })
      setProximoTipo(registro.tipo === 'entrada' ? 'salida' : 'entrada')
    } catch (e) {
      setError('No se pudo registrar el fichaje. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  function cambiarPersona() {
    localStorage.removeItem(PERSONA_STORAGE_KEY)
    navigate('/', { replace: true })
  }

  if (!personaValida) {
    return (
      <div className="pantalla pantalla--centrada">
        <p className="texto-error">Esa persona no existe.</p>
        <button className="boton-secundario" onClick={() => navigate('/')}>
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="pantalla pantalla--centrada">
      <h1 className="titulo">Hola, {persona}</h1>

      {cargando && <p className="texto-info">Cargando...</p>}

      {!cargando && proximoTipo && (
        <>
          <button
            className={`boton-grande boton-marcar ${proximoTipo === 'entrada' ? 'boton-marcar--entrada' : 'boton-marcar--salida'}`}
            onClick={marcar}
            disabled={enviando}
          >
            {enviando
              ? 'Guardando...'
              : proximoTipo === 'entrada'
                ? 'Marcar entrada'
                : 'Marcar salida'}
          </button>

          {confirmacion && (
            <p className="texto-confirmacion">
              {confirmacion.tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada a las{' '}
              <strong>{confirmacion.hora}</strong>
            </p>
          )}

          {error && <p className="texto-error">{error}</p>}
        </>
      )}

      {!cargando && !proximoTipo && (
        <>
          <p className="texto-error">{error}</p>
          <button className="boton-secundario" onClick={cargarEstado}>
            Reintentar
          </button>
        </>
      )}

      <button className="enlace-resumen" onClick={() => navigate('/resumen')}>
        Ver resumen de horas
      </button>

      {!confirmandoCambio ? (
        <button className="enlace-cambiar" onClick={() => setConfirmandoCambio(true)}>
          ¿No sos {persona}? Cambiar de persona en este celular
        </button>
      ) : (
        <div className="confirmar-cambio">
          <p className="texto-info texto-info--centrado">
            Este celular va a dejar de estar asignado a {persona}.
          </p>
          <div className="fila-confirmar">
            <button className="boton-secundario" onClick={cambiarPersona}>
              Sí, cambiar
            </button>
            <button className="boton-texto" onClick={() => setConfirmandoCambio(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
