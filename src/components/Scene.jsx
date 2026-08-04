import { useState, useEffect, useRef } from 'react'
import Capybara from './Capybara'

const ACTIVITY_SETS = [
  ['cycling', 'lifting', 'climbing'],
  ['pullup', 'yoga', 'boxing'],
  ['running', 'cycling', 'lifting'],
]

const CLOUDS = [
  { id: 1, top: '8%', width: 120, duration: 28, delay: 0 },
  { id: 2, top: '14%', width: 80, duration: 38, delay: -12 },
  { id: 3, top: '5%', width: 150, duration: 50, delay: -25 },
  { id: 4, top: '20%', width: 100, duration: 42, delay: -8 },
  { id: 5, top: '11%', width: 60, duration: 32, delay: -18 },
]

const LEAVES = [
  { id: 1, left: '15%', size: 16, duration: 9, delay: 0, color: '#5B8C32' },
  { id: 2, left: '30%', size: 14, duration: 11, delay: -3, color: '#3E7A1A' },
  { id: 3, left: '55%', size: 18, duration: 13, delay: -7, color: '#6AAE2C' },
  { id: 4, left: '70%', size: 12, duration: 8, delay: -4, color: '#4E8A20' },
  { id: 5, left: '85%', size: 15, duration: 10, delay: -9, color: '#5B8C32' },
  { id: 6, left: '42%', size: 13, duration: 14, delay: -6, color: '#7AB82E' },
]

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 55}%`,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 2,
  duration: 1.5 + Math.random() * 2,
}))

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 6 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 21) return 'evening'
  return 'night'
}

function getSunPosition(timeOfDay) {
  const positions = {
    morning: { top: '22%', left: '15%' },
    afternoon: { top: '10%', left: '55%' },
    evening: { top: '30%', left: '78%' },
    night: { top: '15%', left: '80%' },
  }
  return positions[timeOfDay]
}

function Cloud({ top, width, duration, delay }) {
  return (
    <svg
      className="cloud"
      style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      width={width}
      height={width * 0.55}
      viewBox="0 0 120 66"
    >
      <ellipse cx="60" cy="50" rx="55" ry="22" fill="white" opacity="0.92" />
      <ellipse cx="40" cy="40" rx="30" ry="22" fill="white" opacity="0.95" />
      <ellipse cx="80" cy="38" rx="28" ry="20" fill="white" opacity="0.9" />
      <ellipse cx="60" cy="28" rx="22" ry="18" fill="white" />
    </svg>
  )
}

function Bird({ top, delay, duration, scale = 1 }) {
  return (
    <svg
      className="bird"
      style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s`, transform: `scale(${scale})` }}
      width="24" height="12" viewBox="0 0 24 12"
    >
      <path d="M2 7 Q6 1 12 5 Q18 1 22 7" stroke="#2a2a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Leaf({ left, size, duration, delay, color }) {
  return (
    <svg
      className="leaf"
      style={{ left, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      width={size} height={size * 1.4}
      viewBox="0 0 14 20"
    >
      <path d="M7 1 C12 5 14 12 7 19 C0 12 2 5 7 1Z" fill={color} opacity="0.85" />
      <line x1="7" y1="1" x2="7" y2="19" stroke="rgba(0,60,0,0.3)" strokeWidth="0.8" />
    </svg>
  )
}

function MountainsFar({ timeOfDay }) {
  const color = timeOfDay === 'night' ? '#1a2a3a' : timeOfDay === 'evening' ? '#5a3a5a' : '#7BAE78'
  const mid = timeOfDay === 'night' ? '#253040' : timeOfDay === 'evening' ? '#6a4a6a' : '#8EC088'
  return (
    <svg width="110%" height="100%" viewBox="0 0 1100 200" preserveAspectRatio="none">
      <polygon points="0,200 80,60 160,200" fill={color} />
      <polygon points="100,200 230,20 360,200" fill={mid} />
      <polygon points="280,200 400,50 520,200" fill={color} />
      <polygon points="450,200 570,30 690,200" fill={mid} />
      <polygon points="600,200 730,55 860,200" fill={color} />
      <polygon points="780,200 890,25 1000,200" fill={mid} />
      <polygon points="920,200 1020,60 1120,200" fill={color} />
    </svg>
  )
}

function MountainsNear({ timeOfDay }) {
  const c1 = timeOfDay === 'night' ? '#0e1e2e' : timeOfDay === 'evening' ? '#3a2a4a' : '#5B8A4C'
  const c2 = timeOfDay === 'night' ? '#162436' : timeOfDay === 'evening' ? '#4a3a5a' : '#4E7A40'
  return (
    <svg width="110%" height="100%" viewBox="0 0 1100 200" preserveAspectRatio="none">
      <polygon points="-20,200 120,30 260,200" fill={c1} />
      <polygon points="180,200 330,10 480,200" fill={c2} />
      <polygon points="380,200 520,40 660,200" fill={c1} />
      <polygon points="560,200 700,15 840,200" fill={c2} />
      <polygon points="730,200 870,45 1010,200" fill={c1} />
      <polygon points="900,200 1050,20 1200,200" fill={c2} />
    </svg>
  )
}

function TreeGroup({ x, heights = [70, 90, 75], spread = 28, timeOfDay }) {
  const trunkColor = timeOfDay === 'night' ? '#2a1a0e' : '#5D3A1A'
  const leafColors = timeOfDay === 'night'
    ? ['#0e2010', '#0a1a0c', '#122014']
    : timeOfDay === 'evening'
      ? ['#3a5020', '#2e4018', '#44601c']
      : ['#2E5E2A', '#3D7A33', '#255222']

  return (
    <g transform={`translate(${x}, 0)`}>
      {heights.map((h, i) => {
        const ox = (i - 1) * spread
        const lc = leafColors[i % leafColors.length]
        return (
          <g key={i} transform={`translate(${ox}, 0)`} className="tree-sway"
            style={{ animationDelay: `${i * 0.7}s`, animationDuration: `${3 + i * 0.5}s` }}>
            <rect x="-5" y={200 - h * 0.25} width="10" height={h * 0.25 + 10} fill={trunkColor} rx="3" />
            <polygon points={`0,${200 - h} -${h * 0.32},${200 - h * 0.45} ${h * 0.32},${200 - h * 0.45}`} fill={lc} />
            <polygon points={`0,${200 - h * 0.7} -${h * 0.36},${200 - h * 0.2} ${h * 0.36},${200 - h * 0.2}`} fill={lc} opacity="0.9" />
          </g>
        )
      })}
    </g>
  )
}

function WaterfallElement({ timeOfDay }) {
  const waterColor = timeOfDay === 'night' ? '#1a3a6a' : '#5EB8E8'
  return (
    <svg width="80" height="160" viewBox="0 0 80 160">
      {/* Rock cliff */}
      <polygon points="0,0 80,0 80,60 60,80 20,70 0,50" fill={timeOfDay === 'night' ? '#3a3a4a' : '#7A7060'} />
      {/* Waterfall streams */}
      {[20, 32, 45, 56].map((x, i) => (
        <rect key={i} className="waterfall-stream" x={x} y="60" width={4 + (i % 2) * 2} height="90"
          fill={waterColor} opacity={0.6 + i * 0.05} rx="2"
          style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
      {/* Pool at bottom */}
      <ellipse cx="40" cy="155" rx="35" ry="8" fill={waterColor} opacity="0.5" />
    </svg>
  )
}

function River({ timeOfDay }) {
  const wc = timeOfDay === 'night' ? '#1a2a5a' : '#4A8FC4'
  const wc2 = timeOfDay === 'night' ? '#0e1a3a' : '#3B82C4'
  return (
    <svg width="100%" height="80" viewBox="0 0 600 80" preserveAspectRatio="none">
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wc} />
          <stop offset="100%" stopColor={wc2} />
        </linearGradient>
      </defs>
      <path d="M0,15 Q50,5 100,20 Q150,35 200,15 Q250,0 300,20 Q350,35 400,15 Q450,5 500,20 Q550,35 600,15 L600,80 L0,80Z"
        fill="url(#waterGrad)" />
      {/* Animated wave overlay */}
      <g className="water-wave">
        <path d="M-80,25 Q-40,18 0,25 Q40,32 80,25 Q120,18 160,25 Q200,32 240,25 Q280,18 320,25 Q360,32 400,25 Q440,18 480,25 Q520,32 560,25 Q600,18 640,25 Q680,32 720,25 L720,35 Q680,42 640,35 Q600,28 560,35 Q520,42 480,35 Q440,28 400,35 Q360,42 320,35 Q280,28 240,35 Q200,42 160,35 Q120,28 80,35 Q40,42 0,35 Q-40,28 -80,35Z"
          fill="rgba(255,255,255,0.15)" />
      </g>
      {/* Ripples */}
      {[100, 250, 400].map((cx, i) => (
        <circle key={i} className="water-ripple" cx={cx} cy="50" fill="none"
          stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
          style={{ animationDelay: `${i * 0.65}s` }} />
      ))}
    </svg>
  )
}

function Ground({ timeOfDay }) {
  const gc = timeOfDay === 'night' ? '#1a2e12' : '#68A440'
  const gc2 = timeOfDay === 'night' ? '#0e1e0a' : '#5B8C32'
  const dc = timeOfDay === 'night' ? '#1a1410' : '#8B6914'
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
      <rect x="0" y="0" width="1200" height="200" fill={dc} />
      {/* Grass patches */}
      <rect x="0" y="0" width="1200" height="30" fill={gc} rx="0" />
      {[40, 120, 220, 350, 480, 600, 720, 850, 980, 1100].map((x, i) => (
        <g key={i} className="grass-patch" style={{ animationDelay: `${i * 0.3}s` }}>
          {[0, 8, 16].map(dx => (
            <polygon key={dx} points={`${x + dx},30 ${x + dx + 4},12 ${x + dx + 8},30`}
              fill={i % 2 === 0 ? gc : gc2} />
          ))}
        </g>
      ))}
      {/* Rocks */}
      {[180, 420, 680, 900, 1050].map((x, i) => (
        <ellipse key={i} cx={x} cy="50" rx={10 + i * 3} ry={7 + i * 2}
          fill={timeOfDay === 'night' ? '#333' : '#888'} opacity="0.8" />
      ))}
      {/* Stone steps (right area) */}
      {[0, 1, 2, 3].map(s => (
        <rect key={s} x={900 + s * 22} y={30 - s * 12} width={25} height={14}
          fill={timeOfDay === 'night' ? '#3a3a4a' : '#9E9078'} rx="2" />
      ))}
    </svg>
  )
}

function Structures({ timeOfDay }) {
  const wood = timeOfDay === 'night' ? '#3a2a15' : '#7B4F22'
  const woodLight = timeOfDay === 'night' ? '#5a4020' : '#9A6A35'
  const metal = timeOfDay === 'night' ? '#2a2a3a' : '#6a6a7a'
  const rope = timeOfDay === 'night' ? '#4a3a25' : '#9B7C48'

  return (
    <svg width="100%" height="180" viewBox="0 0 1200 180" preserveAspectRatio="none">
      {/* ---- CLIMBING WALL (left ~12%) ---- */}
      <rect x="60" y="20" width="80" height="140" fill={timeOfDay === 'night' ? '#2a3040' : '#4a5A80'} rx="4" />
      <rect x="58" y="18" width="84" height="8" fill={wood} rx="2" />
      <rect x="58" y="152" width="84" height="8" fill={wood} rx="2" />
      {/* Climbing holds */}
      {[[75,50],[110,40],[85,80],[120,70],[72,110],[115,100],[90,135]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={['#e74c3c','#2ecc71','#3498db','#f1c40f','#e67e22','#9b59b6','#1abc9c'][i]} />
      ))}
      {/* Wall frame */}
      <rect x="55" y="15" width="4" height="145" fill={wood} rx="2" />
      <rect x="141" y="15" width="4" height="145" fill={wood} rx="2" />

      {/* ---- MONKEY BARS (center-left ~30%) ---- */}
      <rect x="300" y="25" width="6" height="140" fill={wood} rx="3" />
      <rect x="430" y="25" width="6" height="140" fill={wood} rx="3" />
      <rect x="298" y="22" width="140" height="8" fill={metal} rx="3" />
      {/* Horizontal bars */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={315 + i * 18} y="22" width="6" height="50" fill={metal} rx="3" />
      ))}
      {/* Support diagonal */}
      <line x1="300" y1="25" x2="280" y2="165" stroke={wood} strokeWidth="5" strokeLinecap="round" />
      <line x1="436" y1="25" x2="456" y2="165" stroke={wood} strokeWidth="5" strokeLinecap="round" />

      {/* ---- BARBELL RACK (center ~52%) ---- */}
      <rect x="590" y="100" width="8" height="60" fill={metal} rx="3" />
      <rect x="660" y="100" width="8" height="60" fill={metal} rx="3" />
      <rect x="585" y="95" width="90" height="10" fill={woodLight} rx="3" />
      <rect x="585" y="120" width="90" height="8" fill={woodLight} rx="3" />
      {/* Barbell itself on rack */}
      <rect x="560" y="90" width="148" height="8" fill={metal} rx="4" />
      <ellipse cx="562" cy="94" rx="12" ry="18" fill="#555" />
      <ellipse cx="562" cy="94" rx="9" ry="14" fill="#666" />
      <ellipse cx="706" cy="94" rx="12" ry="18" fill="#555" />
      <ellipse cx="706" cy="94" rx="9" ry="14" fill="#666" />
      {/* Tires / weight plates on floor */}
      <ellipse cx="615" cy="162" rx="18" ry="8" fill="#333" />
      <ellipse cx="643" cy="162" rx="18" ry="8" fill="#444" />

      {/* ---- STATIONARY BIKE (left-center ~22%) ---- */}
      <g transform="translate(175, 100)">
        {/* Frame */}
        <line x1="30" y1="0" x2="65" y2="30" stroke={metal} strokeWidth="4" strokeLinecap="round" />
        <line x1="65" y1="30" x2="80" y2="60" stroke={metal} strokeWidth="4" strokeLinecap="round" />
        <line x1="30" y1="0" x2="10" y2="50" stroke={metal} strokeWidth="4" strokeLinecap="round" />
        <line x1="10" y1="50" x2="80" y2="60" stroke={metal} strokeWidth="4" strokeLinecap="round" />
        {/* Handlebar */}
        <rect x="5" y="-10" width="30" height="5" fill={metal} rx="2" />
        <rect x="18" y="-18" width="6" height="15" fill={metal} rx="2" />
        {/* Seat */}
        <rect x="55" y="-5" width="22" height="5" fill={woodLight} rx="2" />
        <rect x="63" y="-18" width="5" height="16" fill={metal} rx="2" />
        {/* Wheels */}
        <circle cx="10" cy="60" r="22" fill="none" stroke={metal} strokeWidth="3" />
        <circle cx="80" cy="60" r="22" fill="none" stroke={metal} strokeWidth="3" />
        <circle cx="10" cy="60" r="6" fill={metal} />
        <circle cx="80" cy="60" r="6" fill={metal} />
      </g>

      {/* ---- BOXING RING (right ~82%) ---- */}
      {/* Raised platform */}
      <rect x="930" y="70" width="220" height="90" fill={timeOfDay === 'night' ? '#2a2020' : '#8B6914'} rx="4" />
      <rect x="928" y="65" width="224" height="12" fill={woodLight} rx="3" />
      {/* Ring corners */}
      {[[935,65],[1145,65],[935,70],[1145,70]].map(([x,y],i) => (
        <rect key={i} x={x} y={y} width="8" height="100" fill={metal} rx="2" />
      ))}
      {/* Ropes */}
      {[80, 95, 110].map((y, i) => (
        <g key={i}>
          <line x1="935" y1={y} x2="1148" y2={y} stroke={['#e74c3c','#e74c3c','#3498db'][i]} strokeWidth="2" />
        </g>
      ))}
      {/* Canvas floor */}
      <rect x="935" y="77" width="210" height="80" fill={timeOfDay === 'night' ? '#1a1a2a' : '#D4C4A0'} opacity="0.6" />
    </svg>
  )
}

