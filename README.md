# Treino

Diário pessoal de ginásio e corrida: plano semanal fixo, registo interativo de séries, sugestões de progressão seguras (dupla progressão), módulo de corrida com plano de 8 semanas, revisões a cada 4 semanas e gráficos de progresso. Tudo em português de Portugal e pensado para o telemóvel.

## Correr localmente

Precisas de Node 20 ou mais recente.

```bash
cd ~/Treino
npm install
npm run dev
```

Abre o endereço que aparece (ex.: `http://localhost:5173`). Como o servidor arranca com `--host`, também aparece um endereço de rede (`http://192.168.x.x:5173`), que podes abrir no telemóvel ligado à mesma rede Wi-Fi.

Versão de produção (com modo offline/PWA):

```bash
npm run build
npm run preview
```

Para instalar como app: no iPhone, Safari → Partilhar → *Adicionar ao ecrã principal*; no Android, Chrome → menu → *Instalar app*. Para usar fora de casa, publica a pasta `dist/` num alojamento estático (Netlify, Vercel, GitHub Pages…).

Verificar a lógica (progressão, ritmo, plano de corrida, revisões):

```bash
npm run check
```

## Dados

- Ficam só no navegador do dispositivo (`localStorage`), sem conta nem servidor.
- **Perfil → Exportar JSON** cria uma cópia de segurança completa; **Importar** restaura-a. O **CSV** gera duas folhas (ginásio e corrida) para abrir no Excel.
- O treino em curso é guardado a cada toque: podes recarregar ou fechar a app a meio.

## Estrutura

| Ficheiro | O que tem |
|---|---|
| `src/data.ts` | Exercícios (instruções, erros comuns, segurança), treinos A/B/C, semana, plano de corrida |
| `src/logic.ts` | Tipos, datas, sugestões de progressão, cálculos de corrida, revisão de 4 semanas, dados de exemplo |
| `src/store.ts` | Persistência, exportar/importar. Para acrescentar sincronização na nuvem, basta mexer neste ficheiro |
| `src/ui.tsx` | Componentes partilhados e gráficos SVG |
| `src/screens/` | Início, Treino/Histórico, Sessão, Corrida, Progresso/Revisão, Perfil |

Stack: React 18 + TypeScript + Tailwind 4 + Vite. Os gráficos são SVG feitos à mão, sem biblioteca extra.

## Regras de progressão

A app sugere subir a carga só quando **todas** as séries prescritas chegam ao topo da faixa com o mesmo peso, a dificuldade registada é ≤ 8 (≈ 2 repetições em reserva) e não há dor nem técnica a melhorar. No peso morto romeno é ainda preciso marcar *Técnica correta*. Com dor ou desconforto, a sugestão passa a ser «não subir». Nada é alterado automaticamente.

## Imagens

As fotografias vêm do [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), que é domínio público (Unlicense), e estão guardadas em `public/img/`. O bird dog não existe nessa base de dados, por isso usa uma ilustração própria. Se uma imagem falhar a carregar, aparece um marcador no lugar dela.
