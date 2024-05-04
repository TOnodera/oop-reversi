import express from "express";
import { connectMySql } from "../dataaccess/connection";
import { GameGateway } from "../dataaccess/gameGateway";
import { TurnGateway } from "../dataaccess/turnGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { DARK, LIGHT } from "../application/constants";
import { MoveGateway } from "../dataaccess/moveGateway";

export const turnRouter = express.Router();

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();
const moveGateway = new MoveGateway();

turnRouter.get("/api/games/latest/turns/:turnCount", async (req, res) => {
  const turnCount = parseInt(req.params.turnCount);
  const conn = await connectMySql();
  try {
    const gameRecord = await gameGateway.findLatest(conn);
    if (!gameRecord) {
      throw new Error("Latest game not found");
    }

    const turnRecord = await turnGateway.findForGameIdAndTurnCount(
      conn,
      gameRecord.id,
      turnCount
    );
    if (!turnRecord) {
      throw new Error("specified turn not found");
    }

    const squareRecords = await squareGateway.findForTurnId(
      conn,
      turnRecord.id
    );

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });
    const responceBody = {
      turnCount,
      board,
      nextDisc: turnRecord.nextDisc,
      // TODO
      winnerDisc: null,
    };
    res.json(responceBody);
  } finally {
    await conn.end();
  }
});

turnRouter.post("/api/games/latest/turns", async (req, res) => {
  const turnCount = parseInt(req.body.turnCount);
  const disc = parseInt(req.body.move.disc);
  const x = parseInt(req.body.move.x);
  const y = parseInt(req.body.move.y);

  const conn = await connectMySql();
  try {
    // ひとつ前のターンを取得する
    const gameRecord = await gameGateway.findLatest(conn);
    if (!gameRecord) {
      throw new Error("Latest game not found");
    }

    const previousTurnCount = turnCount - 1;
    const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(
      conn,
      gameRecord.id,
      previousTurnCount
    );
    if (!previousTurnRecord) {
      throw new Error("specified turn not found");
    }

    const squareRecords = await squareGateway.findForTurnId(
      conn,
      previousTurnRecord.id
    );

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });
    // 盤面におけるかチェックする
    // 石を置く
    board[y][x] = disc;
    // ひっくり返す
    // ターンを保存する
    const now = new Date();
    const nextDisc = disc === DARK ? LIGHT : DARK;
    const turnRecord = await turnGateway.insert(
      conn,
      gameRecord.id,
      turnCount,
      nextDisc,
      now
    );

    await squareGateway.insertAll(conn, turnRecord.id, board);

    await moveGateway.insert(conn, turnRecord.id, disc, x, y);

    await conn.commit();
  } finally {
    await conn.end();
  }
  res.status(201).end();
});
