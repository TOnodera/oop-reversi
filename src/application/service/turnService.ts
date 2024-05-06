import { connectMySql } from "../../infrastructure/connection";
import { GameGateway } from "../../infrastructure/gameGateway";
import { GameRepository } from "../../domain/model/game/gameRepository";
import { toDisc } from "../../domain/model/turn/disc";
import { Point } from "../../domain/model/turn/point";
import { TurnRespoitory } from "../../domain/model/turn/turnRepository";
import { ApplicationError } from "../error/applicationError";

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
const gameRepository = new GameRepository();

export class TurnService {
  async findLatestGameTurnByTurnCount(
    turnCount: number
  ): Promise<FindLatestGameTurnByTurnCountOutput> {
    const conn = await connectMySql();
    try {
      const game = await gameRepository.findLatest(conn);
      if (!game) {
        throw new ApplicationError(
          "LatestGameNotFound",
          "Latest game not found"
        );
      }
      if (!game.id) {
        throw new Error("game.id not exist");
      }
      const turn = await turnRepository.findForGameIdAndTurnCount(
        conn,
        game.id,
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
      const game = await gameGateway.findLatest(conn);
      if (!game) {
        throw new ApplicationError(
          "LatestGameNotFound",
          "Latest game not found"
        );
      }
      if (!game.id) {
        throw new Error("game.id not exist");
      }

      const previousTurnCount = turnCount - 1;
      const previousTurn = await turnRepository.findForGameIdAndTurnCount(
        conn,
        game.id,
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
