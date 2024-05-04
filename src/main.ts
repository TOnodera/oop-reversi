import express, { json } from "express";
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
app.use(json());

app.get("/api/error", async (req, res) => {
  throw new Error("Error endpoint");
});

app.post("/api/games", async (req, res) => {
  const now = new Date();
  const conn = await connectMySql();
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

app.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = parseInt(req.params.turnCount);
  const conn = await connectMySql();
  try {
    const gameSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, started_at FROM games ORDER BY id DESC limit 1"
    );
    const game = gameSelectResult[0][0];

    const turnSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, game_id, turn_count, next_disc, end_at FROM turns WHERE game_id = ? AND turn_count = ?",
      [game["id"], turnCount]
    );
    const turn = turnSelectResult[0][0];

    const squaresSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, turn_id, x, y, disc FROM squares WHERE turn_id = ?",
      [turn["id"]]
    );

    const squares = squaresSelectResult[0];
    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squares.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });
    const responceBody = {
      turnCount,
      board,
      nextDisc: turn["next_disc"],
      // TODO
      winnerDisc: null,
    };
    res.json(responceBody);
  } finally {
    await conn.end();
  }
});

app.post("/api/games/latest/turns", async (req, res) => {
  const turnCount = parseInt(req.body.turnCount);
  const disc = parseInt(req.body.move.disc);
  const x = parseInt(req.body.move.x);
  const y = parseInt(req.body.move.y);
  // ひとつ前のターンを取得する
  const conn = await connectMySql();
  try {
    const gameSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, started_at FROM games ORDER BY id DESC limit 1"
    );
    const game = gameSelectResult[0][0];

    const previousTurnCount = turnCount - 1;
    const turnSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, game_id, turn_count, next_disc, end_at FROM turns WHERE game_id = ? AND turn_count = ?",
      [game["id"], previousTurnCount]
    );
    const turn = turnSelectResult[0][0];

    const squaresSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, turn_id, x, y, disc FROM squares WHERE turn_id = ?",
      [turn["id"]]
    );

    const squares = squaresSelectResult[0];
    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squares.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });
    // 盤面におけるかチェックする
    // 石を置く
    board[y][x] = disc;
    // ひっくり返す
    // ターンを保存する
    const now = new Date();
    const nextDisc = disc === DARK ? LIGHT : DARK;
    const turnInsertResult = await conn.execute<mysql.ResultSetHeader>(
      "INSERT INTO turns (game_id, turn_count, next_disc, end_at) VALUES(?,?,?,?)",
      [game["id"], turnCount, nextDisc, now]
    );
    const turnId = turnInsertResult[0].insertId;

    const squareCount = board
      .map((line) => line.length)
      .reduce((prev, current) => prev + current, 0);

    const squareInsertSql =
      "INSERT INTO squares (turn_id, x, y, disc) VALUES " +
      Array.from(Array(squareCount))
        .map((_) => "(?,?,?,?)")
        .join(", ");
    const squaresInsertValues: any[] = [];
    board.forEach((line, y) => {
      line.forEach((disc, x) => {
        squaresInsertValues.push(turnId);
        squaresInsertValues.push(x);
        squaresInsertValues.push(y);
        squaresInsertValues.push(disc);
      });
    });

    await conn.execute(squareInsertSql, squaresInsertValues);

    await conn.execute(
      "INSERT INTO moves (turn_id, disc, x, y) VALUES (?, ?, ?, ?)",
      [turnId, disc, x, y]
    );

    await conn.commit();
  } finally {
    await conn.end();
  }
  res.status(201).end();
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

async function connectMySql() {
  return await mysql.createConnection({
    host: "mysql",
    database: "reversi",
    user: "reversi",
    password: "password",
  });
}
