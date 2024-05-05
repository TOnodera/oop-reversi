import { SquareRecord } from "./squareRecord";
import mysql from "mysql2/promise";

export class SquareGateway {
  async findForTurnId(
    conn: mysql.Connection,
    turnId: number
  ): Promise<SquareRecord[]> {
    const squaresSelectResult = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, turn_id, x, y, disc FROM squares WHERE turn_id = ?",
      [turnId]
    );
    const records = squaresSelectResult[0];

    return records.map((r) => {
      return new SquareRecord(r["id"], r["turn_id"], r["x"], r["y"], r["disc"]);
    });
  }

  async insertAll(conn: mysql.Connection, turnId: number, board: number[][]) {
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
  }
}
