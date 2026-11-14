// Tipos, datas, progressão de carga, corrida e revisões. Sem DOM: corre também em Node (npm run check).
import { EXERCISES, WORKOUTS, RUN_PLAN, BAD_TAGS, PROFILE_DEFAULT, type Exercise, type WorkoutItem, type Workout } from './data.ts'

export interface SetLog { kg: number | null; reps: number | null; done: boolean }
export interface ExerciseLog {
  ex: string
  sets: SetLog[]
  rest: number | null
  rpe: number | null // dificuldade percebida 1–10 (8 ≈ 2 repetições em reserva)
  tags: string[]
  comment: string
  pain: boolean
  painNote: string
  done: boolean
}
export interface WorkoutLog { id: string; workout: Workout['id']; date: string; exercises: ExerciseLog[]; notes: string; finished: boolean }
export interface RunLog { id: string; date: string; km: number; sec: number; surface: string; effort: number | null; comments: string; pain: boolean; painNote: string }
export interface Review { id: string; date: string; block: number; answers: Record<string, string>; suggestions: string[] }
export type Profile = typeof PROFILE_DEFAULT & { startDate: string }
export interface DB { version: 1; profile: Profile; workouts: WorkoutLog[]; runs: RunLog[]; reviews: Review[]; draft: WorkoutLog | null; onboarded: boolean }

