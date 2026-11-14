const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// DOM mínimo para exercitar as regras reais do app sem dependências externas.
function app(stored = '[]') {
  const elements = new Map();
  const storage = new Map([['serviceDeskTickets', stored]]);
  const context = vm.createContext({
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
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
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
