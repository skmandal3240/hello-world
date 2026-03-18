import { PrismaClient, ExerciseCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const exercises = [
  {
    category: ExerciseCategory.THOUGHT_RECORD,
    title: 'Thought Record',
    description: 'Identify and challenge negative automatic thoughts using a structured record.',
    instructions: `Step 1: Identify the situation that triggered your distressing emotion.\n\nStep 2: Note the emotions you felt and rate their intensity (0–100%).\n\nStep 3: Write down the automatic thought that went through your mind.\n\nStep 4: Look for evidence FOR the thought.\n\nStep 5: Look for evidence AGAINST the thought.\n\nStep 6: Develop a more balanced alternative thought.\n\nStep 7: Re-rate the intensity of your original emotion. Notice the change.`,
    durationMinutes: 15,
  },
  {
    category: ExerciseCategory.GRATITUDE,
    title: 'Gratitude List (3 Good Things)',
    description: 'Shift focus toward positive experiences by writing three things that went well today.',
    instructions: `Find a quiet moment and reflect on your day.\n\nWrite down three things that went well — big or small. They could be as simple as a good cup of coffee or a kind word from someone.\n\nFor each item, write one sentence about WHY it happened. This builds a sense of agency and connection.\n\nRead your list back to yourself and let the positive feelings sink in for a moment.`,
    durationMinutes: 5,
  },
  {
    category: ExerciseCategory.BREATHING,
    title: '4-7-8 Breathing',
    description: 'Activate the parasympathetic nervous system to reduce anxiety and stress quickly.',
    instructions: `Find a comfortable seated position.\n\nInhale quietly through your nose for 4 counts.\n\nHold your breath for 7 counts.\n\nExhale completely through your mouth for 8 counts, making a whoosh sound.\n\nThis is one breath cycle. Complete 4 cycles.\n\nPractice twice a day or whenever you feel anxious.`,
    durationMinutes: 5,
  },
  {
    category: ExerciseCategory.GROUNDING,
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to anchor yourself to the present moment during anxiety or overwhelm.',
    instructions: `Take a slow, deep breath to begin.\n\n5 — Name 5 things you can SEE right now.\n\n4 — Name 4 things you can TOUCH. Reach out and feel them.\n\n3 — Name 3 things you can HEAR.\n\n2 — Name 2 things you can SMELL.\n\n1 — Name 1 thing you can TASTE.\n\nTake another deep breath. You are here, you are safe, you are present.`,
    durationMinutes: 5,
  },
  {
    category: ExerciseCategory.COGNITIVE_RESTRUCTURING,
    title: 'Evidence For & Against',
    description: 'Examine a negative belief by objectively weighing evidence on both sides.',
    instructions: `Write down a negative belief you hold (e.g., "I always fail at things").\n\nDraw a T-chart with two columns: Evidence FOR and Evidence AGAINST.\n\nFor 5 minutes, list everything that supports the belief.\n\nFor 5 minutes, list everything that challenges or contradicts the belief.\n\nBased on ALL the evidence, write a more balanced, realistic version of the original belief.\n\nNotice how this feels different from the original thought.`,
    durationMinutes: 15,
  },
  {
    category: ExerciseCategory.BEHAVIORAL_ACTIVATION,
    title: 'Behavioral Activation Schedule',
    description: 'Combat low mood by scheduling and completing activities that bring a sense of pleasure or achievement.',
    instructions: `List 5–10 activities that used to bring you joy or a sense of accomplishment — before you started feeling low.\n\nRate each activity for: Pleasure (P) and Achievement (A) on a scale of 0–10.\n\nSchedule at least one activity in your calendar for tomorrow.\n\nAfter completing it, record your actual P and A ratings.\n\nNotice if the anticipated vs actual ratings differ (they usually do — we underestimate pleasure when depressed).\n\nGradually increase the number of scheduled activities each week.`,
    durationMinutes: 20,
  },
  {
    category: ExerciseCategory.THOUGHT_RECORD,
    title: 'Worry Time Exercise',
    description: 'Contain anxious thoughts to a dedicated daily window to reduce rumination throughout the day.',
    instructions: `Choose a specific 15-minute "worry time" each day (not right before bed).\n\nWhen a worry arises outside this window, acknowledge it: "That's a worry. I'll think about it at 5pm."\n\nWrite the worry down briefly and let it go until worry time.\n\nDuring worry time, review your list. For each worry, ask: Is this within my control? If yes, brainstorm one small action. If no, practice letting it go.\n\nWhen worry time ends, stop — even if you haven't resolved everything.`,
    durationMinutes: 15,
  },
  {
    category: ExerciseCategory.GRATITUDE,
    title: 'Self-Compassion Letter',
    description: 'Develop kindness toward yourself by writing as a caring friend would.',
    instructions: `Think of a situation you feel bad about — something you're criticising yourself for.\n\nImagine a wise, compassionate friend who knows all your flaws and still cares about you deeply.\n\nWrite a letter to yourself FROM this friend's perspective. Include:\n- Acknowledgment of your pain and struggle\n- Reminders that imperfection is human\n- Encouragement that is warm but realistic\n\nRead the letter to yourself slowly.\n\nNotice how you feel when you receive this care.`,
    durationMinutes: 15,
  },
];

async function main() {
  // Seed CBT exercises
  for (const exercise of exercises) {
    await prisma.cbtExercise.upsert({
      where: { id: exercise.title },
      update: {},
      create: exercise,
    });
  }

  // Seed demo user
  const pw = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@wellness.com' },
    update: {},
    create: {
      email: 'demo@wellness.com',
      passwordHash: pw,
      displayName: 'Demo User',
    },
  });

  console.log('Seed complete: 8 CBT exercises + demo user');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
