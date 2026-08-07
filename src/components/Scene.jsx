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

/* ─── Activity cycles per participant ─────────────────────── */
const ACTIVITY_CYCLES = {
  benjamin: ['🚴 Bicicleta',       '🤸 Yoga',         '🏃 Carrera'],
  david:    ['🏋️ Pesas',          '🥊 Box',           '🧗 Escalada'],
  daniel:   ['🤼 Anillas / Barra', '🏋️ Sentadillas', '🏊 Natación'],
}

/* ─── Positions over the background image (% of scene) ─────
   Derived from visual inspection of CAPIBARAS.png:
   - Benjamin (bike, left):      ~left 13%, top 56%
   - David (barbell, center):    ~left 47%, top 36%
   - Daniel (yoga/right):        ~left 77%, top 34%
────────────────────────────────────────────────────────────── */
const CAPYBARA_POSITIONS = [
  { id: 'benjamin', name: 'Benjamin', color: '#4A8FD4', left: '13%', top: '55%' },
  { id: 'david',    name: 'David',    color: '#D4724A', left: '47%', top: '33%' },
  { id: 'daniel',   name: 'Daniel',   color: '#5BB85B', left: '77%', top: '32%' },
]

/* ─── Clouds ──────────────────────────────────────────────── */
const CLOUDS = [
  { id: 1, top: '6%',  width: 110, dur: 30, delay: 0,   op: 0.82 },
  { id: 2, top: '12%', width: 80,  dur: 42, delay: -14, op: 0.70 },
  { id: 3, top: '4%',  width: 140, dur: 55, delay: -28, op: 0.75 },
  { id: 4, top: '18%', width: 95,  dur: 38, delay: -8,  op: 0.65 },
  { id: 5, top: '9%',  width: 65,  dur: 34, delay: -22, op: 0.80 },
]

/* ─── Leaves ──────────────────────────────────────────────── */
const LEAVES = [
  { id: 1, left: '8%',  size: 18, dur: 9,  delay: 0,  color: '#5B8C32' },
  { id: 2, left: '22%', size: 14, dur: 12, delay: -3, color: '#3E7A1A' },
  { id: 3, left: '40%', size: 16, dur: 10, delay: -6, color: '#6AAE2C' },
  { id: 4, left: '60%', size: 13, dur: 14, delay: -2, color: '#4E8A20' },
  { id: 5, left: '78%', size: 15, dur: 11, delay: -8, color: '#5B8C32' },
  { id: 6, left: '92%', size: 12, dur: 8,  delay: -5, color: '#7AB82E' },
]

/* ─── Stars (night only) ──────────────────────────────────── */
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  top:  `${3 + Math.random() * 45}%`,
  size: Math.random() * 2.5 + 0.8,
  dur:  1.5 + Math.random() * 2,
  del:  Math.random() * 3,
}))

