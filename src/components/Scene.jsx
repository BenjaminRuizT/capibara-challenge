import { useState, useEffect, useRef } from 'react'

/* ─── Time of Day ────────────────────────────────────────── */
function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 6  && h < 12) return 'morning'
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

export const BG_STYLES = {
  prairie: { backgroundImage: 'url(/capibara-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center top' },
  forest:  { background: 'linear-gradient(180deg, #0a2200 0%, #1a4a0a 25%, #2d7a1a 48%, #4aaa2a 62%, #5cb832 72%, #3d8c20 85%, #2a6015 100%)' },
  ocean:   { background: 'linear-gradient(180deg, #050e1a 0%, #0a1f3d 22%, #0d3060 42%, #1050a0 58%, #0d7050 72%, #0a4535 87%, #071a15 100%)' },
  sunset:  { background: 'linear-gradient(180deg, #0d0520 0%, #3d0850 15%, #8a1540 30%, #c5400a 46%, #e86a0a 60%, #f09025 72%, #c8a848 84%, #9a8a60 100%)' },
  desert:  { background: 'linear-gradient(180deg, #5bb8e0 0%, #87c8e8 35%, #d4c070 54%, #b89040 68%, #9a7030 82%, #7a5020 100%)' },
}

const ACTIVITY_CYCLES = {
  benjamin: ['🚴 Bicicleta', '🤸 Yoga',        '🏃 Carrera'],
  david:    ['🏋️ Pesas',    '🥊 Box',          '🧗 Escalada'],
  daniel:   ['🤼 Anillas',  '🏋️ Sentadillas', '🏊 Natación'],
}

const PHOTOS = { benjamin: '/benja.png', david: '/david.png', daniel: '/dany.png' }

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

