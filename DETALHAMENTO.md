# Detalhamento técnico — Service Desk

Data: 14/11/2026.

## Objetivo e contexto

Corrigir falhas funcionais de um Service Desk acadêmico, utilizando IA como apoio à análise, testes de regressão e versionamento com commits atômicos antes da integração na branch de produção.

A aplicação utiliza HTML, CSS e JavaScript, com persistência no `localStorage` do navegador. Não há backend nem banco de dados compartilhado.

## Repositório e preparação

- Repositório oficial: https://github.com/beatrizSNTech/ia-dev-chatgpt.
- Fork pessoal: https://github.com/milhomemwilker/wilker-milhomem-ia-dev-chatgpt.
- Aplicação: pasta `service-desk`.
- O fork e o clone já existiam. A relação de fork foi confirmada na interface do GitHub; não foi necessário criar outro ou clonar novamente.
- Inicialmente o Git não pôde ser executado no sandbox. Posteriormente foi utilizado o executável instalado, com a permissão do ambiente.

## Bugs encontrados e correções

| Bug | Causa e comportamento observado | Correção | Commit |
| --- | --- | --- | --- |
| ID inválido com base vazia | `Math.max()` sem argumentos retornava `-Infinity`, impedindo a geração de um identificador válido. | Adicionar `1000` como valor mínimo no cálculo; o primeiro ID passa a ser `1001`. | `cef5b03` |
| Resolução desaparecia ao recarregar | A atualização alterava apenas os objetos em memória. | Executar `saveTickets()` após atualizar status, prioridade, correção e histórico. | `9557ac0` |
| Busca ignorava o solicitante | O campo anunciava busca por solicitante, mas o filtro verificava apenas ID e título. | Incluir `requester` na busca, sem diferenciar maiúsculas de minúsculas. | `6c3bf08` |
| Restauração mantinha dados editados | O spread copiava o array, mas compartilhava os objetos e seus históricos com a base de exemplo. | Criar cópias independentes dos dados JSON na inicialização e restauração. | `0389253` |
| Campos com apenas espaços eram aceitos | `required` aceitava espaços e o `trim()` posterior produzia campos vazios. | Validar nome, título e descrição após remover espaços nas extremidades, interrompendo a abertura quando vazios. | `4be9eba` |

## Construção dos prompts e uso da IA

As solicitações foram construídas progressivamente: contexto do incidente, restrições de versionamento, identificação do repositório e instruções específicas para cada etapa. Os exemplos abaixo resumem as solicitações da conversa; não representam um registro literal integral.

1. **Contexto e restrições:** apresentar o sistema de chamados com falhas de abertura e fechamento e orientar a preservação da `main`, o isolamento das correções, a documentação e a integração segura.
2. **Convenção explícita:** solicitar o prefixo `bugfix` para correções e `feature` para melhorias. Essa orientação foi mantida mesmo quando o enunciado posterior apresentou exemplos com `fix`.
3. **Preparação do ambiente:** fornecer os links do fork e do repositório oficial e solicitar a criação da branch `staging` a partir da `main`.
4. **Investigação e explicação:** pedir testes locais para identificar problemas e, depois, ajuda para analisar, entender e corrigir cada erro. A análise relacionou comportamento, causa, alteração de código e teste de regressão.
5. **Versionamento:** solicitar o registro das correções em commits separados na `staging`.
6. **Integração:** autorizar o push da `staging` e a integração na `main` por PR ou terminal. Foi utilizada a opção de terminal.
7. **Documentação:** solicitar este `DETALHAMENTO.md`, resumindo bugs, prompts e fluxo executado.

A IA auxiliou na leitura do código, formulação de hipóteses, implementação, escrita e execução dos testes e organização dos commits. A validação disponível foi automatizada; não houve revisão humana formal por Pull Request nem homologação visual completa no navegador.

## Fluxo de versionamento executado

1. Conferência do repositório local e do remoto `origin`.
2. Verificação de que `main` e a antiga `Staging` apontavam para `d8c52b1`.
3. Preservação da antiga branch como `staging-anterior`, evitando conflito de nomes que diferem apenas por maiúscula no Windows.
4. Criação e seleção de `staging` a partir da `main` local, preservando as alterações existentes. A denominação `Preprod`, mencionada inicialmente, foi substituída pela instrução posterior de utilizar `staging`.
5. Registro de cinco commits `bugfix`, cada um com sua correção e teste correspondente. Os testes foram executados antes de cada commit.
6. Registro da documentação em `9f3bd96` (`feature: documentar correcoes e fluxo de homologacao`).
7. Execução de `git fetch origin`, conferência da sincronização de `main` e publicação com `git push -u origin staging`.
8. Correção de avisos de linhas em branco ao final dos arquivos em `045615e` (`feature: padronizar finais de arquivo para integracao`) e novo push da `staging`.
9. Seleção de `main`, sincronização com `origin/main` por fast-forward e integração com `git merge --no-ff staging`, preservando os commits individuais.
10. Reexecução dos testes e da verificação de sintaxe na `main`, seguida de `git push origin main`.

O merge foi registrado em `eb1bf90` (`bugfix: integrar correcoes homologadas da staging na main`). Não foi utilizado force push nem criado Pull Request nesse processo. A branch remota `Staging` preexistente foi preservada.

Embora as primeiras alterações tenham sido preparadas antes da criação de `staging`, os commits das correções foram realizados nessa branch. Nenhum commit de correção foi feito diretamente na `main`; este relatório é uma entrega documental posterior à integração.

## Testes e evidências

Comando: `node --test service-desk/app.test.cjs`.

Foram aprovados seis testes:

1. Geração de ID finito e sequencial com base vazia.
2. Abertura válida com persistência e exibição no histórico.
3. Persistência de resolução, correção e histórico após reinicialização.
4. Busca pelo solicitante.
5. Restauração dos dados originais após edição na mesma sessão.
6. Rejeição de campos com apenas espaços.

As falhas de busca, restauração e campos com espaços foram reproduzidas por testes antes das respectivas correções. Também passou a verificação `node --check service-desk/app.js`. Após o ajuste de formatação, `git diff --check main..staging` não apontou problemas.

Os testes executam o código real da aplicação em Node.js com DOM e armazenamento simulados. Eles não verificam layout, interação real do navegador, restrições nativas do formulário ou disponibilidade real do `localStorage`.

## Entrega e limites

O código corrigido foi integrado e enviado à `main` do fork no GitHub. Isso representa a atualização da branch definida como produção na atividade; não houve implantação em serviço de hospedagem, execução de pipeline de deploy ou validação de uma URL pública da aplicação.

A branch de homologação isola o código, mas não constitui um ambiente hospedado separado. Permanecem recomendadas a validação visual dos fluxos no navegador e a definição da hospedagem antes de uma implantação real.

Para rollback de código, a integração pode ser revertida por um novo commit, após revisão, preservando o histórico. O retorno do código não recupera dados do `localStorage`; esses dados exigem backup próprio. Orientações adicionais estão em [VERSIONAMENTO.md](service-desk/VERSIONAMENTO.md).
