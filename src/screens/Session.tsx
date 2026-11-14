// Ecrã de treino interativo. Cada alteração fica guardada no rascunho (db.draft), por isso
// recarregar ou fechar a app não perde nada.
import { useEffect, useState } from 'react'
import { EXERCISES, QUICK_TAGS, WORKOUTS } from '../data.ts'
import { update, useDB } from '../store.ts'
import { hasWarning, lastExerciseLog, newWorkoutLog, suggest, type ExerciseLog, type WorkoutLog } from '../logic.ts'
import { Btn, Card, Empty, ExerciseImage, Field, Icon, Page, Pill, Scale, go, inputCls } from '../ui.tsx'
import { prescription } from './Training.tsx'

export default function Session({ id }: { id: string }) {
  const db = useDB()
  const w = WORKOUTS.find((x) => x.id === id)
  const [open, setOpen] = useState(0)

  // Só cria o rascunho ao entrar no ecrã; depois de guardar/descartar (draft = null) não recria.
  useEffect(() => {
    if (w) update((d) => { if (!d.draft) d.draft = newWorkoutLog(w, d) })
  }, [w?.id])

  if (!w) return <Page title="Treino" back="treino"><Empty>Treino não encontrado.</Empty></Page>
  const draft = db.draft
  if (!draft) return null
  if (draft.workout !== w.id) {
    const other = WORKOUTS.find((x) => x.id === draft.workout)!
    return (
      <Page title={w.name} back="">
        <Empty action={
          <div className="flex flex-col gap-2">
            <Btn onClick={() => go('sessao/' + other.id)}>Continuar {other.name}</Btn>
            <Btn variant="danger" onClick={() => confirm(`Descartar o treino ${other.name} em curso?`) && update((d) => { d.draft = newWorkoutLog(w, d) })}>Descartar e iniciar {w.name}</Btn>
          </div>
        }>Tens um treino de <b>{other.name}</b> em curso.</Empty>
      </Page>
    )
  }

  const set = (fn: (d: WorkoutLog) => void) => update((db) => { if (db.draft) fn(db.draft) })
  const doneCount = draft.exercises.filter((e) => e.done).length

  const save = () => {
    const missing = draft.exercises.length - doneCount
    if (missing && !confirm(`Faltam ${missing} exercício(s) por concluir. Guardar mesmo assim?`)) return
    update((db) => {
      const d = db.draft!
      d.finished = true
      d.exercises.forEach((e) => { if (e.sets.some((s) => s.done && s.reps)) e.done = e.done || e.sets.every((s) => s.done) })
      db.workouts.push(d)
      db.draft = null
    })
    go('historico')
  }

  return (
    <Page title={w.name} back="" action={<Pill>{doneCount}/{draft.exercises.length}</Pill>}>
      <div className="-mt-2 flex items-center gap-2 text-sm text-mute">
        <span>Data</span>
        <input type="date" value={draft.date} onChange={(e) => e.target.value && set((d) => { d.date = e.target.value })} className="rounded-lg border border-line bg-white px-2 py-1" />
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-sage-50"><div className="h-full bg-sage-500 transition-all" style={{ width: `${(doneCount / draft.exercises.length) * 100}%` }} /></div>

      {draft.exercises.map((e, i) => (
        <div key={i}>
          {i === w.coreFrom && <h2 className="mt-2 mb-2 text-sm font-semibold uppercase tracking-wide text-mute">Core e abdominais</h2>}
          <ExerciseCard e={e} item={w.items[i]} date={draft.date} open={open === i}
            onToggle={() => setOpen(open === i ? -1 : i)}
            onChange={(fn) => set((d) => fn(d.exercises[i]))}
            onComplete={() => { set((d) => { d.exercises[i].done = true }); setOpen(i + 1) }} />
        </div>
      ))}

      <Card>
        <Field label="Notas gerais do treino">
          <textarea rows={3} className={inputCls + ' py-2'} value={draft.notes} onChange={(ev) => set((d) => { d.notes = ev.target.value })} placeholder="Energia, sono, como correu o treino…" />
        </Field>
      </Card>
      <Btn className="w-full min-h-14 text-base" onClick={save}><Icon name="check" />Guardar treino</Btn>
      <Btn variant="danger" className="w-full" onClick={() => confirm('Descartar este treino? Os registos desta sessão serão apagados.') && (update((d) => { d.draft = null }), go(''))}>Descartar treino</Btn>
      <p className="text-center text-xs text-mute">O progresso é guardado automaticamente enquanto treinas.</p>
    </Page>
  )
}

