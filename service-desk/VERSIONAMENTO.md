# Correção do incidente

## Diagnóstico e validação

- Abertura: `Math.max` sobre uma lista vazia retornava `-Infinity`. A geração de IDs agora começa em 1001 mesmo com armazenamento contendo `[]`.
- Fechamento: `updateSelectedTicket` alterava apenas a memória. Agora salva status, prioridade, correção e histórico no `localStorage`.
- Busca: o campo prometia pesquisar por solicitante, mas filtrava apenas ID e título. Agora também filtra pelo nome, sem diferenciar maiúsculas de minúsculas.
- Restauração: cópias superficiais compartilhavam objetos e histórico com a base de exemplo. Editar um chamado contaminava a restauração na mesma sessão. Agora são criadas cópias independentes.
- Validação: nome, título e descrição contendo apenas espaços eram aceitos e salvos vazios após `trim()`. Agora a abertura é interrompida com uma mensagem ao usuário.
- Testes de regressão: `node --test service-desk/app.test.cjs`. Cobrem IDs em base vazia e a persistência da resolução após uma nova inicialização.
- IA utilizada para inspecionar o código, propor duas correções pequenas e elaborar os testes. Revisão humana e homologação no navegador devem preceder a publicação.

## Situação do versionamento

A branch `staging` foi criada a partir da `main` local e selecionada. A antiga `Staging` foi preservada como `staging-anterior` para evitar conflito de nomes no Windows. O Git instalado pode ser executado com a permissão do ambiente. As correções permanecem no diretório de trabalho, sem commits novos, publicação ou implantação. `main` não foi editada diretamente.

## Resultado dos testes locais — 14/11/2026

`node --test service-desk/app.test.cjs`: seis testes aprovados. A suíte cobre ID em base vazia, persistência da resolução e histórico após reinicialização, busca por solicitante, restauração após edição, rejeição de espaços e abertura válida com persistência e exibição no histórico. As três últimas falhas identificadas foram reproduzidas antes da correção. `node --check service-desk/app.js` também passou.

Os testes executam o JavaScript real em Node.js com DOM e armazenamento simulados. Não substituem a homologação visual no navegador nem verificam as restrições nativas de validação HTML ou disponibilidade real do armazenamento.

## Commits atômicos e Preprod

Use o prefixo `bugfix:` nas mensagens de commits que corrigem bugs e `feature:` nas que adicionam melhorias. Para branches de trabalho, use `bugfix/<descricao>` ou `feature/<descricao>`, conforme o tipo da alteração, mantendo `staging` para integração e homologação. Cada bug deve ter seu próprio commit; testes específicos da correção devem acompanhar esse commit.

Com Git disponível, confira primeiro `git status` e preserve alterações preexistentes. Execute na raiz do repositório:

```sh
git switch -c Preprod
git add -p service-desk/app.js
# Selecione apenas o trecho de nextId.
git commit -m "bugfix: gerar ID válido ao abrir chamado com base vazia"
git add -p service-desk/app.js
# Selecione apenas a chamada saveTickets em updateSelectedTicket.
git commit -m "bugfix: persistir resolução e histórico dos chamados"
git add service-desk/app.test.cjs service-desk/VERSIONAMENTO.md service-desk/README.md
git commit -m "feature: adicionar validação automatizada e guia de homologação"
node --test service-desk/app.test.cjs
git push -u origin Preprod
```

Revise o diff de cada commit antes de confirmá-lo. Não inclua `teste.txt` ou outros arquivos pessoais por engano.

## Homologação e deploy

Uma branch não constitui por si só um ambiente de testes. Publique os arquivos estáticos em um endereço de homologação separado, conforme a hospedagem adotada pela equipe. O projeto não contém configuração de hospedagem; o destino precisa ser definido antes do deploy.

1. Faça backup do valor `serviceDeskTickets` no armazenamento local do navegador antes dos testes. Os dados são locais por navegador e origem; não há servidor nem banco compartilhado.
2. Na origem de homologação, teste abertura com base normal e com `serviceDeskTickets` igual a `[]`. Confirme ID numérico e persistência após recarregar.
3. Resolva um chamado, registre a correção, salve e recarregue. Confira status, correção e histórico. Confira também alterações de prioridade.
4. Abra um PR de `staging` para `main`, anexando resultados dos testes e da homologação. Aguarde revisão antes de integrar.
5. Registre o SHA da versão atualmente publicada. Após aprovação e integração, publique os arquivos do commit aprovado e repita os testes básicos no destino.
6. Se houver regressão, reimplante o artefato anterior identificado pelo SHA e registre a ocorrência. Reverta a alteração responsável por novo commit via PR, sem reescrever o histórico. Restaurar o código não restaura dados do navegador: preserve o backup separadamente.## Commits atômicos e staging

Use o prefixo `bugfix:` para corrigir bugs e `feature:` para melhorias. Cada bug tem um commit próprio, acompanhado pelo teste correspondente.

- `cef5b03`: ID válido com base vazia e abertura com persistência.
- `9557ac0`: persistência da resolução e do histórico.
- `6c3bf08`: busca pelo solicitante.
- `0389253`: restauração independente da base de exemplo.
- `4be9eba`: rejeição de campos contendo apenas espaços.

Os testes foram executados antes de cada commit, acumulando seis casos aprovados. A documentação fica em um commit `feature:` separado. A branch atual é `staging`; para a próxima etapa, revise `git log --oneline main..staging` e publique com `git push -u origin staging` quando solicitado. Arquivos pessoais não foram incluídos.
