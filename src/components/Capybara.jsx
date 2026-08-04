/* Capybara SVG component — body size scales with weight percentage */

function getBodyScale(weight, initialWeight) {
  const pctRemaining = weight / initialWeight
  return 0.82 + pctRemaining * 0.38
}

function CapybaraBase({ color, bodyScale, darkColor, lightColor }) {
  const bx = 100
  const by = 130
  const bw = 80 * bodyScale
  const bh = 48 * bodyScale
  const hx = bx
  const hy = by - bh * 0.65

  return (
    <g>
      {/* Shadow */}
      <ellipse cx={bx} cy={by + bh * 0.55} rx={bw * 0.7} ry={6} fill="rgba(0,0,0,0.2)" />
      {/* Body */}
      <ellipse cx={bx} cy={by} rx={bw} ry={bh} fill={color} />
      {/* Belly highlight */}
      <ellipse cx={bx} cy={by + 5} rx={bw * 0.55} ry={bh * 0.45} fill={lightColor} opacity="0.45" />
      {/* Head */}
      <ellipse cx={hx} cy={hy} rx={bw * 0.52} ry={bh * 0.7} fill={color} />
      {/* Ear left */}
      <ellipse cx={hx - bw * 0.38} cy={hy - bh * 0.6} rx={bw * 0.14} ry={bh * 0.12} fill={color} />
      <ellipse cx={hx - bw * 0.38} cy={hy - bh * 0.6} rx={bw * 0.08} ry={bh * 0.07} fill={darkColor} opacity="0.5" />
      {/* Ear right */}
      <ellipse cx={hx + bw * 0.38} cy={hy - bh * 0.6} rx={bw * 0.14} ry={bh * 0.12} fill={color} />
      <ellipse cx={hx + bw * 0.38} cy={hy - bh * 0.6} rx={bw * 0.08} ry={bh * 0.07} fill={darkColor} opacity="0.5" />
      {/* Eyes */}
      <circle cx={hx - bw * 0.2} cy={hy - bh * 0.15} r={bw * 0.1} fill="white" />
      <circle cx={hx + bw * 0.2} cy={hy - bh * 0.15} r={bw * 0.1} fill="white" />
      <circle cx={hx - bw * 0.18} cy={hy - bh * 0.15} r={bw * 0.06} fill="#1a1a1a" />
      <circle cx={hx + bw * 0.22} cy={hy - bh * 0.15} r={bw * 0.06} fill="#1a1a1a" />
      {/* Eye shines */}
      <circle cx={hx - bw * 0.14} cy={hy - bh * 0.2} r={bw * 0.025} fill="white" />
      <circle cx={hx + bw * 0.26} cy={hy - bh * 0.2} r={bw * 0.025} fill="white" />
      {/* Nose */}
      <rect x={hx - bw * 0.14} y={hy + bh * 0.1} width={bw * 0.28} height={bh * 0.18} fill={darkColor} rx={3} />
      <circle cx={hx - bw * 0.04} cy={hy + bh * 0.16} r={bw * 0.04} fill={lightColor} opacity="0.6" />
      <circle cx={hx + bw * 0.06} cy={hy + bh * 0.16} r={bw * 0.04} fill={lightColor} opacity="0.6" />
    </g>
  )
}

