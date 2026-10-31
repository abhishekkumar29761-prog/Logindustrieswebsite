require("dotenv").config();

const app = require("./src/app");
const port = Number(process.env.PORT || 4000);

const server = app.listen(port, () => {
  console.log(`LogIndustries API listening on http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; closing API server`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
