// Conteúdo fixo da app: perfil-base, exercícios, treinos e plano de corrida.
// Imagens: Free Exercise DB (github.com/yuhonas/free-exercise-db), domínio público (Unlicense).

export type Kind = 'main' | 'isolation' | 'abduction' | 'core'
export type Unit = 'reps' | 'reps/lado' | 'seg' | 'seg/lado'
export type Group = 'Glúteos' | 'Quadríceps' | 'Isquiotibiais' | 'Gémeos' | 'Costas' | 'Peito' | 'Ombros' | 'Braços' | 'Core'

export interface Exercise {
  id: string
  pt: string
  en: string
  img?: string // prefixo em /img: <img>-0.jpg (início) e <img>-1.jpg (fim)
  imgNote?: string
  muscles: string
  group: Group
  kind: Kind
  unit: Unit
  loaded: boolean // regista kg?
  rest: number // segundos
  increment: string
  requiresTechnique?: boolean
  start: string
  steps: string[]
  breathing: string
  mistakes: string[]
  safety: string
}

export const EXERCISES: Record<string, Exercise> = {
  'hip-thrust': {
    id: 'hip-thrust', pt: 'Hip thrust na máquina', en: 'Machine Hip Thrust', img: 'Barbell_Hip_Thrust',
    imgNote: 'A imagem mostra a versão com barra; na máquina o movimento é igual, com o apoio acolchoado sobre a anca.',
    muscles: 'Glúteo máximo (principal), isquiotibiais, core', group: 'Glúteos', kind: 'main', unit: 'reps', loaded: true, rest: 120,
    increment: '+2,5 a 5 kg',
    start: 'Parte superior das costas (abaixo das omoplatas) apoiada no banco, pés à largura da anca, apoio da máquina sobre a anca. Joelhos a cerca de 90° no topo.',
    steps: [
      'Queixo ligeiramente recolhido, olhar em frente (não para o teto).',
      'Empurra o chão com os calcanhares e sobe a anca até o tronco ficar alinhado com as coxas.',
      'No topo, contrai os glúteos 1 segundo, com a bacia em ligeira retroversão (costelas para baixo).',
      'Desce de forma controlada (2–3 s) até a anca quase tocar no assento.',
    ],
    breathing: 'Inspira em baixo e trava o abdómen; expira ao chegar ao topo.',
    mistakes: ['Arquear a lombar no topo em vez de estender a anca', 'Pés demasiado perto (mais quadríceps) ou longe (mais isquiotibiais)', 'Subir com impulso'],
    safety: 'Se sentires a lombar a trabalhar mais do que os glúteos, reduz a carga e encurta a amplitude no topo.',
  },
  'leg-press': {
    id: 'leg-press', pt: 'Leg press', en: 'Leg Press', img: 'Leg_Press',
    muscles: 'Quadríceps, glúteos, adutores', group: 'Quadríceps', kind: 'main', unit: 'reps', loaded: true, rest: 120,
    increment: '+5 a 10 kg',
    start: 'Costas e cabeça bem apoiadas no encosto, pés a meio da plataforma à largura dos ombros, pontas ligeiramente para fora.',
    steps: [
      'Destrava a máquina com as pernas quase estendidas (sem bloquear os joelhos).',
      'Desce a plataforma de forma controlada até cerca de 90° nos joelhos.',
      'Para antes de a bacia rodar e a lombar descolar do encosto.',
      'Empurra com o pé inteiro até quase estender, joelhos alinhados com os pés.',
    ],
    breathing: 'Inspira na descida, expira ao empurrar.',
    mistakes: ['Descer demasiado e descolar a lombar do encosto', 'Joelhos a fugir para dentro', 'Bloquear os joelhos em cima'],
    safety: 'A lombar deve manter-se sempre colada ao encosto. Prefere menor amplitude a perder essa posição.',
  },
  'leg-extension': {
    id: 'leg-extension', pt: 'Extensão de pernas', en: 'Leg Extension', img: 'Leg_Extensions',
    muscles: 'Quadríceps', group: 'Quadríceps', kind: 'isolation', unit: 'reps', loaded: true, rest: 75,
    increment: '1 incremento da máquina ou +2,5 a 5 kg',
    start: 'Em posição sentada, com as costas no encosto, joelho alinhado com o eixo da máquina, rolo sobre a parte baixa da canela.',
    steps: ['Segura as pegas laterais.', 'Estende os joelhos até quase à extensão completa.', 'Pausa 1 s em cima.', 'Desce em 2–3 s sem deixar o peso bater.'],
    breathing: 'Expira ao estender, inspira ao descer.',
    mistakes: ['Balançar o tronco', 'Descer o peso de repente', 'Rolo mal posicionado (sobre o pé ou a meio da canela)'],
    safety: 'Movimento suave; não deve haver dor no joelho.',
  },
  abducao: {
    id: 'abducao', pt: 'Abdução de anca na máquina', en: 'Hip Abduction Machine', img: 'Thigh_Abductor',
    muscles: 'Glúteo médio e mínimo', group: 'Glúteos', kind: 'abduction', unit: 'reps', loaded: true, rest: 60,
    increment: '1 incremento da máquina',
    start: 'Em posição sentada, com as costas apoiadas, almofadas por fora dos joelhos.',
    steps: ['Afasta as pernas o máximo que conseguires com controlo.', 'Pausa 1 s na abertura.', 'Volta devagar sem deixar as placas baterem.', 'Variante: inclinar ligeiramente o tronco à frente para sentir mais o glúteo.'],
    breathing: 'Expira ao abrir, inspira ao fechar.',
    mistakes: ['Usar impulso', 'Amplitude curta com carga a mais', 'Descolar a anca do assento'],
    safety: 'Escolhe uma carga que permita as 15–20 repetições sem perder controlo.',
  },
  gemeos: {
    id: 'gemeos', pt: 'Elevação de gémeos na máquina', en: 'Calf Raise Machine', img: 'Standing_Calf_Raises',
    muscles: 'Gémeos e solear', group: 'Gémeos', kind: 'isolation', unit: 'reps', loaded: true, rest: 60,
    increment: '1 incremento da máquina ou +2,5 a 5 kg',
    start: 'Ponta dos pés no degrau, calcanhares no ar, joelhos quase estendidos (não bloqueados), tronco direito.',
    steps: ['Desce os calcanhares até sentir alongar.', 'Sobe o mais alto possível na ponta dos pés.', 'Pausa 1 s em cima.', 'Desce em 2 s.'],
    breathing: 'Expira ao subir, inspira ao descer.',
    mistakes: ['Movimento curto e rápido', 'Dobrar os joelhos para ajudar', 'Arquear a lombar com a carga nos ombros'],
    safety: 'Se a versão de pé carregar a lombar, usa a máquina sentada ou o leg press para gémeos.',
  },
  'remada-apoio': {
    id: 'remada-apoio', pt: 'Remada com apoio no peito', en: 'Chest-Supported Row', img: 'Dumbbell_Incline_Row',
    imgNote: 'Versão com halteres em banco inclinado; numa máquina de remada com apoio no peito a técnica é a mesma.',
    muscles: 'Dorsais, trapézio médio, romboides, bíceps', group: 'Costas', kind: 'main', unit: 'reps', loaded: true, rest: 90,
    increment: '+1 a 2 kg ou 1 incremento da máquina',
    start: 'Peito apoiado no banco (≈30–45°) ou no apoio da máquina, braços estendidos, ombros afastados das orelhas.',
    steps: ['Começa por juntar as omoplatas.', 'Puxa os cotovelos para trás junto ao corpo.', 'Pausa 1 s com as omoplatas juntas.', 'Estende os braços devagar.'],
    breathing: 'Expira ao puxar, inspira ao estender.',
    mistakes: ['Encolher os ombros', 'Tirar o peito do apoio para dar impulso', 'Puxar só com os braços'],
    safety: 'O apoio no peito protege a lombar: mantém o tronco sempre encostado.',
  },
  puxada: {
    id: 'puxada', pt: 'Puxada à frente', en: 'Lat Pulldown', img: 'Wide-Grip_Lat_Pulldown',
    muscles: 'Grande dorsal, bíceps, trapézio inferior', group: 'Costas', kind: 'main', unit: 'reps', loaded: true, rest: 90,
    increment: '+1 a 2 kg ou 1 incremento da máquina',
    start: 'Em posição sentada, com as coxas presas, pega um pouco mais larga que os ombros, braços estendidos.',
    steps: ['Peito aberto e ligeira inclinação para trás (≈10–15°).', 'Leva os ombros para baixo e puxa a barra até à parte de cima do peito.', 'Cotovelos apontam para baixo.', 'Sobe a barra de forma controlada.'],
    breathing: 'Expira ao puxar, inspira ao subir.',
    mistakes: ['Puxar atrás da nuca', 'Inclinar muito o tronco e balançar', 'Ombros junto às orelhas'],
    safety: 'Não arqueies a lombar para trazer a barra; reduz a carga.',
  },
  'chest-press': {
    id: 'chest-press', pt: 'Chest press (máquina)', en: 'Chest Press', img: 'Leverage_Chest_Press',
    muscles: 'Peitoral, deltoide anterior, tríceps', group: 'Peito', kind: 'main', unit: 'reps', loaded: true, rest: 90,
    increment: '+1 a 2 kg ou 1 incremento da máquina',
    start: 'Pegas à altura do meio do peito, costas apoiadas, omoplatas ligeiramente juntas.',
    steps: ['Empurra até quase estender os cotovelos.', 'Mantém os ombros para trás e para baixo.', 'Volta devagar até sentir um alongamento no peito.'],
    breathing: 'Expira ao empurrar, inspira ao voltar.',
    mistakes: ['Assento demasiado alto ou baixo', 'Ombros a rodar para a frente', 'Bloquear os cotovelos'],
    safety: 'Ajusta o assento antes da primeira série.',
  },
  'elevacao-lateral': {
    id: 'elevacao-lateral', pt: 'Elevação lateral com halteres', en: 'Dumbbell Lateral Raise', img: 'Side_Lateral_Raise',
    muscles: 'Deltoide lateral', group: 'Ombros', kind: 'isolation', unit: 'reps', loaded: true, rest: 60,
    increment: '+1 a 2 kg',
    start: 'De pé ou em posição sentada, halteres ao lado do corpo, cotovelos ligeiramente fletidos.',
    steps: ['Eleva os braços para os lados até à altura dos ombros.', 'Cotovelos ligeiramente à frente do tronco.', 'Desce em 2–3 s.'],
    breathing: 'Expira ao subir, inspira ao descer.',
    mistakes: ['Subir acima dos ombros encolhendo-os', 'Balançar o tronco', 'Halteres pesados demais'],
    safety: 'Se estar de pé incomodar a lombar, faz em posição sentada com as costas apoiadas.',
  },
  'triceps-polia': {
    id: 'triceps-polia', pt: 'Extensão de tríceps na polia', en: 'Triceps Cable Pushdown', img: 'Triceps_Pushdown',
    muscles: 'Tríceps', group: 'Braços', kind: 'isolation', unit: 'reps', loaded: true, rest: 60,
    increment: '+1 a 2 kg ou 1 incremento da máquina',
    start: 'De frente para a polia alta, cotovelos junto ao corpo, antebraços a ≈90°.',
    steps: ['Estende os cotovelos até os braços ficarem retos.', 'Cotovelos fixos ao lado do tronco.', 'Volta de forma controlada até ≈90°.'],
    breathing: 'Expira ao estender, inspira ao voltar.',
    mistakes: ['Cotovelos a abrir ou a mexer', 'Inclinar o tronco sobre a barra'],
    safety: 'Joelhos ligeiramente fletidos e abdómen ativo para não sobrecarregar a lombar.',
  },
  'biceps-polia': {
    id: 'biceps-polia', pt: 'Curl de bíceps na polia', en: 'Biceps Cable Curl', img: 'Standing_Biceps_Cable_Curl',
    muscles: 'Bíceps, braquial', group: 'Braços', kind: 'isolation', unit: 'reps', loaded: true, rest: 60,
    increment: '+1 a 2 kg ou 1 incremento da máquina',
    start: 'De frente para a polia baixa, barra com as palmas para cima, cotovelos junto ao corpo.',
    steps: ['Flete os cotovelos e sobe a barra até à altura do peito.', 'Pausa 1 s.', 'Desce devagar até quase estender.'],
    breathing: 'Expira ao subir, inspira ao descer.',
    mistakes: ['Balançar o tronco', 'Cotovelos a avançar', 'Descer de repente'],
    safety: 'Tronco direito e abdómen ativo durante toda a série.',
  },
  'dead-bug': {
    id: 'dead-bug', pt: 'Dead bug', en: 'Dead Bug', img: 'Dead_Bug',
    muscles: 'Transverso do abdómen, reto abdominal, estabilizadores da bacia', group: 'Core', kind: 'core', unit: 'reps/lado', loaded: false, rest: 45,
    increment: 'Mais controlo e pausa no fim antes de aumentar repetições',
    start: 'Deitar de costas, braços esticados para o teto, ancas e joelhos a 90°. Lombar suavemente encostada ao chão.',
    steps: ['Expira e “fecha” as costelas.', 'Estende devagar o braço direito para trás e a perna esquerda para a frente.', 'Vai só até onde a lombar fica encostada ao chão.', 'Volta e repete para o outro lado.'],
    breathing: 'Expira enquanto estendes, inspira ao voltar.',
    mistakes: ['Lombar a descolar do chão', 'Movimento rápido', 'Prender a respiração'],
    safety: 'Excelente para a lombar se a bacia não se mexer. Reduz a amplitude se precisares.',
  },
  'bird-dog': {
    id: 'bird-dog', pt: 'Bird dog', en: 'Bird Dog',
    muscles: 'Eretores da coluna, glúteos, core profundo', group: 'Core', kind: 'core', unit: 'reps/lado', loaded: false, rest: 45,
    increment: 'Pausa de 3–5 s em extensão antes de aumentar repetições',
    start: 'Em quatro apoios: mãos sob os ombros, joelhos sob as ancas, coluna neutra (imagina um copo de água nas costas).',
    steps: ['Ativa o abdómen sem mexer a coluna.', 'Estende o braço direito para a frente e a perna esquerda para trás, até ficarem alinhados com o tronco.', 'Pausa 2–3 s sem rodar a bacia.', 'Volta devagar e troca de lado.'],
    breathing: 'Expira ao estender, inspira ao voltar.',
    mistakes: ['Subir a perna acima da linha da anca (arqueia a lombar)', 'Rodar a bacia', 'Pressa'],
    safety: 'É um exercício de controlo, não de força: qualidade acima de quantidade.',
  },
  prancha: {
    id: 'prancha', pt: 'Prancha frontal', en: 'Front Plank', img: 'Plank',
    muscles: 'Reto abdominal, transverso, ombros, glúteos', group: 'Core', kind: 'core', unit: 'seg', loaded: false, rest: 45,
    increment: '+5 s por série quando os 30 s forem fáceis',
    start: 'Antebraços no chão com os cotovelos sob os ombros, pernas estendidas, apoio nas pontas dos pés.',
    steps: ['Contrai glúteos e abdómen.', 'Corpo em linha reta da cabeça aos calcanhares.', 'Mantém a posição a respirar normalmente.'],
    breathing: 'Respiração curta e contínua; não prendas o ar.',
    mistakes: ['Anca a descer (lombar em arco)', 'Anca demasiado alta', 'Olhar para a frente e tensionar o pescoço'],
    safety: 'Termina a série quando a anca começar a descer, mesmo antes do tempo.',
  },
  'prancha-lateral': {
    id: 'prancha-lateral', pt: 'Prancha lateral modificada', en: 'Modified Side Plank', img: 'Side_Bridge',
    imgNote: 'Na versão modificada apoias os joelhos fletidos em vez dos pés.',
    muscles: 'Oblíquos, quadrado lombar, glúteo médio', group: 'Core', kind: 'core', unit: 'seg/lado', loaded: false, rest: 45,
    increment: '+5 s por lado; depois passar a pernas estendidas',
    start: 'De lado, cotovelo sob o ombro, joelhos fletidos a ≈90° e alinhados com o tronco.',
    steps: ['Sobe a anca até o corpo ficar em linha dos joelhos à cabeça.', 'Mantém sem deixar a anca descer ou rodar.', 'Troca de lado.'],
    breathing: 'Respiração calma e contínua.',
    mistakes: ['Anca a ir para trás', 'Ombro encolhido', 'Prender a respiração'],
    safety: 'Ótimo para estabilidade lombar; para se sentires desconforto no ombro.',
  },
  rdl: {
    id: 'rdl', pt: 'Peso morto romeno com halteres', en: 'Romanian Deadlift (Dumbbells)', img: 'Stiff-Legged_Dumbbell_Deadlift',
    imgNote: 'Na imagem os joelhos estão quase estendidos; no peso morto romeno mantém-nos ligeiramente fletidos.',
    muscles: 'Isquiotibiais, glúteo máximo, eretores da coluna', group: 'Isquiotibiais', kind: 'main', unit: 'reps', loaded: true, rest: 120,
    increment: '+1 a 2 kg no total, só depois de confirmar boa técnica',
    requiresTechnique: true,
    start: 'De pé, pés à largura da anca, um halter em cada mão à frente das coxas. Joelhos ligeiramente fletidos, peito aberto, ombros para trás. Começa com halteres leves (por exemplo 2 × 6–8 kg).',
    steps: [
      'Dobradiça da anca: empurra a anca para trás, como se quisesses fechar uma porta com o rabo.',
      'Os joelhos ficam com a mesma ligeira flexão durante todo o movimento — não é um agachamento.',
      'Coluna neutra do pescoço à bacia: sem arredondar nem arquear as costas.',
      'Os halteres deslizam junto às coxas e às canelas, sempre colados às pernas.',
      'Desce só até sentir um bom alongamento atrás das coxas (normalmente meio da canela) ou até a coluna começar a arredondar — o que vier primeiro.',
      'Sobe empurrando o chão e levando a anca à frente; contrai os glúteos no topo sem inclinar o tronco para trás.',
      'Tempo: 3 s a descer, 1–2 s a subir.',
    ],
    breathing: 'Inspira e trava o abdómen antes de descer; expira ao chegar ao topo.',
    mistakes: ['Arredondar a lombar para descer mais', 'Afastar os halteres das pernas', 'Dobrar demasiado os joelhos (vira agachamento)', 'Hiperestender a lombar no topo', 'Olhar para cima'],
    safety: 'Exercício técnico e o mais relevante para a tua lombar. Grava-te de lado ou pede a um profissional qualificado (PT/fisioterapeuta) que avalie a técnica. Para imediatamente se sentires dor lombar. Só aumentes a carga quando registares “Técnica correta”.',
  },
  'leg-curl': {
    id: 'leg-curl', pt: 'Curl de pernas sentado', en: 'Seated Leg Curl', img: 'Seated_Leg_Curl',
    muscles: 'Isquiotibiais', group: 'Isquiotibiais', kind: 'main', unit: 'reps', loaded: true, rest: 90,
    increment: '1 incremento da máquina ou +2,5 a 5 kg',
    start: 'Em posição sentada, joelho alinhado com o eixo da máquina, rolo acima do calcanhar, apoio das coxas bem ajustado.',
    steps: ['Flete os joelhos puxando o rolo para baixo e para trás.', 'Pausa 1 s.', 'Volta em 2–3 s até quase estender.'],
    breathing: 'Expira ao fletir, inspira ao voltar.',
    mistakes: ['Levantar a anca do assento', 'Amplitude curta', 'Voltar de repente'],
    safety: 'Apoio das coxas firme para isolar os isquiotibiais.',
  },
  'glute-drive': {
    id: 'glute-drive', pt: 'Glute drive / hip thrust', en: 'Glute Drive / Hip Thrust', img: 'Barbell_Hip_Thrust',
    imgNote: 'Na máquina Glute Drive o movimento é o mesmo do hip thrust com barra.',
    muscles: 'Glúteo máximo, isquiotibiais', group: 'Glúteos', kind: 'main', unit: 'reps', loaded: true, rest: 120,
    increment: '+2,5 a 5 kg',
    start: 'Como no hip thrust: costas apoiadas, pés à largura da anca. Na sexta podes afastar ligeiramente os pés para envolver mais os isquiotibiais.',
    steps: ['Queixo recolhido, costelas para baixo.', 'Sobe a anca empurrando os calcanhares.', 'Contrai os glúteos 1 s no topo.', 'Desce em 2–3 s.'],
    breathing: 'Inspira em baixo, expira no topo.',
    mistakes: ['Arquear a lombar no topo', 'Ritmo rápido sem pausa'],
    safety: 'Se a lombar trabalhar mais do que os glúteos, reduz carga e amplitude no topo.',
  },
  'leg-press-alto': {
    id: 'leg-press-alto', pt: 'Leg press (pés mais altos)', en: 'Leg Press — high foot placement', img: 'Leg_Press',
    imgNote: 'Coloca os pés ligeiramente acima do meio da plataforma.',
    muscles: 'Glúteos, isquiotibiais, quadríceps', group: 'Glúteos', kind: 'main', unit: 'reps', loaded: true, rest: 120,
    increment: '+5 a 10 kg',
    start: 'Como no leg press normal, mas com os pés um pouco mais acima na plataforma, à largura dos ombros.',
    steps: ['Desce controlando até ≈90° nos joelhos.', 'Para antes de a lombar descolar do encosto.', 'Empurra pelos calcanhares até quase estender.'],
    breathing: 'Inspira na descida, expira ao empurrar.',
    mistakes: ['Descer de mais e rodar a bacia', 'Calcanhares a levantar'],
    safety: 'Com os pés mais altos a anca flete mais: atenção redobrada à lombar no fundo do movimento.',
  },
}