function ActivityLifting({ color, bodyScale, darkColor, lightColor }) {
  const bw = 80 * bodyScale
  const bh = 48 * bodyScale
  return (
    <svg width="200" height="220" viewBox="0 0 200 220">
      <CapybaraBase color={color} bodyScale={bodyScale} darkColor={darkColor} lightColor={lightColor} />
      {/* Arms up holding barbell */}
      <line x1={100 - bw * 0.75} y1={130 - bh * 0.3} x2={100 - bw * 0.75} y2={130 - bh * 1.4} stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      <line x1={100 + bw * 0.75} y1={130 - bh * 0.3} x2={100 + bw * 0.75} y2={130 - bh * 1.4} stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      {/* Barbell */}
      <rect x={100 - bw * 0.95} y={130 - bh * 1.45} width={bw * 1.9} height={8} fill="#666" rx="4" />
      <ellipse cx={100 - bw * 0.95} cy={130 - bh * 1.41} rx={10} ry={16} fill="#444" />
      <ellipse cx={100 + bw * 0.95} cy={130 - bh * 1.41} rx={10} ry={16} fill="#444" />
      {/* Legs - wide stance */}
      <line x1={100 - bw * 0.4} y1={130 + bh * 0.9} x2={100 - bw * 0.55} y2={130 + bh * 1.8} stroke={color} strokeWidth={12 * bodyScale} strokeLinecap="round" />
      <line x1={100 + bw * 0.4} y1={130 + bh * 0.9} x2={100 + bw * 0.55} y2={130 + bh * 1.8} stroke={color} strokeWidth={12 * bodyScale} strokeLinecap="round" />
      {/* Sweat drops */}
      <ellipse cx={100 - bw * 0.95} cy={65} rx="4" ry="6" fill="#7EC8F8" opacity="0.7" />
      <ellipse cx={100 + bw * 0.8} cy={60} rx="3" ry="5" fill="#7EC8F8" opacity="0.6" />
    </svg>
  )
}

function ActivityCycling({ color, bodyScale, darkColor, lightColor }) {
  const bw = 80 * bodyScale
  const bh = 48 * bodyScale
  return (
    <svg width="200" height="220" viewBox="0 0 200 220">
      {/* Bike */}
      <circle cx="85" cy="185" r="22" fill="none" stroke="#555" strokeWidth="4" />
      <circle cx="155" cy="185" r="22" fill="none" stroke="#555" strokeWidth="4" />
      <circle cx="85" cy="185" r="5" fill="#555" />
      <circle cx="155" cy="185" r="5" fill="#555" />
      <line x1="85" y1="185" x2="120" y2="155" stroke="#666" strokeWidth="4" />
      <line x1="120" y1="155" x2="155" y2="185" stroke="#666" strokeWidth="4" />
      <line x1="120" y1="155" x2="118" y2="125" stroke="#666" strokeWidth="4" />
      <rect x="108" y="118" width="22" height="6" fill="#777" rx="3" />
      <rect x="115" y="104" width="6" height="18" fill="#777" rx="2" />
      <line x1="120" y1="155" x2="90" y2="148" stroke="#666" strokeWidth="3" />
      {/* Pedals */}
      <circle cx="120" cy="165" r="8" fill="#888" stroke="#555" strokeWidth="2" />
      <line x1="110" y1="165" x2="130" y2="165" stroke="#333" strokeWidth="3" />
      {/* Capybara leaning forward */}
      <g transform="translate(0, -20)">
        <CapybaraBase color={color} bodyScale={bodyScale * 0.85} darkColor={darkColor} lightColor={lightColor} />
        {/* Arms on handlebar */}
        <line x1={100 - 35 * bodyScale} y1={115} x2="90" y2="125" stroke={color} strokeWidth={9 * bodyScale} strokeLinecap="round" />
        <line x1={100 + 35 * bodyScale} y1={115} x2="120" y2="120" stroke={color} strokeWidth={9 * bodyScale} strokeLinecap="round" />
        {/* Legs on pedals */}
        <line x1={100 - 20 * bodyScale} y1={148} x2="110" y2="165" stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
        <line x1={100 + 20 * bodyScale} y1={148} x2="130" y2="160" stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      </g>
    </svg>
  )
}

function ActivityPullup({ color, bodyScale, darkColor, lightColor }) {
  const bw = 80 * bodyScale
  return (
    <svg width="200" height="220" viewBox="0 0 200 220">
      {/* Bar */}
      <rect x="40" y="30" width="120" height="8" fill="#666" rx="4" />
      <line x1="40" y1="30" x2="40" y2="0" stroke="#888" strokeWidth="4" />
      <line x1="160" y1="30" x2="160" y2="0" stroke="#888" strokeWidth="4" />
      {/* Arms */}
      <line x1={100 - bw * 0.4} y1="38" x2={100 - bw * 0.4} y2="75" stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      <line x1={100 + bw * 0.4} y1="38" x2={100 + bw * 0.4} y2="75" stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      {/* Body hanging */}
      <g transform="translate(0, 30)">
        <CapybaraBase color={color} bodyScale={bodyScale * 0.9} darkColor={darkColor} lightColor={lightColor} />
        {/* Legs hanging */}
        <line x1={100 - bw * 0.3} y1="168" x2={100 - bw * 0.35} y2="210" stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
        <line x1={100 + bw * 0.3} y1="168" x2={100 + bw * 0.35} y2="210" stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      </g>
    </svg>
  )
}

