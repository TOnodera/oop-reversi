import { connectMySql } from "../dataaccess/connection";
import { GameGateway } from "../dataaccess/gameGateway";
import { MoveGateway } from "../dataaccess/moveGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { TurnGateway } from "../dataaccess/turnGateway";
import { Board } from "../domain/board";
import { toDisc } from "../domain/disc";
import { Point } from "../domain/point";
import { Turn } from "../domain/turn";
import { TurnRespoitory } from "../domain/turnRepository";
import { DARK, LIGHT } from "./constants";

class FindLatestGameTurnByTurnCountOutput {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | undefined,
    private _winnerDisc: number | undefined
  ) {}

  get turnCount() {
    return this._turnCount;
  }

  get board() {
    return this._board;
  }

  get nextDisc() {
    return this._nextDisc;
  }

  get winnerDisc() {
    return this._winnerDisc;
  }
}

const gameGateway = new GameGateway();
const turnRepository = new TurnRespoitory();

export class TurnService {
  async findLatestGameTurnByTurnCount(
    turnCount: number
  ): Promise<FindLatestGameTurnByTurnCountOutput> {
    const conn = await connectMySql();
    try {
      const gameRecord = await gameGateway.findLatest(conn);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }
      const turn = await turnRepository.findForGameIdAndTurnCount(
        conn,
        gameRecord.id,
        turnCount
      );
      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        turn.board.discs,
        turn.nextDisc,
        undefined
      );
    } finally {
      await conn.end();
    }
  }

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    const conn = await connectMySql();
    try {
      // ひとつ前のターンを取得する
      const gameRecord = await gameGateway.findLatest(conn);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const previousTurnCount = turnCount - 1;
      const previousTurn = await turnRepository.findForGameIdAndTurnCount(
        conn,
        gameRecord.id,
        previousTurnCount
      );

      // 石を置く
      const newTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y));

      // ターンを保存する
      await turnRepository.save(conn, newTurn);

      await conn.commit();
    } finally {
      await conn.end();
    }
  }
}