/* ---------- datas (sempre 'AAAA-MM-DD', hora local) ---------- */
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
const pad = (n: number) => String(n).padStart(2, '0')
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12) }
export const today = () => iso(new Date())
export const addDays = (s: string, n: number) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d) }
export const weekday = (s: string) => ((parse(s).getDay() + 6) % 7) + 1 // 1 = segunda
export const mondayOf = (s: string) => addDays(s, 1 - weekday(s))
export const daysBetween = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000)
export const fmtDate = (s: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  parse(s).toLocaleDateString('pt-PT', opts)

export function trainingWeek(startDate: string, on = today()) {
  const week = Math.max(1, Math.floor(daysBetween(mondayOf(startDate), mondayOf(on)) / 7) + 1)
  const block = Math.ceil(week / 4)
  const blockStart = addDays(mondayOf(startDate), (block - 1) * 28)
  const dayInBlock = daysBetween(blockStart, on) + 1 // 1..28
  return { week, block, weekInBlock: ((week - 1) % 4) + 1, blockStart, blockEnd: addDays(blockStart, 27), dayInBlock }
}

/** Bloco cuja revisão está por fazer (a partir de sexta da 4.ª semana), ou null. */
export function reviewDue(db: DB, on = today()): number | null {
  const { block, dayInBlock } = trainingWeek(db.profile.startDate, on)
  const done = new Set(db.reviews.map((r) => r.block))
  if (dayInBlock >= 26 && !done.has(block)) return block
  for (let b = block - 1; b >= 1; b--) if (!done.has(b)) return b
  return null
}

export const blockRange = (startDate: string, block: number) => {
  const s = addDays(mondayOf(startDate), (block - 1) * 28)
  return { from: s, to: addDays(s, 27) }
}

/* ---------- treino ---------- */
export const workoutById = (id: string) => WORKOUTS.find((w) => w.id === id)!

export function newWorkoutLog(w: Workout, db: DB, date = today()): WorkoutLog {
  return {
    id: uid(), workout: w.id, date, notes: '', finished: false,
    exercises: w.items.map((it) => {
      const prev = lastExerciseLog(db, it.ex)
      const kg = prev ? workingKg(prev) : null
      return {
        ex: it.ex, rest: EXERCISES[it.ex].rest, rpe: null, tags: [], comment: '', pain: false, painNote: '', done: false,
        sets: Array.from({ length: it.sets }, () => ({ kg, reps: null, done: false })),
      }
    }),
  }
}

/** Último registo (concluído) de um exercício, ignorando o rascunho. */
export function lastExerciseLog(db: DB, exId: string, before?: string): ExerciseLog | null {
  const ws = db.workouts.filter((w) => w.finished && (!before || w.date < before)).sort((a, b) => b.date.localeCompare(a.date))
  for (const w of ws) {
    const e = w.exercises.find((x) => x.ex === exId && x.sets.some((s) => s.reps))
    if (e) return e
  }
  return null
}

export const workingKg = (e: ExerciseLog) => {
  const kgs = e.sets.filter((s) => s.reps && s.kg != null).map((s) => s.kg!)
  return kgs.length ? Math.max(...kgs) : null
}
export const volume = (e: ExerciseLog) => e.sets.reduce((t, s) => t + (s.reps ?? 0) * (s.kg ?? 0), 0)
export const hasWarning = (e: ExerciseLog) => e.pain || e.tags.some((t) => BAD_TAGS.includes(t))

export type Suggestion = { level: 'up' | 'keep' | 'hold' | 'first'; text: string }

/**
 * Dupla progressão. Só sugere subir carga quando TODAS as séries prescritas chegaram ao topo da faixa,
 * com a mesma carga, dificuldade ≤ 8 (≈ 2 repetições em reserva) e sem dor/má técnica.
 * Nunca altera nada: devolve apenas um texto.
 */
export function suggest(ex: Exercise, item: WorkoutItem, last: ExerciseLog | null): Suggestion {
  const u = ex.unit.startsWith('seg') ? 's' : ' reps'
  if (!last) {
    return {
      level: 'first',
      text: ex.loaded
        ? `Primeira vez: escolhe uma carga que te permita ${item.min} repetições com boa técnica, deixando 2–3 em reserva.`
        : `Primeira vez: foca-te no controlo. Objetivo: ${item.min}${u}${ex.unit.endsWith('lado') ? ' por lado' : ''}.`,
    }
  }
  if (hasWarning(last)) {
    return { level: 'hold', text: 'Da última vez registaste desconforto ou técnica a melhorar: não aumentes a carga. Mantém ou reduz e foca-te na execução.' }
  }
  const done = last.sets.filter((s) => s.reps)
  const allTop = done.length >= item.sets && done.every((s) => (s.reps ?? 0) >= item.max)
  const kg = workingKg(last)
  const sameKg = done.every((s) => s.kg === kg)

  if (!ex.loaded) {
    return allTop
      ? { level: 'up', text: `Chegaste ao topo (${item.max}${u}) em todas as séries. Próximo passo: ${ex.increment.toLowerCase()}.` }
      : { level: 'keep', text: `Continua a trabalhar até ${item.max}${u} em todas as séries com bom controlo.` }
  }
  if (allTop && sameKg) {
    if (last.rpe == null) return { level: 'keep', text: `Fizeste ${item.max} repetições em todas as séries. Regista a dificuldade (≤ 8 ≈ 2 reps em reserva) para confirmar se está na altura de subir.` }
    if (last.rpe > 8) return { level: 'keep', text: `Chegaste às ${item.max} repetições mas com dificuldade ${last.rpe}/10. Mantém ${kg} kg até ficar mais confortável.` }
    if (ex.requiresTechnique && !last.tags.includes('Técnica correta')) {
      return { level: 'keep', text: `Repetições no topo, mas a técnica ainda não foi confirmada. Mantém ${kg} kg e marca “Técnica correta” quando a tiveres validado.` }
    }
    return { level: 'up', text: `Está na altura de subir: ${ex.increment} (a partir de ${kg} kg). Volta às ${item.min} repetições e progride de novo.` }
  }
  const best = Math.min(...done.map((s) => s.reps ?? 0))
  return { level: 'keep', text: `Mantém ${kg ?? '–'} kg e tenta +1 repetição em pelo menos uma série (pior série: ${best}; objetivo: ${item.max}).` }
}

/* ---------- corrida ---------- */
export const pace = (km: number, sec: number) => (km > 0 ? sec / km : 0) // s/km
export const speed = (km: number, sec: number) => (sec > 0 ? km / (sec / 3600) : 0) // km/h
export const fmtPace = (s: number) => (s > 0 ? `${Math.floor(s / 60)}:${pad(Math.round(s % 60))}` : '–')
export const fmtDur = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = Math.round(s % 60)
  return h ? `${h}h${pad(m)}` : `${m}:${pad(r)}`
}
export const km = (n: number) => n.toLocaleString('pt-PT', { maximumFractionDigits: 2 })
const range = (r: { min: number; max: number }) => (r.min === r.max ? `${km(r.min)} km` : `${km(r.min)}–${km(r.max)} km`)

