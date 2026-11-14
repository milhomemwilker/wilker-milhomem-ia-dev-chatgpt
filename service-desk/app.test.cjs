const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// DOM mínimo para exercitar as regras reais do app sem dependências externas.
function app(stored = '[]', options = {}) {
  const elements = new Map();
  const storage = new Map([['serviceDeskTickets', stored]]);
  const context = vm.createContext({
    window: { confirm: () => options.confirmRestore ?? true },
    document: {
      querySelectorAll: () => [],
      querySelector(selector) {
        if (!elements.has(selector)) elements.set(selector, {
          value: '', listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; }, reset() {},
          classList: { add() {}, remove() {} }
        });
        return elements.get(selector);
      }
    },
    localStorage: {
      getItem: key => { if (options.readFails) throw Error('blocked'); return storage.get(key) ?? null; },
      setItem: (key, value) => { if (options.writeFails) throw Error('quota'); storage.set(key, value); },
      removeItem: key => storage.delete(key)
    },
    setTimeout() {}
  });
  vm.runInContext(fs.readFileSync(`${__dirname}/app.js`, 'utf8'), context);
  return { context, elements, storage };
}

test('abertura com base vazia gera ID finito e sequencial', () => {
  const { context } = app();
  assert.equal(vm.runInContext('nextId()', context), 1001);
  vm.runInContext('tickets.push({ id: 1001 })', context);
  assert.equal(vm.runInContext('nextId()', context), 1002);
});

test('cancelar restauração preserva memória e armazenamento', () => {
  const { context, elements, storage } = app(null, { confirmRestore: false });
  vm.runInContext('tickets[0].title = "Meu chamado"; saveTickets()', context);
  const before = storage.get('serviceDeskTickets');
  elements.get('#clearData').listeners.click();
  assert.equal(vm.runInContext('tickets[0].title', context), 'Meu chamado');
  assert.equal(storage.get('serviceDeskTickets'), before);
});

test('confirmar restauração substitui base inválida somente após autorização', () => {
  const { context, elements, storage } = app('{', { confirmRestore: true });
  elements.get('#clearData').listeners.click();
  assert.equal(vm.runInContext('tickets.length', context), 2);
  assert.equal(JSON.parse(storage.get('serviceDeskTickets')).length, 2);
  assert.equal(elements.get('#storageWarning').hidden, true);
});

test('dados corrompidos ou incompatíveis são preservados sem quebrar a tela', () => {
  for (const raw of ['{', 'null', '{}', '[{}]', '[{"id":1}]']) {
    const { context, elements, storage } = app(raw);
    assert.equal(vm.runInContext('tickets.length', context), 0);
    assert.equal(vm.runInContext('saveTickets([])', context), false);
    assert.equal(storage.get('serviceDeskTickets'), raw);
    assert.equal(elements.get('#storageWarning').hidden, false);
  }
});

test('bloqueio de leitura não impede inicialização', () => {
  const { elements, storage } = app('[]', { readFails: true });
  assert.equal(elements.get('#storageWarning').hidden, false);
  assert.equal(storage.get('serviceDeskTickets'), '[]');
});

test('falha de escrita preserva abertura, edição e restauração', () => {
  const options = { writeFails: true };
  const { context, elements, storage } = app(null, options);
  for (const [selector, value] of Object.entries({
    '#requester': 'Ana', '#email': 'ana@example.com', '#category': 'Software',
    '#priority': 'Alta', '#title': 'Falha', '#description': 'Erro'
  })) context.document.querySelector(selector).value = value;
  elements.get('#ticketForm').listeners.submit({ preventDefault() {} });
  assert.equal(vm.runInContext('tickets.length', context), 2);
  assert.equal(elements.get('#title').value, 'Falha');
  context.document.querySelector('#detailStatus').value = 'Resolvido';
  context.document.querySelector('#detailPriority').value = 'Alta';
  context.document.querySelector('#detailCorrection').value = 'Solução';
  vm.runInContext('updateSelectedTicket(1001)', context);
  assert.equal(vm.runInContext('tickets[0].status', context), 'Aberto');
  vm.runInContext('tickets[0].title = "Preservar"', context);
  elements.get('#clearData').listeners.click();
  assert.equal(vm.runInContext('tickets[0].title', context), 'Preservar');
  assert.equal(storage.get('serviceDeskTickets'), null);
  options.writeFails = false;
  assert.equal(vm.runInContext('saveTickets()', context), true);
  assert.equal(elements.get('#storageWarning').hidden, true);
});

test('abertura válida persiste e exibe chamado no histórico', () => {
  const { context, elements, storage } = app();
  for (const [selector, value] of Object.entries({
    '#requester': 'Ana', '#email': 'ana@example.com', '#category': 'Software',
    '#priority': 'Alta', '#title': 'Falha no acesso', '#description': 'Erro ao entrar'
  })) context.document.querySelector(selector).value = value;
  context.document.querySelector('#ticketForm').listeners.submit({ preventDefault() {} });
  const saved = JSON.parse(storage.get('serviceDeskTickets'));
  assert.equal(saved[0].id, 1001);
  assert.equal(saved[0].status, 'Aberto');
  assert.match(elements.get('#historyTable').innerHTML, /Falha no acesso/);
  assert.equal(vm.runInContext('tickets.length', app(JSON.stringify(saved)).context), 1);
});
test('fechamento persiste status, correção e histórico após recarregar', () => {
  const ticket = {
    id: 1001, requester: 'Ana', email: 'ana@example.com', category: 'Software',
    title: 'Falha', description: 'Erro', priority: 'Alta', status: 'Aberto',
    correction: '', createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), events: []
  };
  const { context, elements, storage } = app(JSON.stringify([ticket]));
  context.document.querySelector('#detailStatus').value = 'Resolvido';
  context.document.querySelector('#detailPriority').value = 'Alta';
  context.document.querySelector('#detailCorrection').value = 'Correção aplicada';
  vm.runInContext('updateSelectedTicket(1001)', context);
  const reloaded = app(storage.get('serviceDeskTickets'));
  assert.equal(vm.runInContext('tickets[0].status', reloaded.context), 'Resolvido');
  assert.equal(vm.runInContext('tickets[0].correction', reloaded.context), 'Correção aplicada');
  assert.equal(vm.runInContext('tickets[0].events.length', reloaded.context), 2);
});


test('busca encontra chamado pelo solicitante', () => {
  const { context, elements } = app(null);
  elements.get('#searchInput').value = 'marina';
  vm.runInContext('renderTicketList()', context);
  assert.equal(elements.get('#ticketCounter').textContent, '1 chamado');
  assert.match(elements.get('#ticketList').innerHTML, /Marina Costa/);
});

test('restaurar base recupera dados originais após edição', () => {
  const { context, elements } = app(null);
  vm.runInContext('tickets[0].status = "Resolvido"; tickets[0].events.push("Editado")', context);
  elements.get('#clearData').listeners.click();
  assert.equal(vm.runInContext('tickets[0].status', context), 'Aberto');
  assert.equal(vm.runInContext('tickets[0].events.length', context), 1);
});

test('abertura rejeita campos contendo apenas espaços', () => {
  const { context } = app();
  for (const [selector, value] of Object.entries({
    '#requester': '   ', '#email': 'ana@example.com', '#category': 'Software',
    '#priority': 'Alta', '#title': '   ', '#description': '   '
  })) context.document.querySelector(selector).value = value;
  context.document.querySelector('#ticketForm').listeners.submit({ preventDefault() {} });
  assert.equal(vm.runInContext('tickets.length', context), 0);
});
