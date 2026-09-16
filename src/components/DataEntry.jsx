import { useState } from 'react'

const FACTOR_META = {
  weight:           { icon: '⚖️', label: 'Peso corporal',      color: '#D4724A' },
  activity:         { icon: '🏃', label: 'Actividad física',   color: '#4A8FD4' },
  hydration:        { icon: '💧', label: 'Hidratación',         color: '#5BB85B' },
  sleep:            { icon: '😴', label: 'Sueño',              color: '#9B59B6' },
  nutrition:        { icon: '🥗', label: 'Nutrición',          color: '#27AE60' },
  measurements:     { icon: '📏', label: 'Medidas',            color: '#E67E22' },
  weekly_challenge: { icon: '🏆', label: 'Reto semanal',       color: '#F39C12' },
  daily_habit:      { icon: '✅', label: 'Hábito diario',      color: '#1ABC9C' },
  social_vote:      { icon: '⭐', label: 'Votar participante', color: '#E74C3C' },
  attendance:       { icon: '🤝', label: 'Asistencia',         color: '#3498DB' },
}

export default function DataEntry({ auth, api, eventId, factors, currentWeek, participants, onClose }) {
  const [activeTab, setActiveTab] = useState(factors[0]?.factor_type || '')
  const today = new Date().toISOString().slice(0, 10)

  const otherParticipants = participants.filter(p => p.id != auth.user.id)

  return (
    <div className="admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">
        <div className="admin-header">
          <span className="admin-title">📊 Registrar datos — Sem {currentWeek}</span>
          <button className="admin-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-tabs-scroll">
          {factors.map(f => {
            const m = FACTOR_META[f.factor_type] || {}
            return (
              <button key={f.factor_type} className={`admin-tab ${activeTab === f.factor_type ? 'active' : ''}`}
                onClick={() => setActiveTab(f.factor_type)}>
                {m.icon} {m.label || f.factor_type}
              </button>
            )
          })}
        </div>
        <div className="admin-tab-body">
          {activeTab === 'weight' && (
            <WeightForm api={api} eventId={eventId} week={currentWeek} today={today} />
          )}
          {activeTab === 'activity' && (
            <ActivityForm api={api} eventId={eventId} week={currentWeek} today={today} />
          )}
          {activeTab === 'hydration' && (
            <HydrationForm api={api} eventId={eventId} week={currentWeek} today={today} />
          )}
          {activeTab === 'sleep' && (
            <SleepForm api={api} eventId={eventId} week={currentWeek} today={today} />
          )}
          {activeTab === 'nutrition' && (
            <NutritionForm api={api} eventId={eventId} week={currentWeek} today={today} />
          )}
          {activeTab === 'measurements' && (
            <MeasurementsForm api={api} eventId={eventId} week={currentWeek} />
          )}
          {activeTab === 'weekly_challenge' && (
            <ChallengeForm api={api} eventId={eventId} week={currentWeek} />
          )}
          {activeTab === 'daily_habit' && (
            <HabitForm api={api} eventId={eventId} week={currentWeek} today={today} />
          )}
          {activeTab === 'social_vote' && (
            <SocialForm api={api} eventId={eventId} week={currentWeek} participants={otherParticipants} />
          )}
          {activeTab === 'attendance' && (
            <div className="tab-content" style={{ color: '#aaa', textAlign: 'center', padding: 32 }}>
              La asistencia la registra el administrador.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Msg({ msg }) {
  if (!msg) return null
  return <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>
}

function WeightForm({ api, eventId, week, today }) {
  const [weight, setWeight] = useState('')
  const [date,   setDate]   = useState(today)
  const [msg,    setMsg]    = useState(null)
  const save = async () => {
    const r = await api(`/api/events/${eventId}/data/weight`, { method: 'POST', body: JSON.stringify({ week, weight: parseFloat(weight), entry_date: date }) })
    setMsg(r.ok ? { ok: true, text: 'Peso registrado ✓' } : { ok: false, text: r.error })
  }
  return (
    <div className="tab-content">
      <p className="entry-hint">Registra tu peso de esta semana (semana {week})</p>
      <div className="form-row"><label>Peso actual (kg)</label><input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0" autoFocus /></div>
      <div className="form-row"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <Msg msg={msg} />
      <button className="btn-primary" onClick={save}>Guardar peso</button>
    </div>
  )
}

function ActivityForm({ api, eventId, week, today }) {
  const [steps,   setSteps]   = useState('')
  const [minutes, setMinutes] = useState('')
  const [date,    setDate]    = useState(today)
  const [msg,     setMsg]     = useState(null)
  const save = async () => {
    const r = await api(`/api/events/${eventId}/data/activity`, { method: 'POST', body: JSON.stringify({ week, entry_date: date, steps: parseInt(steps) || 0, active_minutes: parseInt(minutes) || 0 }) })
    setMsg(r.ok ? { ok: true, text: 'Actividad registrada ✓' } : { ok: false, text: r.error })
  }
  return (
    <div className="tab-content">
      <p className="entry-hint">Registra tu actividad física del día</p>
      <div className="form-row"><label>Pasos</label><input type="number" value={steps} onChange={e => setSteps(e.target.value)} placeholder="8000" /></div>
      <div className="form-row"><label>Minutos activos</label><input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="30" /></div>
      <div className="form-row"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <Msg msg={msg} />
      <button className="btn-primary" onClick={save}>Guardar actividad</button>
    </div>
  )
}

function HydrationForm({ api, eventId, week, today }) {
  const [glasses, setGlasses] = useState('')
  const [date,    setDate]    = useState(today)
  const [msg,     setMsg]     = useState(null)
  const save = async () => {
    const r = await api(`/api/events/${eventId}/data/hydration`, { method: 'POST', body: JSON.stringify({ week, entry_date: date, glasses: parseInt(glasses) || 0 }) })
    setMsg(r.ok ? { ok: true, text: 'Hidratación registrada ✓' } : { ok: false, text: r.error })
  }
  return (
    <div className="tab-content">
      <p className="entry-hint">¿Cuántos vasos de agua tomaste hoy?</p>
      <div className="form-row"><label>Vasos de agua</label><input type="number" value={glasses} onChange={e => setGlasses(e.target.value)} placeholder="8" /></div>
      <div className="form-row"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <Msg msg={msg} />
      <button className="btn-primary" onClick={save}>Guardar hidratación</button>
    </div>
  )
}

function SleepForm({ api, eventId, week, today }) {
  const [hours,   setHours]   = useState('')
  const [quality, setQuality] = useState(3)
  const [date,    setDate]    = useState(today)
  const [msg,     setMsg]     = useState(null)
  const save = async () => {
    const r = await api(`/api/events/${eventId}/data/sleep`, { method: 'POST', body: JSON.stringify({ week, entry_date: date, hours: parseFloat(hours) || 0, quality }) })
    setMsg(r.ok ? { ok: true, text: 'Sueño registrado ✓' } : { ok: false, text: r.error })
  }
  return (
    <div className="tab-content">
      <p className="entry-hint">Registra cómo dormiste anoche</p>
      <div className="form-row"><label>Horas de sueño</label><input type="number" step="0.5" value={hours} onChange={e => setHours(e.target.value)} placeholder="7.5" /></div>
      <div className="form-row"><label>Calidad (1 = terrible, 5 = excelente)</label></div>
      <div className="quality-stars">
        {[1,2,3,4,5].map(n => <button key={n} className={`star-btn ${quality >= n ? 'on' : ''}`} onClick={() => setQuality(n)}>★</button>)}
      </div>
      <div className="form-row"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <Msg msg={msg} />
      <button className="btn-primary" onClick={save}>Guardar sueño</button>
    </div>
  )
}

function NutritionForm({ api, eventId, week, today }) {
  const [consumed, setConsumed] = useState('')
  const [target,   setTarget]   = useState('2000')
  const [date,     setDate]     = useState(today)
  const [msg,      setMsg]      = useState(null)
  const save = async () => {
    const r = await api(`/api/events/${eventId}/data/nutrition`, { method: 'POST', body: JSON.stringify({ week, entry_date: date, calories_consumed: parseInt(consumed) || 0, calories_target: parseInt(target) || 2000 }) })
    setMsg(r.ok ? { ok: true, text: 'Nutrición registrada ✓' } : { ok: false, text: r.error })
  }
  const deficit = (parseInt(target) || 0) - (parseInt(consumed) || 0)
  return (
    <div className="tab-content">
      <p className="entry-hint">Registra tu consumo calórico de hoy</p>
      <div className="form-row"><label>Calorías objetivo</label><input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="2000" /></div>
      <div className="form-row"><label>Calorías consumidas</label><input type="number" value={consumed} onChange={e => setConsumed(e.target.value)} placeholder="1800" /></div>
      {consumed && <div className={`deficit-badge ${deficit >= 0 ? 'ok' : 'over'}`}>{deficit >= 0 ? `✓ Déficit: ${deficit} kcal` : `⚠ Exceso: ${Math.abs(deficit)} kcal`}</div>}
      <div className="form-row"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <Msg msg={msg} />
      <button className="btn-primary" onClick={save}>Guardar nutrición</button>
    </div>
  )
}

function MeasurementsForm({ api, eventId, week }) {
  const [waist,   setWaist]   = useState('')
  const [fatPct,  setFatPct]  = useState('')
  const [msg,     setMsg]     = useState(null)
  const save = async () => {
    const r = await api(`/api/events/${eventId}/data/measurements`, { method: 'POST', body: JSON.stringify({ week, waist_cm: parseFloat(waist) || null, body_fat_pct: parseFloat(fatPct) || null }) })
    setMsg(r.ok ? { ok: true, text: 'Medidas registradas ✓' } : { ok: false, text: r.error })
  }
  return (
    <div className="tab-content">
      <p className="entry-hint">Registra tus medidas corporales de esta semana</p>
      <div className="form-row"><label>Cintura (cm)</label><input type="number" step="0.1" value={waist} onChange={e => setWaist(e.target.value)} placeholder="90.0" /></div>
      <div className="form-row"><label>% Grasa corporal (opcional)</label><input type="number" step="0.1" value={fatPct} onChange={e => setFatPct(e.target.value)} placeholder="25.0" /></div>
      <Msg msg={msg} />
      <button className="btn-primary" onClick={save}>Guardar medidas</button>
    </div>
  )
}

function ChallengeForm({ api, eventId, week }) {
  const [completed, setCompleted] = useState(null)
  const [msg,       setMsg]       = useState(null)
  const save = async (val) => {
    setCompleted(val)
    const r = await api(`/api/events/${eventId}/data/challenge`, { method: 'POST', body: JSON.stringify({ week, completed: val }) })
    setMsg(r.ok ? { ok: true, text: val ? 'Reto completado ✓' : 'Marcado como no completado' } : { ok: false, text: r.error })
  }
  return (
    <div className="tab-content" style={{ textAlign: 'center' }}>
      <p className="entry-hint">¿Completaste el reto de esta semana (sem {week})?</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
        <button className={`challenge-btn yes ${completed === true ? 'selected' : ''}`} onClick={() => save(true)}>✅ Sí, lo logré</button>
        <button className={`challenge-btn no  ${completed === false ? 'selected' : ''}`} onClick={() => save(false)}>❌ No esta vez</button>
      </div>
      <Msg msg={msg} />
    </div>
  )
}

function HabitForm({ api, eventId, week, today }) {
  const [date, setDate] = useState(today)
  const [msg,  setMsg]  = useState(null)
  const save = async () => {
    const r = await api(`/api/events/${eventId}/data/habit`, { method: 'POST', body: JSON.stringify({ week, entry_date: date, completed: true }) })
    setMsg(r.ok ? { ok: true, text: '✅ Hábito registrado para ' + date } : { ok: false, text: r.error })
  }
  return (
    <div className="tab-content" style={{ textAlign: 'center' }}>
      <p className="entry-hint">Marca tu hábito diario como completado</p>
      <div className="form-row"><label>Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <Msg msg={msg} />
      <button className="btn-primary" style={{ marginTop: 12 }} onClick={save}>✓ Marcar hábito completado</button>
    </div>
  )
}

function SocialForm({ api, eventId, week, participants }) {
  const [votedId, setVotedId] = useState('')
  const [msg,     setMsg]     = useState(null)
  const save = async () => {
    if (!votedId) return
    const r = await api(`/api/events/${eventId}/data/social`, { method: 'POST', body: JSON.stringify({ voted_id: parseInt(votedId), week, points: 1 }) })
    setMsg(r.ok ? { ok: true, text: 'Voto registrado ✓' } : { ok: false, text: r.error })
  }
  return (
    <div className="tab-content">
      <p className="entry-hint">Otorga tu punto de motivación a otro participante esta semana</p>
      <div className="vote-options">
        {participants.map(p => (
          <button key={p.id} className={`vote-option ${votedId == p.id ? 'selected' : ''}`} onClick={() => setVotedId(p.id)}>
            <span style={{ color: p.color, fontSize: 24 }}>■</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <Msg msg={msg} />
      <button className="btn-primary" onClick={save} disabled={!votedId}>⭐ Votar</button>
    </div>
  )
}
