import express from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const DATA_FILE = join(__dirname, 'data', 'weights.json')
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'capibara2026'

app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

const readData = () => JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
const writeData = (data) => writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))

app.get('/api/weights', (_req, res) => {
  try {
    res.json(readData())
  } catch {
    res.status(500).json({ error: 'No se pudo leer los datos' })
  }
})

app.post('/api/weights', (req, res) => {
  const { password, participantId, week, date, weight } = req.body
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' })
  }
  if (!participantId || week === undefined || !date || weight === undefined) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }

  const data = readData()
  const participant = data.participants.find(p => p.id === participantId)
  if (!participant) return res.status(404).json({ error: 'Participante no encontrado' })

  const existingIdx = participant.entries.findIndex(e => e.week === week)
  const entry = { week, date, weight: parseFloat(weight) }
  if (existingIdx >= 0) {
    participant.entries[existingIdx] = entry
  } else {
    participant.entries.push(entry)
    participant.entries.sort((a, b) => a.week - b.week)
  }

  writeData(data)
  res.json({ success: true, participant })
})

app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`Capibara's Challenge corriendo en puerto ${PORT}`))
