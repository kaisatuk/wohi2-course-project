const bcrypt = require("bcrypt");
const { resetDb, registerAndLogin, request, app, prisma } = require("./helpers");

beforeEach(resetDb);

it("registers, hashes the password, returns a token", async () => {
  const res = await request(app).post("/api/auth/register")
    .send({ email: "a@test.io", password: "pw12345", name: "A" });
  expect(res.status).toBe(201);
  expect(res.body.token).toEqual(expect.any(String));
  const user = await prisma.user.findUnique({ where: { email: "a@test.io" } });
  expect(user.password).not.toBe("pw12345");
  expect(await bcrypt.compare("pw12345", user.password)).toBe(true);
});

it("returns 400 if fields are missing", async () => {
  const res = await request(app).post("/api/auth/register")
    .send({ email: "a@test.io" });
  expect(res.status).toBe(400);
});

it("returns 409 if email already registered", async () => {
  await registerAndLogin("a@test.io", "A");
  const res = await request(app).post("/api/auth/register")
    .send({ email: "a@test.io", password: "pw12345", name: "A" });
  expect(res.status).toBe(409);
});

it("returns 401 for wrong credentials", async () => {
  await registerAndLogin("a@test.io", "A");
  const res = await request(app).post("/api/auth/login")
    .send({ email: "a@test.io", password: "wrong" });
  expect(res.status).toBe(401);
});

it("returns token on valid login", async () => {
  await registerAndLogin("a@test.io", "A");
  const res = await request(app).post("/api/auth/login")
    .send({ email: "a@test.io", password: "pw12345" });
  expect(res.status).toBe(200);
  expect(res.body.token).toEqual(expect.any(String));
});