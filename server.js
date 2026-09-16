import express from 'express'
import pkg from 'pg'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import multer from 'multer'
import { join, dirname, extname } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const { Pool } = pkg
const __dirname = dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3001
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'capibara2026'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
})

app.use(express.json({ limit: '10mb' }))
app.use(express.static(join(__dirname, 'dist')))

// ── Multer ───────────────────────────────────────────────
const uploadDir = join(__dirname, 'public', 'uploads')
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, f, cb)  => cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${extname(f.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })
app.use('/uploads', express.static(join(__dirname, 'public', 'uploads')))

// ── DB ───────────────────────────────────────────────────
async function initDB() {
  const c = await pool.connect()
  try {
    await c.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           SERIAL PRIMARY KEY,
        username     VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role         VARCHAR(20) NOT NULL DEFAULT 'participant',
        photo_url    TEXT,
        active       BOOLEAN DEFAULT true,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token      VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS events (
        id                 SERIAL PRIMARY KEY,
        name               VARCHAR(200) NOT NULL,
        description        TEXT,
        start_date         DATE,
        end_date           DATE,
        goal_pct           DECIMAL(5,2)  DEFAULT 10.0,
        total_weeks        INTEGER       DEFAULT 9,
        status             VARCHAR(20)   DEFAULT 'draft',
        theme_settings     JSONB         DEFAULT '{}',
        bg_image_url       TEXT,
        entry_fee          DECIMAL(10,2),
        entry_fee_currency VARCHAR(10)   DEFAULT 'MXN',
        prize_config       JSONB         DEFAULT '{"type":"winner_takes_all"}',
        created_by         INTEGER REFERENCES users(id),
        created_at         TIMESTAMPTZ   DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS event_participants (
        id              SERIAL PRIMARY KEY,
        event_id        INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
        initial_weight  DECIMAL(6,2),
        initial_data    JSONB DEFAULT '{}',
        avatar_emoji    VARCHAR(20) DEFAULT '🏃',
        color           VARCHAR(10) DEFAULT '#4A8FD4',
        fee_paid        BOOLEAN DEFAULT false,
        fee_amount_paid DECIMAL(10,2) DEFAULT 0,
        fee_paid_at     TIMESTAMPTZ,
        joined_at       TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(event_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS event_factors (
        id          SERIAL PRIMARY KEY,
        event_id    INTEGER REFERENCES events(id) ON DELETE CASCADE,
        factor_type VARCHAR(50) NOT NULL,
        label       VARCHAR(100),
        weight_pct  DECIMAL(5,2) DEFAULT 0,
        config      JSONB DEFAULT '{}',
        active      BOOLEAN DEFAULT false,
        UNIQUE(event_id, factor_type)
      );
      CREATE TABLE IF NOT EXISTS event_penalties (
        id           SERIAL PRIMARY KEY,
        event_id     INTEGER REFERENCES events(id) ON DELETE CASCADE,
        name         VARCHAR(200) NOT NULL,
        description  TEXT,
        factor_type  VARCHAR(50),
        penalty_type VARCHAR(20) DEFAULT 'points',
        amount       DECIMAL(10,2) NOT NULL DEFAULT 5,
        trigger_type VARCHAR(50)   DEFAULT 'manual'
      );
      CREATE TABLE IF NOT EXISTS penalty_applications (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        penalty_id INTEGER REFERENCES event_penalties(id) ON DELETE CASCADE,
        week       INTEGER,
        reason     TEXT,
        applied_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS weight_entries_v2 (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week       INTEGER NOT NULL,
        entry_date DATE,
        weight     DECIMAL(6,2) NOT NULL,
        logged_by  INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(event_id, user_id, week)
      );
      CREATE TABLE IF NOT EXISTS activity_entries (
        id             SERIAL PRIMARY KEY,
        event_id       INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
        entry_date     DATE NOT NULL,
        week           INTEGER,
        steps          INTEGER DEFAULT 0,
        active_minutes INTEGER DEFAULT 0,
        UNIQUE(event_id, user_id, entry_date)
      );
      CREATE TABLE IF NOT EXISTS hydration_entries (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        entry_date DATE NOT NULL,
        week       INTEGER,
        glasses    INTEGER DEFAULT 0,
        UNIQUE(event_id, user_id, entry_date)
      );
      CREATE TABLE IF NOT EXISTS sleep_entries (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        entry_date DATE NOT NULL,
        week       INTEGER,
        hours      DECIMAL(4,2) DEFAULT 0,
        quality    INTEGER DEFAULT 3,
        UNIQUE(event_id, user_id, entry_date)
      );
      CREATE TABLE IF NOT EXISTS nutrition_entries (
        id                SERIAL PRIMARY KEY,
        event_id          INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id           INTEGER REFERENCES users(id) ON DELETE CASCADE,
        entry_date        DATE NOT NULL,
        week              INTEGER,
        calories_consumed INTEGER DEFAULT 0,
        calories_target   INTEGER DEFAULT 2000,
        UNIQUE(event_id, user_id, entry_date)
      );
      CREATE TABLE IF NOT EXISTS measurement_entries (
        id            SERIAL PRIMARY KEY,
        event_id      INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week          INTEGER NOT NULL,
        waist_cm      DECIMAL(5,2),
        body_fat_pct  DECIMAL(5,2),
        UNIQUE(event_id, user_id, week)
      );
      CREATE TABLE IF NOT EXISTS weekly_challenges (
        id          SERIAL PRIMARY KEY,
        event_id    INTEGER REFERENCES events(id) ON DELETE CASCADE,
        week        INTEGER NOT NULL,
        title       VARCHAR(200),
        description TEXT,
        UNIQUE(event_id, week)
      );
      CREATE TABLE IF NOT EXISTS challenge_completions (
        id        SERIAL PRIMARY KEY,
        event_id  INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week      INTEGER NOT NULL,
        completed BOOLEAN DEFAULT false,
        UNIQUE(event_id, user_id, week)
      );
      CREATE TABLE IF NOT EXISTS habit_checkins (
        id         SERIAL PRIMARY KEY,
        event_id   INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        entry_date DATE NOT NULL,
        week       INTEGER,
        completed  BOOLEAN DEFAULT true,
        UNIQUE(event_id, user_id, entry_date)
      );
      CREATE TABLE IF NOT EXISTS social_votes (
        id       SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        voter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        voted_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week     INTEGER NOT NULL,
        points   INTEGER DEFAULT 1,
        UNIQUE(event_id, voter_id, voted_id, week)
      );
      CREATE TABLE IF NOT EXISTS attendance_entries (
        id           SERIAL PRIMARY KEY,
        event_id     INTEGER REFERENCES events(id) ON DELETE CASCADE,
        user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_date DATE NOT NULL,
        week         INTEGER,
        attended     BOOLEAN DEFAULT true,
        UNIQUE(event_id, user_id, session_date)
      );
    `)

    // Seed admin
    const { rows: adm } = await c.query("SELECT id FROM users WHERE username='admin'")
    if (!adm.length) {
      const h = await bcrypt.hash(ADMIN_PASSWORD, 10)
      await c.query("INSERT INTO users(username,display_name,password_hash,role) VALUES('admin','Administrador',$1,'admin')", [h])
      console.log('Admin creado → usuario: admin / contraseña:', ADMIN_PASSWORD)
    }
    const { rows: vis } = await c.query("SELECT id FROM users WHERE username='visitante'")
    if (!vis.length) {
      const h = await bcrypt.hash('visitante', 10)
      await c.query("INSERT INTO users(username,display_name,password_hash,role) VALUES('visitante','Visitante',$1,'visitor')", [h])
    }

    // Migrate legacy data
    const { rows: [{ count }] } = await c.query('SELECT COUNT(*) FROM events')
    if (count === '0') {
      const { rows: oldParts } = await c.query('SELECT * FROM participants').catch(() => ({ rows: [] }))
      if (oldParts.length) {
        const { rows: oldCfg } = await c.query('SELECT * FROM challenge_config').catch(() => ({ rows: [] }))
        const { rows: oldStg } = await c.query('SELECT * FROM app_settings').catch(() => ({ rows: [] }))
        const cfg = Object.fromEntries(oldCfg.map(r => [r.key, r.value]))
        const stg = Object.fromEntries(oldStg.map(r => [r.key, r.value]))
        const { rows: [admin] } = await c.query("SELECT id FROM users WHERE username='admin'")
        const theme = {
          background: stg.background || 'prairie',
          animations: stg.animations ? JSON.parse(stg.animations) : { clouds: true, birds: true, leaves: true, water: true },
          timeMode: stg.timeMode || 'auto',
        }
        const { rows: [ev] } = await c.query(
          `INSERT INTO events(name,start_date,end_date,goal_pct,total_weeks,status,theme_settings,created_by)
           VALUES($1,$2,$3,$4,$5,'active',$6,$7) RETURNING id`,
          [cfg.name || "Capibara's Challenge", cfg.startDate || '2026-07-20', cfg.endDate || '2026-09-20',
           parseFloat(cfg.goalPercent) || 10, parseInt(cfg.totalWeeks) || 9, JSON.stringify(theme), admin.id]
        )
        await c.query(`INSERT INTO event_factors(event_id,factor_type,label,weight_pct,active) VALUES($1,'weight','Peso corporal',100,true)`, [ev.id])
        const photoMap = { david: '/david.png', benjamin: '/benja.png', daniel: '/dany.png' }
        for (const p of oldParts) {
          const h = await bcrypt.hash(p.id, 10)
          const { rows: [u] } = await c.query(
            `INSERT INTO users(username,display_name,password_hash,role,photo_url) VALUES($1,$2,$3,'participant',$4)
             ON CONFLICT(username) DO UPDATE SET display_name=$2 RETURNING id`,
            [p.id, p.name, h, photoMap[p.id] || `/${p.id}.png`]
          )
          await c.query(
            `INSERT INTO event_participants(event_id,user_id,initial_weight,color,avatar_emoji)
             VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
            [ev.id, u.id, p.initial_weight, p.color, p.avatar]
          )
          const { rows: weights } = await c.query('SELECT * FROM weight_entries WHERE participant_id=$1', [p.id]).catch(() => ({ rows: [] }))
          for (const w of weights) {
            await c.query(
              `INSERT INTO weight_entries_v2(event_id,user_id,week,weight,entry_date,logged_by) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
              [ev.id, u.id, w.week, w.weight, w.entry_date, admin.id]
            )
          }
        }
        console.log('Migración legacy completada')
      }
    }
  } finally { c.release() }
}

// ── Auth middleware ──────────────────────────────────────
function authMw(roles = []) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No autenticado' })
    const { rows } = await pool.query(
      `SELECT s.user_id AS id, u.role, u.active, u.username, u.display_name, u.photo_url
       FROM sessions s JOIN users u ON u.id=s.user_id
       WHERE s.token=$1 AND s.expires_at > NOW()`,
      [token]
    ).catch(() => ({ rows: [] }))
    if (!rows.length) return res.status(401).json({ error: 'Sesión inválida o expirada' })
    if (!rows[0].active) return res.status(403).json({ error: 'Usuario inactivo' })
    if (roles.length && !roles.includes(rows[0].role)) return res.status(403).json({ error: 'Sin permiso' })
    req.user = rows[0]
    next()
  }
}
const isAdmin = authMw(['admin'])
const isAuth  = authMw(['admin', 'participant'])
const isAny   = authMw(['admin', 'participant', 'visitor'])

// ── Auth ─────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  const { rows } = await pool.query('SELECT * FROM users WHERE username=$1 AND active=true', [username])
  if (!rows.length || !await bcrypt.compare(password, rows[0].password_hash))
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  const token = randomBytes(48).toString('hex')
  await pool.query("INSERT INTO sessions(user_id,token,expires_at) VALUES($1,$2,NOW()+INTERVAL'30 days')", [rows[0].id, token])
  const u = rows[0]
  res.json({ token, user: { id: u.id, username: u.username, display_name: u.display_name, role: u.role, photo_url: u.photo_url } })
})
app.post('/api/auth/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token) await pool.query('DELETE FROM sessions WHERE token=$1', [token])
  res.json({ ok: true })
})
app.get('/api/auth/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.json({ user: null })
  const { rows } = await pool.query(
    `SELECT u.id,u.username,u.display_name,u.role,u.photo_url FROM sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token=$1 AND s.expires_at > NOW() AND u.active=true`, [token]
  )
  res.json({ user: rows[0] || null })
})

// ── Users ────────────────────────────────────────────────
app.get('/api/users', isAdmin, async (req, res) => {
  const { rows } = await pool.query('SELECT id,username,display_name,role,photo_url,active,created_at FROM users ORDER BY created_at')
  res.json(rows)
})
app.post('/api/users', isAdmin, async (req, res) => {
  const { username, display_name, password, role = 'participant', photo_url } = req.body
  if (!username || !display_name || !password) return res.status(400).json({ error: 'Faltan campos requeridos' })
  try {
    const h = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO users(username,display_name,password_hash,role,photo_url) VALUES($1,$2,$3,$4,$5) RETURNING id,username,display_name,role,photo_url,active',
      [username, display_name, h, role, photo_url]
    )
    res.json(rows[0])
  } catch (e) {
    if (e.constraint === 'users_username_key') return res.status(409).json({ error: 'Ese nombre de usuario ya existe' })
    throw e
  }
})
app.put('/api/users/:id', isAdmin, async (req, res) => {
  const { display_name, password, role, photo_url, active } = req.body
  if (password) {
    const h = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [h, req.params.id])
  }
  const { rows } = await pool.query(
    `UPDATE users SET display_name=COALESCE($1,display_name),role=COALESCE($2,role),photo_url=COALESCE($3,photo_url),active=COALESCE($4,active)
     WHERE id=$5 RETURNING id,username,display_name,role,photo_url,active`,
    [display_name, role, photo_url, active, req.params.id]
  )
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' })
  res.json(rows[0])
})
app.delete('/api/users/:id', isAdmin, async (req, res) => {
  if (String(req.user.id) === req.params.id) return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' })
  await pool.query('DELETE FROM users WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

// ── Events ───────────────────────────────────────────────
app.get('/api/events', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.*,COUNT(DISTINCT ep.user_id) AS participant_count,u.display_name AS created_by_name
     FROM events e LEFT JOIN event_participants ep ON ep.event_id=e.id LEFT JOIN users u ON u.id=e.created_by
     GROUP BY e.id,u.display_name ORDER BY e.created_at DESC`
  )
  res.json(rows)
})
app.get('/api/events/:id', async (req, res) => {
  const { rows: [ev] } = await pool.query('SELECT * FROM events WHERE id=$1', [req.params.id])
  if (!ev) return res.status(404).json({ error: 'Evento no encontrado' })
  const { rows: parts } = await pool.query(
    `SELECT ep.*,u.display_name,u.username,u.photo_url,
      COALESCE(json_agg(json_build_object('week',w.week,'weight',w.weight,'date',w.entry_date) ORDER BY w.week) FILTER(WHERE w.id IS NOT NULL),'[]') AS entries
     FROM event_participants ep JOIN users u ON u.id=ep.user_id
     LEFT JOIN weight_entries_v2 w ON w.event_id=ep.event_id AND w.user_id=ep.user_id
     WHERE ep.event_id=$1 GROUP BY ep.id,u.display_name,u.username,u.photo_url`,
    [req.params.id]
  )
  const { rows: factors }   = await pool.query('SELECT * FROM event_factors   WHERE event_id=$1 ORDER BY weight_pct DESC', [req.params.id])
  const { rows: penalties } = await pool.query('SELECT * FROM event_penalties WHERE event_id=$1', [req.params.id])
  res.json({ ...ev, participants: parts, factors, penalties })
})
app.post('/api/events', isAdmin, async (req, res) => {
  const { name, description, start_date, end_date, goal_pct, total_weeks, theme_settings, entry_fee, entry_fee_currency, prize_config } = req.body
  const { rows: [ev] } = await pool.query(
    `INSERT INTO events(name,description,start_date,end_date,goal_pct,total_weeks,theme_settings,entry_fee,entry_fee_currency,prize_config,created_by)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [name, description, start_date, end_date, goal_pct || 10, total_weeks || 9, JSON.stringify(theme_settings || {}),
     entry_fee || null, entry_fee_currency || 'MXN', JSON.stringify(prize_config || { type: 'winner_takes_all' }), req.user.id]
  )
  await pool.query("INSERT INTO event_factors(event_id,factor_type,label,weight_pct,active) VALUES($1,'weight','Peso corporal',100,true)", [ev.id])
  res.json(ev)
})
app.put('/api/events/:id', isAdmin, async (req, res) => {
  const { name, description, start_date, end_date, goal_pct, total_weeks, status, theme_settings, bg_image_url, entry_fee, entry_fee_currency, prize_config } = req.body
  const { rows: [ev] } = await pool.query(
    `UPDATE events SET
      name=COALESCE($1,name), description=COALESCE($2,description),
      start_date=COALESCE($3,start_date), end_date=COALESCE($4,end_date),
      goal_pct=COALESCE($5,goal_pct), total_weeks=COALESCE($6,total_weeks),
      status=COALESCE($7,status), theme_settings=COALESCE($8::jsonb,theme_settings),
      bg_image_url=COALESCE($9,bg_image_url), entry_fee=COALESCE($10,entry_fee),
      entry_fee_currency=COALESCE($11,entry_fee_currency), prize_config=COALESCE($12::jsonb,prize_config)
     WHERE id=$13 RETURNING *`,
    [name, description, start_date, end_date, goal_pct, total_weeks, status,
     theme_settings ? JSON.stringify(theme_settings) : null, bg_image_url,
     entry_fee, entry_fee_currency, prize_config ? JSON.stringify(prize_config) : null, req.params.id]
  )
  res.json(ev)
})
app.delete('/api/events/:id', isAdmin, async (req, res) => {
  await pool.query('DELETE FROM events WHERE id=$1', [req.params.id])
  res.json({ ok: true })
})

// ── Event participants ────────────────────────────────────
app.post('/api/events/:id/participants', isAdmin, async (req, res) => {
  const { user_id, initial_weight, initial_data, color, avatar_emoji } = req.body
  const { rows: [p] } = await pool.query(
    `INSERT INTO event_participants(event_id,user_id,initial_weight,initial_data,color,avatar_emoji)
     VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(event_id,user_id) DO UPDATE SET initial_weight=$3,initial_data=$4,color=$5,avatar_emoji=$6 RETURNING *`,
    [req.params.id, user_id, initial_weight, JSON.stringify(initial_data || {}), color || '#4A8FD4', avatar_emoji || '🏃']
  )
  res.json(p)
})
app.put('/api/events/:id/participants/:uid/fee', isAdmin, async (req, res) => {
  const { fee_paid, fee_amount_paid } = req.body
  const { rows: [p] } = await pool.query(
    `UPDATE event_participants SET fee_paid=$1,fee_amount_paid=$2,fee_paid_at=CASE WHEN $1 THEN NOW() ELSE NULL END
     WHERE event_id=$3 AND user_id=$4 RETURNING *`,
    [fee_paid, fee_amount_paid || 0, req.params.id, req.params.uid]
  )
  res.json(p)
})
app.delete('/api/events/:id/participants/:uid', isAdmin, async (req, res) => {
  await pool.query('DELETE FROM event_participants WHERE event_id=$1 AND user_id=$2', [req.params.id, req.params.uid])
  res.json({ ok: true })
})

// ── Factors ──────────────────────────────────────────────
app.put('/api/events/:id/factors', isAdmin, async (req, res) => {
  const { factors } = req.body
  const active = (factors || []).filter(f => f.active)
  const total  = active.reduce((s, f) => s + (parseFloat(f.weight_pct) || 0), 0)
  if (active.length && Math.abs(total - 100) > 0.5)
    return res.status(400).json({ error: `Factores activos deben sumar 100% (actual: ${total.toFixed(1)}%)` })
  for (const f of factors || []) {
    await pool.query(
      `INSERT INTO event_factors(event_id,factor_type,label,weight_pct,config,active)
       VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(event_id,factor_type) DO UPDATE SET label=$3,weight_pct=$4,config=$5,active=$6`,
      [req.params.id, f.factor_type, f.label, f.weight_pct || 0, JSON.stringify(f.config || {}), f.active || false]
    )
  }
  const { rows } = await pool.query('SELECT * FROM event_factors WHERE event_id=$1 ORDER BY weight_pct DESC', [req.params.id])
  res.json(rows)
})

// ── Penalties ────────────────────────────────────────────
app.get('/api/events/:id/penalties', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM event_penalties WHERE event_id=$1', [req.params.id])
  res.json(rows)
})
app.post('/api/events/:id/penalties', isAdmin, async (req, res) => {
  const { name, description, factor_type, penalty_type, amount, trigger_type } = req.body
  const { rows: [p] } = await pool.query(
    `INSERT INTO event_penalties(event_id,name,description,factor_type,penalty_type,amount,trigger_type)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.params.id, name, description, factor_type, penalty_type || 'points', amount || 5, trigger_type || 'manual']
  )
  res.json(p)
})
app.put('/api/events/:id/penalties/:pid', isAdmin, async (req, res) => {
  const { name, description, factor_type, penalty_type, amount, trigger_type } = req.body
  const { rows: [p] } = await pool.query(
    `UPDATE event_penalties SET name=$1,description=$2,factor_type=$3,penalty_type=$4,amount=$5,trigger_type=$6
     WHERE id=$7 AND event_id=$8 RETURNING *`,
    [name, description, factor_type, penalty_type, amount, trigger_type, req.params.pid, req.params.id]
  )
  res.json(p)
})
app.delete('/api/events/:id/penalties/:pid', isAdmin, async (req, res) => {
  await pool.query('DELETE FROM event_penalties WHERE id=$1 AND event_id=$2', [req.params.pid, req.params.id])
  res.json({ ok: true })
})
app.post('/api/events/:id/penalties/:pid/apply', isAdmin, async (req, res) => {
  const { user_id, week, reason } = req.body
  await pool.query(
    `INSERT INTO penalty_applications(event_id,user_id,penalty_id,week,reason,applied_by) VALUES($1,$2,$3,$4,$5,$6)`,
    [req.params.id, user_id, req.params.pid, week, reason, req.user.id]
  )
  res.json({ ok: true })
})
app.delete('/api/events/:id/penalties/applications/:appId', isAdmin, async (req, res) => {
  await pool.query('DELETE FROM penalty_applications WHERE id=$1 AND event_id=$2', [req.params.appId, req.params.id])
  res.json({ ok: true })
})
app.get('/api/events/:id/penalties/applications', isAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT pa.*,ep.name AS penalty_name,ep.penalty_type,ep.amount,u.display_name AS user_name
     FROM penalty_applications pa JOIN event_penalties ep ON ep.id=pa.penalty_id JOIN users u ON u.id=pa.user_id
     WHERE pa.event_id=$1 ORDER BY pa.created_at DESC`,
    [req.params.id]
  )
  res.json(rows)
})

// ── Data entry — 10 factores ─────────────────────────────
const tu = (req, uid) => req.user.role === 'admin' ? (uid || req.user.id) : req.user.id

app.post('/api/events/:id/data/weight', isAuth, async (req, res) => {
  const { user_id, week, weight, entry_date } = req.body
  await pool.query(
    `INSERT INTO weight_entries_v2(event_id,user_id,week,weight,entry_date,logged_by) VALUES($1,$2,$3,$4,$5,$6)
     ON CONFLICT(event_id,user_id,week) DO UPDATE SET weight=$4,entry_date=$5`,
    [req.params.id, tu(req, user_id), week, weight, entry_date, req.user.id]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/activity', isAuth, async (req, res) => {
  const { user_id, entry_date, week, steps, active_minutes } = req.body
  await pool.query(
    `INSERT INTO activity_entries(event_id,user_id,entry_date,week,steps,active_minutes) VALUES($1,$2,$3,$4,$5,$6)
     ON CONFLICT(event_id,user_id,entry_date) DO UPDATE SET steps=$5,active_minutes=$6`,
    [req.params.id, tu(req, user_id), entry_date, week, steps || 0, active_minutes || 0]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/hydration', isAuth, async (req, res) => {
  const { user_id, entry_date, week, glasses } = req.body
  await pool.query(
    `INSERT INTO hydration_entries(event_id,user_id,entry_date,week,glasses) VALUES($1,$2,$3,$4,$5)
     ON CONFLICT(event_id,user_id,entry_date) DO UPDATE SET glasses=$5`,
    [req.params.id, tu(req, user_id), entry_date, week, glasses || 0]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/sleep', isAuth, async (req, res) => {
  const { user_id, entry_date, week, hours, quality } = req.body
  await pool.query(
    `INSERT INTO sleep_entries(event_id,user_id,entry_date,week,hours,quality) VALUES($1,$2,$3,$4,$5,$6)
     ON CONFLICT(event_id,user_id,entry_date) DO UPDATE SET hours=$5,quality=$6`,
    [req.params.id, tu(req, user_id), entry_date, week, hours || 0, quality || 3]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/nutrition', isAuth, async (req, res) => {
  const { user_id, entry_date, week, calories_consumed, calories_target } = req.body
  await pool.query(
    `INSERT INTO nutrition_entries(event_id,user_id,entry_date,week,calories_consumed,calories_target) VALUES($1,$2,$3,$4,$5,$6)
     ON CONFLICT(event_id,user_id,entry_date) DO UPDATE SET calories_consumed=$5,calories_target=$6`,
    [req.params.id, tu(req, user_id), entry_date, week, calories_consumed || 0, calories_target || 2000]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/measurements', isAuth, async (req, res) => {
  const { user_id, week, waist_cm, body_fat_pct } = req.body
  await pool.query(
    `INSERT INTO measurement_entries(event_id,user_id,week,waist_cm,body_fat_pct) VALUES($1,$2,$3,$4,$5)
     ON CONFLICT(event_id,user_id,week) DO UPDATE SET waist_cm=$4,body_fat_pct=$5`,
    [req.params.id, tu(req, user_id), week, waist_cm, body_fat_pct]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/challenge', isAuth, async (req, res) => {
  const { user_id, week, completed } = req.body
  await pool.query(
    `INSERT INTO challenge_completions(event_id,user_id,week,completed) VALUES($1,$2,$3,$4)
     ON CONFLICT(event_id,user_id,week) DO UPDATE SET completed=$4`,
    [req.params.id, tu(req, user_id), week, completed]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/habit', isAuth, async (req, res) => {
  const { user_id, entry_date, week, completed } = req.body
  await pool.query(
    `INSERT INTO habit_checkins(event_id,user_id,entry_date,week,completed) VALUES($1,$2,$3,$4,$5)
     ON CONFLICT(event_id,user_id,entry_date) DO UPDATE SET completed=$5`,
    [req.params.id, tu(req, user_id), entry_date, week, completed !== false]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/social', isAuth, async (req, res) => {
  const { voted_id, week, points } = req.body
  if (req.user.id == voted_id) return res.status(400).json({ error: 'No puedes votarte a ti mismo' })
  await pool.query(
    `INSERT INTO social_votes(event_id,voter_id,voted_id,week,points) VALUES($1,$2,$3,$4,$5)
     ON CONFLICT(event_id,voter_id,voted_id,week) DO UPDATE SET points=$5`,
    [req.params.id, req.user.id, voted_id, week, points || 1]
  )
  res.json({ ok: true })
})
app.post('/api/events/:id/data/attendance', isAdmin, async (req, res) => {
  const { user_id, session_date, week, attended } = req.body
  await pool.query(
    `INSERT INTO attendance_entries(event_id,user_id,session_date,week,attended) VALUES($1,$2,$3,$4,$5)
     ON CONFLICT(event_id,user_id,session_date) DO UPDATE SET attended=$5`,
    [req.params.id, user_id, session_date, week, attended !== false]
  )
  res.json({ ok: true })
})
app.put('/api/events/:id/challenges/:week', isAdmin, async (req, res) => {
  const { title, description } = req.body
  await pool.query(
    `INSERT INTO weekly_challenges(event_id,week,title,description) VALUES($1,$2,$3,$4)
     ON CONFLICT(event_id,week) DO UPDATE SET title=$3,description=$4`,
    [req.params.id, req.params.week, title, description]
  )
  res.json({ ok: true })
})
app.get('/api/events/:id/challenges', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM weekly_challenges WHERE event_id=$1 ORDER BY week', [req.params.id])
  res.json(rows)
})

// ── Scores ───────────────────────────────────────────────
app.get('/api/events/:id/scores', async (req, res) => {
  const { rows: [ev] } = await pool.query('SELECT * FROM events WHERE id=$1', [req.params.id])
  if (!ev) return res.status(404).json({ error: 'Evento no encontrado' })
  const { rows: factors } = await pool.query('SELECT * FROM event_factors WHERE event_id=$1 AND active=true', [req.params.id])
  const { rows: parts   } = await pool.query(
    'SELECT ep.*,u.display_name,u.username FROM event_participants ep JOIN users u ON u.id=ep.user_id WHERE ep.event_id=$1',
    [req.params.id]
  )
  const scores = []
  for (const p of parts) {
    let total = 0; const fs = {}
    for (const f of factors) {
      let s = 0; const cfg = f.config || {}
      if (f.factor_type === 'weight') {
        const { rows: [w] } = await pool.query('SELECT weight FROM weight_entries_v2 WHERE event_id=$1 AND user_id=$2 ORDER BY week DESC LIMIT 1', [ev.id, p.user_id])
        if (w && p.initial_weight) {
          const loss = p.initial_weight - w.weight, goal = p.initial_weight * ev.goal_pct / 100
          s = Math.min(100, Math.max(0, (loss / goal) * 100))
        }
      } else if (f.factor_type === 'activity') {
        const { rows: [r] } = await pool.query('SELECT AVG(steps) a FROM activity_entries WHERE event_id=$1 AND user_id=$2', [ev.id, p.user_id])
        if (r.a) s = Math.min(100, r.a / (cfg.target_steps || 8000) * 100)
      } else if (f.factor_type === 'hydration') {
        const { rows: [r] } = await pool.query('SELECT AVG(glasses) a FROM hydration_entries WHERE event_id=$1 AND user_id=$2', [ev.id, p.user_id])
        if (r.a) s = Math.min(100, r.a / (cfg.target_glasses || 8) * 100)
      } else if (f.factor_type === 'sleep') {
        const { rows: [r] } = await pool.query('SELECT AVG(hours) h,AVG(quality) q FROM sleep_entries WHERE event_id=$1 AND user_id=$2', [ev.id, p.user_id])
        if (r.h) {
          const h = parseFloat(r.h), q = parseFloat(r.q) || 3
          const hs = h >= 7 && h <= 9 ? 100 : h < 7 ? h / 7 * 100 : Math.max(0, 100 - (h - 9) * 20)
          s = hs * 0.6 + (q / 5 * 100) * 0.4
        }
      } else if (f.factor_type === 'nutrition') {
        const { rows: [r] } = await pool.query(
          'SELECT COUNT(*) t,SUM(CASE WHEN calories_consumed<=calories_target THEN 1 ELSE 0 END) c FROM nutrition_entries WHERE event_id=$1 AND user_id=$2',
          [ev.id, p.user_id]
        )
        if (r.t > 0) s = r.c / r.t * 100
      } else if (f.factor_type === 'measurements') {
        const { rows: [first] } = await pool.query('SELECT waist_cm FROM measurement_entries WHERE event_id=$1 AND user_id=$2 ORDER BY week ASC  LIMIT 1', [ev.id, p.user_id])
        const { rows: [last]  } = await pool.query('SELECT waist_cm FROM measurement_entries WHERE event_id=$1 AND user_id=$2 ORDER BY week DESC LIMIT 1', [ev.id, p.user_id])
        if (first?.waist_cm && last?.waist_cm) s = Math.min(100, Math.max(0, (first.waist_cm - last.waist_cm) / first.waist_cm * 1000))
      } else if (f.factor_type === 'weekly_challenge') {
        const { rows: [r] } = await pool.query(
          'SELECT COUNT(*) t,SUM(CASE WHEN completed THEN 1 ELSE 0 END) c FROM challenge_completions WHERE event_id=$1 AND user_id=$2',
          [ev.id, p.user_id]
        )
        if (r.t > 0) s = r.c / r.t * 100
      } else if (f.factor_type === 'daily_habit') {
        const { rows: [r] } = await pool.query(
          'SELECT COUNT(*) t,SUM(CASE WHEN completed THEN 1 ELSE 0 END) c FROM habit_checkins WHERE event_id=$1 AND user_id=$2',
          [ev.id, p.user_id]
        )
        if (r.t > 0) s = r.c / r.t * 100
      } else if (f.factor_type === 'social_vote') {
        const { rows: [r] } = await pool.query('SELECT SUM(points) t FROM social_votes WHERE event_id=$1 AND voted_id=$2', [ev.id, p.user_id])
        const { rows: [m] } = await pool.query('SELECT MAX(tt) mx FROM (SELECT SUM(points) tt FROM social_votes WHERE event_id=$1 GROUP BY voted_id) x', [ev.id])
        s = m.mx > 0 ? ((r.t || 0) / m.mx) * 100 : 0
      } else if (f.factor_type === 'attendance') {
        const { rows: [r] } = await pool.query(
          'SELECT COUNT(*) t,SUM(CASE WHEN attended THEN 1 ELSE 0 END) c FROM attendance_entries WHERE event_id=$1 AND user_id=$2',
          [ev.id, p.user_id]
        )
        if (r.t > 0) s = r.c / r.t * 100
      }
      fs[f.factor_type] = Math.round(s * 10) / 10
      total += s * f.weight_pct / 100
    }
    const { rows: pens } = await pool.query(
      `SELECT pa.id,pa.week,pa.reason,ep.name,ep.penalty_type,ep.amount
       FROM penalty_applications pa JOIN event_penalties ep ON ep.id=pa.penalty_id
       WHERE pa.event_id=$1 AND pa.user_id=$2`,
      [ev.id, p.user_id]
    )
    const penPts   = pens.filter(x => x.penalty_type === 'points').reduce((s, x) => s + parseFloat(x.amount), 0)
    const penMoney = pens.filter(x => x.penalty_type === 'money' ).reduce((s, x) => s + parseFloat(x.amount), 0)
    scores.push({
      user_id: p.user_id, username: p.username, display_name: p.display_name,
      total_score: Math.round(Math.max(0, total - penPts) * 10) / 10,
      factor_scores: fs, penalties: pens, penalty_points: penPts, penalty_money: penMoney,
    })
  }
  scores.sort((a, b) => b.total_score - a.total_score)
  res.json(scores)
})

// ── Prize pool ───────────────────────────────────────────
app.get('/api/events/:id/prize-pool', async (req, res) => {
  const { rows: [ev] } = await pool.query('SELECT entry_fee,entry_fee_currency,prize_config FROM events WHERE id=$1', [req.params.id])
  const { rows: [fees] } = await pool.query(
    'SELECT SUM(fee_amount_paid) AS total,COUNT(*) FILTER(WHERE fee_paid) AS paid_count FROM event_participants WHERE event_id=$1',
    [req.params.id]
  )
  const { rows: [mp] } = await pool.query(
    `SELECT COALESCE(SUM(ep.amount),0) AS money_penalties FROM penalty_applications pa
     JOIN event_penalties ep ON ep.id=pa.penalty_id WHERE pa.event_id=$1 AND ep.penalty_type='money'`,
    [req.params.id]
  )
  res.json({
    entry_fee:        ev.entry_fee,
    currency:         ev.entry_fee_currency,
    prize_config:     ev.prize_config,
    fee_income:       parseFloat(fees.total)       || 0,
    money_penalties:  parseFloat(mp.money_penalties)|| 0,
    total_pool:       (parseFloat(fees.total) || 0) + (parseFloat(mp.money_penalties) || 0),
    paid_count:       parseInt(fees.paid_count)     || 0,
  })
})

// ── File upload ──────────────────────────────────────────
app.post('/api/upload/photo',      upload.single('photo'),      (req, res) => { if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' }); res.json({ url: `/uploads/${req.file.filename}` }) })
app.post('/api/upload/background', upload.single('background'), (req, res) => { if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' }); res.json({ url: `/uploads/${req.file.filename}` }) })

// ── Legacy /api/data ─────────────────────────────────────
app.get('/api/data', async (req, res) => {
  const { rows: [ev] } = await pool.query("SELECT * FROM events WHERE status='active' ORDER BY created_at DESC LIMIT 1")
  if (!ev) return res.json({ event: null, participants: [], challenge: {}, settings: {}, factors: [] })
  const { rows: parts } = await pool.query(
    `SELECT ep.*,u.display_name AS name,u.username,u.photo_url,ep.avatar_emoji AS avatar,
      COALESCE(json_agg(json_build_object('week',w.week,'weight',w.weight,'date',w.entry_date) ORDER BY w.week) FILTER(WHERE w.id IS NOT NULL),'[]') AS entries
     FROM event_participants ep JOIN users u ON u.id=ep.user_id
     LEFT JOIN weight_entries_v2 w ON w.event_id=ep.event_id AND w.user_id=ep.user_id
     WHERE ep.event_id=$1 GROUP BY ep.id,u.display_name,u.username,u.photo_url`,
    [ev.id]
  )
  const { rows: factors } = await pool.query('SELECT * FROM event_factors WHERE event_id=$1 AND active=true', [ev.id])
  const theme = ev.theme_settings || {}
  res.json({
    event: ev,
    participants: parts.map(p => ({
      id: p.user_id, name: p.name, username: p.username, photo_url: p.photo_url,
      color: p.color, avatar: p.avatar,
      initialWeight: parseFloat(p.initial_weight),
      goalWeight: parseFloat(p.initial_weight) * (1 - ev.goal_pct / 100),
      height: p.initial_data?.height || null,
      entries: p.entries || [],
    })),
    challenge: { name: ev.name, startDate: ev.start_date, endDate: ev.end_date, goalPercent: ev.goal_pct, totalWeeks: ev.total_weeks },
    settings:  { background: theme.background || 'prairie', animations: theme.animations || { clouds: true, birds: true, leaves: true, water: true }, timeMode: theme.timeMode || 'auto', bgImageUrl: ev.bg_image_url },
    factors,
  })
})
app.post('/api/weights', async (req, res) => {
  const { password, participantId, week, date, weight } = req.body
  if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Contraseña incorrecta' })
  const { rows: [ev] } = await pool.query("SELECT id FROM events WHERE status='active' ORDER BY created_at DESC LIMIT 1")
  if (!ev) return res.status(404).json({ error: 'Sin evento activo' })
  const { rows: [u] } = await pool.query('SELECT u.id FROM users u JOIN event_participants ep ON ep.user_id=u.id WHERE u.username=$1 AND ep.event_id=$2', [participantId, ev.id])
  if (!u) return res.status(404).json({ error: 'Participante no encontrado' })
  await pool.query(`INSERT INTO weight_entries_v2(event_id,user_id,week,weight,entry_date) VALUES($1,$2,$3,$4,$5) ON CONFLICT(event_id,user_id,week) DO UPDATE SET weight=$4,entry_date=$5`, [ev.id, u.id, week, weight, date])
  res.json({ ok: true })
})
app.post('/api/settings', async (req, res) => {
  const { password, settings } = req.body
  if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Contraseña incorrecta' })
  const { rows: [ev] } = await pool.query("SELECT id,theme_settings FROM events WHERE status='active' ORDER BY created_at DESC LIMIT 1")
  if (!ev) return res.status(404).json({ error: 'Sin evento activo' })
  const merged = { ...(ev.theme_settings || {}), ...settings }
  await pool.query('UPDATE events SET theme_settings=$1 WHERE id=$2', [JSON.stringify(merged), ev.id])
  res.json({ ok: true })
})
app.post('/api/challenge', async (req, res) => {
  const { password, config } = req.body
  if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Contraseña incorrecta' })
  const { rows: [ev] } = await pool.query("SELECT id FROM events WHERE status='active' ORDER BY created_at DESC LIMIT 1")
  if (!ev) return res.status(404).json({ error: 'Sin evento activo' })
  await pool.query(
    `UPDATE events SET name=COALESCE($1,name),start_date=COALESCE($2,start_date),end_date=COALESCE($3,end_date),goal_pct=COALESCE($4,goal_pct),total_weeks=COALESCE($5,total_weeks) WHERE id=$6`,
    [config.name, config.startDate, config.endDate, config.goalPercent, config.totalWeeks, ev.id]
  )
  res.json({ ok: true })
})
app.post('/api/participant', async (req, res) => {
  const { password, id, name, color, initialWeight, avatar } = req.body
  if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Contraseña incorrecta' })
  const { rows: [ev] } = await pool.query("SELECT id FROM events WHERE status='active' ORDER BY created_at DESC LIMIT 1")
  if (!ev) return res.status(404).json({ error: 'Sin evento activo' })
  const { rows: [u] } = await pool.query('SELECT u.id FROM users u JOIN event_participants ep ON ep.user_id=u.id WHERE u.username=$1 AND ep.event_id=$2', [id, ev.id])
  if (!u) return res.status(404).json({ error: 'Participante no encontrado' })
  if (name) await pool.query('UPDATE users SET display_name=$1 WHERE id=$2', [name, u.id])
  await pool.query('UPDATE event_participants SET color=COALESCE($1,color),avatar_emoji=COALESCE($2,avatar_emoji),initial_weight=COALESCE($3,initial_weight) WHERE event_id=$4 AND user_id=$5',
    [color, avatar, initialWeight, ev.id, u.id])
  res.json({ ok: true })
})

// ── SPA fallback ─────────────────────────────────────────
app.get('*', (_, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

initDB()
  .then(() => app.listen(PORT, () => console.log(`Capibara Challenge v3.0.0 — puerto ${PORT}`)))
  .catch(err => { console.error('DB init error:', err); process.exit(1) })
