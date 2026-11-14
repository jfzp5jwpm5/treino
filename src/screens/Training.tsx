import { useState } from 'react'
import { EXERCISES, WEEK, WORKOUTS, RUN_SESSION } from '../data.ts'
import { update, useDB } from '../store.ts'
import { fmtDate, fmtDur, fmtPace, hasWarning, km, lastExerciseLog, pace, suggest, workoutById, volume } from '../logic.ts'
import { Btn, Card, Empty, ExerciseImage, H2, Icon, Page, Pill, go } from '../ui.tsx'

const restLabel = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min` : `${s} s`)
export const prescription = (ex: (typeof EXERCISES)[string], it: { sets: number; min: number; max: number }) => {
  const r = it.min === it.max ? `${it.min}` : `${it.min}–${it.max}`
  const u = { reps: '', 'reps/lado': ' por lado', seg: ' s', 'seg/lado': ' s por lado' }[ex.unit]
  return `${it.sets} × ${r}${u}`
}

/** Plano semanal em formato calendário. */
export function Plan() {
  return (
    <Page title="Plano semanal">
      <div className="space-y-2">
        {WEEK.map((d) => {
          const w = d.workout ? workoutById(d.workout) : null
          return (
            <Card key={d.weekday} onClick={w ? () => go('treino/' + w.id) : d.type === 'run' ? () => go('corrida') : undefined}
              className={d.type === 'rest' ? 'bg-paper' : ''}>
              <div className="flex items-center gap-3">
                <div className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-semibold ${d.type === 'rest' ? 'bg-line/50 text-mute' : 'bg-sage-50 text-sage-700'}`}>
                  {d.short.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{d.title}</div>
                  <div className="truncate text-sm text-mute">{d.detail}{w ? ` · ${w.items.length} exercícios` : ''}</div>
                </div>
                {d.time && <Pill tone="mute">{d.time}</Pill>}
                {d.type !== 'rest' && <Icon name="next" className="text-mute" />}
              </div>
            </Card>
          )
        })}
      </div>
      <p className="text-center text-xs text-mute">Ginásio às 07:30 (~60 min) · corrida ao fim do dia</p>
    </Page>
  )
}

