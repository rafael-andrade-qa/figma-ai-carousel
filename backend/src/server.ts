import "dotenv/config";

import cors from "cors";
import express from "express";
import generateRouter from "./routes/generate.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/generate", generateRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend rodando" });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});