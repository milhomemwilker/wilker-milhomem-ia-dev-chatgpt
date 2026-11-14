# Homologação, integração e publicação

## Situação

Validação local desta entrega: onze testes de regras aprovados; três fluxos de navegador na aplicação e quatro no artefato com homologação, incluindo separação dos dados. O quarto teste só se aplica ao artefato com `/staging/` e é ignorado na execução direta da aplicação. Imagens desktop e móvel foram inspecionadas. PR de entrada na homologação: [#1](https://github.com/milhomemwilker/wilker-milhomem-ia-dev-chatgpt/pull/1).

CI e testes de navegador foram adicionados. Hospedagem permanece pendente por escolha do usuário. A regra de proteção da `main` está preparada, mas não aplicada: o GitHub CLI está sem autenticação administrativa. Arquivos de configuração não comprovam ativação de recursos remotos.

## Executar localmente

O uso normal da aplicação continua sem dependências. Para desenvolvimento e testes, utilize Node.js 22 ou superior:

```sh
npm ci
npx playwright install chromium
npm run check
npm test
npm run test:e2e
```

Os testes de navegador iniciam um servidor apenas em `127.0.0.1:4173`, usam contextos isolados e dados fictícios e encerram o servidor ao terminar. Não use uma base real. O relatório HTML fica em `playwright-report/index.html`; imagens e traces ficam em `test-results/`. Esses arquivos não entram no Git.

O CI executa em pushes para `feature/**`, `bugfix/**`, `staging` e `main`, e em PRs para `staging` e `main`. O job `quality` verifica sintaxe, os testes de regras e os fluxos no Chromium. Relatórios são retidos por 14 dias nos artefatos de cada execução.

## Fluxo de revisão

1. Criar `feature/<descricao>` ou `bugfix/<descricao>` a partir da `staging` atualizada.
2. Implementar e testar. Usar commits `feature:` ou `bugfix:`.
3. Publicar a branch e abrir PR para `staging`; revisar o diff e os resultados de CI.
4. Homologar e abrir PR de `staging` para `main`, preservando commits individuais com merge.
5. Exigir uma aprovação de outro colaborador e CI aprovado antes da integração quando a proteção estiver ativa. O autor não deve aprovar o próprio PR.

O template em `.github/PULL_REQUEST_TEMPLATE.md` registra validação e plano de retorno. Até a proteção ser aplicada, essas condições são um procedimento documentado, não um bloqueio efetivo no GitHub.

## Ativar proteção da main — pendente

Após autenticação normal com `gh auth login`, um administrador deve conferir as regras atuais para não substituí-las inadvertidamente:

```sh
gh api repos/milhomemwilker/wilker-milhomem-ia-dev-chatgpt/branches/main/protection
```

Se não houver regra existente e a equipe já tiver um revisor disponível, aplicar o modelo:

```sh
gh api --method PUT repos/milhomemwilker/wilker-milhomem-ia-dev-chatgpt/branches/main/protection --input .github/main-protection.json
```

O modelo exige PR com uma aprovação, resolução de conversas, branch atualizada e check `quality`; aplica-se a administradores e proíbe force push e exclusão. Não ative antes de haver outro colaborador para revisar, para não bloquear o trabalho individual. Se houver regras existentes, combine os requisitos antes de aplicar. Confirme o resultado por nova consulta e em Settings → Branches.

## Hospedagem preparada — não ativada

O workflow `.github/workflows/pages.yml` tem acionamento manual e só continua na `main` se a variável `ENABLE_PAGES` for `true`. Não foi habilitado nem executado. Não há URL de aplicação publicada comprovada nesta entrega.

Quando houver autorização para hospedagem, um administrador deve:

1. Em Settings → Pages, selecionar GitHub Actions como fonte.
2. Configurar o ambiente `github-pages` para permitir deploy apenas de `main` e, quando houver revisor disponível, exigir sua aprovação.
3. Criar a variável de repositório `ENABLE_PAGES=true`.
4. Conferir a `staging` aprovada e executar **Publicar demonstracao** pela aba Actions, na `main`.
5. Verificar os jobs `build` e `deploy` e registrar a URL retornada pelo deploy; abrir produção e `/staging/` e repetir os fluxos básicos.

O artefato contém apenas `index.html`, `styles.css`, `app.js` e `.nojekyll`. A produção usa o código da `main` selecionada na execução. A homologação usa a `staging` obtida no checkout dessa execução. Os dois conjuntos passam por testes antes do envio ao Pages.

O caminho `/staging/` exibe identificação de homologação e utiliza `serviceDeskTicketsStaging`, enquanto a produção mantém `serviceDeskTickets`. As chaves separam os dados locais, mas os caminhos compartilham a mesma origem: não oferecem isolamento de segurança. São adequados à demonstração acadêmica com dados fictícios. Um sistema real deve ter origens separadas e autenticação.

GitHub Pages publica arquivos estáticos; não adiciona backend, login ou banco compartilhado. A URL muda a origem dos dados: chamados de um arquivo local ou de outro domínio não são migrados automaticamente.

## Rollback

Antes de publicar, registrar o SHA de produção com `git rev-parse main`, a execução do deploy e a versão estável anterior. Registrar também o SHA da `staging` usada no artefato.

Se ocorrer regressão, criar uma branch a partir de `main`, reverter o commit responsável (para um merge, `git revert -m 1 <SHA_DO_MERGE>`), testar e abrir um PR. Após revisão, integrar o retorno também na `staging` e executar novamente a publicação manual da `main`. Não usar force push ou reescrever o histórico.

Preservar backup do armazenamento local antes de operações de restauração. Rollback de código não restaura nem migra chamados armazenados no navegador. Nenhum rollback destrutivo foi executado durante esta atividade.

## Referências técnicas

- [Playwright: instalação e testes](https://playwright.dev/docs/intro).
- [Playwright no GitHub Actions](https://playwright.dev/docs/ci-intro).
- [GitHub Pages com workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [API de proteção de branches](https://docs.github.com/en/rest/branches/branch-protection).