function ExerciseCard({ e, item, date, open, onToggle, onChange, onComplete }: {
  e: ExerciseLog; item: (typeof WORKOUTS)[number]['items'][number]; date: string; open: boolean
  onToggle: () => void; onChange: (fn: (e: ExerciseLog) => void) => void; onComplete: () => void
}) {
  const db = useDB()
  const ex = EXERCISES[e.ex]
  const prev = lastExerciseLog(db, e.ex, date)
  const sug = suggest(ex, item, prev)
  const unit = ex.unit.startsWith('seg') ? 'seg' : 'reps'
  const num = (v: string) => (v === '' ? null : Math.max(0, Number(v.replace(',', '.'))))
  const tone = { up: 'bg-sage-50 text-sage-700', keep: 'bg-paper text-ink', hold: 'bg-rose-soft text-rose-900', first: 'bg-paper text-ink' }[sug.level]

  return (
    <Card className={e.done ? 'border-sage-300' : ''}>
      <button className="flex w-full items-center gap-3 text-left" onClick={onToggle}>
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${e.done ? 'bg-sage-600 text-white' : 'bg-sage-50 text-sage-700'}`}>
          {e.done ? <Icon name="check" className="size-4" /> : <Icon name="gym" className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium leading-tight">{ex.pt}</div>
          <div className="text-xs text-mute">{prescription(ex, item)} · {ex.en}</div>
        </div>
        {hasWarning(e) && <Pill tone="rose">⚠︎</Pill>}
        <Icon name="next" className={`text-mute transition ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          <div className="flex gap-3">
            <ExerciseImage ex={ex} className="w-28 shrink-0" />
            <div className="text-sm">
              <div className="text-mute">Última vez{prev ? '' : ':'}</div>
              {prev ? (
                <div className="font-medium tabular-nums">{prev.sets.filter((s) => s.reps).map((s) => `${s.kg != null ? s.kg + ' kg × ' : ''}${s.reps}`).join(', ')}</div>
              ) : <div>sem registo</div>}
              <button onClick={() => go('exercicio/' + ex.id)} className="mt-1 inline-flex items-center gap-1 text-sage-700 underline-offset-2 hover:underline"><Icon name="info" className="size-4" />Técnica</button>
            </div>
          </div>

          <div className={`rounded-xl p-3 text-sm ${tone}`}>{sug.text}</div>

          {/* Séries */}
          <div className="space-y-2">
            <div className={`grid gap-2 text-xs text-mute ${ex.loaded ? 'grid-cols-[3rem_1fr_1fr_3rem]' : 'grid-cols-[3rem_1fr_3rem]'}`}>
              <span>Série</span>{ex.loaded && <span>Peso (kg)</span>}<span>{unit === 'seg' ? 'Segundos' : 'Repetições'}</span><span />
            </div>
            {e.sets.map((s, si) => (
              <div key={si} className={`grid items-center gap-2 ${ex.loaded ? 'grid-cols-[3rem_1fr_1fr_3rem]' : 'grid-cols-[3rem_1fr_3rem]'}`}>
                <span className="text-center font-semibold text-mute">{si + 1}</span>
                {ex.loaded && <input inputMode="decimal" className={inputCls + ' text-center text-lg tabular-nums'} value={s.kg ?? ''} placeholder={String(prev?.sets[si]?.kg ?? 'kg')}
                  onChange={(ev) => onChange((x) => { x.sets[si].kg = num(ev.target.value) })} aria-label={`Peso série ${si + 1}`} />}
                <input inputMode="numeric" className={inputCls + ' text-center text-lg tabular-nums'} value={s.reps ?? ''} placeholder={String(prev?.sets[si]?.reps ?? item.min)}
                  onChange={(ev) => onChange((x) => { x.sets[si].reps = num(ev.target.value) })} aria-label={`${unit} série ${si + 1}`} />
                <button aria-label={`Marcar série ${si + 1}`} onClick={() => onChange((x) => {
                  const st = x.sets[si]
                  st.done = !st.done
                  if (st.done && st.reps == null) st.reps = prev?.sets[si]?.reps ?? item.min
                  if (st.done && ex.loaded && st.kg == null && si > 0) st.kg = x.sets[si - 1].kg
                })} className={`flex size-12 items-center justify-center rounded-xl ${s.done ? 'bg-sage-600 text-white' : 'border border-line bg-white text-mute'}`}>
                  <Icon name="check" />
                </button>
              </div>
            ))}
            {ex.loaded && e.sets[0].kg != null && (
              <button className="text-sm text-sage-700" onClick={() => onChange((x) => { x.sets.forEach((s) => { s.kg = x.sets[0].kg }) })}>Usar {e.sets[0].kg} kg em todas as séries</button>
            )}
          </div>

          <RestTimer seconds={e.rest ?? ex.rest} onChange={(v) => onChange((x) => { x.rest = v })} />

          <div>
            <div className="mb-1 text-sm font-medium">Dificuldade percebida</div>
            <Scale value={e.rpe} onChange={(v) => onChange((x) => { x.rpe = v })} />
            <p className="mt-1 text-xs text-mute">8 ≈ ficaram 2 repetições em reserva. 10 = não conseguia fazer mais nenhuma.</p>
          </div>

          <div>
            <div className="mb-1 text-sm font-medium">Como correu?</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.filter((t) => t !== 'Técnica correta' || ex.requiresTechnique || ex.kind === 'main').map((t) => {
                const on = e.tags.includes(t)
                return (
                  <button key={t} onClick={() => onChange((x) => { x.tags = on ? x.tags.filter((y) => y !== t) : [...x.tags, t]; if (t === 'Desconforto na lombar' && !on) x.pain = true })}
                    className={`rounded-full border px-3 py-2 text-sm ${on ? 'border-sage-600 bg-sage-600 text-white' : 'border-line bg-white'}`}>{t}</button>
                )
              })}
            </div>
          </div>

          <div className={`rounded-xl border p-3 ${e.pain ? 'border-rose-200 bg-rose-soft' : 'border-line'}`}>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" className="size-5 accent-rose-700" checked={e.pain} onChange={(ev) => onChange((x) => { x.pain = ev.target.checked })} />
              Senti dor ou desconforto
            </label>
            {e.pain && (
              <>
                <input className={inputCls + ' mt-2'} value={e.painNote} onChange={(ev) => onChange((x) => { x.painNote = ev.target.value })} placeholder="Onde e como? (ex.: lombar, na última série)" />
                <p className="mt-2 text-xs text-rose-900">Para o exercício se a dor persistir. A app não vai sugerir aumento de carga para este exercício.</p>
              </>
            )}
          </div>

          <Field label="Comentário">
            <textarea rows={2} className={inputCls + ' py-2'} value={e.comment} onChange={(ev) => onChange((x) => { x.comment = ev.target.value })} placeholder="Como correu este exercício?" />
          </Field>

          <Btn className="w-full" variant={e.done ? 'soft' : 'primary'} onClick={e.done ? () => onChange((x) => { x.done = false }) : onComplete}>
            {e.done ? 'Marcar como não concluído' : <><Icon name="check" />Exercício concluído</>}
          </Btn>
        </div>
      )}
    </Card>
  )
}

function RestTimer({ seconds, onChange }: { seconds: number; onChange: (v: number | null) => void }) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    if (left == null) return
    if (left <= 0) { navigator.vibrate?.([200, 100, 200]); const t = setTimeout(() => setLeft(null), 1500); return () => clearTimeout(t) }
    const t = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1">
        <span className="mb-1 block text-sm font-medium">Descanso (segundos)</span>
        <input inputMode="numeric" className={inputCls + ' tabular-nums'} value={seconds} onChange={(ev) => onChange(ev.target.value === '' ? null : Number(ev.target.value) || 0)} />
      </label>
      <button onClick={() => setLeft(left == null ? seconds : null)}
        className={`mt-6 flex min-h-12 min-w-32 items-center justify-center gap-2 rounded-xl px-3 font-medium tabular-nums ${left == null ? 'bg-sage-50 text-sage-700' : left <= 0 ? 'bg-sage-600 text-white' : 'bg-ink text-white'}`}>
        <Icon name="timer" />{left == null ? 'Iniciar' : left <= 0 ? 'Vamos!' : mmss(left)}
      </button>
    </div>
  )
}

