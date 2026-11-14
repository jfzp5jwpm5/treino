import { useState } from 'react'
import { RUN_PLAN, SURFACES } from '../data.ts'
import { update, useDB } from '../store.ts'
import { addDays, fmtDate, fmtDur, fmtPace, km, mondayOf, pace, runTarget, speed, today, trainingWeek, uid, type RunLog } from '../logic.ts'
import { BarChart, Btn, Card, Empty, Field, H2, Icon, LineChart, Page, Pill, Scale, Stat, go, inputCls } from '../ui.tsx'
import { RunSessionCard } from './Training.tsx'

export function weeklyKm(runs: RunLog[], from: string, to: string) {
  const out: { label: string; value: number }[] = []
  for (let m = mondayOf(from); m <= to; m = addDays(m, 7)) {
    const next = addDays(m, 7)
    out.push({ label: fmtDate(m, { day: 'numeric', month: 'numeric' }), value: runs.filter((r) => r.date >= m && r.date < next).reduce((t, r) => t + r.km, 0) })
  }
  return out
}

export default function Running() {
  const db = useDB()
  const tw = trainingWeek(db.profile.startDate)
  const target = runTarget(tw.week, db.runs)
  const runs = [...db.runs].sort((a, b) => a.date.localeCompare(b.date))
  const total = runs.reduce((t, r) => t + r.km, 0)
  const best = runs.length ? Math.min(...runs.map((r) => pace(r.km, r.sec))) : 0
  const lastIdx = Math.min(RUN_PLAN.length - 1, Math.floor((tw.week - 1) / 2))

  return (
    <Page title="Corrida" action={<Btn className="min-h-10 px-3" onClick={() => go('corrida/nova')}><Icon name="plus" />Registar</Btn>}>
      <Card className="bg-sage-50 border-sage-100">
        <div className="text-sm text-sage-700">Objetivo desta semana · terça ao fim do dia</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight">{target.label}</div>
        {target.repeat && <div className="mt-1"><Pill tone="amber">Repetir etapa anterior (plano: {target.planned})</Pill></div>}
        <p className="mt-2 text-sm text-sage-700">{target.note}</p>
      </Card>

      <RunSessionCard />

      <Card>
        <H2>Progressão de 8 semanas</H2>
        <div className="grid grid-cols-4 gap-2 text-center">
          {RUN_PLAN.map((p, i) => (
            <div key={i} className={`rounded-xl p-2 ${i === lastIdx && tw.week <= 8 ? 'bg-sage-600 text-white' : i < lastIdx || tw.week > 8 ? 'bg-sage-50 text-sage-700' : 'bg-paper text-mute'}`}>
              <div className="text-[11px]">Sem. {p.weeks.join('–')}</div>
              <div className="text-sm font-semibold">{p.min === p.max ? km(p.min) : `${km(p.min)}–${km(p.max)}`}</div>
              <div className="text-[11px]">km</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-mute">Flexível: se sentires cansaço ou a última corrida custou, repete a distância anterior. Consistência e resistência antes de treinos mais rápidos.</p>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Corridas" value={runs.length} />
        <Stat label="Total" value={`${km(Math.round(total * 10) / 10)} km`} />
        <Stat label="Melhor ritmo" value={fmtPace(best)} sub="min/km" />
      </div>

      {runs.length ? (
        <>
          <Card><H2>Distância por corrida (km)</H2><LineChart data={runs.map((r) => ({ label: fmtDate(r.date, { day: 'numeric', month: 'numeric' }), value: r.km }))} fmt={km} /></Card>
          <Card><H2>Ritmo médio (min/km · mais alto = mais rápido)</H2><LineChart data={runs.map((r) => ({ label: fmtDate(r.date, { day: 'numeric', month: 'numeric' }), value: pace(r.km, r.sec) }))} fmt={fmtPace} invert /></Card>
          <Card><H2>Quilómetros por semana</H2><BarChart data={weeklyKm(runs, runs[0].date, today()).slice(-12)} fmt={(v) => km(Math.round(v * 10) / 10)} /></Card>
          <Card>
            <H2>Registos</H2>
            <ul className="divide-y divide-line">
              {[...runs].reverse().map((r) => (
                <li key={r.id}>
                  <button onClick={() => go('corrida/' + r.id)} className="flex w-full items-center gap-3 py-3 text-left">
                    <div className="flex-1">
                      <div className="font-medium tabular-nums">{km(r.km)} km · {fmtDur(r.sec)}</div>
                      <div className="text-sm text-mute">{fmtDate(r.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {r.surface}{r.effort ? ` · esforço ${r.effort}/10` : ''}</div>
                    </div>
                    <div className="text-right tabular-nums"><div className="font-medium">{fmtPace(pace(r.km, r.sec))}</div><div className="text-xs text-mute">min/km</div></div>
                    {r.pain && <Pill tone="rose">dor</Pill>}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </>
      ) : <Empty action={<Btn onClick={() => go('corrida/nova')}>Registar primeira corrida</Btn>}>Ainda não registaste corridas.</Empty>}
    </Page>
  )
}

export function RunForm({ id }: { id?: string }) {
  const db = useDB()
  const existing = id ? db.runs.find((r) => r.id === id) : undefined
  const [r, setR] = useState<RunLog>(existing ?? { id: uid(), date: today(), km: 5, sec: 0, surface: SURFACES[0], effort: null, comments: '', pain: false, painNote: '' })
  const [h, setH] = useState(existing ? Math.floor(existing.sec / 3600) : 0)
  const [m, setM] = useState(existing ? Math.floor((existing.sec % 3600) / 60) : 0)
  const [s, setS] = useState(existing ? existing.sec % 60 : 0)
  const [err, setErr] = useState('')
  if (id && !existing) return <Page title="Corrida" back="corrida"><Empty>Registo não encontrado.</Empty></Page>

  const sec = h * 3600 + m * 60 + s
  const p = pace(r.km, sec)
  const set = (patch: Partial<RunLog>) => setR({ ...r, ...patch })
  const n = (v: string) => Math.max(0, Number(v.replace(',', '.')) || 0)

  const save = () => {
    if (!(r.km > 0)) return setErr('Indica a distância em km.')
    if (!(sec > 0)) return setErr('Indica a duração total.')
    if (p < 150 || p > 1200) return setErr('O ritmo calculado não parece realista. Confirma a distância e a duração.')
    update((db) => { db.runs = [...db.runs.filter((x) => x.id !== r.id), { ...r, sec }] })
    go('corrida')
  }

  return (
    <Page title={existing ? 'Editar corrida' : 'Registar corrida'} back="corrida">
      <Card className="space-y-4">
        <Field label="Data"><input type="date" className={inputCls} value={r.date} onChange={(e) => e.target.value && set({ date: e.target.value })} /></Field>
        <Field label="Distância (km)"><input inputMode="decimal" className={inputCls + ' text-lg'} defaultValue={String(r.km).replace('.', ',')} onChange={(e) => set({ km: n(e.target.value) })} /></Field>
        <div>
          <div className="mb-1 text-sm font-medium">Duração total</div>
          <div className="grid grid-cols-3 gap-2">
            {([['h', h, setH], ['min', m, setM], ['s', s, setS]] as const).map(([l, v, fn]) => (
              <label key={l} className="relative">
                <input inputMode="numeric" className={inputCls + ' pr-10 text-lg tabular-nums'} value={v || ''} placeholder="0" onChange={(e) => fn(Math.floor(n(e.target.value)))} aria-label={l} />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-mute">{l}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Ritmo médio" value={sec && r.km ? fmtPace(p) : '–'} sub="min/km · automático" />
          <Stat label="Velocidade média" value={sec && r.km ? speed(r.km, sec).toLocaleString('pt-PT', { maximumFractionDigits: 1 }) : '–'} sub="km/h · automático" />
        </div>
        <Field label="Superfície">
          <div className="flex flex-wrap gap-2">
            {SURFACES.map((x) => <button key={x} onClick={() => set({ surface: x })} className={`rounded-full border px-3 py-2 text-sm ${r.surface === x ? 'border-sage-600 bg-sage-600 text-white' : 'border-line bg-white'}`}>{x}</button>)}
          </div>
        </Field>
        <div><div className="mb-1 text-sm font-medium">Esforço percebido</div><Scale value={r.effort} onChange={(v) => set({ effort: v })} labels={['Muito leve', 'Máximo']} /></div>
        <div className={`rounded-xl border p-3 ${r.pain ? 'border-rose-200 bg-rose-soft' : 'border-line'}`}>
          <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" className="size-5 accent-rose-700" checked={r.pain} onChange={(e) => set({ pain: e.target.checked })} />Senti dor ou desconforto</label>
          {r.pain && <input className={inputCls + ' mt-2'} value={r.painNote} onChange={(e) => set({ painNote: e.target.value })} placeholder="Onde? (ex.: joelho, canela, lombar)" />}
        </div>
        <Field label="Comentários gerais"><textarea rows={3} className={inputCls + ' py-2'} value={r.comments} onChange={(e) => set({ comments: e.target.value })} placeholder="Como te sentiste? Tempo, percurso…" /></Field>
        {err && <p className="rounded-lg bg-rose-soft p-2 text-sm text-rose-900" role="alert">{err}</p>}
        <Btn className="w-full min-h-14 text-base" onClick={save}><Icon name="check" />Guardar corrida</Btn>
        {existing && <Btn variant="danger" className="w-full" onClick={() => confirm('Apagar esta corrida?') && (update((db) => { db.runs = db.runs.filter((x) => x.id !== r.id) }), go('corrida'))}>Apagar</Btn>}
      </Card>
    </Page>
  )
}