export function runTarget(week: number, runs: RunLog[]) {
  const idx = Math.min(RUN_PLAN.length - 1, Math.floor((Math.max(1, week) - 1) / 2))
  const planned = RUN_PLAN[idx]
  const last = [...runs].sort((a, b) => b.date.localeCompare(a.date))[0]
  const tough = last && (last.pain || (last.effort ?? 0) >= 8)
  if (tough && idx > 0) {
    const prev = RUN_PLAN[idx - 1]
    return { label: range(prev), planned: range(planned), repeat: true, note: last.pain ? 'Registaste dor/desconforto na última corrida: repete a distância anterior e corre só se estiveres sem dor.' : 'A última corrida foi exigente: repete a distância da etapa anterior antes de avançar.' }
  }
  return {
    label: range(planned), planned: range(planned), repeat: false,
    note: week > 8 ? 'Plano de 8 semanas concluído: consolida a distância e revê na avaliação de 4 semanas.' : 'Ritmo confortável, a conseguir conversar. Consistência antes de velocidade.',
  }
}

/* ---------- revisão de 4 semanas ---------- */
export const REVIEW_QUESTIONS = [
  { id: 'fisico', q: 'Como te sentes fisicamente?', opts: ['Muito bem', 'Normal', 'Com cansaço'] },
  { id: 'forca', q: 'Notaste melhorias na força?', opts: ['Sim', 'Um pouco', 'Não'] },
  { id: 'facil', q: 'Os exercícios estão a ficar mais fáceis?', opts: ['Sim', 'Alguns', 'Não'] },
  { id: 'lombar', q: 'Como está a tua lombar?', opts: ['Sem queixas', 'Desconforto ocasional', 'Desconforto frequente'] },
  { id: 'corrida', q: 'A resistência na corrida está a melhorar?', opts: ['Sim', 'Igual', 'Pior'] },
  { id: 'recuperacao', q: 'Sentes que recuperas bem entre treinos?', opts: ['Sim', 'Às vezes', 'Não'] },
] as const

export function blockStats(db: DB, from: string, to: string) {
  const ws = db.workouts.filter((w) => w.finished && w.date >= from && w.date <= to)
  const rs = db.runs.filter((r) => r.date >= from && r.date <= to).sort((a, b) => a.date.localeCompare(b.date))
  const pains = [
    ...ws.flatMap((w) => w.exercises.filter(hasWarning).map((e) => ({ date: w.date, what: EXERCISES[e.ex].pt, note: e.painNote || e.tags.filter((t) => BAD_TAGS.includes(t)).join(', ') || 'Desconforto' }))),
    ...rs.filter((r) => r.pain).map((r) => ({ date: r.date, what: 'Corrida', note: r.painNote || 'Desconforto' })),
  ]
  return { gym: ws.length, runs: rs.length, firstRun: rs[0], lastRun: rs[rs.length - 1], pains, workouts: ws }
}

/** Primeira e última carga/reps de cada exercício até `to` (inclusive). */
export function exerciseProgress(db: DB, from: string, to: string) {
  const out: { ex: string; first: { kg: number | null; reps: number }; last: { kg: number | null; reps: number } }[] = []
  const ws = db.workouts.filter((w) => w.finished && w.date >= from && w.date <= to).sort((a, b) => a.date.localeCompare(b.date))
  const seen = new Set(ws.flatMap((w) => w.exercises.map((e) => e.ex)))
  for (const ex of seen) {
    const logs = ws.flatMap((w) => w.exercises.filter((e) => e.ex === ex && e.sets.some((s) => s.reps)))
    if (!logs.length) continue
    const sum = (e: ExerciseLog) => ({ kg: workingKg(e), reps: e.sets.reduce((t, s) => t + (s.reps ?? 0), 0) })
    out.push({ ex, first: sum(logs[0]), last: sum(logs[logs.length - 1]) })
  }
  return out
}

