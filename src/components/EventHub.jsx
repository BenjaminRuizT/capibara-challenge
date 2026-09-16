import { useState, useEffect } from 'react'

const STATUS_LABEL = { draft: 'Borrador', active: 'Activo', completed: 'Terminado', archived: 'Archivado' }
const STATUS_COLOR = { draft: '#888', active: '#5BB85B', completed: '#4A8FD4', archived: '#666' }
const ROLE_LABEL   = { admin: 'Administrador', participant: 'Participante', visitor: 'Visitante' }

export default function EventHub({ auth, onSelectEvent, onLogout, api }) {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/api/events').then(d => { if (Array.isArray(d)) setEvents(d) }).finally(() => setLoading(false))
  }, [])

  const active   = events.filter(e => e.status === 'active')
  const others   = events.filter(e => e.status !== 'active')

  return (
    <div className="hub-overlay">
      <header className="hub-header">
        <div className="hub-brand">🦦 <span>Capibara's Challenge</span></div>
        <div className="hub-user-info">
          <div className="hub-avatar">{auth.user.display_name.charAt(0).toUpperCase()}</div>
          <div className="hub-user-details">
            <span className="hub-user-name">{auth.user.display_name}</span>
            <span className="hub-user-role">{ROLE_LABEL[auth.user.role] || auth.user.role}</span>
          </div>
          <button className="hub-logout-btn" onClick={onLogout} title="Cerrar sesión">↩</button>
        </div>
      </header>

      <main className="hub-main">
        <h2 className="hub-heading">Selecciona un evento</h2>

        {loading ? (
          <div className="hub-loading">⏳ Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className="hub-empty">
            <div style={{ fontSize: 48 }}>🏆</div>
            <p>No hay eventos disponibles.</p>
            {auth.user.role === 'admin' && <p style={{ color: '#5BB85B' }}>Crea el primer evento desde el panel de administración.</p>}
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="hub-section">
                <h3 className="hub-section-title">● Eventos activos</h3>
                <div className="hub-events-grid">
                  {active.map(ev => <EventCard key={ev.id} ev={ev} onSelect={onSelectEvent} />)}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section className="hub-section">
                <h3 className="hub-section-title" style={{ color: '#888' }}>Otros eventos</h3>
                <div className="hub-events-grid">
                  {others.map(ev => <EventCard key={ev.id} ev={ev} onSelect={onSelectEvent} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function EventCard({ ev, onSelect }) {
  const weeks = ev.total_weeks || 9
  const startDate = ev.start_date ? new Date(ev.start_date) : null
  const endDate   = ev.end_date   ? new Date(ev.end_date)   : null
  const fmtDate   = d => d ? d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="hub-event-card" onClick={() => onSelect(ev.id)}>
      <div className="hub-event-card-top">
        <span className="hub-event-status" style={{ color: STATUS_COLOR[ev.status] }}>
          ● {STATUS_LABEL[ev.status] || ev.status}
        </span>
        {ev.entry_fee && (
          <span className="hub-event-fee">
            💰 {parseFloat(ev.entry_fee).toFixed(2)} {ev.entry_fee_currency}
          </span>
        )}
      </div>
      <div className="hub-event-name">{ev.name}</div>
      {ev.description && <div className="hub-event-desc">{ev.description}</div>}
      <div className="hub-event-meta">
        <span>👥 {ev.participant_count || 0} participante{ev.participant_count != 1 ? 's' : ''}</span>
        {startDate && <span>📅 {fmtDate(startDate)}</span>}
        {endDate   && <span>🏁 {fmtDate(endDate)}</span>}
        {weeks     && <span>📆 {weeks} semanas</span>}
      </div>
      <div className="hub-event-enter">
        {ev.status === 'active' ? 'Entrar al evento →' : 'Ver evento →'}
      </div>
    </div>
  )
}
