# Portfolio - Guilherme Henrique

Portfolio pessoal estático com foco em apresentacao profissional, projetos, contato e grade curricular.

## Estrutura

```text
.
|-- index.html
|-- grade.html
|-- style.css
|-- css/
|   |-- base.css
|   |-- components.css
|   |-- grade.css
|   `-- responsive.css
|-- js/
|   |-- app.js
|   `-- modules/
|-- img/
|-- projects.json
|-- disciplinas.json
|-- tests/
|-- package.json
`-- playwright.config.js
```

## Principais recursos

- Hero com motion leve, typewriter e navegação responsiva.
- Cards interativos para experiencia, habilidades e projetos.
- Modal de projetos e modal de disciplinas.
- Tema claro/escuro, modo para daltonismo e integracao com VLibras.
- Smoke tests com Playwright e lint com ESLint.

## Desenvolvimento

```bash
npm install
npm run lint
npm run test:smoke
```


## Observacoes

- `index.html` e `grade.html` sao as paginas reais do portfolio.
- `sobre.html`, `projetos.html`, `contato.html` e `disciplinas.html` foram mantidos apenas como redirects de compatibilidade.
- Os dados exibidos no site ficam em `projects.json` e `disciplinas.json`.
