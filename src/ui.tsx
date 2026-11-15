// Componentes partilhados: navegação, cartões, botões, gráficos SVG e imagens de exercício.
import { useEffect, useState, type ReactNode } from 'react'
import type { Exercise } from './data.ts'

/* ---------- rotas por hash (#/corrida, #/treino/A, …) ---------- */
export function useRoute() {
  const get = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [r, setR] = useState(get)
  useEffect(() => {
    const on = () => { setR(get()); window.scrollTo(0, 0) }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return r
}
export const go = (path: string) => { location.hash = '#/' + path.replace(/^\//, '') }

/* ---------- ícones ---------- */
const P: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  gym: 'M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11',
  run: 'M13 4a1.5 1.5 0 1 0 0 .01M9 21l2.5-5.5L14 17v4M7 12l3-3.5 4 1.5 2 3 3 .5M10.5 8.5 9 14',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  back: 'M15 18l-6-6 6-6',
  next: 'M9 18l6-6-6-6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  play: 'M7 4.5v15l12-7.5z',
  alert: 'M12 8v5M12 16.5v.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  info: 'M12 16v-5M12 8v.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2 2M9 2h6',
}
export const Icon = ({ name, className = 'size-5' }: { name: keyof typeof P | string; className?: string }) => (
  <svg viewBox="0 0 24 24" className={/\bsize-/.test(className) ? className : 'size-5 shrink-0 ' + className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={P[name]} />
  </svg>
)

/* ---------- blocos de layout ---------- */
export const Page = ({ title, back, children, action }: { title: string; back?: string; children: ReactNode; action?: ReactNode }) => (
  <div className="mx-auto max-w-2xl px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-safe">
    <header className="flex items-center gap-2 py-3">
      {back != null && (
        <button onClick={() => (back ? go(back) : history.back())} className="-ml-2 rounded-full p-2 text-mute hover:bg-line/60" aria-label="Voltar">
          <Icon name="back" />
        </button>
      )}
      <h1 className="flex-1 text-2xl font-semibold tracking-tight">{title}</h1>
      {action}
    </header>
    <div className="space-y-4">{children}</div>
  </div>
)

export const Card = ({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) => {
  const cls = `block w-full rounded-2xl border border-line ${/\bbg-/.test(className) ? '' : 'bg-white'} p-4 text-left ${onClick ? 'transition active:scale-[.99] hover:border-sage-300' : ''} ${className}`
  return onClick ? <button onClick={onClick} className={cls}>{children}</button> : <section className={cls}>{children}</section>
}

export const H2 = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <div className="mb-2 flex items-baseline justify-between gap-2">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-mute">{children}</h2>
    {right}
  </div>
)

export const Btn = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'soft' | 'danger'; className?: string; type?: 'button' | 'submit'; disabled?: boolean
}) => {
  const v = {
    primary: 'bg-sage-600 text-white hover:bg-sage-700',
    soft: 'bg-sage-50 text-sage-700 hover:bg-sage-100',
    ghost: 'border border-line bg-white text-ink hover:border-sage-300',
    danger: 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-soft',
  }[variant]
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 font-medium transition active:scale-[.98] disabled:opacity-40 ${v} ${className}`}>
      {children}
    </button>
  )
}

export const Stat = ({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) => (
  <div className="rounded-2xl border border-line bg-white p-3">
    <div className="text-xs text-mute">{label}</div>
    <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
    {sub && <div className="text-xs text-mute">{sub}</div>}
  </div>
)

export const Empty = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-mute">
    <p>{children}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>
)

export const Pill = ({ children, tone = 'sage' }: { children: ReactNode; tone?: 'sage' | 'amber' | 'rose' | 'mute' }) => {
  const t = { sage: 'bg-sage-50 text-sage-700', amber: 'bg-amber-soft text-amber-800', rose: 'bg-rose-soft text-rose-800', mute: 'bg-line/60 text-mute' }[tone]
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${t}`}>{children}</span>
}

export const Progress = ({ value }: { value: number }) => (
  <div className="h-2 overflow-hidden rounded-full bg-sage-50">
    <div className="h-full rounded-full bg-sage-500 transition-all" style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
  </div>
)

export const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
  </label>
)
export const inputCls = 'w-full min-h-12 rounded-xl border border-line bg-white px-3 outline-none focus:border-sage-500 focus:ring-2 focus:ring-sage-100'

