import { useState, useEffect, useRef } from 'react'
import Scene from './components/Scene'
import AdminDashboard from './components/AdminDashboard'
import LoginPage from './components/LoginPage'
import EventHub from './components/EventHub'
import DataEntry from './components/DataEntry'

function UpdateBanner() {
  const [show, setShow] = useState(false)
  const dismissed = useRef(false)

  useEffect(() => {
    const check = async () => {
      if (dismissed.current) return
      try {
        const r = await fetch('/api/version', { cache: 'no-store' })
        const { version } = await r.json()
        if (version && version !== __APP_VERSION__) setShow(true)
      } catch {}
    }
    check()
    const id = setInterval(check, 5 * 60 * 1000) // cada 5 min
    return () => clearInterval(id)
  }, [])

  if (!show) return null
  return (
    <div className="update-banner">
      <span>🚀 Nueva versión disponible</span>
      <button className="update-banner-btn" onClick={() => window.location.reload()}>Actualizar</button>
      <button className="update-banner-dismiss" onClick={() => { setShow(false); dismissed.current = true }}>✕</button>
    </div>
  )
}

const apiFetch = async (url, opts = {}) => {
  const token = localStorage.getItem('cc_token')
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
  return res.json()
}

function addAvatars(participants) {
  return participants.map(p => ({ ...p, avatar: p.avatar || '🦦' }))
}

export default function App() {
  const [auth,          setAuth]          = useState(null)
  const [view,          setView]          = useState('loading')
  const [data,          setData]          = useState(null)
  const [showAdmin,     setShowAdmin]     = useState(false)
  const [showDataEntry, setShowDataEntry] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    if (!token) { setView('login'); return }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ user }) => {
        if (user) { setAuth({ user, token }); setView('hub') }
        else { localStorage.removeItem('cc_token'); setView('login') }
      })
      .catch(() => setView('login'))
  }, [])

  const handleLogin = ({ user, token }) => {
    localStorage.setItem('cc_token', token)
    setAuth({ user, token })
    setView('hub')
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('cc_token')
    if (token) await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    localStorage.removeItem('cc_token')
    setAuth(null); setData(null); setView('login')
  }

  const loadEventData = async () => {
    const d = await apiFetch('/api/data')
    if (d.participants) setData({ ...d, participants: addAvatars(d.participants) })
    return d
  }

  const handleSelectEvent = async () => {
    await loadEventData()
    setView('event')
  }

  const getCurrentWeek = () => {
    if (!data?.challenge?.startDate) return 0
    const start = new Date(data.challenge.startDate)
    const diff  = Math.floor((new Date() - start) / (7 * 24 * 60 * 60 * 1000))
    return Math.max(0, Math.min(diff, data.challenge.totalWeeks || 9))
  }

  if (view === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#1a1a2e', color: '#fff', fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: 700 }}>
      🦦 Cargando...
    </div>
  )

  if (view === 'login') return <><UpdateBanner /><LoginPage onLogin={handleLogin} /></>

  if (view === 'hub') return (
    <><UpdateBanner /><EventHub auth={auth} onSelectEvent={handleSelectEvent} onLogout={handleLogout} api={apiFetch} /></>
  )

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#1a1a2e', color: '#fff', fontFamily: 'Nunito, sans-serif', fontSize: 18 }}>
      Cargando evento...
    </div>
  )

  const isAdmin       = auth?.user?.role === 'admin'
  const isParticipant = auth?.user?.role === 'participant'

  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <UpdateBanner />
      <Scene
        participants={data.participants}
        challenge={data.challenge}
        currentWeek={getCurrentWeek()}
        settings={data.settings}
        userRole={auth?.user?.role}
        onAdminToggle={() => isAdmin ? setShowAdmin(v => !v) : isParticipant ? setShowDataEntry(v => !v) : null}
        onBackToHub={() => { setView('hub'); setShowAdmin(false); setShowDataEntry(false) }}
      />
      {showAdmin && isAdmin && (
        <AdminDashboard
          auth={auth}
          api={apiFetch}
          participants={data.participants}
          challenge={data.challenge}
          settings={data.settings}
          eventId={data.event?.id}
          currentWeek={getCurrentWeek()}
          onClose={() => setShowAdmin(false)}
          onRefresh={loadEventData}
        />
      )}
      {showDataEntry && isParticipant && (
        <DataEntry
          auth={auth}
          api={apiFetch}
          eventId={data.event?.id}
          factors={data.factors || []}
          currentWeek={getCurrentWeek()}
          participants={data.participants}
          onClose={() => setShowDataEntry(false)}
        />
      )}
    </div>
  )
}
