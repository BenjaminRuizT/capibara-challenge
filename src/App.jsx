import { useState, useEffect } from 'react'
import Scene from './components/Scene'
import Rankings from './components/Rankings'
import AdminPanel from './components/AdminPanel'

const INITIAL_DATA = {
  challenge: { name: "Capibara's Challenge", startDate: '2026-07-20', endDate: '2026-09-20', goalPercent: 10, totalWeeks: 9 },
  participants: [
    { id: 'david',    name: 'David',    color: '#D4724A', avatar: '🏋️', initialWeight: 147.5, goalWeight: 132.75, entries: [{ week: 0, date: '2026-07-20', weight: 147.5 }] },
    { id: 'benjamin', name: 'Benjamin', color: '#4A8FD4', avatar: '🚴', initialWeight: 96.5,  goalWeight: 86.85,  entries: [{ week: 0, date: '2026-07-20', weight: 96.5  }] },
    { id: 'daniel',   name: 'Daniel',   color: '#5BB85B', avatar: '🤸', initialWeight: 109,   goalWeight: 98.1,   entries: [{ week: 0, date: '2026-07-20', weight: 109   }] }
  ]
}

export default function App() {
  const [data, setData] = useState(INITIAL_DATA)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showRankings, setShowRankings] = useState(false)
  const [titleClicks, setTitleClicks] = useState(0)

  useEffect(() => {
    fetch('/api/weights')
      .then(r => r.json())
      .then(d => setData(prev => ({
        ...d,
        participants: d.participants.map(p => ({
          ...p,
          avatar: INITIAL_DATA.participants.find(ip => ip.id === p.id)?.avatar ?? '🦦',
        })),
      })))
      .catch(() => {})
  }, [])

  const handleTitleClick = () => {
    setTitleClicks(prev => {
      const next = prev + 1
      if (next >= 5) { setShowAdmin(true); return 0 }
      return next
    })
  }

  const handleWeightSaved = (updated) => {
    setData(prev => ({
      ...prev,
      participants: prev.participants.map(p => p.id === updated.id ? updated : p)
    }))
  }

  const getCurrentWeek = () => {
    const start = new Date('2026-07-20')
    const now = new Date()
    const diff = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000))
    return Math.max(0, Math.min(diff, 9))
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Scene
        participants={data.participants}
        currentWeek={getCurrentWeek()}
        onTitleClick={handleTitleClick}
        onRankingsToggle={() => setShowRankings(v => !v)}
        onAdminToggle={() => setShowAdmin(v => !v)}
        showRankings={showRankings}
      />
      {showRankings && (
        <Rankings
          participants={data.participants}
          challenge={data.challenge}
          currentWeek={getCurrentWeek()}
          onClose={() => setShowRankings(false)}
        />
      )}
      {showAdmin && (
        <AdminPanel
          participants={data.participants}
          currentWeek={getCurrentWeek()}
          onSaved={handleWeightSaved}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  )
}
