import { Disc } from "../turn/disc";
import { Move } from "../turn/move";
import { Point } from "./point";

export class Board {
  constructor(private _discs: Disc[][]) {}

  place(move: Move): Board {
    // TODO 盤面におけるかチェック
    // 空出ない場合は石を置くことはできない
    if (this._discs[move.point.y][move.point.x] !== Disc.Empty) {
      throw new Error("Selected point is not Empty");
    }

    // ひっくり返せる点がない場合は置くことはできない
    const flipPoints = this.listFlipPoints();
    if (flipPoints.length === 0) {
      throw new Error("Flip point is emptys");
    }

    // 盤面をコピー
    const newDiscs = this._discs.map((line) => line.map((disc) => disc));
    // 石を置く
    newDiscs[move.point.y][move.point.x] = move.disc;
    // TODO ひっくり返す
    return new Board(newDiscs);
  }

  private listFlipPoints() {
    return [new Point(0, 0)];
  }

  get discs() {
    return this._discs;
  }
}

const E = Disc.Empty;
const D = Disc.Dark;
const L = Disc.Light;
const INITIAL_BOARD = [
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, D, L, E, E, E],
  [E, E, E, L, D, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
  [E, E, E, E, E, E, E, E],
];

export const initialBoard = new Board(INITIAL_BOARD);
