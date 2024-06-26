import { DomainError } from "../../error/domainError";
import { Disc, isOppositeDisc } from "../turn/disc";
import { Move } from "../turn/move";
import { Point } from "./point";

export class Board {
  private _walledDiscs: Disc[][];
  constructor(private _discs: Disc[][]) {
    this._walledDiscs = this.wallDiscs();
  }

  place(move: Move): Board {
    // TODO 盤面におけるかチェック
    // 空出ない場合は石を置くことはできない
    if (this._discs[move.point.y][move.point.x] !== Disc.Empty) {
      throw new DomainError(
        "SelectedPointIsNotEmpty",
        "Selected point is not Empty"
      );
    }

    // ひっくり返せる点がない場合は置くことはできない
    const flipPoints = this.listFlipPoints(move);
    console.log(flipPoints.length);
    if (flipPoints.length === 0) {
      throw new DomainError("FlipPointsIsEmpty", "Flip point is emptys");
    }

    // 盤面をコピー
    const newDiscs = this._discs.map((line) => line.map((disc) => disc));
    // 石を置く
    newDiscs[move.point.y][move.point.x] = move.disc;
    // ひっくり返す
    flipPoints.forEach((p) => (newDiscs[p.y][p.x] = move.disc));
    return new Board(newDiscs);
  }

  private listFlipPoints(move: Move): Point[] {
    const flipPoints: Point[] = [];
    const walledX = move.point.x + 1;
    const walledY = move.point.y + 1;

    const checkFlipPoints = (xMove: number, yMove: number) => {
      const flipCandidate: Point[] = [];

      // 一つ動いた一から開始する
      let cursorX = walledX + xMove;
      let cursorY = walledY + yMove;

      while (isOppositeDisc(move.disc, this._walledDiscs[cursorY][cursorX])) {
        // 番兵を考慮して-1
        flipCandidate.push(new Point(cursorX - 1, cursorY - 1));
        cursorX += xMove;
        cursorY += yMove;

        if (move.disc === this._walledDiscs[cursorY][cursorX]) {
          flipPoints.push(...flipCandidate);
          break;
        }
      }
    };

    // 上
    checkFlipPoints(0, -1);
    // 左上
    checkFlipPoints(-1, -1);
    // 左
    checkFlipPoints(-1, 0);
    // 左下
    checkFlipPoints(-1, 1);
    // 下
    checkFlipPoints(0, 1);
    // 右下
    checkFlipPoints(1, 1);
    // 右
    checkFlipPoints(1, 0);
    // 右上
    checkFlipPoints(1, -1);

    return flipPoints;
  }

  existValidMove(disc: Disc): boolean {
    for (let y = 0; y < this._discs.length; y++) {
      const line = this._discs[y];
      for (let x = 0; x < line.length; x++) {
        const discOnBoard = line[x];
        // 空でない点は無視
        if (discOnBoard !== Disc.Empty) {
          continue;
        }
        const move = new Move(disc, new Point(x, y));
        const flipPoints = this.listFlipPoints(move);
        if (flipPoints.length !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  count(disc: Disc): number {
    return this._discs
      .map((line) => line.filter((discOnBoard) => discOnBoard === disc).length)
      .reduce((prev, curr) => prev + curr, 0);
  }

  private wallDiscs(): Disc[][] {
    const walled: Disc[][] = [];
    const topAndBottomWall = Array(this._discs[0].length + 2).fill(Disc.Wall);
    walled.push(topAndBottomWall);
    this._discs.forEach((line) => {
      const walledLine = [Disc.Wall, ...line, Disc.Wall];
      walled.push(walledLine);
    });
    walled.push(topAndBottomWall);

    return walled;
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
