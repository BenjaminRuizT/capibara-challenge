import express from 'express'
import pkg from 'pg'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Pool } = pkg
const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'capibara2026'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      color VARCHAR(20),
      initial_weight NUMERIC(6,2) NOT NULL,
      goal_weight NUMERIC(6,2),
      height NUMERIC(5,1),
      avatar VARCHAR(20)
    );
    CREATE TABLE IF NOT EXISTS weight_entries (
      id SERIAL PRIMARY KEY,
      participant_id VARCHAR(50) REFERENCES participants(id),
      week INTEGER NOT NULL,
      entry_date DATE NOT NULL,
      weight NUMERIC(6,2) NOT NULL,
      UNIQUE(participant_id, week)
    );
    CREATE TABLE IF NOT EXISTS challenge_config (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT
    );
  `)

  const { rows } = await pool.query('SELECT COUNT(*) FROM participants')
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO participants (id, name, color, initial_weight, goal_weight, height, avatar) VALUES
      ('david',    'David',    '#D4724A', 147.5, 132.75, NULL, '🏋️'),
      ('benjamin', 'Benjamin', '#4A8FD4',  96.5,  86.85, NULL, '🚴'),
      ('daniel',   'Daniel',   '#5BB85B', 109.0,  98.10, NULL, '🤸')
    `)
    await pool.query(`
      INSERT INTO weight_entries (participant_id, week, entry_date, weight) VALUES
      ('david',    0, '2026-07-20', 147.5),
      ('benjamin', 0, '2026-07-20',  96.5),
      ('daniel',   0, '2026-07-20', 109.0)
    `)
    await pool.query(`
      INSERT INTO challenge_config (key, value) VALUES
      ('name',        'Capibara''s Challenge'),
      ('startDate',   '2026-07-20'),
      ('endDate',     '2026-09-20'),
      ('goalPercent', '10'),
      ('totalWeeks',  '9')
    `)
    await pool.query(`
      INSERT INTO app_settings (key, value) VALUES
      ('background',  'prairie'),
      ('animations',  '{"clouds":true,"birds":true,"leaves":true,"water":true}'),
      ('timeMode',    'auto')
    `)
  }
}

async function getData() {
  const [pRes, eRes, cRes, sRes] = await Promise.all([
    pool.query('SELECT * FROM participants ORDER BY id'),
    pool.query('SELECT * FROM weight_entries ORDER BY participant_id, week'),
    pool.query('SELECT * FROM challenge_config'),
    pool.query('SELECT * FROM app_settings'),
  ])

  const challenge = {}
  cRes.rows.forEach(r => { challenge[r.key] = r.value })
  challenge.goalPercent = parseFloat(challenge.goalPercent) || 10
  challenge.totalWeeks  = parseInt(challenge.totalWeeks)   || 9

  const settings = {}
  sRes.rows.forEach(r => { settings[r.key] = r.value })
  if (typeof settings.animations === 'string') {
    try { settings.animations = JSON.parse(settings.animations) } catch { settings.animations = {} }
  }

  const participants = pRes.rows.map(p => ({
    id:            p.id,
    name:          p.name,
    color:         p.color,
    initialWeight: parseFloat(p.initial_weight),
    goalWeight:    parseFloat(p.goal_weight),
    height:        p.height ? parseFloat(p.height) : null,
    avatar:        p.avatar,
    entries: eRes.rows
      .filter(e => e.participant_id === p.id)
      .map(e => ({
        week:   e.week,
        date:   e.entry_date.toISOString().slice(0, 10),
        weight: parseFloat(e.weight),
      })),
  }))

  return { challenge, participants, settings }
}

app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

app.get('/api/data', async (_req, res) => {
  try   { res.json(await getData()) }
  catch (err) { console.error(err); res.status(500).json({ error: 'Error al leer datos' }) }
})

app.post('/api/weights', async (req, res) => {
  const { password, participantId, week, date, weight } = req.body
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Contraseña incorrecta' })
  if (!participantId || week === undefined || !date || weight === undefined)
    return res.status(400).json({ error: 'Datos incompletos' })
  try {
    await pool.query(`
      INSERT INTO weight_entries (participant_id, week, entry_date, weight)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (participant_id, week)
      DO UPDATE SET entry_date = EXCLUDED.entry_date, weight = EXCLUDED.weight
    `, [participantId, parseInt(week), date, parseFloat(weight)])
    const data = await getData()
    res.json({ success: true, participant: data.participants.find(p => p.id === participantId) })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error al guardar peso' }) }
})

app.post('/api/settings', async (req, res) => {
  const { password, settings } = req.body
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Contraseña incorrecta' })
  try {
    for (const [key, value] of Object.entries(settings)) {
      const val = typeof value === 'object' ? JSON.stringify(value) : String(value)
      await pool.query(
        'INSERT INTO app_settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',
        [key, val]
      )
    }
    res.json({ success: true })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error al guardar configuración' }) }
})

app.post('/api/challenge', async (req, res) => {
  const { password, config } = req.body
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Contraseña incorrecta' })
  try {
    for (const [key, value] of Object.entries(config)) {
      await pool.query(
        'INSERT INTO challenge_config(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value',
        [key, String(value)]
      )
    }
    res.json({ success: true })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error al guardar evento' }) }
})

app.post('/api/participant', async (req, res) => {
  const { password, id, name, color, initialWeight, goalWeight, height, avatar } = req.body
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Contraseña incorrecta' })
  try {
    await pool.query(`
      UPDATE participants
      SET name=$2, color=$3, initial_weight=$4, goal_weight=$5, height=$6, avatar=$7
      WHERE id=$1
    `, [id, name, color, parseFloat(initialWeight), parseFloat(goalWeight), height ? parseFloat(height) : null, avatar])
    const data = await getData()
    res.json({ success: true, data })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Error al actualizar participante' }) }
})

app.get('*', (_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

initDB()
  .then(() => app.listen(PORT, () => console.log(`Capibara's Challenge en puerto ${PORT}`)))
  .catch(err => { console.error('DB init error:', err); process.exit(1) })
