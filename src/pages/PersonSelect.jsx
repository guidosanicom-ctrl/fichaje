import { useNavigate } from 'react-router-dom'
import { PERSONAS } from '../utils/fichajes'

export default function PersonSelect() {
  const navigate = useNavigate()

  return (
    <div className="pantalla pantalla--centrada">
      <img src="/waco-logo.png" alt="WACO Muebles" className="logo-waco" />
      <h1 className="titulo">¿Quién sos?</h1>

      <div className="columna-botones">
        {PERSONAS.map((persona) => (
          <button
            key={persona}
            className="boton-grande boton-persona"
            onClick={() => navigate(`/marcar/${persona}`)}
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
