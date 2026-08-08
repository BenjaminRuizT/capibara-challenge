import { useState, useEffect } from 'react'

/* ─── Time of Day ─────────────────────────────────────────── */
function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 21) return 'evening'
  return 'night'
}

const TIME_OVERLAYS = {
  morning:   { bg: 'rgba(255, 210, 120, 0.18)', filter: 'brightness(1.05) saturate(1.1)' },
  afternoon: { bg: 'transparent',                filter: 'none' },
  evening:   { bg: 'rgba(200, 80, 20, 0.38)',   filter: 'brightness(0.85) saturate(1.2)' },
  night:     { bg: 'rgba(5, 10, 55, 0.72)',      filter: 'brightness(0.45) saturate(0.5)' },
}

const ACTIVITY_CYCLES = {
  benjamin: ['🚴 Bicicleta', '🤸 Yoga',         '🏃 Carrera'],
  david:    ['🏋️ Pesas',    '🥊 Box',           '🧗 Escalada'],
  daniel:   ['🤼 Anillas',  '🏋️ Sentadillas',  '🏊 Natación'],
}

const CAPYBARA_POSITIONS = [
  { id: 'benjamin', name: 'Benjamin', color: '#4A8FD4', left: '13%', top: '55%' },
  { id: 'david',    name: 'David',    color: '#D4724A', left: '47%', top: '33%' },
  { id: 'daniel',   name: 'Daniel',   color: '#5BB85B', left: '77%', top: '32%' },
]

const PHOTOS = {
  benjamin: '/benja.png',
  david:    '/david.png',
  daniel:   '/dany.png',
}

const CLOUDS = [
  { id: 1, top: '6%',  width: 110, dur: 30, delay: 0,   op: 0.82 },
  { id: 2, top: '12%', width: 80,  dur: 42, delay: -14, op: 0.70 },
  { id: 3, top: '4%',  width: 140, dur: 55, delay: -28, op: 0.75 },
  { id: 4, top: '18%', width: 95,  dur: 38, delay: -8,  op: 0.65 },
  { id: 5, top: '9%',  width: 65,  dur: 34, delay: -22, op: 0.80 },
]

const LEAVES = [
  { id: 1, left: '8%',  size: 18, dur: 9,  delay: 0,  color: '#5B8C32' },
  { id: 2, left: '22%', size: 14, dur: 12, delay: -3, color: '#3E7A1A' },
  { id: 3, left: '40%', size: 16, dur: 10, delay: -6, color: '#6AAE2C' },
  { id: 4, left: '60%', size: 13, dur: 14, delay: -2, color: '#4E8A20' },
  { id: 5, left: '78%', size: 15, dur: 11, delay: -8, color: '#5B8C32' },
  { id: 6, left: '92%', size: 12, dur: 8,  delay: -5, color: '#7AB82E' },
]

const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  top:  `${3 + Math.random() * 45}%`,
  size: Math.random() * 2.5 + 0.8,
  dur:  1.5 + Math.random() * 2,
  del:  Math.random() * 3,
}))

