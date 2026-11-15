import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './screens/Home.tsx'
import { Plan, WorkoutDetail, ExerciseDetail, History } from './screens/Training.tsx'
import Session, { EditWorkout } from './screens/Session.tsx'
import Running, { RunForm } from './screens/Running.tsx'
import ProgressPage, { ReviewPage } from './screens/Progress.tsx'
import Profile from './screens/Profile.tsx'
import { Icon, useRoute, go } from './ui.tsx'
import { exportJSON } from './store.ts'

const TABS = [
  { path: '', label: 'Início', icon: 'home', match: ['', 'historico', 'editar'] },
  { path: 'treino', label: 'Treino', icon: 'gym', match: ['treino', 'sessao', 'exercicio'] },
  { path: 'corrida', label: 'Corrida', icon: 'run', match: ['corrida'] },
  { path: 'progresso', label: 'Progresso', icon: 'chart', match: ['progresso', 'revisao'] },
  { path: 'perfil', label: 'Perfil', icon: 'user', match: ['perfil'] },
]

function Screen({ r }: { r: string[] }) {
  const [a, b] = r
  switch (a) {
    case undefined: return <Home />
    case 'historico': return <History />
    case 'treino': return b ? <WorkoutDetail id={b} /> : <Plan />
    case 'exercicio': return <ExerciseDetail id={b} />
    case 'sessao': return <Session id={b} />
    case 'editar': return <EditWorkout key={b} logId={b} />
    case 'corrida': return b === 'nova' ? <RunForm /> : b ? <RunForm key={b} id={b} /> : <Running />
    case 'progresso': return <ProgressPage />
    case 'revisao': return <ReviewPage key={b} block={Number(b)} />
    case 'perfil': return <Profile />
    default: go(''); return null
  }
}

function App() {
  const r = useRoute()
  const inSession = r[0] === 'sessao' || r[0] === 'editar'
  return (
    <>
      <Screen r={r} />
      {!inSession && (
        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto grid max-w-2xl grid-cols-5">
            {TABS.map((t) => {
              const on = t.match.includes(r[0] ?? '')
              return (
                <button key={t.label} onClick={() => go(t.path)} aria-current={on ? 'page' : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${on ? 'text-sage-700' : 'text-mute'}`}>
                  <Icon name={t.icon} className={`size-6 ${on ? 'stroke-[2.2]' : ''}`} />{t.label}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}

/** Se algo falhar a renderizar, mostra uma saída segura em vez de ecrã branco. */
class Boundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null }
  static getDerivedStateFromError(err: Error) { return { err } }
  render() {
    if (!this.state.err) return this.props.children
    return (
      <div className="mx-auto max-w-md space-y-3 p-6 text-sm">
        <h1 className="text-xl font-semibold">Algo correu mal</h1>
        <p className="text-mute">Os teus dados continuam guardados. Exporta uma cópia por segurança e volta ao início.</p>
        <pre className="overflow-auto rounded-lg bg-white p-2 text-xs">{this.state.err.message}</pre>
        <button className="w-full rounded-xl border border-line bg-white p-3" onClick={exportJSON}>Exportar cópia (JSON)</button>
        <button className="w-full rounded-xl bg-sage-600 p-3 text-white" onClick={() => { location.hash = '#/'; location.reload() }}>Voltar ao início</button>
      </div>
    )
  }
}

createRoot(document.getElementById('root')!).render(<StrictMode><Boundary><App /></Boundary></StrictMode>)

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('sw.js')
