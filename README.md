# Etiqueta QDC — Quadro Identificado

Gerador automático de etiquetas para quadros de distribuição (QDC), inspirado no produto
_Quadro Identificado_. Web app (React + TypeScript + Vite) que roda 100% no navegador,
instalável como PWA (offline).

## Funcionalidades

- Lista de circuitos com número, tipo (14 tipos com cor/ícone, incluindo **DR — Diferencial Residual** e **DPS — Proteção contra Surtos**), ambiente e corrente (A).
- Prévia das etiquetas (padrão do mercado: 17,5 × 30 mm) antes de imprimir.
- Geração de PDF em folha A4 reformatada: grade de etiquetas + tabela de identificação para a porta do quadro.
- Margens configuráveis (0 / 5 / 10 mm).
- Modelos de quadro prontos: 12, 18, 24, 30 e 40 disjuntores de fabricantes comuns (WEG, Schneider, Siemens, GE, etc.).
- Colar lista rapidamente (`1 | iluminacao | Sala, Hall | 10 A` — também aceita sem `|`;
  reconhece `dps`/`surto`/`protetor` e `dr`/`diferencial`/`residual`).
- Persistência automática no navegador (localStorage) + backup/restauração em JSON.
- Instalável como app (PWA) com ícone e manifest em pt-BR.

## Uso

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # build de produção (tsc + vite) em dist/
npm run preview    # serve o build
npm run lint       # oxlint
```

Gerar o PDF:

1. Preencha o projeto (nome, cliente, modelo de quadro) e os circuitos.
2. Clique em **Prévia** para conferir as etiquetas na tela.
3. Clique em **PDF** para baixar o arquivo.
4. Imprima em **A4, escala 100%** (sem "ajustar à página") em papel adesivo ou sulfite.

### PWA / instalação

- Abra o site no Chrome/Edge → ícone de instalar na barra do navegador.
- Depois de abrir uma vez, funciona offline (service worker precache).

## Estrutura

- `src/lib/` — estado, parser, persistência, tipos e cores (`circuitTypes.ts`, `panelModels.ts`).
- `src/lib/pdf/` — geometria e geração do PDF (`layout.ts`, `glyphs.ts`, `generatePdf.ts`).
- `src/components/` — telas: circuitos, prévia, exportar.
- `scripts/smoke.ts` — teste de fumaça do PDF/parser (`node .cache/smoke.mjs` após `npx esbuild scripts/smoke.ts --bundle --platform=node --outfile=.cache/smoke.mjs`).

## Implantação

O build é estático (pasta `dist/`). Sirva em qualquer host (Vercel, Netlify, GitHub Pages, S3…)
ou em hospedagem tradicional. Nada é enviado a servidor: o PDF é gerado no navegador com `pdf-lib`.

## Modelo de tipografia do PDF

O PDF usa fontes padrão (Helvetica, cp1252), com acentuação compatível com o português.

## Observação comercial

App desenvolvido para uso próprio; fonte de referência da landing:
https://tudoparaeletricista.com.br/cea-v1-37/