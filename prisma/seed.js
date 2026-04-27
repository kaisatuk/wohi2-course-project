const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const seedQuestions = [
  { question: "What color is grass?", answer: "green" },
  { question: "10+3?", answer: "13" },
  { question: "20-20?", answer: "0" },
];

async function main() {
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  // Luo testikäyttäjä
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  // Luo kysymykset käyttäjälle
  for (const q of seedQuestions) {
    await prisma.question.create({
      data: {
        question: q.question,
        answer: q.answer,
        userId: user.id,
      },
    });
  }

  console.log('Seed data inserted successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());