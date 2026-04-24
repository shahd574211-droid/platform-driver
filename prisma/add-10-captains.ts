/**
 * يضيف 10 مرشحين بأرقام كباتن (CAP-001 إلى CAP-010) فقط.
 * شغّله: npx tsx prisma/add-10-captains.ts
 */
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const cities = ['Baghdad', 'Basra', 'Erbil', 'Mosul', 'Kirkuk', 'Najaf'];
const carStatuses = ['Has Own Car', 'Renting', 'No Car'];
const carModels = ['Toyota Corolla', 'Hyundai Accent', 'Kia Rio', 'Nissan Sunny', 'Chevrolet Aveo'];
const statuses = ['PENDING', 'COMPLETED', 'REJECTED', 'CALL_BACK'] as const;

async function main() {
  console.log('Adding 10 captains (CAP-001 to CAP-010)...\n');

  for (let i = 0; i < 10; i++) {
    const captainNumber = `CAP-${String(i + 1).padStart(3, '0')}`;
    const candidate = await prisma.candidate.create({
      data: {
        whatsappPhoneNumber: `+9647${Math.floor(Math.random() * 90000000 + 10000000)}`,
        captainNumber,
        cityName: cities[i % cities.length],
        status: statuses[i % statuses.length],
        carStatus: carStatuses[i % carStatuses.length],
        carModel: carModels[i % carModels.length],
        carYear: String(2018 + (i % 6)),
        nidFrontUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=NID+Front',
        nidBackUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=NID+Back',
        driverLicenseUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=License',
        selfieUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=captain${i}`,
      },
    });
    console.log(`  ${captainNumber} → ${candidate.whatsappPhoneNumber} (${candidate.cityName})`);
  }

  console.log('\nDone. 10 captains added. Check the dashboard and database.');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