/** Lista de exercícios de um treino. */
export function WorkoutDetail({ id }: { id: string }) {
  const db = useDB()
  const w = WORKOUTS.find((x) => x.id === id)
  if (!w) return <Page title="Treino" back="treino"><Empty>Treino não encontrado.</Empty></Page>
  return (
    <Page title={w.name} back="treino">
      <p className="-mt-3 text-sm text-mute">{WEEK[w.weekday - 1].name} · {w.goal}</p>
      <Btn className="w-full min-h-14 text-base" onClick={() => go('sessao/' + w.id)}><Icon name="play" />{db.draft?.workout === w.id ? 'Continuar treino' : 'Iniciar treino'}</Btn>
      <div className="space-y-2">
        {w.items.map((it, i) => {
          const ex = EXERCISES[it.ex]
          const last = lastExerciseLog(db, it.ex)
          const s = suggest(ex, it, last)
          return (
            <div key={i}>
              {i === w.coreFrom && <h2 className="mt-4 mb-2 text-sm font-semibold uppercase tracking-wide text-mute">Core e abdominais</h2>}
              <Card onClick={() => go('exercicio/' + ex.id)}>
                <div className="flex gap-3">
                  <ExerciseImage ex={ex} className="w-24 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium leading-tight">{ex.pt}</div>
                    <div className="text-xs text-mute">{ex.en}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Pill>{prescription(ex, it)}</Pill>
                      <Pill tone="mute">descanso {restLabel(ex.rest)}</Pill>
                      {s.level === 'up' && <Pill>↑ subir carga</Pill>}
                      {s.level === 'hold' && <Pill tone="rose">não subir</Pill>}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </Page>
  )
}

/** Ficha técnica completa de um exercício. */
export function ExerciseDetail({ id }: { id: string }) {
  const db = useDB()
  const ex = EXERCISES[id]
  if (!ex) return <Page title="Exercício" back=""><Empty>Exercício não encontrado.</Empty></Page>
  const uses = WORKOUTS.flatMap((w) => w.items.filter((it) => it.ex === id).map((it) => ({ w, it })))
  const history = db.workouts.filter((w) => w.finished).flatMap((w) => w.exercises.filter((e) => e.ex === id && e.sets.some((s) => s.reps)).map((e) => ({ date: w.date, e })))
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  return (
    <Page title={ex.pt} back="">
      <p className="-mt-3 text-sm text-mute">{ex.en}</p>
      <ExerciseImage ex={ex} both />
      {ex.imgNote && <p className="text-xs text-mute">{ex.imgNote}</p>}
      <div className="flex flex-wrap gap-1">
        {uses.map(({ w, it }) => <Pill key={w.id}>{w.name}: {prescription(ex, it)}</Pill>)}
        <Pill tone="mute">descanso {restLabel(ex.rest)}</Pill>
      </div>
      <Card><H2>Músculos trabalhados</H2><p className="text-sm">{ex.muscles}</p></Card>
      <Card><H2>Posição inicial</H2><p className="text-sm leading-relaxed">{ex.start}</p></Card>
      <Card>
        <H2>Execução</H2>
        <ol className="space-y-2 text-sm leading-relaxed">
          {ex.steps.map((s, i) => <li key={i} className="flex gap-2"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sage-50 text-xs font-semibold text-sage-700">{i + 1}</span>{s}</li>)}
        </ol>
      </Card>
      <Card><H2>Respiração</H2><p className="text-sm">{ex.breathing}</p></Card>
      <Card>
        <H2>Erros comuns</H2>
        <ul className="list-disc space-y-1 pl-5 text-sm">{ex.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
      </Card>
      <Card className={ex.requiresTechnique ? 'border-amber-200 bg-amber-soft' : ''}>
        <H2>Técnica e segurança</H2>
        <p className="text-sm leading-relaxed">{ex.safety}</p>
        <p className="mt-2 text-sm"><span className="text-mute">Progressão:</span> {ex.increment}.</p>
        <p className="mt-2 text-xs text-mute">Se sentires dor, para o exercício. Nunca treines com dor.</p>
      </Card>
      <Card>
        <H2>Últimos registos</H2>
        {history.length ? (
          <ul className="divide-y divide-line text-sm">
            {history.map(({ date, e }, i) => (
              <li key={i} className="flex justify-between py-2">
                <span className="text-mute">{fmtDate(date)}</span>
                <span className="tabular-nums">{e.sets.filter((s) => s.reps).map((s) => `${s.kg ?? ''}${s.kg != null ? '×' : ''}${s.reps}`).join(' · ')}{hasWarning(e) ? ' ⚠︎' : ''}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-mute">Sem registos ainda.</p>}
      </Card>
    </Page>
  )
}

/** Histórico de treinos e corridas. */
export function History() {
  const db = useDB()
  const [open, setOpen] = useState<string | null>(null)
  const items = [
    ...db.workouts.filter((w) => w.finished).map((w) => ({ kind: 'gym' as const, date: w.date, id: w.id, w })),
    ...db.runs.map((r) => ({ kind: 'run' as const, date: r.date, id: r.id, r })),
  ].sort((a, b) => b.date.localeCompare(a.date))
  return (
    <Page title="Histórico" back="">
      {!items.length && <Empty action={<Btn onClick={() => go('treino')}>Ver plano</Btn>}>Ainda não há treinos registados.</Empty>}
      {items.map((it) =>
        it.kind === 'run' ? (
          <Card key={it.id} onClick={() => go('corrida/' + it.id)}>
            <div className="flex items-center gap-3">
              <Icon name="run" className="size-6 text-sage-600" />
              <div className="flex-1"><div className="font-medium">Corrida · {km(it.r.km)} km</div><div className="text-sm text-mute">{fmtDate(it.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {fmtDur(it.r.sec)} · {fmtPace(pace(it.r.km, it.r.sec))} min/km</div></div>
              {it.r.pain && <Pill tone="rose">dor</Pill>}
            </div>
          </Card>
        ) : (
          <Card key={it.id}>
            <button className="flex w-full items-center gap-3 text-left" onClick={() => setOpen(open === it.id ? null : it.id)}>
              <Icon name="gym" className="size-6 text-sage-600" />
              <div className="flex-1">
                <div className="font-medium">{workoutById(it.w.workout).name}</div>
                <div className="text-sm text-mute">{fmtDate(it.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {it.w.exercises.filter((e) => e.done).length}/{it.w.exercises.length} exercícios · {Math.round(it.w.exercises.reduce((t, e) => t + volume(e), 0))} kg</div>
              </div>
              {it.w.exercises.some(hasWarning) && <Pill tone="rose">⚠︎</Pill>}
              <Icon name={open === it.id ? 'back' : 'next'} className="-rotate-90 text-mute" />
            </button>
            {open === it.id && (
              <div className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
                {it.w.exercises.map((e, i) => (
                  <div key={i}>
                    <div className="flex justify-between gap-2"><span className={e.done ? '' : 'text-mute line-through'}>{EXERCISES[e.ex]?.pt}</span><span className="tabular-nums text-mute">{e.sets.filter((s) => s.reps).map((s) => `${s.kg ?? ''}${s.kg != null ? '×' : ''}${s.reps}`).join(' · ') || '—'}</span></div>
                    {(e.tags.length > 0 || e.comment || e.pain) && <div className="text-xs text-mute">{[e.rpe ? `dificuldade ${e.rpe}/10` : '', ...e.tags, e.comment, e.pain ? `dor: ${e.painNote || 'sim'}` : ''].filter(Boolean).join(' · ')}</div>}
                  </div>
                ))}
                {it.w.notes && <p className="rounded-lg bg-paper p-2 text-mute">{it.w.notes}</p>}
                <Btn variant="danger" className="w-full" onClick={() => confirm('Apagar este treino? Não é possível desfazer.') && update((db) => { db.workouts = db.workouts.filter((w) => w.id !== it.id) })}>Apagar treino</Btn>
              </div>
            )}
          </Card>
        ),
      )}
    </Page>
  )
}

export const RunSessionCard = () => (
  <Card>
    <H2>Sessão-tipo</H2>
    <ol className="space-y-2 text-sm">
      {RUN_SESSION.map((s) => <li key={s.d} className="flex gap-3"><span className="w-20 shrink-0 font-semibold tabular-nums">{s.t}</span><span>{s.d}</span></li>)}
    </ol>
  </Card>
)
