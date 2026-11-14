const { test, expect } = require('@playwright/test');

async function openTicket(page) {
  await page.locator('#requester').fill('Pessoa de Teste');
  await page.locator('#email').fill('teste@example.com');
  await page.locator('#category').selectOption('Software');
  await page.locator('#title').fill('Chamado de homologação');
  await page.locator('#description').fill('Dados fictícios para teste automatizado.');
  await page.getByRole('button', { name: 'Enviar chamado' }).click();
}

test('abrir, buscar, resolver e recarregar preserva chamado e histórico', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await openTicket(page);
  await page.getByRole('button', { name: 'Painel do analista' }).click();
  await page.locator('#searchInput').fill('Pessoa de Teste');
  await expect(page.locator('.ticket-card')).toHaveCount(1);
  await page.locator('.ticket-card').click();
  await page.locator('#detailStatus').selectOption('Resolvido');
  await page.locator('#detailCorrection').fill('Solução de homologação');
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Painel do analista' }).click();
  await expect(page.locator('#detailStatus')).toHaveValue('Resolvido');
  await expect(page.locator('#detailCorrection')).toHaveValue('Solução de homologação');
  await expect(page.locator('.history-box')).toContainText('Solução de homologação');
  await page.screenshot({ path: 'test-results/homologacao-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Histórico', exact: true }).click();
  await expect(page.locator('#historyTable')).toContainText('Chamado de homologação');
  expect(errors).toEqual([]);
});

test('artefato de homologação usa armazenamento separado da produção', async ({ page }) => {
  test.skip(process.env.TEST_BASE_PATH !== '/staging/', 'Somente para o artefato com os dois ambientes.');
  await page.goto('./');
  await openTicket(page);
  await page.goto('../');
  await page.getByRole('button', { name: 'Histórico', exact: true }).click();
  await expect(page.locator('#historyTable')).not.toContainText('Chamado de homologação');
  await page.goto('./');
  await page.getByRole('button', { name: 'Histórico', exact: true }).click();
  await expect(page.locator('#historyTable')).toContainText('Chamado de homologação');
});

test('restauração permite cancelar e confirmar no navegador', async ({ page }) => {
  await page.goto('./');
  await openTicket(page);
  await page.getByRole('button', { name: 'Histórico', exact: true }).click();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Restaurar base de exemplo' }).click();
  await expect(page.locator('#historyTable')).toContainText('Chamado de homologação');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Restaurar base de exemplo' }).click();
  await expect(page.locator('#historyTable tr')).toHaveCount(2);
  await page.reload();
  await page.getByRole('button', { name: 'Histórico', exact: true }).click();
  await expect(page.locator('#historyTable')).not.toContainText('Chamado de homologação');
});

test('formulário funciona em tela móvel sem transbordamento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await expect(page.getByRole('button', { name: 'Enviar chamado' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/homologacao-mobile.png', fullPage: true });
});
