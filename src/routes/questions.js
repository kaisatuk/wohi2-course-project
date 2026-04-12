const express = require("express");
const router = express.Router();

const questions = require("../data/questions");

// GET /questions
// List all questions
router.get("/", (req, res) => {
    const { keyword } = req.query;

  if (!keyword) {
     return res.json(questions);
  }

  const filteredQuestions = questions.filter(question =>
    question.keywords.includes(keyword.toLowerCase())
  );

  res.json(filteredQuestions);
});

// GET /posts/:postId
// Show a specific post
router.get("/:qId", (req, res) => {
  const qId = Number(req.params.postId);

  const question = questions.find((p) => p.id === qId);

  if (!question) {
    return res.status(404).json({ message: "question not found" });
  }

  res.json(question);
});

// POST /questions
// Create a new question
router.question("/", (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({
      message: "question and answer are required"
    });
  }
  const maxId = Math.max(...questions.map(p => p.id), 0);

  const newQuestion = {
    id: posts.length ? maxId + 1 : 1,
    question, answer,
    keywords: Array.isArray(keywords) ? keywords : []
  };
  questions.push(newQuestion);
  res.status(201).json(newQuestion);
});
// PUT /posts/:postId
// Edit a post
router.put("/:qId", (req, res) => {
  const qId = Number(req.params.qId);
  const { question,answer } = req.body;

  const question = questions.find((p) => p.id === qId);

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  if (!question || !answer) {
    return res.json({
      message: "question and answer are required"
    });
  }

  post.title = title;
  post.date = date;
  post.content = content;
  post.keywords = Array.isArray(keywords) ? keywords : [];

  res.json(question);
});
// DELETE /posts/:postId
// Delete a post
router.delete("/:qId", (req, res) => {
  const qId = Number(req.params.postId);

  const questionIndex = questions.findIndex((p) => p.id === qId);

  if (questionIndex === -1) {
    return res.status(404).json({ message: "Question not found" });
  }

  const deletedQuestion = questions.splice(questionIndex, 1);

  res.json({
    message: "question deleted successfully",
    post: deletedQuestion[0]
  });
});


module.exports = router;