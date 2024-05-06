import express, { json } from "express";
import morgan from "morgan";
import "express-async-errors";
import { gameRouter } from "./presentation/gameRouter";
import { turnRouter } from "./presentation/turnRouter";
import { DomainError } from "./domain/error/domainError";
import { ApplicationError } from "./application/error/applicationError";

const PORT = 3000;
const app = express();

app.use(morgan("dev"));
app.use(express.static("static", { extensions: ["html"] }));
app.use(json());

app.get("/api/error", async (req, res) => {
  throw new Error("Error endpoint");
});

app.get("/api/hello", async (req, res) => {
  res.json({
    message: "Hello, world",
  });
});

const errorHandler = (
  error: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  if (error instanceof DomainError) {
    res.status(400).json({
      type: error.type,
      message: error.message,
    });
    return;
  }

  if (error instanceof ApplicationError) {
    switch (error.type) {
      case "LatestGameNotFound":
        res.status(404).json({
          type: error.type,
          message: error.message,
        });
    }
  }
  console.error("unexpected error occurred", error);
  res.status(500).json({
    message: "Unexpected error occurred",
  });
};

app.use(gameRouter);
app.use(turnRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});
