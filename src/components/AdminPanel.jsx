import { useState } from 'react'
import { Avatar } from './Scene'

/* ─── Health Metrics ─────────────────────────────────────── */
function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Bajo peso',   color: '#4A8FD4' }
  if (bmi < 25)   return { label: 'Normal ✅',    color: '#5EFF99' }
  if (bmi < 30)   return { label: 'Sobrepeso ⚠️', color: '#FFE566' }
  if (bmi < 35)   return { label: 'Obesidad I',   color: '#FF8C42' }
  if (bmi < 40)   return { label: 'Obesidad II',  color: '#FF5B5B' }
  return              { label: 'Obesidad III',    color: '#FF3030' }
}

function HealthMetrics({ weight, height, goalWeight }) {
  if (!height || height < 100) {
    return (
      <div style={{ opacity: 0.45, fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>
        Ingresa la talla para ver métricas de salud
      </div>
    )
  }
  const h       = height / 100
  const bmi     = weight / (h * h)
  const goalBmi = goalWeight / (h * h)
  const cat     = bmiCategory(bmi)
  const goalCat = bmiCategory(goalBmi)
  const toLose  = weight - goalWeight
  const weeks05 = Math.ceil(Math.max(0, toLose) / 0.5)
  const weeks10 = Math.ceil(Math.max(0, toLose) / 1.0)
  const hydration = (0.035 * weight).toFixed(1)

  return (
    <div className="health-metrics">
      <div className="health-metrics-title">📊 Métricas de Salud</div>
      <div className="health-grid">
        <div className="health-item">IMC actual: <strong style={{ color: cat.color }}>{bmi.toFixed(1)}</strong></div>
        <div className="health-item">Categoría: <strong style={{ color: cat.color }}>{cat.label}</strong></div>
        <div className="health-item">IMC meta: <strong style={{ color: goalCat.color }}>{goalBmi.toFixed(1)}</strong></div>
        <div className="health-item">Meta: <strong style={{ color: goalCat.color }}>{goalCat.label}</strong></div>
        <div className="health-item">A perder: <strong>{Math.max(0, toLose).toFixed(1)} kg</strong></div>
        <div className="health-item">Hidratación: <strong>{hydration} L/día</strong></div>
      </div>
      <div className="health-rates">
        <div className="health-rates-title">Ritmo recomendado:</div>
        <div className="health-rate-row">⚡ 1 kg/sem (agresivo): ~{weeks10} sem → <strong>1,100 kcal/día déficit</strong></div>
        <div className="health-rate-row">🌿 0.5 kg/sem (seguro): ~{weeks05} sem → <strong>550 kcal/día déficit</strong></div>
        <div className="health-rate-row" style={{ opacity: 0.55, fontSize: 11, marginTop: 4 }}>
          1 kg grasa ≈ 7,700 kcal · Rango seguro: 0.5–1 kg/semana
        </div>
      </div>
    </div>
  )
}

/* ─── Participant section (Evento tab) ───────────────────── */
function ParticipantSection({ p, password, onSaved, onMsg }) {
  const [open, setOpen]    = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm]    = useState({
    name:          p.name,
    color:         p.color,
    initialWeight: p.initialWeight,
    goalWeight:    p.goalWeight,
    height:        p.height || '',
    avatar:        p.avatar,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!password) { onMsg({ type: 'error', text: 'Ingresa la contraseña arriba' }); return }
    setSaving(true)
    try {
      const res  = await fetch('/api/participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id: p.id, ...form,
          initialWeight: parseFloat(form.initialWeight),
          goalWeight: parseFloat(form.goalWeight),
          height: form.height ? parseFloat(form.height) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onMsg({ type: 'success', text: `✅ ${form.name} actualizado` })
      if (onSaved && data.data) onSaved(data.data)
    } catch (err) {
      onMsg({ type: 'error', text: `❌ ${err.message}` })
    }
    setSaving(false)
  }

  return (
    <div className="participant-section">
      <div className="participant-section-header" onClick={() => setOpen(o => !o)}>
        <Avatar id={p.id} avatar={p.avatar} color={p.color} size={32} />
        <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 16, flex: 1 }}>{p.name}</span>
        <span style={{ opacity: 0.5, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="participant-section-body">
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>Nombre</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Color</label>
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                style={{ padding: 4, height: 40 }} />
            </div>
            <div className="admin-field">
              <label>Peso inicial (kg)</label>
              <input type="number" step="0.1" value={form.initialWeight}
                onChange={e => set('initialWeight', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Meta de peso (kg)</label>
              <input type="number" step="0.1" value={form.goalWeight}
                onChange={e => set('goalWeight', e.target.value)} />
            </div>
            <div className="admin-field">
              <label>Talla (cm)</label>
              <input type="number" step="0.5" placeholder="ej. 175" value={form.height}
                onChange={e => set('height', e.target.value)} />
            </div>
          </div>
          <HealthMetrics
            weight={parseFloat(form.initialWeight) || p.initialWeight}
            height={parseFloat(form.height) || p.height}
            goalWeight={parseFloat(form.goalWeight) || p.goalWeight}
          />
          <button className="btn-save" style={{ marginTop: 12, width: '100%' }}
            onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : `💾 Guardar ${form.name}`}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Tab: Pesos ─────────────────────────────────────────── */
function PesosTab({ participants, currentWeek, password, onWeightSaved }) {
  const [participantId, setParticipantId] = useState(participants[0]?.id || '')
  const [week,   setWeek]   = useState(currentWeek)
  const [weight, setWeight] = useState('')
  const [date,   setDate]   = useState(weekToDate(currentWeek))
  const [msg,    setMsg]    = useState(null)
  const [loading, setLoading] = useState(false)

  function weekToDate(w) {
    const d = new Date('2026-07-20')
    d.setDate(d.getDate() + parseInt(w) * 7)
    return d.toISOString().slice(0, 10)
  }

  const onWeekChange = (w) => {
    setWeek(w)
    const p = participants.find(p => p.id === participantId)
    const ex = p?.entries?.find(e => e.week === parseInt(w))
    if (ex) { setWeight(String(ex.weight)); setDate(ex.date) }
    else     { setWeight(''); setDate(weekToDate(w)) }
    setMsg(null)
  }

  const onParticipantChange = (id) => {
    setParticipantId(id)
    const p  = participants.find(p => p.id === id)
    const ex = p?.entries?.find(e => e.week === parseInt(week))
    if (ex) { setWeight(String(ex.weight)); setDate(ex.date) }
    else     { setWeight(''); setDate(weekToDate(week)) }
    setMsg(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!password) return setMsg({ type: 'error', text: 'Ingresa la contraseña arriba' })
    if (!weight)   return setMsg({ type: 'error', text: 'Ingresa el peso' })
    setLoading(true)
    try {
      const res  = await fetch('/api/weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, participantId, week: parseInt(week), date, weight: parseFloat(weight) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setMsg({ type: 'success', text: `✅ ${data.participant.name}: ${weight} kg (sem ${week})` })
      onWeightSaved(data.participant)
      setWeight('')
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` })
    }
    setLoading(false)
  }

  const selectedP   = participants.find(p => p.id === participantId)
  const hasExisting = selectedP?.entries?.some(e => e.week === parseInt(week))
  const getLatest   = (p) => p?.entries?.[p.entries.length - 1]?.weight ?? p?.initialWeight
  const recentEntries = [...(selectedP?.entries || [])].sort((a,b) => b.week - a.week).slice(0, 5)

  return (
    <form onSubmit={handleSave}>
      <div className="admin-field">
        <label>Participante</label>
        <select value={participantId} onChange={e => onParticipantChange(e.target.value)}>
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.name} — actual: {getLatest(p)} kg</option>
          ))}
        </select>
      </div>

      <div className="admin-grid-2">
        <div className="admin-field">
          <label>Semana</label>
          <select value={week} onChange={e => onWeekChange(e.target.value)}>
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
        <label>Peso (kg){selectedP ? ` · Meta: ${selectedP.goalWeight} kg` : ''}</label>
        <input
          type="number" step="0.1" min="30" max="300"
          placeholder={selectedP ? `ej. ${(getLatest(selectedP) - 1).toFixed(1)}` : ''}
          value={weight}
          onChange={e => setWeight(e.target.value)}
        />
      </div>

      {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}

      <div className="admin-btns">
        <button type="submit" className="btn-save" disabled={loading}>
          {loading ? 'Guardando…' : hasExisting ? '✏️ Actualizar' : '💾 Guardar'}
        </button>
      </div>

      {recentEntries.length > 0 && (
        <div className="weight-history">
          <div className="weight-history-title">Historial — {selectedP?.name}</div>
          {recentEntries.map(e => {
            const prev = selectedP?.entries?.find(en => en.week === e.week - 1)
            const delta = prev ? (prev.weight - e.weight).toFixed(1) : null
            return (
              <div key={e.week} className="weight-history-row">
                <span style={{ opacity: 0.65 }}>Sem {e.week}{e.week === 0 ? ' (inicio)' : ''}</span>
                <span style={{ fontFamily: 'Fredoka One, cursive', color: '#FFE566' }}>{e.weight} kg</span>
                {delta !== null && (
                  <span style={{ color: parseFloat(delta) >= 0 ? '#5EFF99' : '#FF5B5B', fontSize: 11 }}>
                    {parseFloat(delta) >= 0 ? `▼ ${delta}` : `▲ ${Math.abs(delta)}`} kg
                  </span>
                )}
                <span style={{ opacity: 0.45, fontSize: 11 }}>{e.date}</span>
              </div>
            )
          })}
        </div>
      )}
    </form>
  )
}

/* ─── Tab: Visual ────────────────────────────────────────── */
const BG_OPTIONS = [
  { id: 'prairie', icon: '🌿', label: 'Pradera' },
  { id: 'forest',  icon: '🌲', label: 'Bosque'  },
  { id: 'ocean',   icon: '🌊', label: 'Océano'  },
  { id: 'sunset',  icon: '🌅', label: 'Atardecer' },
  { id: 'desert',  icon: '🏜️', label: 'Desierto' },
]
const TIME_OPTIONS = [
  { id: 'auto',      icon: '🔄', label: 'Auto'    },
  { id: 'morning',   icon: '🌄', label: 'Mañana'  },
  { id: 'afternoon', icon: '☀️', label: 'Tarde'   },
  { id: 'evening',   icon: '🌇', label: 'Atardecer' },
  { id: 'night',     icon: '🌙', label: 'Noche'   },
]
const ANIM_OPTIONS = [
  { id: 'clouds', icon: '☁️', label: 'Nubes'     },
  { id: 'birds',  icon: '🐦', label: 'Pájaros'   },
  { id: 'leaves', icon: '🍃', label: 'Hojas'     },
  { id: 'water',  icon: '💧', label: 'Destellos de agua' },
]

function VisualTab({ settings, password, onSettingsSaved }) {
  const [bg,       setBg]       = useState(settings.background || 'prairie')
  const [timeMode, setTimeMode] = useState(settings.timeMode   || 'auto')
  const [anim,     setAnim]     = useState({
    clouds: true, birds: true, leaves: true, water: true,
    ...(settings.animations || {}),
  })
  const [msg,     setMsg]     = useState(null)
  const [loading, setLoading] = useState(false)

  const toggleAnim = (key) => setAnim(a => ({ ...a, [key]: !a[key] }))

  const handleSave = async () => {
    if (!password) { setMsg({ type: 'error', text: 'Ingresa la contraseña arriba' }); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, settings: { background: bg, animations: anim, timeMode } }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: '✅ Configuración visual guardada' })
      onSettingsSaved({ background: bg, animations: anim, timeMode })
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` })
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="admin-field">
        <label>Fondo de pantalla</label>
        <div className="bg-options">
          {BG_OPTIONS.map(opt => (
            <div key={opt.id} className={`bg-option ${bg === opt.id ? 'active' : ''}`}
              onClick={() => setBg(opt.id)}>
              <div className="bg-option-icon">{opt.icon}</div>
              <div className="bg-option-label">{opt.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-field">
        <label>Animaciones</label>
        <div className="anim-toggles">
          {ANIM_OPTIONS.map(opt => (
            <div key={opt.id} className="anim-toggle" onClick={() => toggleAnim(opt.id)}>
              <span className="anim-toggle-label">
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </span>
              <div className={`toggle-switch ${anim[opt.id] ? 'on' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="admin-field">
        <label>Hora del día</label>
        <div className="time-options">
          {TIME_OPTIONS.map(opt => (
            <div key={opt.id} className={`time-option ${timeMode === opt.id ? 'active' : ''}`}
              onClick={() => setTimeMode(opt.id)}>
              {opt.icon} {opt.label}
            </div>
          ))}
        </div>
      </div>

      {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}
      <div className="admin-btns">
        <button className="btn-save" onClick={handleSave} disabled={loading}>
          {loading ? 'Guardando…' : '🎨 Aplicar configuración visual'}
        </button>
      </div>
    </div>
  )
}

/* ─── Tab: Evento & Salud ────────────────────────────────── */
function EventoTab({ challenge, participants, password, onDataRefresh }) {
  const [form, setForm] = useState({
    name:        challenge.name        || "Capibara's Challenge",
    startDate:   challenge.startDate   || '2026-07-20',
    endDate:     challenge.endDate     || '2026-09-20',
    goalPercent: challenge.goalPercent || 10,
    totalWeeks:  challenge.totalWeeks  || 9,
  })
  const [msg,     setMsg]     = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!password) { setMsg({ type: 'error', text: 'Ingresa la contraseña arriba' }); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, config: form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: '✅ Configuración del evento guardada' })
    } catch (err) {
      setMsg({ type: 'error', text: `❌ ${err.message}` })
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Event config */}
      <div style={{
        background: 'rgba(255,215,0,0.06)',
        border: '1px solid rgba(255,215,0,0.2)',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 16,
      }}>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 14, color: '#FFE566', marginBottom: 12 }}>
          🏆 Configuración del Evento
        </div>
        <div className="admin-field">
          <label>Nombre del evento</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="admin-grid-2">
          <div className="admin-field">
            <label>Fecha inicio</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Fecha fin</label>
            <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Meta de pérdida (%)</label>
            <input type="number" step="0.5" min="1" max="50"
              value={form.goalPercent} onChange={e => set('goalPercent', e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Duración (semanas)</label>
            <input type="number" step="1" min="1" max="52"
              value={form.totalWeeks} onChange={e => set('totalWeeks', e.target.value)} />
          </div>
        </div>

        {/* Info card — doctor/nutritionist context */}
        <div style={{
          background: 'rgba(94,255,153,0.07)',
          border: '1px solid rgba(94,255,153,0.2)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 11,
          opacity: 0.8,
          lineHeight: 1.5,
        }}>
          💡 <strong>Recomendaciones:</strong> Pérdida segura 0.5–1 kg/sem.
          Meta del {form.goalPercent}% en {form.totalWeeks} sem equivale a
          ~{(form.goalPercent / 100 / form.totalWeeks * 1).toFixed(2)}%/sem.
          Para David: {(147.5 * form.goalPercent / 100 / form.totalWeeks).toFixed(1)} kg/sem;
          Benjamin: {(96.5 * form.goalPercent / 100 / form.totalWeeks).toFixed(1)} kg/sem;
          Daniel: {(109 * form.goalPercent / 100 / form.totalWeeks).toFixed(1)} kg/sem.
        </div>

        {msg && <div className={`admin-msg ${msg.type}`}>{msg.text}</div>}
        <div className="admin-btns">
          <button className="btn-save" onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando…' : '💾 Guardar evento'}
          </button>
        </div>
      </div>

      {/* Per-participant config */}
      <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 14, color: '#FFE566', marginBottom: 10 }}>
        👥 Participantes &amp; Métricas de Salud
      </div>
      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 12 }}>
        Ingresa la talla de cada participante para ver IMC, categoría y ritmo recomendado
      </div>
      {participants.map(p => (
        <ParticipantSection
          key={p.id}
          p={p}
          password={password}
          onSaved={onDataRefresh}
          onMsg={setMsg}
        />
      ))}
    </div>
  )
}

/* ─── AdminPanel ─────────────────────────────────────────── */
const TABS = ['⚖️ Pesos', '🎨 Visual', '🏆 Evento & Salud']

export default function AdminPanel({
  participants, challenge, settings, currentWeek,
  onWeightSaved, onSettingsSaved, onDataRefresh, onClose,
}) {
  const [activeTab, setActiveTab] = useState(0)
  const [password,  setPassword]  = useState('')

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={e => e.stopPropagation()}>

        <div className="admin-header">
          <div className="admin-title">⚙️ Panel Admin</div>
          <button className="admin-close" onClick={onClose}>✕</button>
        </div>

        {/* Shared password */}
        <div className="admin-pw-row">
          <label>🔑</label>
          <input
            type="password"
            placeholder="Contraseña admin"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map((t, i) => (
            <button key={i} className={`admin-tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 0 && (
          <PesosTab
            participants={participants}
            currentWeek={currentWeek}
            password={password}
            onWeightSaved={onWeightSaved}
          />
        )}
        {activeTab === 1 && (
          <VisualTab
            settings={settings}
            password={password}
            onSettingsSaved={onSettingsSaved}
          />
        )}
        {activeTab === 2 && (
          <EventoTab
            challenge={challenge}
            participants={participants}
            password={password}
            onDataRefresh={onDataRefresh}
          />
        )}

      </div>
    </div>
  )
}