function Lanterns({ timeOfDay }) {
  const glow = timeOfDay === 'night' ? 'rgba(255,200,50,0.9)' : timeOfDay === 'evening' ? 'rgba(255,180,30,0.6)' : 'none'
  const bodyColor = '#8B5E2A'
  return (
    <svg width="100%" height="100px" viewBox="0 0 1200 100" preserveAspectRatio="none">
      {[120, 270, 780, 920, 1080].map((x, i) => (
        <g key={i} className="lantern">
          {/* Pole */}
          <rect x={x + 8} y="20" width="5" height="80" fill={bodyColor} rx="2" />
          {/* Lantern body */}
          {glow !== 'none' && <ellipse cx={x + 10} cy="22" rx="18" ry="12" fill={glow} opacity="0.3" />}
          <rect x={x} y="5" width="21" height="22" fill="#D4A030" rx="4" />
          <rect x={x + 3} y="2" width="15" height="5" fill={bodyColor} rx="2" />
          <rect x={x + 3} y="25" width="15" height="4" fill={bodyColor} rx="1" />
          {glow !== 'none' && <rect x={x + 5} y="10" width="11" height="12" fill="rgba(255,240,100,0.7)" rx="2" />}
        </g>
      ))}
    </svg>
  )
}

export default function Scene({ participants, currentWeek, onTitleClick, onRankingsToggle }) {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay)
  const [activitySet, setActivitySet] = useState(0)
  const [activityFading, setActivityFading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTimeOfDay(getTimeOfDay()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityFading(true)
      setTimeout(() => {
        setActivitySet(prev => (prev + 1) % ACTIVITY_SETS.length)
        setActivityFading(false)
      }, 600)
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  const sunPos = getSunPosition(timeOfDay)
  const activities = ACTIVITY_SETS[activitySet]

  const getLatestWeight = (p) => {
    if (!p.entries.length) return p.initialWeight
    return p.entries[p.entries.length - 1].weight
  }
  const getLost = (p) => {
    const latest = getLatestWeight(p)
    return (p.initialWeight - latest).toFixed(1)
  }
  const getPct = (p) => {
    const latest = getLatestWeight(p)
    return (((p.initialWeight - latest) / p.initialWeight) * 100).toFixed(1)
  }

  const ranked = [...participants].sort((a, b) => parseFloat(getPct(b)) - parseFloat(getPct(a)))

  return (
    <div className={`scene ${timeOfDay}`}>
      {/* SKY */}
      <div className="sky">
        {timeOfDay === 'night' ? (
          <div className="stars">
            {STARS.map(s => (
              <div key={s.id} className="star" style={{
                left: s.left, top: s.top,
                width: s.size, height: s.size,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }} />
            ))}
          </div>
        ) : null}
        {/* Sun or Moon */}
        {timeOfDay === 'night' ? (
          <div className="moon" style={{ ...sunPos }} />
        ) : (
          <div className="sun" style={{ ...sunPos }} />
        )}
        {/* Clouds (fewer at night) */}
        <div className="clouds">
          {CLOUDS.filter((_, i) => timeOfDay !== 'night' || i < 2).map(c => (
            <Cloud key={c.id} {...c} />
          ))}
        </div>
      </div>

      {/* BIRDS */}
      {timeOfDay !== 'night' && (
        <div className="birds-layer">
          {[
            { top: '18%', delay: 0, duration: 22, scale: 0.9 },
            { top: '24%', delay: -8, duration: 28, scale: 1 },
            { top: '14%', delay: -15, duration: 34, scale: 0.7 },
            { top: '30%', delay: -5, duration: 25, scale: 1.1 },
          ].map((b, i) => <Bird key={i} {...b} />)}
        </div>
      )}

      {/* MOUNTAINS FAR */}
      <div className="mountains-far">
        <MountainsFar timeOfDay={timeOfDay} />
      </div>

      {/* MOUNTAINS NEAR */}
      <div className="mountains-near">
        <MountainsNear timeOfDay={timeOfDay} />
      </div>

      {/* TREES BACKGROUND */}
      <div className="trees-bg">
        <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <TreeGroup x={80} heights={[90, 110, 80]} spread={30} timeOfDay={timeOfDay} />
          <TreeGroup x={200} heights={[80, 100]} spread={25} timeOfDay={timeOfDay} />
          <TreeGroup x={500} heights={[95, 120, 85]} spread={32} timeOfDay={timeOfDay} />
          <TreeGroup x={700} heights={[85, 105]} spread={28} timeOfDay={timeOfDay} />
          <TreeGroup x={870} heights={[100, 125, 90]} spread={30} timeOfDay={timeOfDay} />
          <TreeGroup x={1050} heights={[90, 110]} spread={26} timeOfDay={timeOfDay} />
          <TreeGroup x={1150} heights={[95, 115, 80]} spread={28} timeOfDay={timeOfDay} />
        </svg>
      </div>

      {/* WATERFALL */}
      <div className="waterfall-container">
        <WaterfallElement timeOfDay={timeOfDay} />
      </div>

      {/* GYM STRUCTURES */}
      <div className="structures">
        <Structures timeOfDay={timeOfDay} />
      </div>

      {/* GROUND */}
      <div className="ground">
        <Ground timeOfDay={timeOfDay} />
      </div>

      {/* RIVER */}
      <div className="river-container">
        <River timeOfDay={timeOfDay} />
      </div>

      {/* LANTERNS */}
      <div style={{ position: 'absolute', bottom: '27%', left: 0, right: 0, height: '100px', zIndex: 11 }}>
        <Lanterns timeOfDay={timeOfDay} />
      </div>

      {/* FALLING LEAVES */}
      <div className="leaves-layer">
        {LEAVES.map(l => <Leaf key={l.id} {...l} />)}
      </div>

      {/* NIGHT OVERLAY */}
      <div className="night-overlay" />

      {/* ===== CAPYBARAS ===== */}
      <div className="capybaras-layer" style={{ opacity: activityFading ? 0 : 1, transition: 'opacity 0.6s ease' }}>
        {/* Benjamin - left area (stationary bike zone) */}
        <div className="capybara-wrapper" style={{ left: '20%', bottom: '10px' }}>
          <div className={`activity-${activities[0]}`}>
            <Capybara
              name={participants[1]?.name || 'Benjamin'}
              weight={getLatestWeight(participants[1] || {})}
              initialWeight={participants[1]?.initialWeight || 96.5}
              color={participants[1]?.color || '#4A8FD4'}
              activity={activities[0]}
              size={0.85}
            />
          </div>
          <div className="capybara-name-tag" style={{ borderBottom: `2px solid ${participants[1]?.color || '#4A8FD4'}` }}>
            {participants[1]?.name || 'Benjamin'}
          </div>
          <div className="capybara-weight-tag">
            {getLatestWeight(participants[1] || {})} kg
            {parseFloat(getLost(participants[1] || {})) > 0 && (
              <span style={{ color: '#5EFF99', marginLeft: 4 }}>▼{getLost(participants[1] || {})}kg</span>
            )}
          </div>
        </div>

        {/* David - center (barbell zone) */}
        <div className="capybara-wrapper" style={{ left: '48%', bottom: '10px' }}>
          <div className={`activity-${activities[1]}`}>
            <Capybara
              name={participants[0]?.name || 'David'}
              weight={getLatestWeight(participants[0] || {})}
              initialWeight={participants[0]?.initialWeight || 147.5}
              color={participants[0]?.color || '#D4724A'}
              activity={activities[1]}
              size={1.2}
            />
          </div>
          <div className="capybara-name-tag" style={{ borderBottom: `2px solid ${participants[0]?.color || '#D4724A'}` }}>
            {participants[0]?.name || 'David'}
          </div>
          <div className="capybara-weight-tag">
            {getLatestWeight(participants[0] || {})} kg
            {parseFloat(getLost(participants[0] || {})) > 0 && (
              <span style={{ color: '#5EFF99', marginLeft: 4 }}>▼{getLost(participants[0] || {})}kg</span>
            )}
          </div>
        </div>

        {/* Daniel - right (boxing ring zone) */}
        <div className="capybara-wrapper" style={{ left: '76%', bottom: '10px' }}>
          <div className={`activity-${activities[2]}`}>
            <Capybara
              name={participants[2]?.name || 'Daniel'}
              weight={getLatestWeight(participants[2] || {})}
              initialWeight={participants[2]?.initialWeight || 109}
              color={participants[2]?.color || '#5BB85B'}
              activity={activities[2]}
              size={0.98}
            />
          </div>
          <div className="capybara-name-tag" style={{ borderBottom: `2px solid ${participants[2]?.color || '#5BB85B'}` }}>
            {participants[2]?.name || 'Daniel'}
          </div>
          <div className="capybara-weight-tag">
            {getLatestWeight(participants[2] || {})} kg
            {parseFloat(getLost(participants[2] || {})) > 0 && (
              <span style={{ color: '#5EFF99', marginLeft: 4 }}>▼{getLost(participants[2] || {})}kg</span>
            )}
          </div>
        </div>
      </div>

      {/* ===== TITLE SIGN ===== */}
      <div className="title-sign" onClick={onTitleClick}>
        <svg width="320" height="80" viewBox="0 0 320 80">
          {/* Wood sign shape */}
          <rect x="8" y="8" width="304" height="64" fill="#6B3E1A" rx="6" />
          <rect x="4" y="4" width="312" height="68" fill="#8B5A2B" rx="8" />
          {/* Wood grain lines */}
          {[15, 28, 42, 55, 65].map(y => (
            <line key={y} x1="10" y1={y} x2="310" y2={y + 2} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
          ))}
          {/* Border nails */}
          {[[18,14],[302,14],[18,66],[302,66]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#4A3010" />
          ))}
          {/* Title text */}
          <text x="160" y="30" textAnchor="middle" fontFamily="Fredoka One, cursive"
            fontSize="20" fill="#FFE566" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}>
            CAPIBARA'S
          </text>
          <text x="160" y="60" textAnchor="middle" fontFamily="Fredoka One, cursive"
            fontSize="26" fill="#FFE566" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}>
            CHALLENGE 🦦
          </text>
        </svg>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
          Semana {currentWeek} / 9
        </div>
      </div>

      {/* PARTICIPANT CARDS */}
      <div className="cards-row">
        {ranked.map((p, i) => {
          const latest = getLatestWeight(p)
          const lost = parseFloat(getLost(p))
          const pct = parseFloat(getPct(p))
          const progress = Math.min((pct / 10) * 100, 100)
          const medals = ['🥇', '🥈', '🥉']
          return (
            <div key={p.id} className={`participant-card rank-${i + 1}`}>
              <div className="card-header">
                <div className="card-avatar-dot" style={{ background: p.color }} />
                <span className="card-name">{p.name}</span>
                <span className="card-rank">{medals[i]}</span>
              </div>
              <div className="card-weights">
                <div>
                  <span className="card-current-weight">{latest}</span>
                  <span className="card-weight-unit">kg</span>
                </div>
                <div className="card-lost">
                  {lost > 0 ? `▼ ${lost} kg` : 'Inicio'}
                </div>
              </div>
              <div className="card-progress-label">
                <span>Progreso hacia meta 10%</span>
                <span>{pct}%</span>
              </div>
              <div className="card-progress-bar">
                <div className="card-progress-fill"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${p.color}, #5EFF99)` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* TOP BUTTONS */}
      <button className="rankings-btn" onClick={onRankingsToggle}>
        🏆 Ranking Detallado
      </button>
      <div className="week-counter">
        📅 Semana {currentWeek} · {9 - currentWeek} semanas restantes
      </div>
    </div>
  )
}
