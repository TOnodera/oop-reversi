import { GameRecord } from "./gameRecord";
import mysql from "mysql2/promise";

export class GameGateway {
  async findLatest(conn: mysql.Connection): Promise<GameRecord | undefined> {
    const gameSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, started_at FROM games ORDER BY id DESC limit 1"
    );
    const record = gameSelectResult[0][0];
    if (!record) {
      return undefined;
    }

    return new GameRecord(record["id"], record["startedAt"]);
  }

  async insert(conn: mysql.Connection, startAt: Date): Promise<GameRecord> {
    const gameInsertResult = await conn.execute<mysql.ResultSetHeader>(
      "INSERT INTO games(started_at) VALUES(?)",
      [startAt]
    );
    const gameId = gameInsertResult[0].insertId;
    return new GameRecord(gameId, startAt);
  }
}
