import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql from "mysql2/promise";

const PORT = 3000;
const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;
const INITIAL_BOARD = [
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, DARK, LIGHT, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, LIGHT, DARK, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
];

const app = express();

app.use(morgan("dev"));
app.use(express.static("static", { extensions: ["html"] }));

app.get("/api/error", async (req, res) => {
  throw new Error("Error endpoint");
});

app.post("/api/games", async (req, res) => {
  const now = new Date();
  const conn = await mysql.createConnection({
    host: "mysql",
    database: "reversi",
    user: "reversi",
    password: "password",
  });
  try {
    await conn.beginTransaction();
    const gameInsertResult = await conn.execute<mysql.ResultSetHeader>(
      "INSERT INTO games(started_at) VALUES(?)",
      [now]
    );
    const gameId = gameInsertResult[0].insertId;

    const turnInsertResult = await conn.execute<mysql.ResultSetHeader>(
      "INSERT INTO turns (game_id, turn_count, next_disc, end_at) VALUES(?,?,?,?)",
      [gameId, 0, DARK, now]
    );
    const turnId = turnInsertResult[0].insertId;

    const squareCount = INITIAL_BOARD.map((line) => line.length).reduce(
      (prev, current) => prev + current,
      0
    );

    const squareInsertSql =
      "INSERT INTO squares (turn_id, x, y, disc) VALUES " +
      Array.from(Array(squareCount))
        .map((_) => "(?,?,?,?)")
        .join(", ");
    const squaresInsertValues: any[] = [];
    INITIAL_BOARD.forEach((line, y) => {
      line.forEach((disc, x) => {
        squaresInsertValues.push(turnId);
        squaresInsertValues.push(x);
        squaresInsertValues.push(y);
        squaresInsertValues.push(disc);
      });
    });

    await conn.execute(squareInsertSql, squaresInsertValues);

    await conn.commit();
  } catch (error) {
    console.error(error);
  } finally {
    await conn.end();
  }
  res.status(200).end();
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
  console.error("unexpected error occurred", error);
  res.status(500).json({
    message: "Unexpected error occurred",
  });
};
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});