/* ─── Avatar ─────────────────────────────────────────────── */
export function Avatar({ id, avatar, color, size = 32, border = false }) {
  const photo = PHOTOS[id]
  return (
    <div className="avatar-circle" style={{
      width: size, height: size, borderRadius: '50%',
      background: color, flexShrink: 0, overflow: 'hidden',
      boxShadow: border
        ? `0 0 0 5px rgba(255,255,255,0.85), 0 6px 20px rgba(0,0,0,0.7)`
        : `0 2px 6px rgba(0,0,0,0.5)`,
      border: border ? `3px solid rgba(255,255,255,0.95)` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55,
    }}>
      {photo
        ? <img src={photo} alt={id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : (avatar ?? id[0].toUpperCase())
      }
    </div>
  )
}

/* ─── Scene elements ─────────────────────────────────────── */
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
    </>
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

/* ─── Responsive SVG Line Chart ─────────────────────────── */
export function WeightLineChart({ entries, initialWeight, goalWeight, color }) {
  const VW = 340, VH = 115
  const PAD = { t: 28, b: 18, l: 6, r: 6 }
  const cW  = VW - PAD.l - PAD.r
  const cH  = VH - PAD.t - PAD.b

  const sorted = [...(entries || [])].sort((a, b) => a.week - b.week)
  if (sorted.length < 2) return null

  const allW  = sorted.map(e => e.weight)
  const maxW  = Math.max(...allW, initialWeight) + 1
  const minW  = Math.max(Math.min(...allW, goalWeight) - 1, 0)
  const range = maxW - minW || 1

  const xOf = (week) => PAD.l + (week / 9) * cW
  const yOf = (w)    => PAD.t + cH - ((w - minW) / range) * cH

  const pts      = sorted.map(e => ({ ...e, x: xOf(e.week), y: yOf(e.weight) }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = pts.length > 1
    ? `M${pts[0].x.toFixed(1)},${(PAD.t + cH).toFixed(1)} ` +
      pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L${pts[pts.length - 1].x.toFixed(1)},${(PAD.t + cH).toFixed(1)} Z`
    : ''
  const goalY = yOf(goalWeight)

  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible' }}>

      {/* Goal line */}
      <line x1={PAD.l} y1={goalY} x2={VW - PAD.r} y2={goalY}
        stroke="#5EFF99" strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
      <text x={VW - PAD.r + 2} y={goalY + 3} fontSize="9" fill="#5EFF99" opacity="0.7">meta</text>

      {/* Empty week ticks */}
      {Array.from({ length: 10 }, (_, w) => {
        if (sorted.some(e => e.week === w)) return null
        const x = xOf(w)
        return (
          <g key={w}>
            <line x1={x} y1={PAD.t + cH - 3} x2={x} y2={PAD.t + cH}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <text x={x} y={VH - 2} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)">{w}</text>
          </g>
        )
      })}

      {/* Area fill */}
      {areaPath && <path d={areaPath} fill={color} opacity="0.12" />}

      {/* Line */}
      {pts.length > 1 && (
        <path d={linePath} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Points */}
      {pts.map((p, i) => {
        const prev    = pts[i - 1]
        const isGain  = prev && p.weight > prev.weight
        const dotClr  = i === 0 ? 'rgba(255,255,255,0.6)' : (isGain ? '#FF5B5B' : '#5EFF99')
        const delta   = prev ? (prev.weight - p.weight).toFixed(1) : null
        return (
          <g key={p.week}>
            <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize="11"
              fill="white" fontWeight="700" style={{ textShadow: '0 1px 3px black' }}>
              {p.weight}
            </text>
            {delta !== null && (
              <text x={p.x} y={p.y - 21} textAnchor="middle" fontSize="9"
                fill={isGain ? '#FF5B5B' : '#5EFF99'}>
                {isGain ? `+${Math.abs(delta)}` : `-${Math.abs(delta)}`}
              </text>
            )}
            <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5}
              fill={dotClr} stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" />
            <text x={p.x} y={VH - 2} textAnchor="middle" fontSize="9"
              fill={i === pts.length - 1 ? '#FFE566' : 'rgba(255,255,255,0.55)'}>
              S{p.week}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Participant Card ───────────────────────────────────── */
function ParticipantCard({ p, rank, medals, goalPercent }) {
  const latest   = p.entries?.length ? p.entries[p.entries.length - 1].weight : p.initialWeight
  const lost     = parseFloat((p.initialWeight - latest).toFixed(1))
  const pct      = parseFloat(((lost / p.initialWeight) * 100).toFixed(1))
  const progress = Math.min((pct / goalPercent) * 100, 100)
  const kgLeft   = Math.max(0, p.initialWeight * (goalPercent / 100) - lost).toFixed(1)

  return (
    <div className={`participant-card rank-${rank + 1}`}>
      <div className="card-avatar-float">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {rank === 0 && <span className="leader-crown">👑</span>}
          <Avatar id={p.id} avatar={p.avatar} color={p.color} size={164} border />
        </div>
        <div className="card-name-badge">
          <span className="card-rank">{medals[rank]}</span>
          <span className="card-name">{p.name}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, justifyContent: 'center' }}>
          <span className="card-current-weight">{latest}</span>
          <span className="card-weight-unit">kg</span>
        </div>
        <div className="card-lost">
          {lost > 0 ? `▼ ${lost} kg perdidos (${pct}%)` : '🏁 Peso inicial'}
        </div>
      </div>

      <div className="card-progress-label">
        <span>Meta {goalPercent}%</span>
        <span>{pct}% {pct >= goalPercent ? '✅' : `· faltan ${kgLeft} kg`}</span>
      </div>
      <div className="card-progress-bar">
        <div className="card-progress-fill"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${p.color}, #5EFF99)` }} />
      </div>

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
}

/* ─── Main Scene ──────────────────────────────────────────── */
export default function Scene({ participants, challenge, currentWeek, settings = {}, onAdminToggle }) {
  const anim     = settings.animations || { clouds: true, birds: true, leaves: true, water: true }
  const goalPct  = challenge?.goalPercent || 10
  const totWeeks = challenge?.totalWeeks  || 9

  const [timeOfDay, setTimeOfDay] = useState(() => {
    const mode = settings.timeMode
    return (mode && mode !== 'auto') ? mode : getTimeOfDay()
  })
  const [activityIdx, setActivityIdx] = useState(0)
  const [activeCard,  setActiveCard]  = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    const mode = settings.timeMode
    if (mode && mode !== 'auto') { setTimeOfDay(mode); return }
    setTimeOfDay(getTimeOfDay())
    const t = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000)
    return () => clearInterval(t)
  }, [settings.timeMode])

  useEffect(() => {
    const iv = setInterval(() => setActivityIdx(i => i + 1), 20_000)
    return () => clearInterval(iv)
  }, [])

  const overlay = TIME_OVERLAYS[timeOfDay]
  const isNight = timeOfDay === 'night'
  const bgStyle = BG_STYLES[settings.background] || BG_STYLES.prairie

  const getLost = (p) => {
    const latest = p.entries?.length ? p.entries[p.entries.length - 1].weight : p.initialWeight
    return (p.initialWeight - latest).toFixed(1)
  }
  const getPct = (p) => {
    return (((p.initialWeight - (p.entries?.length ? p.entries[p.entries.length - 1].weight : p.initialWeight)) / p.initialWeight) * 100).toFixed(1)
  }

  const ranked = [...participants].sort((a, b) => parseFloat(getPct(b)) - parseFloat(getPct(a)))
  const medals = ['🥇', '🥈', '🥉']

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const firstCard = el.querySelector('.participant-card')
    if (!firstCard) return
    const cardW = firstCard.offsetWidth + 12
    const idx   = Math.round(el.scrollLeft / cardW)
    setActiveCard(Math.max(0, Math.min(idx, ranked.length - 1)))
  }

  return (
    <div className={`scene ${timeOfDay}`}>

      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        ...bgStyle,
        filter: overlay.filter,
        transition: 'filter 4s ease',
        zIndex: 0,
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

      {anim.water && <WaterShimmer />}

      {anim.clouds && !isNight && (
        <div className="clouds" style={{ zIndex: 5 }}>
          {CLOUDS.map(c => <Cloud key={c.id} {...c} />)}
        </div>
      )}

      {anim.birds && !isNight && (
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

      {anim.leaves && (
        <div className="leaves-layer" style={{ zIndex: 7 }}>
          {LEAVES.map(l => <Leaf key={l.id} {...l} />)}
        </div>
      )}

      {/* Title sign */}
      <div className="title-sign" style={{ zIndex: 18 }}>
        <svg className="title-svg" viewBox="0 0 320 80" preserveAspectRatio="xMidYMid meet">
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
            CAPIBARA&apos;S
          </text>
          <text x="160" y="60" textAnchor="middle" fontFamily="Fredoka One, cursive"
            fontSize="26" fill="#FFE566"
            style={{ filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.9))' }}>
            CHALLENGE
          </text>
        </svg>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          Semana {currentWeek} / {totWeeks}
        </div>
      </div>

      {/* Ranking cards */}
      <div className="cards-row">
        <div className="cards-inner" ref={scrollRef} onScroll={handleScroll}>
          {ranked.map((p, i) => (
            <ParticipantCard
              key={p.id}
              p={p}
              rank={i}
              medals={medals}
              goalPercent={goalPct}
            />
          ))}
        </div>
        <div className="carousel-dots">
          {ranked.map((_, i) => (
            <div key={i} className={`carousel-dot ${i === activeCard ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      <div className="week-counter">📅 Sem {currentWeek} · {totWeeks - currentWeek} restantes</div>
      <button className="admin-btn" onClick={onAdminToggle} title="Administrar">⚙</button>
      <div className="version-badge">v{__APP_VERSION__}</div>
    </div>
  )
}
