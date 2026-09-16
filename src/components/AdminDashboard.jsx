import { useState, useEffect, useRef } from 'react'

const FACTOR_CATALOG = [
  { type: 'weight',           label: 'Peso corporal',       icon: '⚖️',  unit: '% pérdida',         tip: 'Porcentaje de peso perdido respecto al objetivo' },
  { type: 'activity',         label: 'Actividad física',    icon: '🏃',  unit: 'pasos / min activos', tip: 'Pasos diarios o minutos de actividad' },
  { type: 'hydration',        label: 'Hidratación',         icon: '💧',  unit: 'vasos / día',         tip: 'Vasos de agua consumidos por día' },
  { type: 'sleep',            label: 'Sueño',               icon: '😴',  unit: 'horas / calidad',     tip: 'Horas de sueño y calidad de descanso (1-5)' },
  { type: 'nutrition',        label: 'Nutrición',           icon: '🥗',  unit: 'kcal déficit',         tip: 'Días en que se logró el déficit calórico' },
  { type: 'measurements',     label: 'Medidas corporales',  icon: '📏',  unit: 'cm cintura / % grasa', tip: 'Reducción de cintura o porcentaje de grasa' },
  { type: 'weekly_challenge', label: 'Reto semanal',        icon: '🏆',  unit: 'sí / no',             tip: 'Reto especial configurable por semana' },
  { type: 'daily_habit',      label: 'Hábito diario',       icon: '✅',  unit: 'racha de días',        tip: 'Check-in diario — porcentaje de días completados' },
  { type: 'social_vote',      label: 'Puntuación social',   icon: '⭐',  unit: 'votos',               tip: 'Puntos otorgados por otros participantes' },
  { type: 'attendance',       label: 'Asistencia grupal',   icon: '🤝',  unit: 'sesiones',             tip: 'Asistencia a clases o sesiones grupales' },
]

const TABS = [
  { id: 'weights',   label: '⚖️ Pesos'       },
  { id: 'visual',    label: '🎨 Visual'       },
  { id: 'event',     label: '🏆 Evento'       },
  { id: 'factors',   label: '📊 Factores'     },
  { id: 'penalties', label: '🚨 Penalizaciones'},
  { id: 'users',     label: '👥 Usuarios'     },
  { id: 'events',    label: '📅 Eventos'      },
  { id: 'fees',      label: '💰 Inscripciones'},
]

export default function AdminDashboard({ auth, api, participants, challenge, settings, eventId, currentWeek, onClose, onRefresh }) {
  const [tab, setTab] = useState('weights')

  return (
    <div className="admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel admin-panel-lg">
        <div className="admin-header">
          <span className="admin-title">⚙️ Panel de administración</span>
          <button className="admin-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-tabs-scroll">
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="admin-tab-body">
          {tab === 'weights'   && <WeightsTab   api={api} participants={participants} currentWeek={currentWeek} eventId={eventId} onRefresh={onRefresh} />}
          {tab === 'visual'    && <VisualTab    api={api} settings={settings} onRefresh={onRefresh} />}
          {tab === 'event'     && <EventTab     api={api} challenge={challenge} participants={participants} onRefresh={onRefresh} />}
          {tab === 'factors'   && <FactorsTab   api={api} eventId={eventId} onRefresh={onRefresh} />}
          {tab === 'penalties' && <PenaltiesTab api={api} eventId={eventId} participants={participants} currentWeek={currentWeek} />}
          {tab === 'users'     && <UsersTab     api={api} />}
          {tab === 'events'    && <EventsTab    api={api} onRefresh={onRefresh} />}
          {tab === 'fees'      && <FeesTab      api={api} eventId={eventId} participants={participants} />}
        </div>
      </div>
    </div>
  )
}