function ActivityBoxing({ color, bodyScale, darkColor, lightColor }) {
  const bw = 80 * bodyScale
  const bh = 48 * bodyScale
  return (
    <svg width="200" height="220" viewBox="0 0 200 220">
      <CapybaraBase color={color} bodyScale={bodyScale} darkColor={darkColor} lightColor={lightColor} />
      {/* Boxing gloves - one forward, one back */}
      <ellipse cx={100 - bw * 1.0} cy={130 - bh * 0.5} rx={18 * bodyScale} ry={14 * bodyScale} fill="#e74c3c" />
      <ellipse cx={100 + bw * 0.6} cy={130 - bh * 0.6} rx={14 * bodyScale} ry={12 * bodyScale} fill="#e74c3c" />
      {/* Arms */}
      <line x1={100 - bw * 0.6} y1={130 - bh * 0.2} x2={100 - bw * 0.9} y2={130 - bh * 0.5} stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      <line x1={100 + bw * 0.5} y1={130 - bh * 0.3} x2={100 + bw * 0.55} y2={130 - bh * 0.55} stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      {/* Legs */}
      <line x1={100 - bw * 0.4} y1={130 + bh * 0.9} x2={100 - bw * 0.6} y2={130 + bh * 1.8} stroke={color} strokeWidth={12 * bodyScale} strokeLinecap="round" />
      <line x1={100 + bw * 0.4} y1={130 + bh * 0.9} x2={100 + bw * 0.5} y2={130 + bh * 1.8} stroke={color} strokeWidth={12 * bodyScale} strokeLinecap="round" />
      {/* Stars of impact */}
      {['*', '✦'].map((s, i) => (
        <text key={i} x={100 - bw * 1.1 + i * 30} y={130 - bh * 0.8} fontSize="14" fill="#FFD700" textAnchor="middle">{s}</text>
      ))}
    </svg>
  )
}

function ActivityClimbing({ color, bodyScale, darkColor, lightColor }) {
  const bw = 80 * bodyScale
  const bh = 48 * bodyScale
  return (
    <svg width="200" height="220" viewBox="0 0 200 220">
      {/* Climbing wall */}
      <rect x="10" y="0" width="75" height="220" fill="#4a5A80" rx="3" />
      {/* Holds */}
      {[[25,30],[55,50],[30,80],[60,100],[25,130],[55,155],[35,185]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="6" fill={['#e74c3c','#2ecc71','#3498db','#f1c40f','#e74c3c','#9b59b6','#2ecc71'][i]} />
      ))}
      {/* Capybara diagonal on wall */}
      <g transform="rotate(-15, 100, 100)">
        <CapybaraBase color={color} bodyScale={bodyScale * 0.8} darkColor={darkColor} lightColor={lightColor} />
        {/* Arms reaching up */}
        <line x1={100 - bw * 0.5} y1={100} x2="55" y2="100" stroke={color} strokeWidth={9 * bodyScale} strokeLinecap="round" />
        <line x1={100 + bw * 0.5} y1={100} x2="25" y2="80" stroke={color} strokeWidth={9 * bodyScale} strokeLinecap="round" />
        {/* Legs on holds */}
        <line x1={100 - bw * 0.4} y1="158" x2="35" y2="155" stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
        <line x1={100 + bw * 0.4} y1="155" x2="60" y2="155" stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      </g>
    </svg>
  )
}

