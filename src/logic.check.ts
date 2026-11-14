// Verificação mínima da lógica: `npm run check` (Node ≥ 23, sem dependências).
import assert from 'node:assert/strict'
import { EXERCISES, WORKOUTS } from './data.ts'
import { suggest, pace, speed, fmtPace, runTarget, trainingWeek, sampleDB, reviewDue, type ExerciseLog } from './logic.ts'

const item = WORKOUTS[0].items[0] // hip thrust 3×10–12
const ex = EXERCISES[item.ex]
const log = (reps: number[], extra: Partial<ExerciseLog> = {}): ExerciseLog => ({
  ex: item.ex, sets: reps.map((r) => ({ kg: 30, reps: r, done: true })), rest: 120, rpe: 7, tags: [], comment: '', pain: false, painNote: '', done: true, ...extra,
})

assert.equal(suggest(ex, item, null).level, 'first')
assert.equal(suggest(ex, item, log([12, 12, 12])).level, 'up')
assert.equal(suggest(ex, item, log([12, 12, 11])).level, 'keep')
assert.equal(suggest(ex, item, log([12, 12])).level, 'keep', 'séries em falta não sobem')
assert.equal(suggest(ex, item, log([12, 12, 12], { rpe: 9 })).level, 'keep', 'sem 2 reps em reserva não sobe')
assert.equal(suggest(ex, item, log([12, 12, 12], { pain: true })).level, 'hold', 'dor nunca sobe')
assert.equal(suggest(ex, item, log([12, 12, 12], { tags: ['Preciso de melhorar a técnica'] })).level, 'hold')
const rdl = WORKOUTS[2].items[0]
assert.equal(suggest(EXERCISES.rdl, rdl, { ...log([10, 10]), ex: 'rdl' }).level, 'keep', 'RDL exige técnica confirmada')
assert.equal(suggest(EXERCISES.rdl, rdl, { ...log([10, 10]), ex: 'rdl', tags: ['Técnica correta'] }).level, 'up')

assert.equal(fmtPace(pace(5, 1950)), '6:30')
assert.equal(speed(5, 1800), 10)
assert.equal(runTarget(1, []).label, '5 km')
assert.equal(runTarget(3, []).label, '5–5,5 km')
assert.equal(runTarget(5, [{ id: 'x', date: '2026-01-01', km: 5.5, sec: 2200, surface: '', effort: 9, comments: '', pain: false, painNote: '' }]).repeat, true)

assert.deepEqual([trainingWeek('2026-11-02', '2026-11-08').week, trainingWeek('2026-11-02', '2026-11-30').block], [1, 2])
const db = sampleDB('2026-11-14')
assert.ok(db.workouts.length >= 12 && db.runs.length === 5)
assert.equal(reviewDue(db, '2026-11-14'), 1)
console.log('ok — lógica verificada')
