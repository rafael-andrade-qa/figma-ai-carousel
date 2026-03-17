import "dotenv/config";

import cors from "cors";
import creditsRoutes from "./routes/credits.routes";
import express from "express";
import generateRoutes from "./routes/generate.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(generateRoutes);
app.use(creditsRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend rodando" });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});