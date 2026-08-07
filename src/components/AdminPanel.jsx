import { useState, useEffect } from 'react'

const CHALLENGE_START = '2026-07-20'

function weekToDate(week) {
  const d = new Date(CHALLENGE_START)
  d.setDate(d.getDate() + parseInt(week) * 7)
  return d.toISOString().slice(0, 10)
}

export default function AdminPanel({ participants, currentWeek, onSaved, onClose }) {
  const [password, setPassword] = useState('')
  const [participantId, setParticipantId] = useState(participants[0]?.id || 'david')
  const [week, setWeek] = useState(currentWeek)
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(weekToDate(currentWeek))
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const p = participants.find(p => p.id === participantId)
    const existing = p?.entries?.find(e => e.week === parseInt(week))
    if (existing) {
      setWeight(String(existing.weight))
      setDate(existing.date)
    } else {
      setWeight('')
      setDate(weekToDate(week))
    }
    setMsg(null)
  }, [week, participantId])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!password || !weight) return setMsg({ type: 'error', text: 'Completa todos los campos' })
    setLoading(true)
    try {
      const res = await fetch('/api/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, participantId, week: parseInt(week), date, weight: parseFloat(weight) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setMsg({ type: 'success', text: `✅ Peso guardado para ${data.participant.name}: ${weight} kg` })
      onSaved(data.participant)
      setPassword('')
      setWeight('')
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` })
    }
    setLoading(false)
  }

  const selectedP   = participants.find(p => p.id === participantId)
  const getLatest   = (p) => p?.entries?.[p.entries.length - 1]?.weight ?? p?.initialWeight
  const hasExisting = selectedP?.entries?.some(e => e.week === parseInt(week))

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={e => e.stopPropagation()}>
        <div className="admin-title">⚙️ Registro de Peso</div>
        <form onSubmit={handleSave}>
          <div className="admin-field">
            <label>Participante</label>
            <select value={participantId} onChange={e => setParticipantId(e.target.value)}>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name} (actual: {getLatest(p)} kg)</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="admin-field">
              <label>Semana</label>
              <select value={week} onChange={e => setWeek(e.target.value)}>
                {Array.from({ length: 10 }, (_, i) => {
                  const tiene = selectedP?.entries?.some(e => e.week === i)
                  return (
                    <option key={i} value={i}>
                      Semana {i}{i === 0 ? ' (inicio)' : ''}{tiene ? ' ✓' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
            <div className="admin-field">
              <label>Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
          <div className="admin-field">
            <label>Peso (kg) {selectedP && `· Meta: ${selectedP.goalWeight} kg`}</label>
            <input
              type="number"
              step="0.1"
              min="40"
              max="300"
              placeholder={`ej. ${selectedP ? (getLatest(selectedP) - 1).toFixed(1) : '95.0'}`}
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña admin"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}
          <div className="admin-btns">
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Guardando...' : hasExisting ? '✏️ Actualizar Peso' : '💾 Guardar Peso'}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
        <div style={{ fontSize: 10, opacity: 0.4, textAlign: 'center', marginTop: 12 }}>
          Acceso admin: 5 clicks en el título
        </div>
      </div>
    </div>
  )
}
