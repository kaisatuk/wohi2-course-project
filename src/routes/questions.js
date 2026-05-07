const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const authenticate = require("../middleware/auth");
const isOwner = require("../middleware/isOwner");
const multer = require("multer");
const path = require("path");

// Multer setup
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "public", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Apply authentication to ALL routes in this router
router.use(authenticate);

// GET /api/questions - List all questions with pagination
router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 5));
  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      orderBy: { id: "asc" },
      include: {
        user: true,
        attempts: { where: { userId: req.user.userId, correct: true }, take: 1 },
      },
      skip,
      take: limit,
    }),
    prisma.question.count(),
  ]);

  const formatted = questions.map((q) => ({
    ...q,
    userName: q.user?.name || null,
    solved: q.attempts ? q.attempts.length > 0 : false,
    user: undefined,
    attempts: undefined,
  }));

  res.json({
    data: formatted,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/questions/:qId - Get one question
router.get("/:qId", async (req, res) => {
  const qId = Number(req.params.qId);
  const question = await prisma.question.findUnique({
    where: { id: qId },
    include: {
      user: true,
      attempts: { where: { userId: req.user.userId, correct: true }, take: 1 },
    },
  });
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }
  res.json({
    ...question,
    userName: question.user?.name || null,
    solved: question.attempts ? question.attempts.length > 0 : false,
    user: undefined,
    attempts: undefined,
  });
});

// POST /questions - Create a question
router.post("/", upload.single("image"), async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: "question and answer are required" });
  }
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const newQuestion = await prisma.question.create({
    data: { question, answer, userId: req.user.userId, imageUrl },
  });
  res.json(newQuestion);
});

// PUT /api/questions/:qId - Update a question
router.put("/:qId", upload.single("image"), isOwner, async (req, res) => {
  const { question, answer } = req.body;
  const data = { question, answer };
  if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
  const updated = await prisma.question.update({
    where: { id: req.question.id },
    data,
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

// POST /api/questions/:qId/play - Submit an answer
router.post("/:qId/play", async (req, res) => {
  const questionId = Number(req.params.qId);
  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({ message: "Answer is required" });
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const correct = question.answer.toLowerCase().trim() === answer.toLowerCase().trim();

  const attempt = await prisma.attempt.create({
    data: {
      userId: req.user.userId,
      questionId,
      submittedAnswer: answer,
      correct,
    },
  });

  res.status(201).json({
    id: attempt.id,
    correct,
    submittedAnswer: answer,
    correctAnswer: correct ? answer : question.answer,
    createdAt: attempt.createdAt,
  });
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err?.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router;