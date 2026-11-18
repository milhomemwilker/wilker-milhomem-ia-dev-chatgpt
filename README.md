# Service Desk — versionamento e desenvolvimento com IA

Registro da atividade realizada em **14/11/2026**: identificação e correção de falhas, commits atômicos, homologação, integração na `main`, melhorias de armazenamento e automação dos testes.

## Projeto e objetivo

A atividade simula um incidente em um sistema de suporte após uma atualização. A missão foi corrigir os problemas de abertura e fechamento de chamados, preservar a branch principal e manter um histórico verificável das alterações.

A aplicação está em [`service-desk`](service-desk) e utiliza **HTML, CSS e JavaScript**, com dados no `localStorage` do navegador. Oferece abertura de chamados, painel do analista, busca, alteração de status e prioridade, registro de solução e histórico.

- [Repositório oficial da professora](https://github.com/beatrizSNTech/ia-dev-chatgpt).
- [Fork pessoal e entrega da atividade](https://github.com/milhomemwilker/wilker-milhomem-ia-dev-chatgpt).
- [Relatório técnico detalhado](DETALHAMENTO.md).
- [Guia de operação, CI, deploy e rollback](OPERACAO.md).

O fork e o clone já existiam no início do trabalho. Sua relação com o repositório oficial foi confirmada no GitHub; não foi realizado outro fork ou clone durante a execução assistida.

## 1. Preparação e ambiente de homologação

O repositório já estava aberto no VS Code, inicialmente na branch `Staging`. Após conferir o estado do Git, verificamos que `main` e `Staging` apontavam para o mesmo commit, `d8c52b1`.

A antiga branch local foi preservada como `staging-anterior`, e a nova **`staging` foi criada a partir da `main` local**, mantendo as alterações em andamento. O nome inicial sugerido, `Preprod`, foi substituído pela orientação posterior de usar `staging`.

Os commits das correções foram feitos na `staging`. Uma branch separa o código, mas não cria, por si só, um servidor de homologação.

## 2. Bugs identificados e corrigidos

| Problema | Causa | Correção | Commit atômico |
| --- | --- | --- | --- |
| ID inválido na abertura com base vazia | `Math.max()` sem valores retornava `-Infinity`. | Usar `1000` como referência mínima; primeiro ID igual a `1001`. | `cef5b03` |
| Resolução desaparecia ao recarregar | O chamado era atualizado apenas em memória. | Persistir status, prioridade, correção e histórico após a atualização. | `9557ac0` |
| Busca não encontrava o solicitante | O filtro considerava apenas ID e título. | Incluir o nome do solicitante, sem diferenciar maiúsculas e minúsculas. | `6c3bf08` |
| Restauração conservava dados alterados | A cópia superficial compartilhava objetos com a base de exemplo. | Criar cópias independentes dos dados JSON. | `0389253` |
| Campos com apenas espaços eram aceitos | A validação HTML não impedia espaços, removidos depois por `trim()`. | Validar nome, título e descrição após remover os espaços nas extremidades. | `4be9eba` |

Cada correção foi registrada separadamente, com seu teste correspondente. A primeira suíte reuniu **seis testes aprovados**, incluindo uma abertura válida com persistência e exibição no histórico.

## 3. Prompts e uso da inteligência artificial

Os prompts foram construídos por etapas, combinando contexto, restrições e resultado esperado. As formulações abaixo resumem a conversa; não são uma transcrição integral.

| Etapa | Orientação fornecida à IA | Resultado |
| --- | --- | --- |
| Contextualização | Analisar um Service Desk com falhas após uma atualização, preservando a `main`. | Inspeção do projeto e diagnóstico das regras de chamados. |
| Convenções | Utilizar `bugfix` para bugs e `feature` para melhorias. | Mensagens de commits padronizadas. |
| Preparação | Verificar o fork e criar `staging` a partir de `main`. | Origem confirmada e branch de homologação selecionada. |
| Investigação | Testar a aplicação e explicar cada erro, sua causa e correção. | Cinco bugs documentados e testes de regressão. |
| Versionamento | Registrar cada correção em um commit atômico. | Histórico com uma correção por commit. |
| Integração | Publicar `staging` e integrar na produção por PR ou terminal. | Primeira integração pelo terminal, com commit de merge. |
| Melhorias | Tratar armazenamento e confirmar a restauração, usando branches `feature`. | Duas melhorias implementadas e testadas. |
| Automação | Aplicar as próximas etapas e documentar o trabalho. | CI, testes de navegador, PRs e preparação de operação e publicação. |

A IA auxiliou na leitura do código, formulação de hipóteses, implementação, execução dos testes e organização da documentação. As decisões foram verificadas por testes e inspeção do diff. A revisão técnica foi realizada pelo agente; **não houve aprovação independente de outro colaborador**.

## 4. Commits e integração inicial na main

Foi adotado o padrão:

```text
bugfix: descrição da correção
feature: descrição da melhoria
```

A `staging` foi enviada ao GitHub. Após testes, verificação de sintaxe e conferência do remoto, a integração inicial ocorreu pelo terminal com `git merge --no-ff staging`, preservando os commits individuais.

| Marco | Commit |
| --- | --- |
| Documentação inicial e guia de homologação | `9f3bd96` |
| Ajuste de finais de arquivo para integração | `045615e` |
| Merge das cinco correções na `main` | `eb1bf90` |
| Publicação do relatório `DETALHAMENTO.md` | `1a37735` |

Não foi utilizado force push. O envio da `main` ao GitHub atualizou a branch definida como produção na atividade, sem publicar a aplicação em uma hospedagem.

## 5. Melhorias implementadas

### Tratamento do armazenamento

Na branch `feature/tratamento-armazenamento`, foram adicionados tratamento de falhas de leitura e escrita e validação da estrutura dos chamados, IDs únicos, datas, status, prioridades e histórico.

Dados inválidos são preservados, com aviso persistente e bloqueio de gravação até restauração explícita. Abertura, edição e restauração só atualizam a memória após gravação bem-sucedida. Em caso de falha, os campos permanecem disponíveis para nova tentativa, sem mensagem falsa de sucesso.

Commit: `13e1eb6` — `feature: tratar falhas e validar armazenamento local`.

### Confirmação da restauração

Na branch `feature/confirmacao-restauracao`, o botão **Restaurar base de exemplo** passou a solicitar confirmação, informando a substituição dos chamados. Cancelar mantém os dados. Confirmar tenta gravar os exemplos sem apagar a base anterior primeiro; se houver falha, os dados anteriores são preservados.

Commit: `038ac73` — `feature: confirmar restauracao antes de substituir chamados`.

As duas melhorias foram testadas, integradas na `staging` e depois na `main`, com merge `cc1ebf2`. A suíte de regras passou a ter **11 testes**.

## 6. Homologação no navegador e CI

Foi adicionado Playwright para executar testes em Chromium com contextos isolados e dados fictícios. O Chrome instalado falhou ao criar abas antes de carregar a aplicação; a execução prosseguiu com o Chromium oficial de testes.

Foram aprovados:

- **11 testes de regras**, incluindo armazenamento indisponível, dados inválidos, preservação em falhas e confirmação/cancelamento.
- **3 testes de navegador na aplicação:** fluxo de abertura até resolução e recarregamento; restauração com cancelamento e confirmação; formulário móvel sem transbordamento horizontal.
- **4 testes no artefato de homologação:** os três anteriores e a separação dos dados entre produção e `/staging/`.

Imagens desktop e móvel foram inspecionadas. O teste exclusivo de separação é ignorado quando a aplicação é executada diretamente, sem o artefato de dois ambientes.

O workflow [CI](.github/workflows/ci.yml) executa o check `quality` em pushes para `main`, `staging`, `feature/**` e `bugfix/**`, e em PRs para `main` e `staging`. Ele verifica sintaxe, executa testes e guarda relatórios e evidências por 14 dias.

### Pull Requests utilizados

| PR | Finalidade | Resultado |
| --- | --- | --- |
| [#1](https://github.com/milhomemwilker/wilker-milhomem-ia-dev-chatgpt/pull/1) | Integrar automação e documentação na `staging`. | Merge após CI aprovado. |
| [#3](https://github.com/milhomemwilker/wilker-milhomem-ia-dev-chatgpt/pull/3) | Documentar operação e ajuste do Git no Windows. | Merge após CI aprovado. |
| [#2](https://github.com/milhomemwilker/wilker-milhomem-ia-dev-chatgpt/pull/2) | Promover a `staging` para `main`. | Merge após CI aprovado; commit `9148e94`. |

[Execução aprovada do CI antes da promoção para main](https://github.com/milhomemwilker/wilker-milhomem-ia-dev-chatgpt/actions/runs/43617856518).

Foi criado um [template de Pull Request](.github/PULL_REQUEST_TEMPLATE.md) para registrar resultado, testes e plano de retorno.

## 7. Ajuste do Git no Windows

O remoto possui `Staging` e `staging`. Esses nomes causaram conflito no fetch em um sistema de arquivos sem distinção de maiúsculas e minúsculas.

O clone foi configurado para ignorar a antiga `Staging` no fetch, usando o refspec negativo `^refs/heads/Staging`. A referência local de acompanhamento conflitante foi removida e recriada corretamente pelo fetch. **Nenhuma branch remota foi excluída.** A configuração é local ao clone; o procedimento está em [OPERACAO.md](OPERACAO.md).

## 8. Deploy e rollback preparados

O [workflow de Pages](.github/workflows/pages.yml) foi preparado para execução manual, apenas na `main` e com a variável `ENABLE_PAGES=true`. A publicação permanece desativada por padrão.

O empacotamento inclui somente os arquivos estáticos necessários. Quando ativado, prepara produção na raiz e homologação em `/staging/`, com identificação visual e chaves de armazenamento diferentes. Os caminhos compartilham a mesma origem: a separação dos dados não representa isolamento de segurança.

O rollback foi documentado como uma reversão por novo commit e PR, seguida de testes e nova publicação. Não foi executado rollback destrutivo. Reverter código não recupera dados do navegador; é necessário manter backup próprio antes de restaurar a base.

## 9. Como executar e testar

Para usar a aplicação, abra [`service-desk/index.html`](service-desk/index.html) no navegador ou execute `service-desk/abrir-service-desk.bat`. Não é necessário instalar dependências para esse uso.

Para desenvolvimento e testes, utilize Node.js 22 ou superior, na raiz do repositório:

```sh
npm ci
npx playwright install chromium
npm run check
npm test
npm run test:e2e
```

Os testes iniciam um servidor local em `127.0.0.1:4173` e não usam o perfil pessoal do navegador. Os relatórios ficam em `playwright-report/`, e imagens e traces em `test-results/`; esses diretórios são ignorados pelo Git.

Para preparar e testar localmente um artefato de homologação com o mesmo código nos dois caminhos, consulte os scripts e as variáveis `TEST_SITE_ROOT` e `TEST_BASE_PATH` em [OPERACAO.md](OPERACAO.md) e no [workflow de CI](.github/workflows/ci.yml).

## 10. Estado final e pendências

| Item | Situação |
| --- | --- |
| Cinco bugs e commits atômicos | Concluídos e integrados na `main`. |
| Proteção do armazenamento e confirmação de restauração | Implementadas e testadas. |
| Testes reais de navegador e CI | Executados com sucesso. |
| Integração por PR e documentação | Publicadas no GitHub. |
| Hospedagem da aplicação | **Pendente por escolha do usuário**; não há URL pública da aplicação comprovada. |
| Proteção administrativa da `main` | Modelo preparado, **não aplicado**, por falta de autenticação administrativa do CLI. |
| Revisão independente | Não realizada; revisão técnica pelo agente. |

A tentativa de reutilizar a credencial do Git na API foi rejeitada pela revisão automática por risco de acesso a credenciais. O método foi abandonado, sem gravar tokens no projeto. A ativação administrativa deve usar autenticação normal, conforme o guia de operação.

Este projeto é uma demonstração acadêmica. Não possui backend, autenticação, permissões por usuário nem banco compartilhado. Os testes realizados não constituem auditoria completa de segurança, acessibilidade ou compatibilidade entre navegadores.

## Documentação complementar

- [DETALHAMENTO.md](DETALHAMENTO.md): histórico técnico, bugs e prompts.
- [OPERACAO.md](OPERACAO.md): execução, CI, proteção, publicação e rollback.
- [service-desk/VERSIONAMENTO.md](service-desk/VERSIONAMENTO.md): registro da fase inicial de correções.
- [service-desk/README.md](service-desk/README.md): instruções rápidas da aplicação.

## Licença

Este repositório adota a **GNU General Public License, versão 3 (GPL-3.0-only)**. Consulte o texto completo em [LICENSE](LICENSE).

Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo sob os termos da GNU GPL versão 3, publicada pela Free Software Foundation. É distribuído sem qualquer garantia, conforme os termos da licença.

As referências ao [repositório original da professora](https://github.com/beatrizSNTech/ia-dev-chatgpt) e os créditos de autoria existentes foram preservados. A inclusão desta licença ocorre neste fork e não modifica o repositório de origem.