/* ─── Sub-components ─────────────────────────────────────── */
function Cloud({ top, width, dur, delay, op }) {
  return (
    <svg className="cloud" width={width} height={width * 0.55}
      viewBox="0 0 120 66"
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

/* ─── Water shimmer overlays on the bg image ─────────────── */
function WaterShimmer() {
  return (
    <>
      {/* Stream (left side of image) */}
      <div style={{
        position: 'absolute', left: '2%', top: '62%', width: '22%', height: '8%',
        background: 'linear-gradient(90deg, transparent, rgba(100,200,255,0.18), transparent)',
        borderRadius: '50%',
        animation: 'waterShimmer 2s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 4,
      }} />
      <div style={{
        position: 'absolute', left: '4%', top: '65%', width: '18%', height: '5%',
        background: 'linear-gradient(90deg, transparent, rgba(150,220,255,0.22), transparent)',
        borderRadius: '50%',
        animation: 'waterShimmer 2.5s ease-in-out infinite',
        animationDelay: '-1s',
        pointerEvents: 'none', zIndex: 4,
      }} />
      {/* Waterfall (right side) */}
      <div style={{
        position: 'absolute', right: '5%', top: '42%', width: '5%', height: '18%',
        background: 'linear-gradient(180deg, rgba(180,230,255,0.3), transparent)',
        animation: 'waterfallShimmer 0.8s linear infinite',
        pointerEvents: 'none', zIndex: 4,
      }} />
    </>
  )
}

/* ─── Capybara activity badge ─────────────────────────────── */
function CapybaraBadge({ participant, currentWeight, initialWeight, activityText, show }) {
  const lost = (initialWeight - currentWeight).toFixed(1)
  const pct  = (((initialWeight - currentWeight) / initialWeight) * 100).toFixed(1)

  return (
    <div className={`capybara-badge ${show ? 'badge-visible' : 'badge-hidden'}`}
      style={{ '--accent': participant.color }}>
      <div className="badge-avatar" style={{ background: participant.color }}>
        {participant.avatar ?? participant.name[0]}
      </div>
      <div className="badge-name" style={{ color: participant.color }}>
        {participant.name}
      </div>
      <div className="badge-activity">{activityText}</div>
      <div className="badge-weight">
        <span className="badge-kg">{currentWeight} kg</span>
        {parseFloat(lost) > 0 && (
          <span className="badge-lost">▼ {lost} kg ({pct}%)</span>
        )}
      </div>
    </div>
  )
}

/* ─── Moon ────────────────────────────────────────────────── */
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

/* ─── Main Scene ──────────────────────────────────────────── */
export default function Scene({ participants, currentWeek, onTitleClick, onRankingsToggle, onAdminToggle }) {
  const [timeOfDay, setTimeOfDay]   = useState(getTimeOfDay)
  const [activityIdx, setActivityIdx] = useState(0)
  const [badgeVisible, setBadgeVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setBadgeVisible(false)
      setTimeout(() => {
        setActivityIdx(i => i + 1)
        setBadgeVisible(true)
      }, 500)
    }, 20_000)
    return () => clearInterval(interval)
  }, [])

  const overlay = TIME_OVERLAYS[timeOfDay]
  const isNight = timeOfDay === 'night'
  const showClouds = timeOfDay !== 'night'
  const showBirds  = timeOfDay !== 'night'

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

  const ranked = [...participants].sort((a, b) =>
    parseFloat(getPct(b)) - parseFloat(getPct(a))
  )
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className={`scene ${timeOfDay}`}>

      {/* ── Background Image ────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/capibara-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        filter: overlay.filter,
        transition: 'filter 4s ease',
        zIndex: 0,
      }} />

      {/* ── Day / Night color overlay ──────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: overlay.bg,
        transition: 'background 4s ease',
        zIndex: 1, pointerEvents: 'none',
        mixBlendMode: isNight ? 'multiply' : 'normal',
      }} />

      {/* ── Night: stars + moon ────────────────────────── */}
      {isNight && (
        <>
          <Moon />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
            {STARS.map(s => (
              <div key={s.id} className="star" style={{
                left: s.left, top: s.top,
                width: s.size, height: s.size,
                animationDuration: `${s.dur}s`,
                animationDelay: `${s.del}s`,
              }} />
            ))}
          </div>
        </>
      )}

      {/* ── Water shimmer ──────────────────────────────── */}
      <WaterShimmer />

      {/* ── Clouds ────────────────────────────────────── */}
      {showClouds && (
        <div className="clouds" style={{ zIndex: 5 }}>
          {CLOUDS.map(c => <Cloud key={c.id} {...c} />)}
        </div>
      )}

      {/* ── Birds ─────────────────────────────────────── */}
      {showBirds && (
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

      {/* ── Falling Leaves ────────────────────────────── */}
      <div className="leaves-layer" style={{ zIndex: 7 }}>
        {LEAVES.map(l => <Leaf key={l.id} {...l} />)}
      </div>

      {/* ── Capybara Badges ────────────────────────────
          Positioned over each capybara in the bg image  */}
      {CAPYBARA_POSITIONS.map(pos => {
        const participant = participants.find(p => p.id === pos.id)
        if (!participant) return null
        const currentWeight = getLatestWeight(participant)
        return (
          <div key={pos.id} style={{
            position: 'absolute',
            left: pos.left,
            top: pos.top,
            transform: 'translate(-50%, -100%)',
            zIndex: 12,
          }}>
            <CapybaraBadge
              participant={pos}
              currentWeight={currentWeight}
              initialWeight={participant.initialWeight}
              activityText={getActivity(pos.id)}
              show={badgeVisible}
            />
          </div>
        )
      })}

      {/* ── Title Sign ────────────────────────────────── */}
      <div className="title-sign" onClick={onTitleClick} style={{ zIndex: 18 }}>
        <svg width="320" height="80" viewBox="0 0 320 80">
          <rect x="8" y="8" width="304" height="64" fill="#5a2e0a" rx="6" />
          <rect x="4" y="4" width="312" height="68" fill="#7B4520" rx="8" />
          {[16, 30, 44, 56].map(y => (
            <line key={y} x1="10" y1={y} x2="310" y2={y + 2}
              stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          ))}
          {[[18,14],[302,14],[18,66],[302,66]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#3a1a05" />
          ))}
          <text x="160" y="30" textAnchor="middle"
            fontFamily="Fredoka One, cursive" fontSize="20"
            fill="#FFE566"
            style={{ filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.9))' }}>
            CAPIBARA'S
          </text>
          <text x="160" y="60" textAnchor="middle"
            fontFamily="Fredoka One, cursive" fontSize="26"
            fill="#FFE566"
            style={{ filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.9))' }}>
            CHALLENGE 🦦
          </text>
        </svg>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
          Semana {currentWeek} / 9
        </div>
      </div>

      {/* ── Participant Cards (bottom strip) ──────────── */}
      <div className="cards-row">
        {ranked.map((p, i) => {
          const latest   = getLatestWeight(p)
          const lost     = parseFloat(getLost(p))
          const pct      = parseFloat(getPct(p))
          const progress = Math.min((pct / 10) * 100, 100)
          return (
            <div key={p.id} className={`participant-card rank-${i + 1}`}>
              <div className="card-header">
                <div className="card-avatar" style={{ background: p.color }}>
                  {p.avatar ?? p.name[0]}
                </div>
                <span className="card-name">{p.name}</span>
                <span className="card-rank">{medals[i]}</span>
              </div>
              <div className="card-weights">
                <div>
                  <span className="card-current-weight">{latest}</span>
                  <span className="card-weight-unit"> kg</span>
                </div>
                <div className="card-lost">
                  {lost > 0 ? `▼ ${lost} kg` : '🏁 Inicio'}
                </div>
              </div>
              <div className="card-progress-label">
                <span>Progreso al 10%</span>
                <span>{pct}%</span>
              </div>
              <div className="card-progress-bar">
                <div className="card-progress-fill"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${p.color}, #5EFF99)` }} />
              </div>
              {/* Weekly trend chart */}
              {p.entries?.length > 0 && (
                <div className="card-weekly-chart">
                  {Array.from({ length: 10 }, (_, week) => {
                    const entry    = p.entries.find(e => e.week === week)
                    const prevEntry = p.entries.find(e => e.week === week - 1)
                    const isLast   = entry && week === p.entries[p.entries.length - 1].week
                    let delta = null
                    let barColor = 'rgba(255,255,255,0.15)'
                    let barH = 2
                    let isGain = false

                    if (entry) {
                      if (prevEntry) {
                        delta = prevEntry.weight - entry.weight
                        isGain = delta < 0
                        const absD = Math.abs(delta)
                        barH = Math.min(absD * 6, 28)
                        barColor = isGain ? '#FF5B5B' : '#5EFF99'
                      } else {
                        barH = 4
                        barColor = 'rgba(255,255,255,0.3)'
                      }
                    }

                    return (
                      <div key={week} className="chart-bar-col" title={
                        entry ? (delta !== null ? `S${week}: ${delta > 0 ? '▼' : '▲'} ${Math.abs(delta).toFixed(1)} kg` : `S${week}: inicio`) : `S${week}: sin dato`
                      }>
                        <div className="chart-delta-label">
                          {delta !== null && Math.abs(delta) >= 0.1 && (
                            <span style={{ color: isGain ? '#FF5B5B' : '#5EFF99', fontSize: 7 }}>
                              {isGain ? '▲' : '▼'}{Math.abs(delta).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="chart-bar-wrap">
                          <div className="chart-bar" style={{
                            height: Math.max(barH, 2),
                            background: barColor,
                            boxShadow: isLast ? `0 0 5px ${barColor}` : 'none',
                            opacity: entry ? 1 : 0.25,
                          }} />
                        </div>
                        <div className="chart-label" style={{ color: isLast ? '#FFE566' : undefined }}>
                          {week}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Top Buttons ────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 14, left: 18, zIndex: 25, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button className="rankings-btn" onClick={onRankingsToggle}>🏆 Ranking</button>
        <button className="register-btn" onClick={onAdminToggle}>✏️ Registrar Peso</button>
      </div>
      <div className="week-counter">📅 Semana {currentWeek} · {9 - currentWeek} sem restantes</div>
    </div>
  )
}
