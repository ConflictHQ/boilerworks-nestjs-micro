import 'dotenv/config';
import { randomBytes, createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plaintext = process.env['API_KEY_SEED'] || randomBytes(32).toString('hex');
  const keyHash = createHash('sha256').update(plaintext).digest('hex');

  const existing = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (existing) {
    console.log('Seed API key already exists, skipping.');
    return;
  }

  await prisma.apiKey.create({
    data: {
      name: 'seed-admin-key',
      keyHash,
      scopes: ['*'],
      isActive: true,
    },
  });

  console.log('='.repeat(60));
  console.log('Seed API key created.');
  console.log(`Plaintext key: ${plaintext}`);
  console.log('Scopes: *');
  console.log('Store this key — it will not be shown again.');
  console.log('='.repeat(60));
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