// ─── TAB: Pesos ──────────────────────────────────────────
function WeightsTab({ api, participants, currentWeek, eventId, onRefresh }) {
  const [pid,    setPid]    = useState(participants[0]?.id || '')
  const [week,   setWeek]   = useState(currentWeek)
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10))
  const [weight, setWeight] = useState('')
  const [msg,    setMsg]    = useState(null)

  const p = participants.find(x => x.id == pid)
  const existingEntry = p?.entries?.find(e => e.week == week)
  useEffect(() => { if (existingEntry) setWeight(existingEntry.weight); else setWeight('') }, [pid, week])

  const save = async () => {
    if (!weight || !pid || week === '' || !eventId) return
    const r = await api(`/api/events/${eventId}/data/weight`, {
      method: 'POST', body: JSON.stringify({ user_id: pid, week: parseInt(week), weight: parseFloat(weight), entry_date: date })
    })
    setMsg(r.ok ? { ok: true, text: 'Peso guardado ✓' } : { ok: false, text: r.error })
    if (r.ok) onRefresh()
  }

  const last5 = (p?.entries || []).slice(-5).reverse()

  return (
    <div className="tab-content">
      <div className="form-row">
        <label>Participante</label>
        <select value={pid} onChange={e => setPid(e.target.value)}>
          {participants.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>
      <div className="form-row-2">
        <div className="form-row">
          <label>Semana</label>
          <select value={week} onChange={e => setWeek(e.target.value)}>
            {Array.from({ length: (p?.challenge?.totalWeeks || 10) + 1 }, (_, i) => (
              <option key={i} value={i}>Sem {i}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <label>Peso (kg)</label>
        <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0" />
      </div>
      {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <button className="btn-primary" onClick={save}>{existingEntry ? 'Actualizar' : 'Guardar'}</button>

      {last5.length > 0 && (
        <div className="history-list">
          <div className="history-title">Últimos registros de {p?.name}</div>
          {last5.map(e => (
            <div key={e.week} className="history-row">
              <span>Sem {e.week}</span><span>{e.date}</span><span style={{ fontWeight: 700 }}>{e.weight} kg</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TAB: Visual ─────────────────────────────────────────
const BACKGROUNDS = [
  { id: 'prairie', label: 'Pradera', emoji: '🌾' },
  { id: 'forest',  label: 'Bosque',  emoji: '🌲' },
  { id: 'ocean',   label: 'Océano',  emoji: '🌊' },
  { id: 'sunset',  label: 'Atardecer',emoji: '🌅' },
  { id: 'desert',  label: 'Desierto', emoji: '🏜️' },
]
const TIME_MODES = [
  { id: 'auto',      label: '🕐 Automático' },
  { id: 'morning',   label: '🌤 Mañana' },
  { id: 'afternoon', label: '☀️ Tarde' },
  { id: 'evening',   label: '🌆 Atardecer' },
  { id: 'night',     label: '🌙 Noche' },
]

function VisualTab({ api, settings, onRefresh }) {
  const [bg,       setBg]       = useState(settings?.background || 'prairie')
  const [anim,     setAnim]     = useState(settings?.animations || { clouds: true, birds: true, leaves: true, water: true })
  const [timeMode, setTimeMode] = useState(settings?.timeMode   || 'auto')
  const [bgFile,   setBgFile]   = useState(null)
  const [msg,      setMsg]      = useState(null)
  const fileRef = useRef()

  const toggleAnim = k => setAnim(a => ({ ...a, [k]: !a[k] }))

  const save = async () => {
    let bgImageUrl = settings?.bgImageUrl
    if (bgFile) {
      const fd = new FormData(); fd.append('background', bgFile)
      const token = localStorage.getItem('cc_token')
      const r = await fetch('/api/upload/background', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd }).then(r => r.json())
      bgImageUrl = r.url
    }
    const payload = { background: bg, animations: anim, timeMode }
    if (bgImageUrl) payload.bgImageUrl = bgImageUrl
    const r = await api('/api/settings', { method: 'POST', body: JSON.stringify({ password: 'capibara2026', settings: payload }) })
    setMsg(r.ok || r.success ? { ok: true, text: 'Guardado ✓' } : { ok: false, text: r.error })
    if (r.ok || r.success) onRefresh()
  }

  return (
    <div className="tab-content">
      <div className="form-row"><label>Fondo de pantalla</label></div>
      <div className="bg-options">
        {BACKGROUNDS.map(b => (
          <button key={b.id} className={`bg-btn ${bg === b.id ? 'active' : ''}`} onClick={() => setBg(b.id)}>
            <span>{b.emoji}</span><span>{b.label}</span>
          </button>
        ))}
      </div>
      <div className="form-row" style={{ marginTop: 14 }}>
        <label>Imagen personalizada (reemplaza fondo)</label>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setBgFile(e.target.files[0])} />
        <button className="btn-secondary" onClick={() => fileRef.current.click()}>
          {bgFile ? `📎 ${bgFile.name}` : '📂 Cargar imagen...'}
        </button>
        {bgFile && <button className="btn-ghost" onClick={() => setBgFile(null)}>✕ Quitar</button>}
      </div>
      <div className="form-row" style={{ marginTop: 14 }}><label>Animaciones</label></div>
      <div className="toggles-row">
        {[['clouds','☁️ Nubes'],['birds','🐦 Pájaros'],['leaves','🍃 Hojas'],['water','💧 Agua']].map(([k, l]) => (
          <button key={k} className={`toggle-btn ${anim[k] ? 'on' : ''}`} onClick={() => toggleAnim(k)}>{l}</button>
        ))}
      </div>
      <div className="form-row" style={{ marginTop: 14 }}><label>Hora del día</label></div>
      <div className="radio-group">
        {TIME_MODES.map(m => (
          <button key={m.id} className={`radio-btn ${timeMode === m.id ? 'active' : ''}`} onClick={() => setTimeMode(m.id)}>{m.label}</button>
        ))}
      </div>
      {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <button className="btn-primary" style={{ marginTop: 16 }} onClick={save}>Aplicar configuración visual</button>
    </div>
  )
}

// ─── TAB: Evento ─────────────────────────────────────────
function EventTab({ api, challenge, participants, onRefresh }) {
  const [name,    setName]    = useState(challenge?.name    || '')
  const [start,   setStart]   = useState(challenge?.startDate  || '')
  const [end,     setEnd]     = useState(challenge?.endDate    || '')
  const [goalPct, setGoalPct] = useState(challenge?.goalPercent|| 10)
  const [weeks,   setWeeks]   = useState(challenge?.totalWeeks || 9)
  const [msg,     setMsg]     = useState(null)

  const save = async () => {
    const r = await api('/api/challenge', { method: 'POST', body: JSON.stringify({ password: 'capibara2026', config: { name, startDate: start, endDate: end, goalPercent: goalPct, totalWeeks: weeks } }) })
    setMsg(r.ok || r.success ? { ok: true, text: 'Evento actualizado ✓' } : { ok: false, text: r.error })
    if (r.ok || r.success) onRefresh()
  }

  return (
    <div className="tab-content">
      <div className="form-row"><label>Nombre del evento</label><input type="text" value={name} onChange={e => setName(e.target.value)} /></div>
      <div className="form-row-2">
        <div className="form-row"><label>Inicio</label><input type="date" value={start} onChange={e => setStart(e.target.value)} /></div>
        <div className="form-row"><label>Fin</label><input type="date" value={end} onChange={e => setEnd(e.target.value)} /></div>
      </div>
      <div className="form-row-2">
        <div className="form-row"><label>Objetivo pérdida (%)</label><input type="number" min="1" max="50" step="0.5" value={goalPct} onChange={e => setGoalPct(e.target.value)} /></div>
        <div className="form-row"><label>Semanas</label><input type="number" min="1" max="52" value={weeks} onChange={e => setWeeks(e.target.value)} /></div>
      </div>
      {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <button className="btn-primary" onClick={save}>Guardar configuración</button>
      <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
        <div className="form-row"><label style={{ fontSize: 13, color: '#aaa' }}>Participantes en este evento ({participants.length})</label></div>
        {participants.map(p => <ParticipantRow key={p.id} p={p} api={api} onRefresh={onRefresh} />)}
      </div>
    </div>
  )
}

function ParticipantRow({ p, api, onRefresh }) {
  const [open,   setOpen]   = useState(false)
  const [name,   setName]   = useState(p.name)
  const [color,  setColor]  = useState(p.color)
  const [weight, setWeight] = useState(p.initialWeight || '')
  const [msg,    setMsg]    = useState(null)

  const save = async () => {
    const r = await api('/api/participant', { method: 'POST', body: JSON.stringify({ password: 'capibara2026', id: p.username || p.id, name, color, initialWeight: parseFloat(weight), avatar: p.avatar }) })
    setMsg(r.ok || r.success ? { ok: true, text: 'Actualizado ✓' } : { ok: false, text: r.error })
    if (r.ok || r.success) onRefresh()
  }

  return (
    <div className="participant-row-admin">
      <div className="participant-row-header" onClick={() => setOpen(v => !v)}>
        <span style={{ color: p.color }}>■</span>
        <span style={{ fontWeight: 700 }}>{p.name}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.5 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '10px 0 0' }}>
          <div className="form-row-2">
            <div className="form-row"><label>Nombre</label><input type="text" value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="form-row"><label>Color</label><input type="color" value={color} onChange={e => setColor(e.target.value)} /></div>
          </div>
          <div className="form-row"><label>Peso inicial (kg)</label><input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
          <button className="btn-secondary" onClick={save}>Guardar</button>
        </div>
      )}
    </div>
  )
}

// ─── TAB: Factores ───────────────────────────────────────
function FactorsTab({ api, eventId, onRefresh }) {
  const [factors, setFactors] = useState(null)
  const [msg,     setMsg]     = useState(null)

  useEffect(() => {
    if (!eventId) return
    api(`/api/events/${eventId}`).then(ev => {
      if (ev.factors) {
        const map = Object.fromEntries(ev.factors.map(f => [f.factor_type, f]))
        setFactors(FACTOR_CATALOG.map(c => ({
          ...c, factor_type: c.type,
          weight_pct: map[c.type]?.weight_pct || 0,
          config:     map[c.type]?.config || {},
          active:     map[c.type]?.active || false,
        })))
      } else {
        setFactors(FACTOR_CATALOG.map(c => ({ ...c, factor_type: c.type, weight_pct: 0, config: {}, active: false })))
      }
    })
  }, [eventId])

  if (!factors) return <div className="tab-content" style={{ color: '#aaa' }}>Cargando factores...</div>

  const toggle = (type) => setFactors(fs => fs.map(f => f.factor_type === type ? { ...f, active: !f.active } : f))
  const setPct = (type, val) => setFactors(fs => fs.map(f => f.factor_type === type ? { ...f, weight_pct: parseFloat(val) || 0 } : f))
  const setConfigVal = (type, key, val) => setFactors(fs => fs.map(f => f.factor_type === type ? { ...f, config: { ...f.config, [key]: val } } : f))

  const activeFactors = factors.filter(f => f.active)
  const total = activeFactors.reduce((s, f) => s + (f.weight_pct || 0), 0)
  const totalOk = activeFactors.length === 0 || Math.abs(total - 100) <= 0.5

  const distribute = () => {
    if (!activeFactors.length) return
    const each = +(100 / activeFactors.length).toFixed(1)
    setFactors(fs => fs.map(f => f.active ? { ...f, weight_pct: each } : f))
  }

  const save = async () => {
    const r = await api(`/api/events/${eventId}/factors`, { method: 'PUT', body: JSON.stringify({ factors }) })
    setMsg(Array.isArray(r) ? { ok: true, text: 'Factores guardados ✓' } : { ok: false, text: r.error })
    if (Array.isArray(r)) onRefresh()
  }

  return (
    <div className="tab-content">
      <div className="factors-header">
        <div>
          <span style={{ color: totalOk ? '#5BB85B' : '#e55' }}>
            Total activos: {total.toFixed(1)}%
          </span>
          {!totalOk && <span style={{ color: '#e55', marginLeft: 8, fontSize: 12 }}>⚠ Debe ser 100%</span>}
        </div>
        <button className="btn-ghost" onClick={distribute}>Distribuir equitativamente</button>
      </div>
      <div className="factors-list">
        {factors.map(f => (
          <div key={f.factor_type} className={`factor-row ${f.active ? 'active' : ''}`}>
            <div className="factor-row-top">
              <button className={`factor-toggle ${f.active ? 'on' : ''}`} onClick={() => toggle(f.factor_type)}>
                {f.active ? '✓' : '○'}
              </button>
              <span className="factor-icon">{f.icon}</span>
              <div className="factor-info">
                <span className="factor-label">{f.label}</span>
                <span className="factor-unit">{f.unit}</span>
              </div>
              {f.active && (
                <div className="factor-pct-input">
                  <input type="number" min="0" max="100" step="0.5" value={f.weight_pct}
                    onChange={e => setPct(f.factor_type, e.target.value)} />
                  <span>%</span>
                </div>
              )}
            </div>
            {f.active && (
              <div className="factor-config">
                <span className="factor-tip">{f.tip}</span>
                {f.factor_type === 'activity' && (
                  <div className="factor-config-row">
                    <label>Meta diaria de pasos</label>
                    <input type="number" value={f.config.target_steps || 8000} onChange={e => setConfigVal(f.factor_type, 'target_steps', parseInt(e.target.value))} />
                  </div>
                )}
                {f.factor_type === 'hydration' && (
                  <div className="factor-config-row">
                    <label>Meta vasos por día</label>
                    <input type="number" value={f.config.target_glasses || 8} onChange={e => setConfigVal(f.factor_type, 'target_glasses', parseInt(e.target.value))} />
                  </div>
                )}
                {f.factor_type === 'nutrition' && (
                  <div className="factor-config-row">
                    <label>Calorías objetivo por día</label>
                    <input type="number" value={f.config.calories_target || 2000} onChange={e => setConfigVal(f.factor_type, 'calories_target', parseInt(e.target.value))} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <button className="btn-primary" onClick={save} disabled={!totalOk && activeFactors.length > 0}>Guardar factores</button>
    </div>
  )
}

// ─── TAB: Penalizaciones ─────────────────────────────────
function PenaltiesTab({ api, eventId, participants, currentWeek }) {
  const [penalties, setPenalties] = useState([])
  const [apps,      setApps]      = useState([])
  const [form,      setForm]      = useState({ name: '', description: '', penalty_type: 'points', amount: 5, factor_type: '', trigger_type: 'manual' })
  const [applyForm, setApplyForm] = useState({ penalty_id: '', user_id: '', week: currentWeek, reason: '' })
  const [msg,       setMsg]       = useState(null)
  const [editing,   setEditing]   = useState(null)

  const load = async () => {
    if (!eventId) return
    const [p, a] = await Promise.all([
      api(`/api/events/${eventId}/penalties`),
      api(`/api/events/${eventId}/penalties/applications`),
    ])
    if (Array.isArray(p)) setPenalties(p)
    if (Array.isArray(a)) setApps(a)
  }
  useEffect(() => { load() }, [eventId])

  const save = async () => {
    const ep = editing
      ? await api(`/api/events/${eventId}/penalties/${editing}`, { method: 'PUT', body: JSON.stringify(form) })
      : await api(`/api/events/${eventId}/penalties`, { method: 'POST', body: JSON.stringify(form) })
    if (ep.id) { setMsg({ ok: true, text: editing ? 'Actualizada ✓' : 'Creada ✓' }); setEditing(null); setForm({ name: '', description: '', penalty_type: 'points', amount: 5, factor_type: '', trigger_type: 'manual' }); load() }
    else setMsg({ ok: false, text: ep.error })
  }

  const del = async (id) => { await api(`/api/events/${eventId}/penalties/${id}`, { method: 'DELETE' }); load() }

  const apply = async () => {
    if (!applyForm.penalty_id || !applyForm.user_id) return
    const r = await api(`/api/events/${eventId}/penalties/${applyForm.penalty_id}/apply`, { method: 'POST', body: JSON.stringify(applyForm) })
    setMsg(r.ok ? { ok: true, text: 'Penalización aplicada ✓' } : { ok: false, text: r.error })
    if (r.ok) load()
  }

  const delApp = async (id) => { await api(`/api/events/${eventId}/penalties/applications/${id}`, { method: 'DELETE' }); load() }

  return (
    <div className="tab-content">
      <h4 className="section-title">Catálogo de penalizaciones</h4>
      <div className="form-row-2">
        <div className="form-row"><label>Nombre</label><input type="text" value={form.name} placeholder="Ej. Falta de registro" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
        <div className="form-row">
          <label>Tipo</label>
          <select value={form.penalty_type} onChange={e => setForm(f => ({ ...f, penalty_type: e.target.value }))}>
            <option value="points">Puntos</option>
            <option value="money">Dinero</option>
          </select>
        </div>
      </div>
      <div className="form-row-2">
        <div className="form-row">
          <label>{form.penalty_type === 'money' ? 'Monto ($)' : 'Puntos a descontar'}</label>
          <input type="number" min="0" step={form.penalty_type === 'money' ? '10' : '1'} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>Factor relacionado (opcional)</label>
          <select value={form.factor_type} onChange={e => setForm(f => ({ ...f, factor_type: e.target.value }))}>
            <option value="">— General —</option>
            {FACTOR_CATALOG.map(fc => <option key={fc.type} value={fc.type}>{fc.icon} {fc.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row"><label>Descripción</label><input type="text" value={form.description} placeholder="Descripción opcional" onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={save}>{editing ? 'Actualizar' : '+ Crear penalización'}</button>
        {editing && <button className="btn-ghost" onClick={() => { setEditing(null); setForm({ name: '', description: '', penalty_type: 'points', amount: 5, factor_type: '', trigger_type: 'manual' }) }}>Cancelar</button>}
      </div>

      {penalties.length > 0 && (
        <div className="penalties-list">
          {penalties.map(p => (
            <div key={p.id} className="penalty-item">
              <div className="penalty-item-top">
                <span className="penalty-name">{p.name}</span>
                <span className={`penalty-type-badge ${p.penalty_type}`}>{p.penalty_type === 'money' ? `💰 $${p.amount}` : `−${p.amount} pts`}</span>
                <button className="btn-icon" onClick={() => { setEditing(p.id); setForm(p) }}>✏️</button>
                <button className="btn-icon danger" onClick={() => del(p.id)}>🗑</button>
              </div>
              {p.description && <div className="penalty-desc">{p.description}</div>}
            </div>
          ))}
        </div>
      )}

      {penalties.length > 0 && (
        <>
          <h4 className="section-title" style={{ marginTop: 20 }}>Aplicar penalización a participante</h4>
          <div className="form-row-2">
            <div className="form-row">
              <label>Penalización</label>
              <select value={applyForm.penalty_id} onChange={e => setApplyForm(f => ({ ...f, penalty_id: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {penalties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Participante</label>
              <select value={applyForm.user_id} onChange={e => setApplyForm(f => ({ ...f, user_id: e.target.value }))}>
                <option value="">Seleccionar...</option>
                {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-row"><label>Semana</label><input type="number" min="0" value={applyForm.week} onChange={e => setApplyForm(f => ({ ...f, week: e.target.value }))} /></div>
            <div className="form-row"><label>Razón</label><input type="text" value={applyForm.reason} placeholder="Opcional" onChange={e => setApplyForm(f => ({ ...f, reason: e.target.value }))} /></div>
          </div>
          <button className="btn-danger" onClick={apply}>Aplicar penalización</button>
        </>
      )}

      {apps.length > 0 && (
        <div className="penalties-list" style={{ marginTop: 16 }}>
          <div className="section-title">Penalizaciones aplicadas</div>
          {apps.map(a => (
            <div key={a.id} className="penalty-item">
              <div className="penalty-item-top">
                <span>{a.user_name}</span>
                <span style={{ opacity: 0.6 }}>Sem {a.week}</span>
                <span className="penalty-name">{a.penalty_name}</span>
                <span className={`penalty-type-badge ${a.penalty_type}`}>{a.penalty_type === 'money' ? `💰 $${a.amount}` : `−${a.amount} pts`}</span>
                <button className="btn-icon danger" onClick={() => delApp(a.id)}>✕</button>
              </div>
              {a.reason && <div className="penalty-desc">{a.reason}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TAB: Usuarios ───────────────────────────────────────
const ROLES = { admin: 'Administrador', participant: 'Participante', visitor: 'Visitante' }

function UsersTab({ api }) {
  const [users,    setUsers]    = useState([])
  const [form,     setForm]     = useState({ username: '', display_name: '', password: '', role: 'participant', photo_url: '' })
  const [editing,  setEditing]  = useState(null)
  const [msg,      setMsg]      = useState(null)
  const [photoFile,setPhotoFile]= useState(null)
  const fileRef = useRef()

  const load = () => api('/api/users').then(d => { if (Array.isArray(d)) setUsers(d) })
  useEffect(() => { load() }, [])

  const uploadPhoto = async () => {
    if (!photoFile) return null
    const fd = new FormData(); fd.append('photo', photoFile)
    const token = localStorage.getItem('cc_token')
    const r = await fetch('/api/upload/photo', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd }).then(r => r.json())
    return r.url || null
  }

  const save = async () => {
    const photoUrl = await uploadPhoto()
    const payload = { ...form, ...(photoUrl ? { photo_url: photoUrl } : {}) }
    const r = editing
      ? await api(`/api/users/${editing}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await api('/api/users', { method: 'POST', body: JSON.stringify(payload) })
    if (r.id) {
      setMsg({ ok: true, text: editing ? 'Usuario actualizado ✓' : 'Usuario creado ✓' })
      setEditing(null); setForm({ username: '', display_name: '', password: '', role: 'participant', photo_url: '' }); setPhotoFile(null); load()
    } else setMsg({ ok: false, text: r.error })
  }

  const toggle = async (u) => {
    await api(`/api/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ active: !u.active }) })
    load()
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    await api(`/api/users/${id}`, { method: 'DELETE' })
    load()
  }

  const startEdit = (u) => {
    setEditing(u.id); setForm({ username: u.username, display_name: u.display_name, password: '', role: u.role, photo_url: u.photo_url || '' })
  }

  return (
    <div className="tab-content">
      <h4 className="section-title">{editing ? 'Editar usuario' : 'Nuevo usuario'}</h4>
      <div className="form-row-2">
        <div className="form-row"><label>Usuario</label><input type="text" value={form.username} disabled={!!editing} placeholder="nombre_usuario" onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
        <div className="form-row"><label>Nombre completo</label><input type="text" value={form.display_name} placeholder="Nombre que verá la app" onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} /></div>
      </div>
      <div className="form-row-2">
        <div className="form-row"><label>Contraseña {editing && '(vacío = no cambia)'}</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
        <div className="form-row">
          <label>Rol</label>
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="participant">Participante</option>
            <option value="admin">Administrador</option>
            <option value="visitor">Visitante</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <label>Foto (opcional)</label>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setPhotoFile(e.target.files[0])} />
        <button className="btn-secondary" onClick={() => fileRef.current.click()}>{photoFile ? `📎 ${photoFile.name}` : '📂 Subir foto...'}</button>
      </div>
      {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={save}>{editing ? 'Actualizar' : '+ Crear usuario'}</button>
        {editing && <button className="btn-ghost" onClick={() => { setEditing(null); setForm({ username: '', display_name: '', password: '', role: 'participant', photo_url: '' }) }}>Cancelar</button>}
      </div>

      <h4 className="section-title" style={{ marginTop: 24 }}>Usuarios registrados ({users.length})</h4>
      <div className="users-list">
        {users.map(u => (
          <div key={u.id} className={`user-row ${!u.active ? 'inactive' : ''}`}>
            <div className="user-avatar-sm">{(u.photo_url ? <img src={u.photo_url} alt="" /> : u.display_name.charAt(0))}</div>
            <div className="user-info-col">
              <span className="user-display">{u.display_name}</span>
              <span className="user-meta">@{u.username} · <span className={`role-badge ${u.role}`}>{ROLES[u.role]}</span></span>
            </div>
            <div className="user-actions">
              <button className="btn-icon" onClick={() => startEdit(u)} title="Editar">✏️</button>
              <button className={`btn-icon ${u.active ? '' : 'danger'}`} onClick={() => toggle(u)} title={u.active ? 'Desactivar' : 'Activar'}>
                {u.active ? '🔒' : '🔓'}
              </button>
              <button className="btn-icon danger" onClick={() => del(u.id)} title="Eliminar">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TAB: Eventos ─────────────────────────────────────────
function EventsTab({ api, onRefresh }) {
  const [events,  setEvents]  = useState([])
  const [form,    setForm]    = useState({ name: '', description: '', start_date: '', end_date: '', goal_pct: 10, total_weeks: 9, status: 'draft' })
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg]     = useState(null)

  const load = () => api('/api/events').then(d => { if (Array.isArray(d)) setEvents(d) })
  useEffect(() => { load() }, [])

  const save = async () => {
    const r = editing
      ? await api(`/api/events/${editing}`, { method: 'PUT', body: JSON.stringify(form) })
      : await api('/api/events', { method: 'POST', body: JSON.stringify(form) })
    if (r.id) {
      setMsg({ ok: true, text: editing ? 'Evento actualizado ✓' : 'Evento creado ✓' })
      setEditing(null); setForm({ name: '', description: '', start_date: '', end_date: '', goal_pct: 10, total_weeks: 9, status: 'draft' }); load(); onRefresh()
    } else setMsg({ ok: false, text: r.error })
  }

  const setStatus = async (id, status) => {
    await api(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
    load(); onRefresh()
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar este evento y todos sus datos?')) return
    await api(`/api/events/${id}`, { method: 'DELETE' }); load()
  }

  const startEdit = (ev) => {
    setEditing(ev.id)
    setForm({ name: ev.name, description: ev.description || '', start_date: ev.start_date || '', end_date: ev.end_date || '', goal_pct: ev.goal_pct, total_weeks: ev.total_weeks, status: ev.status })
  }

  const STATUS_OPTIONS = ['draft', 'active', 'completed', 'archived']
  const STATUS_COLOR = { draft: '#888', active: '#5BB85B', completed: '#4A8FD4', archived: '#666' }

  return (
    <div className="tab-content">
      <h4 className="section-title">{editing ? 'Editar evento' : 'Nuevo evento'}</h4>
      <div className="form-row"><label>Nombre</label><input type="text" value={form.name} placeholder="Nombre del evento" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
      <div className="form-row"><label>Descripción</label><input type="text" value={form.description} placeholder="Descripción breve" onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
      <div className="form-row-2">
        <div className="form-row"><label>Inicio</label><input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
        <div className="form-row"><label>Fin</label><input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
      </div>
      <div className="form-row-2">
        <div className="form-row"><label>Objetivo pérdida (%)</label><input type="number" min="1" max="50" value={form.goal_pct} onChange={e => setForm(f => ({ ...f, goal_pct: e.target.value }))} /></div>
        <div className="form-row"><label>Semanas</label><input type="number" min="1" max="52" value={form.total_weeks} onChange={e => setForm(f => ({ ...f, total_weeks: e.target.value }))} /></div>
      </div>
      {editing && (
        <div className="form-row">
          <label>Estatus</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={save}>{editing ? 'Actualizar' : '+ Crear evento'}</button>
        {editing && <button className="btn-ghost" onClick={() => { setEditing(null); setForm({ name: '', description: '', start_date: '', end_date: '', goal_pct: 10, total_weeks: 9, status: 'draft' }) }}>Cancelar</button>}
      </div>

      <h4 className="section-title" style={{ marginTop: 24 }}>Eventos ({events.length})</h4>
      {events.map(ev => (
        <div key={ev.id} className="event-admin-row">
          <div className="event-admin-row-top">
            <span className="event-admin-status" style={{ color: STATUS_COLOR[ev.status] }}>●</span>
            <span className="event-admin-name">{ev.name}</span>
            <span className="event-admin-meta">👥 {ev.participant_count}</span>
            <button className="btn-icon" onClick={() => startEdit(ev)}>✏️</button>
            <button className="btn-icon danger" onClick={() => del(ev.id)}>🗑</button>
          </div>
          <div className="event-status-buttons">
            {STATUS_OPTIONS.filter(s => s !== ev.status).map(s => (
              <button key={s} className="btn-status" onClick={() => setStatus(ev.id, s)}>→ {s}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── TAB: Inscripciones ───────────────────────────────────
function FeesTab({ api, eventId, participants }) {
  const [pool,      setPool]      = useState(null)
  const [eventData, setEventData] = useState(null)
  const [feeForm,   setFeeForm]   = useState({ entry_fee: '', entry_fee_currency: 'MXN', prize_config: { type: 'winner_takes_all' } })
  const [msg,       setMsg]       = useState(null)

  const load = async () => {
    if (!eventId) return
    const [p, ev] = await Promise.all([api(`/api/events/${eventId}/prize-pool`), api(`/api/events/${eventId}`)])
    setPool(p); setEventData(ev)
    if (ev.entry_fee !== undefined) setFeeForm(f => ({ ...f, entry_fee: ev.entry_fee || '', entry_fee_currency: ev.entry_fee_currency || 'MXN', prize_config: ev.prize_config || { type: 'winner_takes_all' } }))
  }
  useEffect(() => { load() }, [eventId])

  const saveFee = async () => {
    const r = await api(`/api/events/${eventId}`, { method: 'PUT', body: JSON.stringify({ entry_fee: feeForm.entry_fee || null, entry_fee_currency: feeForm.entry_fee_currency, prize_config: feeForm.prize_config }) })
    setMsg(r.id ? { ok: true, text: 'Inscripción guardada ✓' } : { ok: false, text: r.error })
    if (r.id) load()
  }

  const markPaid = async (uid, paid, amount) => {
    await api(`/api/events/${eventId}/participants/${uid}/fee`, { method: 'PUT', body: JSON.stringify({ fee_paid: paid, fee_amount_paid: amount }) })
    load()
  }

  const PRIZE_TYPES = [
    { id: 'winner_takes_all', label: '🏆 Todo al ganador' },
    { id: 'top3',             label: '🥇🥈🥉 Top 3 (50/30/20%)' },
    { id: 'custom',           label: '⚙️ Distribución personalizada' },
  ]

  return (
    <div className="tab-content">
      <h4 className="section-title">Configuración de inscripción</h4>
      <div className="form-row-2">
        <div className="form-row">
          <label>Cuota de inscripción (dejar vacío = sin cuota)</label>
          <input type="number" min="0" step="10" value={feeForm.entry_fee} placeholder="0.00" onChange={e => setFeeForm(f => ({ ...f, entry_fee: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>Moneda</label>
          <select value={feeForm.entry_fee_currency} onChange={e => setFeeForm(f => ({ ...f, entry_fee_currency: e.target.value }))}>
            <option>MXN</option><option>USD</option><option>EUR</option>
          </select>
        </div>
      </div>
      <div className="form-row"><label>Distribución del premio</label></div>
      <div className="radio-group">
        {PRIZE_TYPES.map(pt => (
          <button key={pt.id} className={`radio-btn ${feeForm.prize_config?.type === pt.id ? 'active' : ''}`}
            onClick={() => setFeeForm(f => ({ ...f, prize_config: { ...f.prize_config, type: pt.id } }))}>
            {pt.label}
          </button>
        ))}
      </div>
      {msg && <div className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</div>}
      <button className="btn-primary" onClick={saveFee}>Guardar configuración</button>

      {pool && (
        <div className="prize-pool-box">
          <div className="prize-pool-title">💰 Pot de premios</div>
          <div className="prize-pool-grid">
            <div className="prize-pool-item"><span>Inscripciones cobradas</span><strong>{pool.currency} {(pool.fee_income || 0).toFixed(2)}</strong></div>
            <div className="prize-pool-item"><span>Penalizaciones dinero</span><strong>{pool.currency} {(pool.money_penalties || 0).toFixed(2)}</strong></div>
            <div className="prize-pool-item total"><span>Total del pot</span><strong>{pool.currency} {(pool.total_pool || 0).toFixed(2)}</strong></div>
            <div className="prize-pool-item"><span>Participantes pagados</span><strong>{pool.paid_count} / {participants.length}</strong></div>
          </div>
        </div>
      )}

      {eventData && participants.length > 0 && (
        <>
          <h4 className="section-title" style={{ marginTop: 20 }}>Estado de pagos por participante</h4>
          {(eventData.participants || participants).map(p => {
            const ep = eventData.participants?.find(x => x.user_id == p.id || x.id == p.id)
            const paid = ep?.fee_paid || false
            const amount = ep?.fee_amount_paid || 0
            return (
              <div key={p.id} className={`fee-row ${paid ? 'paid' : ''}`}>
                <span className="fee-participant">{p.name || p.display_name}</span>
                <span className="fee-status">{paid ? `✓ Pagó ${feeForm.entry_fee_currency} ${amount}` : '○ Pendiente'}</span>
                <button className={`btn-small ${paid ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => markPaid(ep?.user_id || p.id, !paid, paid ? 0 : (feeForm.entry_fee || 0))}>
                  {paid ? 'Marcar pendiente' : 'Marcar pagado'}
                </button>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