function ActivityYoga({ color, bodyScale, darkColor, lightColor }) {
  const bw = 80 * bodyScale
  const bh = 48 * bodyScale
  return (
    <svg width="200" height="220" viewBox="0 0 200 220">
      {/* Yoga mat */}
      <rect x="20" y="185" width="160" height="12" fill="#6BB8A0" rx="4" opacity="0.8" />
      {/* Capybara in tree pose */}
      <CapybaraBase color={color} bodyScale={bodyScale} darkColor={darkColor} lightColor={lightColor} />
      {/* One arm up, one out */}
      <line x1={100 - bw * 0.5} y1={130 - bh * 0.1} x2={100 - bw * 0.9} y2={130 - bh * 1.3} stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      <line x1={100 + bw * 0.5} y1={130 - bh * 0.1} x2={100 + bw * 1.1} y2={130 - bh * 0.2} stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
      {/* One leg standing, one bent */}
      <line x1={100 - bw * 0.35} y1={130 + bh * 0.9} x2={100 - bw * 0.35} y2={185} stroke={color} strokeWidth={12 * bodyScale} strokeLinecap="round" />
      <line x1={100 + bw * 0.35} y1={130 + bh * 0.9} x2={100 - bw * 0.1} y2={155} stroke={color} strokeWidth={12 * bodyScale} strokeLinecap="round" />
      {/* Stars / zen symbols */}
      <text x="155" y="70" fontSize="16" opacity="0.8">✨</text>
      <text x="35" y="90" fontSize="14" opacity="0.6">☮</text>
    </svg>
  )
}

function ActivityRunning({ color, bodyScale, darkColor, lightColor }) {
  const bw = 80 * bodyScale
  const bh = 48 * bodyScale
  return (
    <svg width="200" height="220" viewBox="0 0 200 220">
      {/* Motion lines */}
      {[0, 1, 2].map(i => (
        <line key={i} x1={30 - i * 15} y1={120 + i * 15} x2={55 - i * 15} y2={110 + i * 15}
          stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* Capybara leaning forward */}
      <g transform="rotate(-8, 100, 130)">
        <CapybaraBase color={color} bodyScale={bodyScale} darkColor={darkColor} lightColor={lightColor} />
        {/* Arms pumping */}
        <line x1={100 - bw * 0.5} y1={130 - bh * 0.1} x2={100 - bw * 0.9} y2={130 - bh * 0.7} stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
        <line x1={100 + bw * 0.5} y1={130 - bh * 0.1} x2={100 + bw * 0.8} y2={130 + bh * 0.2} stroke={color} strokeWidth={10 * bodyScale} strokeLinecap="round" />
        {/* Legs running */}
        <line x1={100 - bw * 0.35} y1={130 + bh * 0.9} x2={100 - bw * 0.7} y2={130 + bh * 1.8} stroke={color} strokeWidth={12 * bodyScale} strokeLinecap="round" />
        <line x1={100 + bw * 0.35} y1={130 + bh * 0.9} x2={100 + bw * 0.2} y2={130 + bh * 1.5} stroke={color} strokeWidth={12 * bodyScale} strokeLinecap="round" />
      </g>
      {/* Sweat */}
      <ellipse cx="150" cy="75" rx="3" ry="5" fill="#7EC8F8" opacity="0.7" />
      <ellipse cx="158" cy="88" rx="2" ry="4" fill="#7EC8F8" opacity="0.5" />
    </svg>
  )
}

const COLORS = {
  '#D4724A': { dark: '#8B3A1A', light: '#F0A080' },
  '#4A8FD4': { dark: '#1A4A8B', light: '#7ABEF0' },
  '#5BB85B': { dark: '#2A6A2A', light: '#8AE08A' },
}

export default function Capybara({ name, weight, initialWeight, color, activity, size = 1 }) {
  const bodyScale = getBodyScale(weight, initialWeight) * size
  const { dark, light } = COLORS[color] || { dark: '#5a3a1a', light: '#d4a080' }

  const props = { color, bodyScale, darkColor: dark, lightColor: light }

  const ActivityComponents = {
    lifting: ActivityLifting,
    cycling: ActivityCycling,
    pullup: ActivityPullup,
    boxing: ActivityBoxing,
    climbing: ActivityClimbing,
    yoga: ActivityYoga,
    running: ActivityRunning,
  }

  const ActivityComponent = ActivityComponents[activity] || ActivityLifting

  return (
    <div style={{ display: 'inline-block', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.35))' }}>
      <ActivityComponent {...props} />
    </div>
  )
}
