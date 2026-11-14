const fs = require('node:fs');
const path = require('node:path');
// Somente arquivos públicos necessários à aplicação entram no artefato.
const files = ['index.html', 'styles.css', 'app.js'];
const stagingRoot = process.argv[2];
function copy(source, destination, staging) {
  fs.mkdirSync(destination, { recursive: true });
  for (const file of files) {
    let content = fs.readFileSync(path.join(source, 'service-desk', file), 'utf8');
    if (staging && file === 'app.js') content = content.replace('"serviceDeskTickets"', '"serviceDeskTicketsStaging"');
    if (staging && file === 'index.html') content = content.replace('<main>', '<main><p role="status">Homologação — utilize apenas dados fictícios.</p>');
    fs.writeFileSync(path.join(destination, file), content);
  }
}
copy('.', 'dist', false);
if (stagingRoot) copy(stagingRoot, 'dist/staging', true);
fs.writeFileSync('dist/.nojekyll', '');
