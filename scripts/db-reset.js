const { spawnSync } = require('child_process');

// Reset the PostgreSQL database by applying migrations, then running the seed script.
console.log('Running migrations...');
const migrateRes = spawnSync('pnpm', ['--filter', '@anugraha/db', 'migrate'], { stdio: 'inherit' });
if (migrateRes.error) {
  console.error('Failed to run migrations:', migrateRes.error);
  process.exit(1);
}

console.log('Running seed script...');
const res = spawnSync('pnpm', ['--filter', '@anugraha/api-server', 'seed'], { stdio: 'inherit' });
if (res.error) {
  console.error('Failed to run seed:', res.error);
  process.exit(1);
}
process.exit(res.status);
