const { spawnSync } = require('node:child_process');

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

  return {
    output: `${result.stdout || ''}${result.stderr || ''}`,
    status: Number.isInteger(result.status) ? result.status : 1,
  };
};

const deployMigrations = () => runPrisma(['migrate', 'deploy']);

const deployResult = deployMigrations();

if (deployResult.status === 0) {
  process.exit(0);
}

const canBaseline =
  deployResult.output.includes('P3005') &&
  process.env.PRISMA_BASELINE_EXISTING_SCHEMA === 'true';

if (!canBaseline) {
  process.exit(deployResult.status);
}

console.log('Aplicando baseline da migration inicial do Prisma.');

const baselineResult = runPrisma([
  'migrate',
  'resolve',
  '--applied',
  '20260719142320_init_evaluation_schema',
]);

if (baselineResult.status !== 0) {
  process.exit(baselineResult.status);
}

if (process.env.PRISMA_MANUAL_API_IA_MIGRATION_APPLIED === 'true') {
  console.log('Registrando a migration manual de importacao da API-IA.');

  const manualMigrationResult = runPrisma([
    'migrate',
    'resolve',
    '--applied',
    '20260725140000_add_api_ia_import_fields',
  ]);

  if (manualMigrationResult.status !== 0) {
    process.exit(manualMigrationResult.status);
  }
}

process.exit(deployMigrations().status);