export interface WorkoutItem { ex: string; sets: number; min: number; max: number }
export interface Workout { id: 'A' | 'C' | 'B'; name: string; focus: string; goal: string; weekday: number; items: WorkoutItem[]; coreFrom?: number }

export const WORKOUTS: Workout[] = [
  {
    id: 'A', name: 'Inferior A', focus: 'Glúteos e quadríceps', goal: 'Hipertrofia de glúteos e quadríceps', weekday: 1,
    items: [
      { ex: 'hip-thrust', sets: 3, min: 10, max: 12 },
      { ex: 'leg-press', sets: 3, min: 10, max: 12 },
      { ex: 'leg-extension', sets: 3, min: 12, max: 15 },
      { ex: 'abducao', sets: 2, min: 15, max: 20 },
      { ex: 'gemeos', sets: 2, min: 12, max: 15 },
    ],
  },
  {
    id: 'C', name: 'Superior + Core', focus: 'Costas, ombros, braços e core', goal: 'Desenvolvimento equilibrado, postura e estabilidade do core', weekday: 3, coreFrom: 6,
    items: [
      { ex: 'remada-apoio', sets: 3, min: 10, max: 12 },
      { ex: 'puxada', sets: 3, min: 10, max: 12 },
      { ex: 'chest-press', sets: 2, min: 10, max: 12 },
      { ex: 'elevacao-lateral', sets: 2, min: 12, max: 15 },
      { ex: 'triceps-polia', sets: 2, min: 12, max: 15 },
      { ex: 'biceps-polia', sets: 2, min: 12, max: 15 },
      { ex: 'dead-bug', sets: 2, min: 8, max: 8 },
      { ex: 'bird-dog', sets: 2, min: 8, max: 8 },
      { ex: 'prancha', sets: 2, min: 20, max: 30 },
      { ex: 'prancha-lateral', sets: 2, min: 15, max: 20 },
    ],
  },
  {
    id: 'B', name: 'Inferior B', focus: 'Glúteos e isquiotibiais', goal: 'Hipertrofia de glúteos e isquiotibiais', weekday: 5,
    items: [
      { ex: 'rdl', sets: 2, min: 10, max: 10 },
      { ex: 'leg-curl', sets: 3, min: 10, max: 12 },
      { ex: 'glute-drive', sets: 3, min: 10, max: 12 },
      { ex: 'leg-press-alto', sets: 2, min: 12, max: 12 },
      { ex: 'abducao', sets: 2, min: 15, max: 20 },
    ],
  },
]

