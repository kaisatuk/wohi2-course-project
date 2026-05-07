require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const questionsRouter = require("./routes/questions");
const authRouter = require("./routes/auth");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/auth", authRouter);
app.use("/api/questions", questionsRouter);

app.use((req, res) => {
  res.json({ msg: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});