export function reviewSuggestions(a: Record<string, string>, s: { gym: number; runs: number; pains: unknown[] }): string[] {
  const out: string[] = []
  const tired = a.fisico === 'Com cansaço' || a.recuperacao === 'Não'
  const back = a.lombar && a.lombar !== 'Sem queixas'
  if (back || s.pains.length) {
    out.push('Lombar: não aumentes cargas nos exercícios onde houve desconforto (sobretudo peso morto romeno e leg press). Revê a técnica, idealmente com um profissional qualificado.')
  }
  if (a.lombar === 'Desconforto frequente') out.push('Desconforto lombar frequente: consulta um fisioterapeuta antes de progredir. Mantém o core (dead bug, bird dog, pranchas) e substitui o peso morto romeno por mais curl de pernas se for preciso.')
  if (tired) out.push('Recuperação: faz a 1.ª semana do próximo bloco mais leve (−1 série por exercício ou −10% de carga) e prioriza o sono e a alimentação.')
  if (s.gym < 10) out.push(`Consistência: completaste ${s.gym} de 12 treinos de ginásio. Prioriza fazer os 3 treinos semanais antes de pensar em aumentar cargas.`)
  if (!tired && !back && (a.forca === 'Sim' || a.facil === 'Sim')) out.push('Força: continua a dupla progressão. Nos exercícios que já chegaram ao topo da faixa com ~2 repetições em reserva, sobe um pequeno incremento.')
  if (a.facil === 'Não' && !tired) out.push('Os exercícios ainda não estão mais fáceis: mantém as cargas atuais e procura +1 repetição por sessão antes de mexer no peso.')
  if (a.corrida === 'Sim' && !tired && s.runs >= 3) out.push('Corrida: podes avançar para a próxima etapa de distância (+0,5 km).')
  else out.push('Corrida: repete a distância atual mais duas semanas antes de aumentar.')
  if (a.objetivos?.trim()) out.push(`Ajustes que pediste: “${a.objetivos.trim()}”. Altera-os no perfil se fizer sentido.`)
  out.push('Nada muda automaticamente: estas são sugestões. Ouve o corpo e nunca treines com dor.')
  return out
}

/* ---------- dados de exemplo (5 semanas) ---------- */
export function sampleDB(on = today()): DB {
  const start = addDays(mondayOf(on), -28)
  const db: DB = { version: 1, profile: { ...PROFILE_DEFAULT, name: 'Ana', startDate: start }, workouts: [], runs: [], reviews: [], draft: null, onboarded: true }
  const kg: Record<string, number> = { 'hip-thrust': 30, 'leg-press': 50, 'leg-extension': 20, abducao: 25, gemeos: 30, 'remada-apoio': 6, puxada: 25, 'chest-press': 15, 'elevacao-lateral': 2, 'triceps-polia': 10, 'biceps-polia': 7.5, rdl: 12, 'leg-curl': 20, 'glute-drive': 30, 'leg-press-alto': 50 }
  const inc: Record<string, number> = { 'hip-thrust': 5, 'glute-drive': 5, 'leg-press': 10, 'leg-press-alto': 10, rdl: 2, 'elevacao-lateral': 1, 'remada-apoio': 1 }
  const reps: Record<string, number> = {}
  for (let wk = 0; wk < 5; wk++) {
    for (const w of WORKOUTS) {
      const date = addDays(start, wk * 7 + w.weekday - 1)
      if (date >= on) continue
      const log: WorkoutLog = { id: uid(), workout: w.id, date, notes: '', finished: true, exercises: [] }
      for (const it of w.items) {
        const ex = EXERCISES[it.ex]
        const r = (reps[it.ex] ??= it.min)
        const sets = Array.from({ length: it.sets }, (_, i) => ({ kg: ex.loaded ? kg[it.ex] : null, reps: r < it.max && i === it.sets - 1 ? Math.max(it.min, r - 1) : r, done: true }))
        const e: ExerciseLog = { ex: it.ex, sets, rest: ex.rest, rpe: 7, tags: [], comment: '', pain: false, painNote: '', done: true }
        if (it.ex === 'rdl' && wk === 1) { e.tags = ['Desconforto na lombar']; e.pain = true; e.painNote = 'Ligeiro na última série, parei a tempo.'; e.rpe = 8 }
        else if (it.ex === 'rdl') e.tags = ['Técnica correta']
        if (sets.every((s) => s.reps >= it.max) && ex.loaded) { kg[it.ex] += inc[it.ex] ?? 2.5; reps[it.ex] = it.min; e.tags.push('Posso aumentar o peso na próxima') }
        else reps[it.ex] = Math.min(it.max, r + (it.max - it.min > 3 ? 2 : 1))
        if (e.pain) reps[it.ex] = r
        log.exercises.push(e)
      }
      if (wk === 1 && w.id === 'B') log.notes = 'Dormi pouco. Senti a lombar no peso morto romeno — reduzi a amplitude.'
      db.workouts.push(log)
    }
    const runDate = addDays(start, wk * 7 + 1)
    if (runDate < on) {
      const k = [5, 5, 5.3, 5.5, 5.5][wk], p = [395, 388, 384, 380, 376][wk]
      db.runs.push({ id: uid(), date: runDate, km: k, sec: Math.round(k * p), surface: wk % 2 ? 'Estrada' : 'Terra batida', effort: [6, 6, 7, 7, 6][wk], comments: wk === 2 ? 'Último km mais difícil, mas bem.' : '', pain: false, painNote: '' })
    }
  }
  return db
}
