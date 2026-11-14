import { useState } from 'react'
import { WEEK, WORKOUTS } from '../data.ts'
import { replaceDB, update, useDB } from '../store.ts'
import { addDays, fmtDate, fmtDur, fmtPace, km, mondayOf, pace, reviewDue, runTarget, sampleDB, today, trainingWeek, weekday, volume, workoutById, type DB } from '../logic.ts'
import { Btn, Card, Field, H2, Icon, Page, Pill, Progress, Stat, go, inputCls } from '../ui.tsx'

/** Próximo dia de ginásio a partir de hoje (inclusive), saltando os já feitos esta semana. */
export function nextGym(db: DB) {
  const t = today()
  for (let i = 0; i < 8; i++) {
    const d = addDays(t, i)
    const day = WEEK[weekday(d) - 1]
    if (day.type !== 'gym') continue
    const done = db.workouts.some((w) => w.finished && w.workout === day.workout && mondayOf(w.date) === mondayOf(d))
    if (!done) return { date: d, day, w: workoutById(day.workout!) }
  }
  return null
}

export default function Home() {
  const db = useDB()
  if (!db.onboarded) return <Welcome />
  const t = today()
  const tw = trainingWeek(db.profile.startDate)
  const mon = mondayOf(t)
  const weekWorkouts = db.workouts.filter((w) => w.finished && w.date >= mon)
  const weekRuns = db.runs.filter((r) => r.date >= mon)
  const next = nextGym(db)
  const target = runTarget(tw.week, db.runs)
  const lastW = [...db.workouts].filter((w) => w.finished).sort((a, b) => b.date.localeCompare(a.date))[0]
  const lastR = [...db.runs].sort((a, b) => b.date.localeCompare(a.date))[0]
  const due = reviewDue(db)
  const todayDay = WEEK[weekday(t) - 1]
  const hello = new Date().getHours() < 13 ? 'Bom dia' : new Date().getHours() < 20 ? 'Boa tarde' : 'Boa noite'

  return (
    <Page title={`${hello}${db.profile.name ? ', ' + db.profile.name : ''}`}>
      <p className="-mt-3 text-sm text-mute">
        Semana {tw.week} · bloco {tw.block} · {fmtDate(t, { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {db.draft && (
        <Card onClick={() => go('sessao/' + db.draft!.workout)} className="border-sage-300 bg-sage-50">
          <div className="flex items-center gap-3">
            <Icon name="play" className="size-6 text-sage-700" />
            <div className="flex-1"><div className="font-medium">Treino em curso: {workoutById(db.draft.workout).name}</div><div className="text-sm text-mute">Toca para continuar</div></div>
            <Icon name="next" className="text-mute" />
          </div>
        </Card>
      )}

      {due && (
        <Card onClick={() => go('revisao/' + due)} className="border-amber-200 bg-amber-soft">
          <div className="flex items-center gap-3">
            <Icon name="chart" className="size-6 text-amber-800" />
            <div className="flex-1"><div className="font-medium">Revisão do bloco {due} disponível</div><div className="text-sm text-amber-900/70">Responde a 7 perguntas e vê sugestões para as próximas 4 semanas</div></div>
            <Icon name="next" />
          </div>
        </Card>
      )}

      {/* Ação principal */}
      <div className="grid grid-cols-2 gap-2">
        {todayDay.type === 'run' && !weekRuns.length ? (
          <Btn onClick={() => go('corrida/nova')} className="col-span-2 min-h-14 text-base"><Icon name="run" />Registar a corrida de hoje</Btn>
        ) : next ? (
          <Btn onClick={() => go('sessao/' + next.w.id)} className="col-span-2 min-h-14 text-base">
            <Icon name="play" />{next.date === t ? `Iniciar treino de hoje · ${next.w.name}` : `Iniciar ${next.w.name} (${next.day.name.toLowerCase()})`}
          </Btn>
        ) : null}
        <Btn variant="ghost" onClick={() => go('corrida/nova')}><Icon name="run" />Corrida</Btn>
        <Btn variant="ghost" onClick={() => go('historico')}><Icon name="history" />Histórico</Btn>
        <Btn variant="ghost" onClick={() => go('progresso')} className="col-span-2"><Icon name="chart" />Ver progresso</Btn>
      </div>

      {/* Semana */}
      <Card>
        <H2 right={<span className="text-sm text-mute">{weekWorkouts.length}/3 ginásio · {weekRuns.length}/1 corrida</span>}>Esta semana</H2>
        <div className="grid grid-cols-7 gap-1">
          {WEEK.map((d) => {
            const date = addDays(mon, d.weekday - 1)
            const done = d.type === 'gym' ? weekWorkouts.some((w) => w.workout === d.workout) : d.type === 'run' ? weekRuns.length > 0 : false
            const isToday = date === t
            return (
              <button key={d.weekday} onClick={() => go(d.workout ? 'treino/' + d.workout : d.type === 'run' ? 'corrida' : 'treino')}
                className={`flex flex-col items-center rounded-xl py-2 text-xs ${isToday ? 'ring-2 ring-sage-500' : ''} ${done ? 'bg-sage-600 text-white' : d.type === 'rest' ? 'bg-paper text-mute' : 'bg-sage-50 text-sage-700'}`}>
                <span className="font-medium">{d.short}</span>
                <span className="mt-1">{done ? <Icon name="check" className="size-4" /> : d.type === 'gym' ? <Icon name="gym" className="size-4" /> : d.type === 'run' ? <Icon name="run" className="size-4" /> : '·'}</span>
              </button>
            )
          })}
        </div>
        {next && <p className="mt-3 text-sm"><span className="text-mute">Próximo treino:</span> <b>{next.w.name}</b> — {next.day.name}, {fmtDate(next.date)} às {next.day.time}</p>}
      </Card>

      {/* Revisão de 4 semanas */}
      <Card>
        <H2 right={<span className="text-sm text-mute">dia {Math.min(28, tw.dayInBlock)} de 28</span>}>Até à revisão de 4 semanas</H2>
        <Progress value={tw.dayInBlock / 28} />
        <p className="mt-2 text-sm text-mute">Bloco {tw.block}: {fmtDate(tw.blockStart)} – {fmtDate(tw.blockEnd)} · semana {tw.weekInBlock} de 4</p>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Treinos concluídos" value={db.workouts.filter((w) => w.finished).length} sub={`${db.runs.length} corridas no total`} />
        <Stat label="Objetivo de corrida" value={target.label} sub={target.repeat ? 'repetir etapa' : `semana ${tw.week}`} />
      </div>

      <Card onClick={lastW ? () => go('historico') : undefined}>
        <H2>Último treino de ginásio</H2>
        {lastW ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{workoutById(lastW.workout).name}</div>
              <div className="text-sm text-mute">{fmtDate(lastW.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {lastW.exercises.filter((e) => e.done).length}/{lastW.exercises.length} exercícios</div>
            </div>
            <div className="text-right"><div className="text-lg font-semibold tabular-nums">{Math.round(lastW.exercises.reduce((t, e) => t + volume(e), 0)).toLocaleString('pt-PT')} kg</div><div className="text-xs text-mute">volume total</div></div>
          </div>
        ) : <p className="text-sm text-mute">Ainda sem treinos. O primeiro é o mais importante!</p>}
      </Card>

      <Card onClick={lastR ? () => go('corrida') : undefined}>
        <H2>Última corrida</H2>
        {lastR ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><div className="text-lg font-semibold tabular-nums">{km(lastR.km)} km</div><div className="text-xs text-mute">{fmtDate(lastR.date)}</div></div>
            <div><div className="text-lg font-semibold tabular-nums">{fmtDur(lastR.sec)}</div><div className="text-xs text-mute">duração</div></div>
            <div><div className="text-lg font-semibold tabular-nums">{fmtPace(pace(lastR.km, lastR.sec))}</div><div className="text-xs text-mute">min/km</div></div>
          </div>
        ) : <p className="text-sm text-mute">Ainda sem corridas registadas.</p>}
      </Card>
    </Page>
  )
}

function Welcome() {
  const [name, setName] = useState('')
  const [start, setStart] = useState(mondayOf(today()))
  return (
    <Page title="Boas-vindas ao Treino">
      <Card>
        <p className="text-sm leading-relaxed text-mute">
          O teu diário de ginásio e corrida: plano semanal, registo de cargas e repetições, sugestões de progressão seguras e revisões a cada 4 semanas.
          Os dados ficam só neste dispositivo.
        </p>
        <div className="mt-4 space-y-3">
          <Field label="Como te chamas? (opcional)"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" /></Field>
          <Field label="Início do plano" hint="A semana 1 começa na segunda-feira desta data."><input type="date" className={inputCls} value={start} onChange={(e) => setStart(e.target.value)} /></Field>
        </div>
        <Btn className="mt-4 w-full" onClick={() => update((db) => { db.onboarded = true; db.profile.name = name.trim(); db.profile.startDate = mondayOf(start || today()) })}>Começar</Btn>
        <Btn variant="ghost" className="mt-2 w-full" onClick={() => replaceDB(sampleDB())}>Explorar com dados de exemplo</Btn>
        <p className="mt-2 text-xs text-mute">Podes apagar os dados de exemplo a qualquer momento no Perfil.</p>
      </Card>
      <Card>
        <H2>O plano</H2>
        <ul className="space-y-1 text-sm">
          {WORKOUTS.map((w) => <li key={w.id}><b>{WEEK[w.weekday - 1].name}</b> — {w.name}: {w.focus.toLowerCase()}</li>)}
          <li><b>Terça</b> — Corrida contínua</li>
          <li><b>Quinta, sábado e domingo</b> — Descanso</li>
        </ul>
        <div className="mt-2"><Pill>3× ginásio · 1× corrida por semana</Pill></div>
      </Card>
    </Page>
  )
}
