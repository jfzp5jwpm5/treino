// Persistência local (localStorage). Toda a escrita passa por `update`, por isso
// trocar isto por IndexedDB ou sincronização na nuvem mais tarde mexe só neste ficheiro.
import { useSyncExternalStore } from 'react'
import { PROFILE_DEFAULT, EXERCISES } from './data.ts'
import { mondayOf, today, fmtDur, pace, fmtPace, type DB } from './logic.ts'

const KEY = 'treino-db-v1'
const empty = (): DB => ({ version: 1, profile: { ...PROFILE_DEFAULT, startDate: mondayOf(today()) }, workouts: [], runs: [], reviews: [], draft: null, onboarded: false })

export function isDB(x: any): x is DB {
  return x && x.version === 1 && x.profile && Array.isArray(x.workouts) && Array.isArray(x.runs) && Array.isArray(x.reviews)
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const db = JSON.parse(raw)
    if (isDB(db)) return { ...empty(), ...db, profile: { ...empty().profile, ...db.profile } }
    localStorage.setItem(KEY + '-corrompido-' + Date.now(), raw) // nunca deitar dados fora
  } catch { /* armazenamento indisponível: continua em memória */ }
  return empty()
}

let state = load()
let saveError = false
const subs = new Set<() => void>()

export function update(fn: (db: DB) => DB | void) {
  const copy = structuredClone(state)
  state = fn(copy) ?? copy
  try { localStorage.setItem(KEY, JSON.stringify(state)); saveError = false } catch { saveError = true }
  subs.forEach((s) => s())
}
export const replaceDB = (db: DB) => update(() => db)
export const resetDB = () => update(() => empty())
export const hasSaveError = () => saveError

export function useDB(): DB {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb) }, () => state)
}

/* ---------- exportar / importar ---------- */
function download(name: string, text: string, type: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
export const exportJSON = () => download(`treino-${today()}.json`, JSON.stringify(state, null, 2), 'application/json')

const csv = (rows: (string | number | null)[][]) =>
  rows.map((r) => r.map((v) => { const s = String(v ?? ''); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }).join(';')).join('\n')

export function exportCSV() {
  const gym = [['data', 'treino', 'exercicio', 'serie', 'kg', 'reps', 'dificuldade', 'dor', 'comentario']]
  for (const w of state.workouts) for (const e of w.exercises) e.sets.forEach((s, i) =>
    gym.push([w.date, w.workout, EXERCISES[e.ex]?.pt ?? e.ex, i + 1, s.kg as any, s.reps as any, e.rpe as any, e.pain ? 'sim' : '', [...e.tags, e.comment].filter(Boolean).join(' | ')]))
  const runs = [['data', 'km', 'duracao', 'ritmo_min_km', 'superficie', 'esforco', 'dor', 'comentarios']]
  for (const r of state.runs) runs.push([r.date, r.km, fmtDur(r.sec), fmtPace(pace(r.km, r.sec)), r.surface, r.effort as any, r.pain ? r.painNote || 'sim' : '', r.comments])
  download(`treino-ginasio-${today()}.csv`, '﻿' + csv(gym), 'text/csv')
  setTimeout(() => download(`treino-corrida-${today()}.csv`, '﻿' + csv(runs), 'text/csv'), 300)
}

export async function importJSON(file: File): Promise<string> {
  const db = JSON.parse(await file.text())
  if (!isDB(db)) throw new Error('Ficheiro inválido: não parece uma cópia de segurança desta app.')
  replaceDB(db)
  return `Importados ${db.workouts.length} treinos e ${db.runs.length} corridas.`
}

