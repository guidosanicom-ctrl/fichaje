import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PERSONA_STORAGE_KEY, PERSONAS } from '../utils/fichajes'

export default function PersonSelect() {
  const navigate = useNavigate()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    const guardada = localStorage.getItem(PERSONA_STORAGE_KEY)
    if (PERSONAS.includes(guardada)) {
      navigate(`/marcar/${guardada}`, { replace: true })
    } else {
      setVerificando(false)
    }
  }, [navigate])

  function elegir(persona) {
    localStorage.setItem(PERSONA_STORAGE_KEY, persona)
    navigate(`/marcar/${persona}`)
  }

  if (verificando) {
    return <div className="pantalla pantalla--centrada" />
  }

  return (
    <div className="pantalla pantalla--centrada">
      <img src="/waco-logo.png" alt="WACO Muebles" className="logo-waco" />
      <h1 className="titulo">¿Quién sos?</h1>
      <p className="texto-info texto-info--centrado">
        Esta selección queda guardada en este celular, así que la vas a hacer una sola vez.
      </p>

      <div className="columna-botones">
        {PERSONAS.map((persona) => (
          <button
            key={persona}
            className="boton-grande boton-persona"
            onClick={() => elegir(persona)}
          >
            {persona}
          </button>
        ))}
      </div>

      <button className="enlace-resumen" onClick={() => navigate('/resumen')}>
        Ver resumen de horas
      </button>
    </div>
  )
}
