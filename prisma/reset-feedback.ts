import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

/**
 * Reset all feedback and agent assignment to zero:
 * - Delete all CallFeedback records (feedback count = 0 for every candidate)
 * - Set assignedTo and currentlyViewingBy to null for all candidates
 * - Optionally reset all candidate status to PENDING
 */
async function main() {
  console.log('Resetting all feedback and assignments to zero...');

  const deletedFeedbacks = await prisma.callFeedback.deleteMany({});
  console.log(`  Deleted ${deletedFeedbacks.count} call feedback(s).`);

  const updatedCandidates = await prisma.candidate.updateMany({
    data: {
      assignedTo: null,
      currentlyViewingBy: null,
      status: 'PENDING',
    },
  });
  console.log(`  Updated ${updatedCandidates.count} candidate(s): assignedTo=null, currentlyViewingBy=null, status=PENDING.`);

  console.log('Done. All numbers now have 0 feedback and no agent assignment.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
