import { connectMySql } from "../dataaccess/connection";
import { Game } from "../domain/game/game";
import { GameRepository } from "../domain/game/gameRepository";
import { firstTurn } from "../domain/turn/turn";
import { TurnRespoitory } from "../domain/turn/turnRepository";

const turnRepository = new TurnRespoitory();
const gameRepository = new GameRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySql();
    try {
      await conn.beginTransaction();
      const game = await gameRepository.save(conn, new Game(undefined, now));
      if (!game.id) {
        throw new Error("game.id not exists");
      }
      const turn = firstTurn(game.id, now);
      await turnRepository.save(conn, turn);
      await conn.commit();
    } catch (error) {
      console.error(error);
    } finally {
      await conn.end();
    }
  }
}
