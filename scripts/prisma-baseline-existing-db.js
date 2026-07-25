const { spawnSync } = require('node:child_process');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL nao foi configurada.');
  process.exit(1);
}

const prismaCli = require.resolve('prisma/build/index.js');

const runPrisma = (args) => {
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    encoding: 'utf8',
    env: process.env,
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    throw result.error;
  }

  return Number.isInteger(result.status) ? result.status : 1;
};

console.log('Registrando a migration inicial no historico do Prisma.');

const baselineStatus = runPrisma([
  'migrate',
  'resolve',
  '--applied',
  '20260719142320_init_evaluation_schema',
]);

if (baselineStatus !== 0) {
  process.exit(baselineStatus);
}

console.log('Aplicando migrations pendentes.');
process.exit(runPrisma(['migrate', 'deploy']));
