import { GameResultGateway } from "../../../infrastructure/gameResultGateway";
import { GameResult } from "./gameResult";
import mysql from "mysql2/promise";
import { toWinnerDisc } from "./winnerDisc";

const gameResultGameway = new GameResultGateway();
export class GameResultRepository {
  async findForGameId(
    conn: mysql.Connection,
    gameId: number
  ): Promise<GameResult | undefined> {
    const gameResultRecord = await gameResultGameway.findForGameId(
      conn,
      gameId
    );

    if (!gameResultRecord) {
      return undefined;
    }

    return new GameResult(
      gameResultRecord.gameId,
      toWinnerDisc(gameResultRecord.winnerDisc),
      gameResultRecord.endAt
    );
  }

  async save(conn: mysql.Connection, gameResult: GameResult) {
    await gameResultGameway.insert(
      conn,
      gameResult.gameId,
      gameResult.winnerDisc,
      gameResult.endAt
    );
  }
}