/** Escala 1–10 com botões grandes. */
export const Scale = ({ value, onChange, labels = ['Muito fácil', 'Máximo'] }: { value: number | null; onChange: (v: number | null) => void; labels?: [string, string] | string[] }) => (
  <div>
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" onClick={() => onChange(value === n ? null : n)}
          className={`h-11 rounded-lg text-sm font-medium tabular-nums transition ${value === n ? (n >= 9 ? 'bg-rose-700 text-white' : 'bg-sage-600 text-white') : 'bg-sage-50 text-sage-700'}`}>
          {n}
        </button>
      ))}
    </div>
    <div className="mt-1 flex justify-between text-[11px] text-mute"><span>{labels[0]}</span><span>{labels[1]}</span></div>
  </div>
)

/* ---------- gráficos SVG (sem dependências) ---------- */
type Pt = { label: string; value: number }
const W = 320, H = 140, PADX = 28, PADY = 18

export function LineChart({ data, fmt = String, invert = false }: { data: Pt[]; fmt?: (v: number) => string; invert?: boolean }) {
  if (data.length === 0) return <Empty>Sem dados neste período.</Empty>
  const vs = data.map((d) => d.value)
  let lo = Math.min(...vs), hi = Math.max(...vs)
  if (lo === hi) { lo -= 1; hi += 1 }
  const x = (i: number) => PADX + (data.length === 1 ? (W - 2 * PADX) / 2 : (i * (W - 2 * PADX)) / (data.length - 1))
  const y = (v: number) => { const t = (v - lo) / (hi - lo); return PADY + (invert ? t : 1 - t) * (H - 2 * PADY) }
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {[lo, hi].map((v) => (
        <g key={v}>
          <line x1={PADX} x2={W - 8} y1={y(v)} y2={y(v)} stroke="var(--color-line)" strokeDasharray="3 3" />
          <text x={2} y={y(v) + 3} fontSize="9" fill="var(--color-mute)">{fmt(v)}</text>
        </g>
      ))}
      <path d={path} fill="none" stroke="var(--color-sage-600)" strokeWidth={2.2} strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r={3.2} fill="white" stroke="var(--color-sage-600)" strokeWidth={2}><title>{`${d.label}: ${fmt(d.value)}`}</title></circle>
          {(i === 0 || i === data.length - 1 || data.length <= 6) && <text x={x(i)} y={H - 3} fontSize="9" textAnchor="middle" fill="var(--color-mute)">{d.label}</text>}
        </g>
      ))}
    </svg>
  )
}

export function BarChart({ data, fmt = String, target }: { data: Pt[]; fmt?: (v: number) => string; target?: number }) {
  if (data.length === 0) return <Empty>Sem dados neste período.</Empty>
  const hi = Math.max(...data.map((d) => d.value), target ?? 0, 1)
  const bw = (W - PADX) / data.length
  const y = (v: number) => H - PADY - (v / hi) * (H - 2 * PADY)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      {target != null && <line x1={PADX - 4} x2={W} y1={y(target)} y2={y(target)} stroke="var(--color-sage-300)" strokeDasharray="4 3" />}
      {data.map((d, i) => (
        <g key={i}>
          <rect x={PADX + i * bw + bw * 0.18} y={y(d.value)} width={bw * 0.64} height={Math.max(0, H - PADY - y(d.value))} rx={3}
            fill={target != null && d.value >= target ? 'var(--color-sage-600)' : 'var(--color-sage-300)'}><title>{`${d.label}: ${fmt(d.value)}`}</title></rect>
          {d.value > 0 && <text x={PADX + i * bw + bw / 2} y={y(d.value) - 3} fontSize="9" textAnchor="middle" fill="var(--color-ink)">{fmt(d.value)}</text>}
          {(data.length <= 10 || i % Math.ceil(data.length / 8) === 0) && <text x={PADX + i * bw + bw / 2} y={H - 4} fontSize="9" textAnchor="middle" fill="var(--color-mute)">{d.label}</text>}
        </g>
      ))}
    </svg>
  )
}

