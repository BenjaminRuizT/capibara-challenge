import { useState, useEffect } from 'react'
import Scene from './components/Scene'
import AdminPanel from './components/AdminPanel'

const AVATARS = { david: '🏋️', benjamin: '🚴', daniel: '🤸' }

const INITIAL_DATA = {
  challenge: { name: "Capibara's Challenge", startDate: '2026-07-20', endDate: '2026-09-20', goalPercent: 10, totalWeeks: 9 },
  participants: [
    { id: 'david',    name: 'David',    color: '#D4724A', initialWeight: 147.5, goalWeight: 132.75, height: null, entries: [{ week: 0, date: '2026-07-20', weight: 147.5 }] },
    { id: 'benjamin', name: 'Benjamin', color: '#4A8FD4', initialWeight: 96.5,  goalWeight: 86.85,  height: null, entries: [{ week: 0, date: '2026-07-20', weight: 96.5  }] },
    { id: 'daniel',   name: 'Daniel',   color: '#5BB85B', initialWeight: 109,   goalWeight: 98.1,   height: null, entries: [{ week: 0, date: '2026-07-20', weight: 109   }] },
  ],
  settings: { background: 'prairie', animations: { clouds: true, birds: true, leaves: true, water: true }, timeMode: 'auto' },
}

function addAvatars(participants) {
  return participants.map(p => ({ ...p, avatar: AVATARS[p.id] ?? '🦦' }))
}

export default function App() {
  const [data, setData]         = useState(INITIAL_DATA)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.json())
      .then(d => setData({ ...d, participants: addAvatars(d.participants) }))
      .catch(() => {})
  }, [])

  const getCurrentWeek = () => {
    const start = new Date(data.challenge.startDate || '2026-07-20')
    const diff  = Math.floor((new Date() - start) / (7 * 24 * 60 * 60 * 1000))
    return Math.max(0, Math.min(diff, data.challenge.totalWeeks || 9))
  }

  const handleWeightSaved = (updated) => {
    setData(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === updated.id ? { ...updated, avatar: AVATARS[updated.id] ?? '🦦' } : p
      ),
    }))
  }

  const handleSettingsSaved = (newSettings) => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }))
  }

  const handleDataRefresh = (newData) => {
    setData({ ...newData, participants: addAvatars(newData.participants) })
  }

  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <Scene
        participants={data.participants}
        challenge={data.challenge}
        currentWeek={getCurrentWeek()}
        settings={data.settings}
        onAdminToggle={() => setShowAdmin(v => !v)}
      />
      {showAdmin && (
        <AdminPanel
          participants={data.participants}
          challenge={data.challenge}
          settings={data.settings}
          currentWeek={getCurrentWeek()}
          onWeightSaved={handleWeightSaved}
          onSettingsSaved={handleSettingsSaved}
          onDataRefresh={handleDataRefresh}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  )
}
