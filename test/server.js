import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const cached = {};

const server = express();

const staticPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/static"
);

server.use("/static", express.static(staticPath));

server.use("/api", (req, res, next) => {
  console.log(`API request: ${req.method} ${req.path}`);
  next();
});

server.post("/api/:testId/events", express.json(), (req, res) => {
  const { page, action, timestamp } = req.body;
  cached[req.params.testId] = cached[req.params.testId] || [];
  cached[req.params.testId].push({ page, action, timestamp });
  res.status(200).send("ok");
});

server.get("/api/:testId/events", express.json(), (req, res) => {
  res.status(200).send({ events: cached[req.params.testId] || [] });
});

server.delete("/api/:testId/events", express.json(), (req, res) => {
  delete cached[req.params.testId];
  res.status(200).send({ events: cached[req.params.testId] || [] });
});

server.listen(3000, (err) => {
  if (err) {
    console.error("Error starting server:", err);
    return;
  }
  console.log("Server is running on http://localhost:3000");
});
