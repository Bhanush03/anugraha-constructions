const { spawnSync } = require('child_process');

console.log('Running seed script...');
const res = spawnSync('pnpm', ['--filter', '@anugraha/api-server', 'seed'], { stdio: 'inherit' });
if (res.error) {
  console.error('Failed to run seed:', res.error);
  process.exit(1);
}
process.exit(res.status);
