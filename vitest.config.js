const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    env: {
      DATABASE_URL: "mysql://root:2608@localhost:3306/quizgame_test",
      JWT_SECRET: "test-secret",
      NODE_ENV: "test",
      LOG_LEVEL: "silent",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.js"],
      exclude: ["src/generated/**", "src/index.js"],
    }
  }
});