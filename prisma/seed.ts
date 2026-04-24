import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const candidateStatuses = ['PENDING', 'COMPLETED', 'REJECTED', 'CALL_BACK'] as const;
const callStatusValues = ['ANSWERED', 'NO_ANSWER', 'BUSY'] as const;

async function main() {
  console.log('Starting seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      password: hashedPassword,
      name: 'Agent Smith',
      role: 'agent',
    },
  });

  console.log('Created users:', { adminUser: adminUser.email, agentUser: agentUser.email });

  // Create demo candidates
  const cities = ['Baghdad', 'Basra', 'Erbil', 'Mosul', 'Kirkuk', 'Najaf'];
  const carStatuses = ['Has Own Car', 'Renting', 'No Car'];
  const carModels = ['Toyota Corolla', 'Hyundai Accent', 'Kia Rio', 'Nissan Sunny', 'Chevrolet Aveo'];
  const statuses = candidateStatuses;

  const candidates = [];

  for (let i = 0; i < 50; i++) {
    const captainNumber = i < 10 ? `CAP-${String(i + 1).padStart(3, '0')}` : null;
    const candidate = await prisma.candidate.create({
      data: {
        whatsappPhoneNumber: `+964${Math.floor(Math.random() * 900000000 + 100000000)}`,
        captainNumber,
        cityName: cities[Math.floor(Math.random() * cities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        carStatus: carStatuses[Math.floor(Math.random() * carStatuses.length)],
        carModel: carModels[Math.floor(Math.random() * carModels.length)],
        carYear: String(2015 + Math.floor(Math.random() * 10)),
        nidFrontUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=NID+Front',
        nidBackUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=NID+Back',
        driverLicenseUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=License',
        selfieUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        assignedTo: i % 3 === 0 ? agentUser.email : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    candidates.push(candidate);
  }

  console.log(`Created ${candidates.length} candidates`);

  // Create demo call feedbacks
  const callStatuses = callStatusValues;
  const notes = [
    'Customer requested callback tomorrow',
    'Documents verified successfully',
    'Phone number incorrect',
    'Interested in joining',
    'Will submit remaining documents',
    null,
  ];

  for (const candidate of candidates.slice(0, 30)) {
    const feedbackCount = Math.floor(Math.random() * 4);
    
    for (let j = 0; j < feedbackCount; j++) {
      await prisma.callFeedback.create({
        data: {
          candidateId: candidate.id,
          agentEmail: agentUser.email,
          callStatus: callStatuses[Math.floor(Math.random() * callStatuses.length)],
          note: notes[Math.floor(Math.random() * notes.length)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('Created call feedbacks');

  console.log('Seed completed successfully!');
  console.log('\nDemo credentials:');
  console.log('Admin: admin@example.com / password123');
  console.log('Agent: agent@example.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
