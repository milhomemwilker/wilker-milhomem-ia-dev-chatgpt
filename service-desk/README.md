# Service Desk Acadêmico

O processo completo da atividade — bugs, prompts, commits, melhorias, testes, PRs e pendências — está no [README principal do repositório](../README.md).

Aplicativo web estático feito em HTML, CSS e JavaScript para demonstrar versionamento de código em aula.

## Como abrir sem servidor

Este projeto não precisa de servidor local, Node.js, Python ou instalação de dependências.

Opção mais simples:

1. Dê dois cliques no arquivo `abrir-service-desk.bat`.
2. O navegador padrão abrirá o arquivo `index.html`.

Também é possível abrir diretamente o arquivo `index.html` com dois cliques.

## Funcionalidades

- Tela do usuário para abrir chamados.
- Painel do analista para selecionar chamados.
- Alteração de status.
- Alteração de prioridade.
- Registro de correção.
- Histórico dos chamados.
- Persistência simples usando `localStorage`.

## Arquivos principais

- `index.html`: estrutura das telas.
- `styles.css`: aparência do aplicativo.
- `app.js`: regras de interação e persistência local.
- `abrir-service-desk.bat`: atalho para abrir o app no navegador sem subir servidor.

## Versionamento e testes

O aplicativo informa falhas de armazenamento e preserva os dados anteriores quando uma gravação falha. Dados locais inválidos não são sobrescritos automaticamente. No Histórico, **Restaurar base de exemplo** pede confirmação antes de substituir os chamados; faça uma cópia dos dados antes de confirmar. Cancelar mantém a base atual.

Consulte [VERSIONAMENTO.md](VERSIONAMENTO.md) para diagnóstico, commits atômicos, homologação, deploy e rollback.

Execute os testes com: node --test service-desk/app.test.cjs

Para testes reais no navegador e instruções de CI, proteção de branches e publicação, consulte [OPERACAO.md](../OPERACAO.md). A aplicação continua funcionando sem instalação; Playwright e npm são necessários apenas para desenvolvimento e testes.
