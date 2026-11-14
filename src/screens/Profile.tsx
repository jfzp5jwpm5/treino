import { useRef, useState } from 'react'
import { exportCSV, exportJSON, hasSaveError, importJSON, replaceDB, resetDB, update, useDB } from '../store.ts'
import { mondayOf, sampleDB, trainingWeek } from '../logic.ts'
import { Btn, Card, Field, H2, Page, inputCls } from '../ui.tsx'

export default function Profile() {
  const db = useDB()
  const p = db.profile
  const file = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const set = (k: keyof typeof p, v: string | number) => update((db) => { (db.profile as any)[k] = v })
  const num = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) || 0)
  const txt = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value)

  return (
    <Page title="Perfil">
      <Card className="space-y-3">
        <H2>Dados</H2>
        <Field label="Nome"><input className={inputCls} value={p.name} onChange={txt('name')} /></Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Idade"><input inputMode="numeric" className={inputCls} value={p.age} onChange={num('age')} /></Field>
          <Field label="Altura (cm)"><input inputMode="numeric" className={inputCls} value={p.height} onChange={num('height')} /></Field>
          <Field label="Peso (kg)"><input inputMode="decimal" className={inputCls} value={p.weight} onChange={num('weight')} /></Field>
        </div>
        <Field label="Início do plano" hint={`Hoje: semana ${trainingWeek(p.startDate).week}, bloco ${trainingWeek(p.startDate).block}.`}>
          <input type="date" className={inputCls} value={p.startDate} onChange={(e) => e.target.value && set('startDate', mondayOf(e.target.value))} />
        </Field>
      </Card>

      <Card className="space-y-3">
        <H2>Objetivos</H2>
        <Field label="Nível"><input className={inputCls} value={p.level} onChange={txt('level')} /></Field>
        <Field label="Objetivo principal"><textarea rows={2} className={inputCls + ' py-2'} value={p.goal} onChange={txt('goal')} /></Field>
        <Field label="Prioridade muscular"><input className={inputCls} value={p.priority} onChange={txt('priority')} /></Field>
        <Field label="Objetivos secundários"><input className={inputCls} value={p.secondary} onChange={txt('secondary')} /></Field>
        <Field label="Objetivo de corrida"><textarea rows={2} className={inputCls + ' py-2'} value={p.runGoal} onChange={txt('runGoal')} /></Field>
        <Field label="Notas de saúde"><textarea rows={2} className={inputCls + ' py-2'} value={p.backNote} onChange={txt('backNote')} /></Field>
      </Card>

      <Card className="border-amber-200 bg-amber-soft text-sm leading-relaxed">
        <b>Segurança.</b> Nunca treines com dor. A app só sugere aumentos de carga quando completas a faixa de repetições com boa técnica e sem desconforto, e nunca altera cargas sozinha.
        Em caso de dor lombar persistente, consulta um profissional de saúde.
      </Card>

      <Card className="space-y-2">
        <H2>Cópia de segurança</H2>
        <p className="text-sm text-mute">Os dados ficam só neste dispositivo e neste navegador. Exporta regularmente para não os perderes.</p>
        {hasSaveError() && <p className="rounded-lg bg-rose-soft p-2 text-sm text-rose-900">Não foi possível guardar no dispositivo (armazenamento cheio ou bloqueado). Exporta já uma cópia.</p>}
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="ghost" onClick={exportJSON}>Exportar JSON</Btn>
          <Btn variant="ghost" onClick={exportCSV}>Exportar CSV</Btn>
        </div>
        <Btn variant="ghost" className="w-full" onClick={() => file.current?.click()}>Importar cópia (JSON)</Btn>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; e.target.value = ''
          if (!f) return
          if (!confirm('Importar substitui todos os dados atuais. Continuar?')) return
          try { setMsg(await importJSON(f)) } catch (err) { setMsg(err instanceof Error ? err.message : 'Não foi possível ler o ficheiro.') }
        }} />
        {msg && <p className="text-sm" role="status">{msg}</p>}
      </Card>

      <Card className="space-y-2">
        <H2>Dados</H2>
        <Btn variant="ghost" className="w-full" onClick={() => confirm('Substituir os dados atuais por dados de exemplo?') && replaceDB(sampleDB())}>Carregar dados de exemplo</Btn>
        <Btn variant="danger" className="w-full" onClick={() => confirm('Apagar TODOS os dados (treinos, corridas, revisões)? Não é possível desfazer. Exporta primeiro se quiseres guardar.') && resetDB()}>Apagar todos os dados</Btn>
      </Card>
      <p className="text-center text-xs text-mute">Instala no telemóvel: no Safari, Partilhar → “Adicionar ao ecrã principal”; no Chrome, menu → “Instalar app”.<br />Imagens: Free Exercise DB (domínio público).</p>
    </Page>
  )
}
