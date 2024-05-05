import { Disc } from "../turn/disc";
import { Move } from "../turn/move";

export class Board {
  constructor(private _discs: Disc[][]) {}

  place(move: Move): Board {
    // TODO 盤面におけるかチェック
    // 盤面をコピー
    const newDiscs = this._discs.map((line) => line.map((disc) => disc));
    // 石を置く
    newDiscs[move.point.y][move.point.x] = move.disc;
    // TODO ひっくり返す
    return new Board(newDiscs);
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