export type DayType = 'gym' | 'run' | 'rest'
export interface Day { weekday: number; short: string; name: string; type: DayType; title: string; detail: string; time?: string; workout?: Workout['id'] }

// weekday: 1 = segunda … 7 = domingo
export const WEEK: Day[] = [
  { weekday: 1, short: 'Seg', name: 'Segunda', type: 'gym', title: 'Inferior A', detail: 'Glúteos e quadríceps', time: '07:30', workout: 'A' },
  { weekday: 2, short: 'Ter', name: 'Terça', type: 'run', title: 'Corrida', detail: 'Corrida contínua de resistência', time: 'Fim do dia' },
  { weekday: 3, short: 'Qua', name: 'Quarta', type: 'gym', title: 'Superior + Core', detail: 'Costas, ombros, braços e core', time: '07:30', workout: 'C' },
  { weekday: 4, short: 'Qui', name: 'Quinta', type: 'rest', title: 'Descanso', detail: 'Recuperação' },
  { weekday: 5, short: 'Sex', name: 'Sexta', type: 'gym', title: 'Inferior B', detail: 'Glúteos e isquiotibiais', time: '07:30', workout: 'B' },
  { weekday: 6, short: 'Sáb', name: 'Sábado', type: 'rest', title: 'Descanso', detail: 'Atividade leve opcional (caminhada, mobilidade)' },
  { weekday: 7, short: 'Dom', name: 'Domingo', type: 'rest', title: 'Descanso', detail: 'Atividade leve opcional (caminhada, mobilidade)' },
]

