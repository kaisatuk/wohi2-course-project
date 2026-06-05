const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");

router.use(authenticate);

// GET /api/leaderboard
router.get("/", async (req, res) => {
  const leaderboard = await prisma.user.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      _count: {
        select: { attempts: { where: { correct: true } } },
      },
    },
    orderBy: {
      attempts: {
        _count: "desc",
      },
    },
    where: {
      attempts: {
        some: { correct: true },
      },
    },
  });

  const formatted = leaderboard.map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.name,
    correctAttempts: u._count.attempts,
  }));

  res.json({ data: formatted });
});

module.exports = router;