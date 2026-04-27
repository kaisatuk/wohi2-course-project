const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");

// Apply authentication to ALL routes in this router
router.use(authenticate);

// GET /api/questions - List all questions
router.get("/", async (req, res) => {
  const questions = await prisma.question.findMany({
    orderBy: { id: "asc" },
  });
  res.json(questions);
});

// GET /api/questions/:qId - Get one question
router.get("/:qId", async (req, res) => {
  const qId = Number(req.params.qId);
  const question = await prisma.question.findUnique({
    where: { id: qId },
  });
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  res.json(question);
});

// POST /questions - Create a question
router.post("/", async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.json({ message: "question and answer are required" });
  }
  const newQuestion = await prisma.question.create({
    data: { question, answer, userId: req.user.userId },
  });
  res.json(newQuestion);
});

// PUT /api/questions/:qId - Update a question
router.put("/:qId", isOwner, async (req, res) => {
  const { question, answer } = req.body;
  const updated = await prisma.question.update({
    where: { id: req.question.id },
    data: { question, answer },
  });
  res.json(updated);
});

// DELETE /api/questions/:qId - Delete a question
router.delete("/:qId", isOwner, async (req, res) => {
  await prisma.question.delete({
    where: { id: req.question.id },
  });
  res.json({ message: "question deleted successfully" });
});

module.exports = router;