export const RUN_PLAN = [
  { weeks: [1, 2], min: 5, max: 5 },
  { weeks: [3, 4], min: 5, max: 5.5 },
  { weeks: [5, 6], min: 5.5, max: 6 },
  { weeks: [7, 8], min: 6, max: 6.5 },
]

export const RUN_SESSION = [
  { t: '5 min', d: 'Aquecimento a caminhar' },
  { t: '30–35 min', d: 'Corrida contínua a ritmo confortável — consegues conversar' },
  { t: '5 min', d: 'Retorno à calma a caminhar' },
]

export const QUICK_TAGS = [
  'Senti-me confortável',
  'Posso aumentar o peso na próxima',
  'Difícil completar as últimas repetições',
  'Desconforto na lombar',
  'Preciso de melhorar a técnica',
  'Técnica correta',
]
export const BAD_TAGS = ['Desconforto na lombar', 'Preciso de melhorar a técnica']

export const SURFACES = ['Terra batida', 'Estrada', 'Misto', 'Passadeira']

export const PROFILE_DEFAULT = {
  name: '',
  age: 28,
  height: 160,
  weight: 53,
  level: 'Iniciante',
  goal: 'Ganhar massa muscular de forma gradual e melhorar a definição',
  priority: 'Glúteos e pernas',
  secondary: 'Força no tronco superior, postura e core',
  runGoal: 'Melhorar a resistência, aumentar a distância e o ritmo médio',
  backNote: 'Desconforto lombar ocasional em pé muito tempo ou a dobrar/levantar com má técnica.',
}