/* ---------- imagem do exercício (com alternativa se falhar) ---------- */
export function ExerciseImage({ ex, both = false, className = '' }: { ex: Exercise; both?: boolean; className?: string }) {
  const [failed, setFailed] = useState<Record<number, boolean>>({})
  if (!ex.img) return ex.id === 'bird-dog' ? <BirdDog className={className} /> : <Placeholder ex={ex} className={className} />
  const frames = both ? [0, 1] : [1]
  return (
    <div className={`grid gap-1 ${both ? 'grid-cols-2' : ''} ${className}`}>
      {frames.map((i) =>
        failed[i] ? <Placeholder key={i} ex={ex} /> : (
          <figure key={i} className="relative overflow-hidden rounded-xl bg-line/40">
            <img src={`${import.meta.env.BASE_URL}img/${ex.img}-${i}.jpg`} alt={`${ex.pt} — ${i === 0 ? 'posição inicial' : 'posição final'}`} loading="lazy"
              onError={() => setFailed((f) => ({ ...f, [i]: true }))} className="aspect-[3/2] w-full object-cover" />
            {both && <figcaption className="absolute bottom-1 left-1 rounded-md bg-white/85 px-1.5 text-[11px] font-medium">{i === 0 ? 'Início' : 'Fim'}</figcaption>}
          </figure>
        ),
      )}
    </div>
  )
}

const Placeholder = ({ ex, className = '' }: { ex: Exercise; className?: string }) => (
  <div className={`flex aspect-[3/2] w-full flex-col items-center justify-center rounded-xl bg-sage-50 text-sage-700 ${className}`}>
    <Icon name="gym" className="size-8" />
    <span className="mt-1 px-2 text-center text-xs">{ex.pt}</span>
  </div>
)

/** Ilustração própria (o Free Exercise DB não tem bird dog): quatro apoios, braço e perna opostos estendidos. */
const BirdDog = ({ className = '' }: { className?: string }) => (
  <div className={`overflow-hidden rounded-xl bg-sage-50 ${className}`}>
    <svg viewBox="0 0 300 200" className="aspect-[3/2] w-full" role="img" aria-label="Bird dog: em quatro apoios, braço direito à frente e perna esquerda atrás, alinhados com o tronco">
      <line x1="10" y1="168" x2="290" y2="168" stroke="var(--color-sage-300)" strokeWidth="3" />
      <g stroke="var(--color-sage-700)" strokeWidth="11" strokeLinecap="round" fill="none">
        <path d="M95 100 L190 100" />{/* tronco */}
        <path d="M190 100 L190 165" />{/* braço de apoio */}
        <path d="M95 100 L95 165 L60 165" />{/* perna de apoio (joelho no chão) */}
        <path d="M190 100 L270 96" stroke="var(--color-sage-500)" />{/* braço estendido */}
        <path d="M95 100 L20 104" stroke="var(--color-sage-500)" />{/* perna estendida */}
      </g>
      <circle cx="212" cy="86" r="15" fill="var(--color-sage-700)" />
      <text x="150" y="40" textAnchor="middle" fontSize="13" fill="var(--color-sage-700)">Coluna neutra · bacia estável</text>
      <path d="M95 60 H190" stroke="var(--color-sage-500)" strokeDasharray="5 4" />
    </svg>
  </div>
)