/* ─── Avatar with photo ──────────────────────────────────── */
function Avatar({ id, avatar, color, size = 32, border = false }) {
  const photo = PHOTOS[id]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, flexShrink: 0, overflow: 'hidden',
      boxShadow: `0 2px 6px rgba(0,0,0,0.5)`,
      border: border ? `2px solid rgba(255,255,255,0.4)` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55,
    }}>
      {photo
        ? <img src={photo} alt={id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : avatar ?? id[0].toUpperCase()
      }
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────── */
function Cloud({ top, width, dur, delay, op }) {
  return (
    <svg className="cloud" width={width} height={width * 0.55} viewBox="0 0 120 66"
      style={{ top, animationDuration: `${dur}s`, animationDelay: `${delay}s`, opacity: op }}>
      <ellipse cx="60" cy="50" rx="55" ry="22" fill="white" />
      <ellipse cx="40" cy="40" rx="30" ry="22" fill="white" />
      <ellipse cx="80" cy="38" rx="28" ry="20" fill="white" />
      <ellipse cx="60" cy="28" rx="22" ry="18" fill="white" />
    </svg>
  )
}

function Bird({ top, delay, dur, scale = 1 }) {
  return (
    <svg className="bird" width="24" height="12" viewBox="0 0 24 12"
      style={{ top, animationDuration: `${dur}s`, animationDelay: `${delay}s`, transform: `scale(${scale})` }}>
      <path d="M2 7 Q6 1 12 5 Q18 1 22 7" stroke="rgba(30,30,30,0.7)"
        strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Leaf({ left, size, dur, delay, color }) {
  return (
    <svg className="leaf" width={size} height={size * 1.4} viewBox="0 0 14 20"
      style={{ left, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <path d="M7 1 C12 5 14 12 7 19 C0 12 2 5 7 1Z" fill={color} opacity="0.9" />
      <line x1="7" y1="1" x2="7" y2="19" stroke="rgba(0,50,0,0.3)" strokeWidth="0.8" />
    </svg>
  )
}

function WaterShimmer() {
  return (
    <>
      <div style={{
        position: 'absolute', left: '2%', top: '62%', width: '22%', height: '8%',
        background: 'linear-gradient(90deg, transparent, rgba(100,200,255,0.18), transparent)',
        borderRadius: '50%', animation: 'waterShimmer 2s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 4,
      }} />
      <div style={{
        position: 'absolute', left: '4%', top: '65%', width: '18%', height: '5%',
        background: 'linear-gradient(90deg, transparent, rgba(150,220,255,0.22), transparent)',
        borderRadius: '50%', animation: 'waterShimmer 2.5s ease-in-out infinite',
        animationDelay: '-1s', pointerEvents: 'none', zIndex: 4,
      }} />
      <div style={{
        position: 'absolute', right: '5%', top: '42%', width: '5%', height: '18%',
        background: 'linear-gradient(180deg, rgba(180,230,255,0.3), transparent)',
        animation: 'waterfallShimmer 0.8s linear infinite',
        pointerEvents: 'none', zIndex: 4,
      }} />
    </>
  )
}

function CapybaraBadge({ participant, currentWeight, initialWeight, activityText, show }) {
  const lost = (initialWeight - currentWeight).toFixed(1)
  const pct  = (((initialWeight - currentWeight) / initialWeight) * 100).toFixed(1)
  return (
    <div className={`capybara-badge ${show ? 'badge-visible' : 'badge-hidden'}`}
      style={{ '--accent': participant.color }}>
      <Avatar id={participant.id} avatar={participant.avatar} color={participant.color} size={40} border />
      <div className="badge-name" style={{ color: participant.color }}>{participant.name}</div>
      <div className="badge-activity">{activityText}</div>
      <div className="badge-weight">
        <span className="badge-kg">{currentWeight} kg</span>
        {parseFloat(lost) > 0 && <span className="badge-lost">▼ {lost} kg ({pct}%)</span>}
      </div>
    </div>
  )
}

function Moon() {
  return (
    <div style={{
      position: 'absolute', top: '8%', right: '12%', width: 52, height: 52,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #FFFEF0, #E8E8C0 60%, #C0C090)',
      boxShadow: '0 0 18px 6px rgba(220,220,160,0.45)',
      zIndex: 3, pointerEvents: 'none',
    }} />
  )
}

/* ─── Weekly Weight Chart (SVG line chart) ────────────────── */
function WeightLineChart({ entries, initialWeight, goalWeight, color }) {
  const W = 340, H = 115
  const PAD = { t: 24, b: 18, l: 6, r: 6 }
  const cW = W - PAD.l - PAD.r
  const cH = H - PAD.t - PAD.b

  const sorted = [...(entries || [])].sort((a, b) => a.week - b.week)
  if (sorted.length === 0) return null

  const allWeights = sorted.map(e => e.weight)
  const maxW = Math.max(...allWeights, initialWeight) + 1
  const minW = Math.max(Math.min(...allWeights, goalWeight) - 1, 0)
  const range = maxW - minW || 1

  const xOf = (week) => PAD.l + (week / 9) * cW
  const yOf = (w)    => PAD.t + cH - ((w - minW) / range) * cH

  const pts = sorted.map(e => ({ ...e, x: xOf(e.week), y: yOf(e.weight) }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = pts.length > 1
    ? `M${pts[0].x.toFixed(1)},${(PAD.t + cH).toFixed(1)} ` +
      pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L${pts[pts.length - 1].x.toFixed(1)},${(PAD.t + cH).toFixed(1)} Z`
    : ''

  const goalY = yOf(goalWeight)

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      {/* Goal line */}
      <line x1={PAD.l} y1={goalY} x2={W - PAD.r} y2={goalY}
        stroke="#5EFF99" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
      <text x={W - PAD.r + 2} y={goalY + 3} fontSize="9" fill="#5EFF99" opacity="0.7">meta</text>

      {/* Future weeks tick marks */}
      {Array.from({ length: 10 }, (_, w) => {
        const hasDatum = sorted.some(e => e.week === w)
        if (hasDatum) return null
        const x = xOf(w)
        return (
          <g key={w}>
            <line x1={x} y1={PAD.t + cH - 3} x2={x} y2={PAD.t + cH}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <text x={x} y={H - 2} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)">
              {w}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      {areaPath && (
        <path d={areaPath} fill={color} opacity="0.12" />
      )}

      {/* Line */}
      {pts.length > 1 && (
        <path d={linePath} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Data points */}
      {pts.map((p, i) => {
        const prev   = pts[i - 1]
        const isGain = prev && p.weight > prev.weight
        const dotColor = i === 0 ? 'rgba(255,255,255,0.6)' : (isGain ? '#FF5B5B' : '#5EFF99')
        const delta  = prev ? (prev.weight - p.weight).toFixed(1) : null
        return (
          <g key={p.week}>
            {/* Weight label above dot */}
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="11"
              fill="white" fontWeight="700" style={{ textShadow: '0 1px 3px black' }}>
              {p.weight}
            </text>
            {/* Delta vs previous week */}
            {delta !== null && (
              <text x={p.x} y={p.y - 21} textAnchor="middle" fontSize="9"
                fill={isGain ? '#FF5B5B' : '#5EFF99'}>
                {isGain ? `+${Math.abs(delta)}` : `-${Math.abs(delta)}`}
              </text>
            )}
            {/* Dot */}
            <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5}
              fill={dotColor} stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" />
            {/* Week label below */}
            <text x={p.x} y={H - 2} textAnchor="middle" fontSize="9"
              fill={i === pts.length - 1 ? '#FFE566' : 'rgba(255,255,255,0.55)'}>
              S{p.week}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Main Scene ──────────────────────────────────────────── */
export default function Scene({ participants, currentWeek, onTitleClick, onAdminToggle }) {
  const [timeOfDay, setTimeOfDay]     = useState(getTimeOfDay)
  const [activityIdx, setActivityIdx] = useState(0)
  const [badgeVisible, setBadgeVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeVisible(false)
      setTimeout(() => { setActivityIdx(i => i + 1); setBadgeVisible(true) }, 500)
    }, 20_000)
    return () => clearInterval(interval)
  }, [])

  const overlay  = TIME_OVERLAYS[timeOfDay]
  const isNight  = timeOfDay === 'night'

  const getLatestWeight = (p) => {
    if (!p?.entries?.length) return p?.initialWeight ?? 0
    return p.entries[p.entries.length - 1].weight
  }
  const getActivity = (id) => {
    const cycle = ACTIVITY_CYCLES[id] ?? ['🏋️ Ejercicio']
    return cycle[activityIdx % cycle.length]
  }
  const getLost = (p) => (p.initialWeight - getLatestWeight(p)).toFixed(1)
  const getPct  = (p) => (((p.initialWeight - getLatestWeight(p)) / p.initialWeight) * 100).toFixed(1)

  const ranked = [...participants].sort((a, b) => parseFloat(getPct(b)) - parseFloat(getPct(a)))
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className={`scene ${timeOfDay}`}>

      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/capibara-bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center top',
        filter: overlay.filter, transition: 'filter 4s ease', zIndex: 0,
      }} />

      {/* Day/Night overlay */}
      <div style={{
        position: 'absolute', inset: 0, background: overlay.bg,
        transition: 'background 4s ease', zIndex: 1, pointerEvents: 'none',
        mixBlendMode: isNight ? 'multiply' : 'normal',
      }} />

      {isNight && (
        <>
          <Moon />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
            {STARS.map(s => (
              <div key={s.id} className="star" style={{
                left: s.left, top: s.top, width: s.size, height: s.size,
                animationDuration: `${s.dur}s`, animationDelay: `${s.del}s`,
              }} />
            ))}
          </div>
        </>
      )}

      <WaterShimmer />

      {timeOfDay !== 'night' && (
        <div className="clouds" style={{ zIndex: 5 }}>
          {CLOUDS.map(c => <Cloud key={c.id} {...c} />)}
        </div>
      )}

      {timeOfDay !== 'night' && (
        <div className="birds-layer" style={{ zIndex: 6 }}>
          {[
            { top: '8%',  delay: 0,   dur: 24, scale: 0.85 },
            { top: '14%', delay: -9,  dur: 32, scale: 1.0  },
            { top: '5%',  delay: -18, dur: 40, scale: 0.7  },
            { top: '20%', delay: -5,  dur: 28, scale: 1.1  },
            { top: '11%', delay: -25, dur: 36, scale: 0.9  },
          ].map((b, i) => <Bird key={i} {...b} />)}
        </div>
      )}

      <div className="leaves-layer" style={{ zIndex: 7 }}>
        {LEAVES.map(l => <Leaf key={l.id} {...l} />)}
      </div>


      {/* Title sign */}
      <div className="title-sign" onClick={onTitleClick} style={{ zIndex: 18 }}>
        <svg width="500" height="124" viewBox="0 0 320 80">
          <rect x="8" y="8" width="304" height="64" fill="#5a2e0a" rx="6" />
          <rect x="4" y="4" width="312" height="68" fill="#7B4520" rx="8" />
          {[16, 30, 44, 56].map(y => (
            <line key={y} x1="10" y1={y} x2="310" y2={y + 2}
              stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          ))}
          {[[18,14],[302,14],[18,66],[302,66]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#3a1a05" />
          ))}
          <text x="160" y="30" textAnchor="middle" fontFamily="Fredoka One, cursive"
            fontSize="20" fill="#FFE566"
            style={{ filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.9))' }}>
            CAPIBARA'S
          </text>
          <text x="160" y="60" textAnchor="middle" fontFamily="Fredoka One, cursive"
            fontSize="26" fill="#FFE566"
            style={{ filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.9))' }}>
            CHALLENGE
          </text>
        </svg>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          Semana {currentWeek} / 9
        </div>
      </div>

      {/* ── Ranking panel — siempre visible ───────────── */}
      <div className="cards-row">
        <div className="ranking-header">🏆 Ranking — Semana {currentWeek} / 9</div>
        <div className="cards-inner">
          {ranked.map((p, i) => {
            const latest   = getLatestWeight(p)
            const lost     = parseFloat(getLost(p))
            const pct      = parseFloat(getPct(p))
            const progress = Math.min((pct / 10) * 100, 100)
            return (
              <div key={p.id} className={`participant-card rank-${i + 1}`}>
                {/* Foto + nombre completamente fuera del cuadro, encima */}
                <div className="card-avatar-float">
                  <Avatar id={p.id} avatar={p.avatar} color={p.color} size={164} border />
                  <div className="card-name-badge">
                    <span className="card-rank">{medals[i]}</span>
                    <span className="card-name">{p.name}</span>
                  </div>
                </div>

                {/* Solo datos dentro del cuadro */}
                <div style={{ textAlign: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, justifyContent: 'center' }}>
                    <span className="card-current-weight">{latest}</span>
                    <span className="card-weight-unit">kg</span>
                  </div>
                  <div className="card-lost" style={{ marginTop: 2 }}>
                    {lost > 0 ? `▼ ${lost} kg perdidos (${pct}%)` : '🏁 Peso inicial'}
                  </div>
                </div>

                {/* Progress toward 10% goal */}
                <div className="card-progress-label">
                  <span>Meta 10%</span>
                  <span>{pct}% {pct >= 10 ? '✅' : `· faltan ${(p.initialWeight * 0.1 - lost).toFixed(1)} kg`}</span>
                </div>
                <div className="card-progress-bar">
                  <div className="card-progress-fill"
                    style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${p.color}, #5EFF99)` }} />
                </div>

                {/* Weekly line chart */}
                <div className="card-chart-wrap">
                  <WeightLineChart
                    entries={p.entries}
                    initialWeight={p.initialWeight}
                    goalWeight={p.goalWeight}
                    color={p.color}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="week-counter">📅 Semana {currentWeek} · {9 - currentWeek} sem restantes</div>
      <div className="version-badge">v{__APP_VERSION__}</div>
    </div>
  )
}
