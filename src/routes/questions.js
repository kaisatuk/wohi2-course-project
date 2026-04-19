const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// GET /questions - List all questions
router.get("/", async (req, res) => {
  const questions = await prisma.question.findMany({
    orderBy: { id: "asc" },
  });
  res.json(questions);
});

// GET /questions/:qId - Get one question
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
    data: { question, answer },
  });
  res.json(newQuestion);
});

// PUT /questions/:qId - Update a question
router.put("/:qId", async (req, res) => {
  const qId = Number(req.params.qId);
  const { question, answer } = req.body;
  const updated = await prisma.question.update({
    where: { id: qId },
    data: { question, answer },
  });
  res.json(updated);
});

// DELETE /questions/:qId - Delete a question
router.delete("/:qId", async (req, res) => {
  const qId = Number(req.params.qId);
  await prisma.question.delete({
    where: { id: qId },
  });
  res.json({ message: "question deleted successfully" });
});

module.exports = router;