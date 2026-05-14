const { resetDb, registerAndLogin, createQuestion, request, app, prisma } = require("./helpers");

beforeEach(resetDb);

describe("question tests", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/questions");
    expect(res.status).toBe(401);
  });

  it("returns 404 for unknown question", async () => {
    const token = await registerAndLogin();
    const res = await request(app).get("/api/questions/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Question not found");
  });

  it("returns 400 for invalid question body", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/api/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "" });
    expect(res.status).toBe(400);
  });

  it("creates a question successfully", async () => {
    const token = await registerAndLogin();
    const res = await request(app).post("/api/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({ question: "What is 2+2?", answer: "4" });
    expect(res.status).toBe(200);
    expect(res.body.question).toBe("What is 2+2?");
  });

  it("returns 403 when editing someone else's question", async () => {
    const aliceToken = await registerAndLogin("alice@test.io", "Alice");
    const q = await createQuestion(aliceToken, { question: "Alice's question", answer: "A" });
    const bobToken = await registerAndLogin("bob@test.io", "Bob");
    const res = await request(app).put(`/api/questions/${q.id}`)
      .set("Authorization", `Bearer ${bobToken}`)
      .send({ question: "hijacked", answer: "x" });
    expect(res.status).toBe(403);
    const after = await prisma.question.findUnique({ where: { id: q.id } });
    expect(after.question).toBe("Alice's question");
  });
});