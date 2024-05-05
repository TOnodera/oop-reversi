import { connectMySql } from "../dataaccess/connection";
import { GameGateway } from "../dataaccess/gameGateway";
import { firstTurn } from "../domain/turn";
import { TurnRespoitory } from "../domain/turnRepository";

const gameGateway = new GameGateway();
const turnRepository = new TurnRespoitory();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const conn = await connectMySql();
    try {
      await conn.beginTransaction();
      const gameRecord = await gameGateway.insert(conn, now);
      const turn = firstTurn(gameRecord.id, now);
      await turnRepository.save(conn, turn);
      await conn.commit();
    } catch (error) {
      console.error(error);
    } finally {
      await conn.end();
    }
  }
}
