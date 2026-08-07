export default function Rankings({ participants, challenge, currentWeek, onClose }) {
  const getLatest = (p) => {
    if (!p.entries?.length) return p.initialWeight
    return p.entries[p.entries.length - 1].weight
  }
  const getLost = (p) => (p.initialWeight - getLatest(p)).toFixed(1)
  const getPct = (p) => (((p.initialWeight - getLatest(p)) / p.initialWeight) * 100).toFixed(2)
  const getWeeksWithData = (p) => (p.entries?.length || 1)

  const ranked = [...participants].sort((a, b) => parseFloat(getPct(b)) - parseFloat(getPct(a)))
  const medals = ['🥇', '🥈', '🥉']

  const startDate = new Date(challenge?.startDate || '2026-07-20')
  const endDate = new Date(challenge?.endDate || '2026-09-20')
  const today = new Date()
  const elapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
  const total = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))
  const progressPct = Math.min(Math.max((elapsed / total) * 100, 0), 100)

  return (
    <div className="rankings-overlay" onClick={onClose}>
      <div className="rankings-panel" onClick={e => e.stopPropagation()}>
        <div className="rankings-title">🦦 Capibara's Challenge</div>

        {/* Challenge timeline */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
            <span>20 Jul 2026</span>
            <span style={{ color: '#FFE566', fontWeight: 700 }}>Semana {currentWeek} de {challenge?.totalWeeks || 9}</span>
            <span>20 Sep 2026</span>
          </div>
          <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #4A8FD4, #5EFF99)',
              borderRadius: 5,
              transition: 'width 1s ease',
            }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.6, marginTop: 4 }}>
            {elapsed} días transcurridos · {total - elapsed} días restantes
          </div>
        </div>

        {/* Ranking rows */}
        {ranked.map((p, i) => {
          const lost = parseFloat(getLost(p))
          const pct = parseFloat(getPct(p))
          const progress = Math.min((pct / 10) * 100, 100)
          const weekAvg = lost > 0 ? (lost / Math.max(getWeeksWithData(p) - 1, 1)).toFixed(2) : '—'
          const weeksToGoal = lost > 0 && pct < 10
            ? Math.ceil((p.initialWeight * 0.10 - lost) / (lost / Math.max(getWeeksWithData(p) - 1, 1)))
            : 0

          return (
            <div key={p.id} className="ranking-row">
              <div className="rank-medal">{medals[i]}</div>
              <div className="rank-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: p.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}>
                    {p.avatar ?? p.name[0]}
                  </div>
                  <span className="rank-name">{p.name}</span>
                </div>
                <div className="rank-stats">
                  Inicio: {p.initialWeight} kg · Actual: {getLatest(p)} kg · Meta: {p.goalWeight} kg
                  {weekAvg !== '—' && ` · Promedio: −${weekAvg} kg/sem`}
                  {weeksToGoal > 0 && ` · ~${weeksToGoal} sem para meta`}
                  {pct >= 10 && ' · ✅ META ALCANZADA!'}
                </div>
                <div className="rank-progress" style={{ marginTop: 6 }}>
                  <div className="rank-fill" style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${p.color}, #5EFF99)`,
                  }} />
                </div>
                {/* Weekly history mini-chart */}
                {p.entries?.length > 1 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, alignItems: 'flex-end' }}>
                    {p.entries.map((entry, ei) => {
                      const lost = p.initialWeight - entry.weight
                      const bar = Math.min((lost / (p.initialWeight * 0.1)) * 32, 32)
                      return (
                        <div key={ei} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <div style={{
                            width: 18, height: Math.max(bar, 2),
                            background: `${p.color}cc`,
                            borderRadius: '2px 2px 0 0',
                          }} />
                          <div style={{ fontSize: 9, opacity: 0.5 }}>S{entry.week}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="rank-pct">
                {pct}%
                {pct >= 10 && <div style={{ fontSize: 18 }}>🎉</div>}
              </div>
            </div>
          )
        })}

        <button className="close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}
