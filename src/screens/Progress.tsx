import { useState } from 'react'
import { EXERCISES, WORKOUTS, type Group } from '../data.ts'
import { update, useDB } from '../store.ts'
import {
  REVIEW_QUESTIONS, addDays, blockRange, blockStats, daysBetween, exerciseProgress, fmtDate, fmtPace, km, mondayOf, pace, reviewDue,
  reviewSuggestions, today, trainingWeek, uid, workingKg,
} from '../logic.ts'
import { BarChart, Btn, Card, Empty, Field, H2, Icon, LineChart, Page, Pill, Stat, go, inputCls } from '../ui.tsx'
import { weeklyKm } from './Running.tsx'

const RANGES = [{ l: '4 sem.', d: 28 }, { l: '8 sem.', d: 56 }, { l: '12 sem.', d: 84 }, { l: 'Tudo', d: 0 }]
const short = (s: string) => fmtDate(s, { day: 'numeric', month: 'numeric' })

export default function ProgressPage() {
  const db = useDB()
  const [range, setRange] = useState(56)
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null)
  const allLoaded = [...new Set(WORKOUTS.flatMap((w) => w.items.map((i) => i.ex)))].filter((id) => EXERCISES[id].loaded)
  const [exId, setExId] = useState(allLoaded[0])

  const to = custom?.to ?? today()
  const from = custom?.from ?? (range ? addDays(to, -range + 1) : [db.profile.startDate, ...db.workouts.map((w) => w.date), ...db.runs.map((r) => r.date)].sort()[0])
  const ws = db.workouts.filter((w) => w.finished && w.date >= from && w.date <= to).sort((a, b) => a.date.localeCompare(b.date))
  const runs = db.runs.filter((r) => r.date >= from && r.date <= to).sort((a, b) => a.date.localeCompare(b.date))
  const weeks = Math.max(1, Math.ceil((daysBetween(mondayOf(from > db.profile.startDate ? from : db.profile.startDate), to) + 1) / 7)) // só conta semanas desde o início do plano
  const consistency = Math.min(1, ws.length / (weeks * 3))

  const perWeek: { label: string; value: number }[] = []
  for (let m = mondayOf(from); m <= to; m = addDays(m, 7)) perWeek.push({ label: short(m), value: ws.filter((w) => w.date >= m && w.date < addDays(m, 7)).length })

  const exSeries = ws.flatMap((w) => w.exercises.filter((e) => e.ex === exId && e.sets.some((s) => s.reps)).map((e) => ({ date: w.date, kg: workingKg(e) ?? 0, reps: e.sets.reduce((t, s) => t + (s.reps ?? 0), 0) })))

  const groups = new Map<Group, number>()
  for (const w of ws) for (const e of w.exercises) {
    const n = e.sets.filter((s) => s.reps).length
    if (n) groups.set(EXERCISES[e.ex].group, (groups.get(EXERCISES[e.ex].group) ?? 0) + n)
  }
  const groupMax = Math.max(1, ...groups.values())
  const due = reviewDue(db)

  return (
    <Page title="Progresso">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button key={r.l} onClick={() => { setRange(r.d); setCustom(null) }} className={`rounded-full border px-3 py-2 text-sm ${!custom && range === r.d ? 'border-sage-600 bg-sage-600 text-white' : 'border-line bg-white'}`}>{r.l}</button>
        ))}
        <button onClick={() => setCustom(custom ?? { from, to })} className={`rounded-full border px-3 py-2 text-sm ${custom ? 'border-sage-600 bg-sage-600 text-white' : 'border-line bg-white'}`}>Personalizado</button>
      </div>
      {custom && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="De"><input type="date" className={inputCls} value={custom.from} max={custom.to} onChange={(e) => e.target.value && setCustom({ ...custom, from: e.target.value })} /></Field>
          <Field label="Até"><input type="date" className={inputCls} value={custom.to} min={custom.from} onChange={(e) => e.target.value && setCustom({ ...custom, to: e.target.value })} /></Field>
        </div>
      )}
      <p className="-mt-2 text-xs text-mute">{fmtDate(from)} – {fmtDate(to)}</p>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Treinos de ginásio" value={ws.length} sub={`${Math.round(consistency * 100)}% de consistência`} />
        <Stat label="Corridas" value={runs.length} sub={`${km(Math.round(runs.reduce((t, r) => t + r.km, 0) * 10) / 10)} km no total`} />
      </div>

      <Card><H2>Treinos concluídos por semana</H2><BarChart data={perWeek.slice(-16)} target={3} /></Card>

      <Card>
        <H2>Progressão de carga</H2>
        <select className={inputCls + ' mb-3'} value={exId} onChange={(e) => setExId(e.target.value)}>
          {allLoaded.map((id) => <option key={id} value={id}>{EXERCISES[id].pt}</option>)}
        </select>
        <LineChart data={exSeries.map((p) => ({ label: short(p.date), value: p.kg }))} fmt={(v) => `${km(v)} kg`} />
        {exSeries.length > 0 && (
          <>
            <div className="mt-3 mb-1 text-xs text-mute">Repetições totais por sessão</div>
            <LineChart data={exSeries.map((p) => ({ label: short(p.date), value: p.reps }))} />
          </>
        )}
      </Card>

      <Card><H2>Distância de corrida (km)</H2><LineChart data={runs.map((r) => ({ label: short(r.date), value: r.km }))} fmt={km} /></Card>
      <Card><H2>Ritmo médio (min/km)</H2><LineChart data={runs.map((r) => ({ label: short(r.date), value: pace(r.km, r.sec) }))} fmt={fmtPace} invert /></Card>
      <Card><H2>Quilómetros por semana</H2><BarChart data={weeklyKm(runs, from, to).slice(-16)} fmt={(v) => km(Math.round(v * 10) / 10)} /></Card>

      <Card>
        <H2>Volume por grupo muscular (séries feitas)</H2>
        {groups.size ? (
          <ul className="space-y-2">
            {[...groups].sort((a, b) => b[1] - a[1]).map(([g, n]) => (
              <li key={g} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-2 text-sm">
                <span>{g}</span>
                <span className="h-3 overflow-hidden rounded-full bg-sage-50"><span className="block h-full rounded-full bg-sage-500" style={{ width: `${(n / groupMax) * 100}%` }} /></span>
                <span className="text-right tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
        ) : <Empty>Sem treinos neste período.</Empty>}
      </Card>

      <Card>
        <H2>Revisões de 4 semanas</H2>
        {due && <Btn className="mb-3 w-full" onClick={() => go('revisao/' + due)}>Fazer revisão do bloco {due}</Btn>}
        {db.reviews.length ? (
          <ul className="divide-y divide-line">
            {[...db.reviews].sort((a, b) => b.block - a.block).map((r) => (
              <li key={r.id}><button onClick={() => go('revisao/' + r.block)} className="flex w-full items-center justify-between py-3 text-left">
                <span><b>Bloco {r.block}</b> <span className="text-sm text-mute">· {fmtDate(r.date)}</span></span><Icon name="next" className="text-mute" />
              </button></li>
            ))}
          </ul>
        ) : <p className="text-sm text-mute">Ainda sem revisões. A primeira fica disponível no fim da 4.ª semana.</p>}
      </Card>
    </Page>
  )
}

export function ReviewPage({ block }: { block: number }) {
  const db = useDB()
  const saved = db.reviews.find((r) => r.block === block)
  const [a, setA] = useState<Record<string, string>>(saved?.answers ?? {})
  const { from, to } = blockRange(db.profile.startDate, block)
  const cur = trainingWeek(db.profile.startDate)
  if (!(block >= 1 && block <= cur.block)) return <Page title="Revisão" back="progresso"><Empty>Este bloco ainda não começou.</Empty></Page>

  const s = blockStats(db, from, to)
  const prog = exerciseProgress(db, db.profile.startDate, to)
  const answered = REVIEW_QUESTIONS.every((q) => a[q.id])
  const save = () => update((db) => {
    db.reviews = db.reviews.filter((r) => r.block !== block)
    db.reviews.push({ id: uid(), date: today(), block, answers: a, suggestions: reviewSuggestions(a, s) })
  })

  return (
    <Page title={`Revisão · bloco ${block}`} back="progresso">
      <p className="-mt-3 text-sm text-mute">{fmtDate(from)} – {fmtDate(to)}</p>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Treinos de ginásio" value={`${s.gym}/12`} />
        <Stat label="Corridas" value={`${s.runs}/4`} />
        <Stat label="Distância" value={s.firstRun ? `${km(s.firstRun.km)} → ${km(s.lastRun!.km)} km` : '–'} sub="primeira → última" />
        <Stat label="Ritmo" value={s.firstRun ? `${fmtPace(pace(s.firstRun.km, s.firstRun.sec))} → ${fmtPace(pace(s.lastRun!.km, s.lastRun!.sec))}` : '–'} sub="min/km" />
      </div>

      <Card>
        <H2>Cargas e repetições: início → agora</H2>
        {prog.length ? (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-mute"><th className="py-1 font-normal">Exercício</th><th className="font-normal">Carga</th><th className="font-normal">Reps tot.</th></tr></thead>
            <tbody className="divide-y divide-line">
              {prog.map((p) => {
                const up = (p.last.kg ?? 0) > (p.first.kg ?? 0)
                return (
                  <tr key={p.ex}>
                    <td className="py-2 pr-2">{EXERCISES[p.ex].pt}</td>
                    <td className="tabular-nums">{p.first.kg != null ? `${km(p.first.kg)} → ${km(p.last.kg ?? 0)} kg` : '—'} {up && <span className="text-sage-600">↑</span>}</td>
                    <td className="tabular-nums">{p.first.reps} → {p.last.reps}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : <Empty>Sem treinos registados neste período.</Empty>}
      </Card>

      <Card className={s.pains.length ? 'border-rose-200' : ''}>
        <H2>Dor ou desconforto registado</H2>
        {s.pains.length ? (
          <ul className="space-y-1 text-sm">{s.pains.map((p, i) => <li key={i}><span className="text-mute">{fmtDate(p.date)}</span> · <b>{p.what}</b>: {p.note}</li>)}</ul>
        ) : <p className="text-sm text-mute">Nenhum registo neste bloco. 👍</p>}
      </Card>

      <Card className="space-y-4">
        <H2>A tua avaliação</H2>
        {REVIEW_QUESTIONS.map((q) => (
          <div key={q.id}>
            <div className="mb-1 text-sm font-medium">{q.q}</div>
            <div className="flex flex-wrap gap-2">
              {q.opts.map((o) => <button key={o} onClick={() => setA({ ...a, [q.id]: o })} className={`rounded-full border px-3 py-2 text-sm ${a[q.id] === o ? 'border-sage-600 bg-sage-600 text-white' : 'border-line bg-white'}`}>{o}</button>)}
            </div>
          </div>
        ))}
        <Field label="Queres ajustar algum objetivo?"><textarea rows={2} className={inputCls + ' py-2'} value={a.objetivos ?? ''} onChange={(e) => setA({ ...a, objetivos: e.target.value })} placeholder="Ex.: mais foco nos glúteos, correr 7 km…" /></Field>
        <Btn className="w-full" disabled={!answered} onClick={save}>{saved ? 'Atualizar sugestões' : 'Ver sugestões para o próximo bloco'}</Btn>
        {!answered && <p className="text-center text-xs text-mute">Responde às 6 perguntas para continuar.</p>}
      </Card>

      {saved && (
        <Card className="border-sage-300 bg-sage-50">
          <H2 right={<Pill>guardado {fmtDate(saved.date)}</Pill>}>Sugestões para o bloco {block + 1}</H2>
          <ul className="space-y-2 text-sm leading-relaxed">{saved.suggestions.map((x, i) => <li key={i} className="flex gap-2"><span className="text-sage-600">•</span>{x}</li>)}</ul>
        </Card>
      )}
    </Page>
  )
}
