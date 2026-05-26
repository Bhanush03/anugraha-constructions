const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Path to the sqlite file in the api-server package
const dbPath = path.resolve(__dirname, '..', 'artifacts', 'api-server', 'data', 'anugraha.sqlite');

console.log(`Removing database file at ${dbPath} (if exists)`);
try {
  fs.rmSync(dbPath, { force: true });
  console.log('Removed database file');
} catch (err) {
  console.error('Failed to remove database file:', err);
}

// Run seed script for api-server
console.log('Running seed script...');
const res = spawnSync('pnpm', ['--filter', '@anugraha/api-server', 'seed'], { stdio: 'inherit' });
if (res.error) {
  console.error('Failed to run seed:', res.error);
  process.exit(1);
}
process.exit(res.status);
