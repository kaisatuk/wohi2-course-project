const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const seedQuestions = [
  {
    question: "5+4?",
    answer: "9",
  },
  {
    question: "What color is grass?",
    answer: "green",
  },
  {
    question: "10+3?",
    answer: "13",
  },
  {
    question: "20-20?",
    answer: "0",
  },
];

async function main() {
  await prisma.question.deleteMany();

  for (const q of seedQuestions) {
    await prisma.question.create({
      data: {
        question: q.question,
        answer: q.answer,
      },
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());