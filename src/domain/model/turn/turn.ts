import { DomainError } from "../../error/domainError";
import { WinnterDisc } from "../gameResult/winnerDisc";
import { Board, initialBoard } from "./board";
import { Disc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";

export class Turn {
  constructor(
    private _gameId: number,
    private _turnCount: number,
    private _nextDisc: Disc | undefined,
    private _move: Move | undefined,
    private _board: Board,
    private _endAt: Date
  ) {}

  placeNext(disc: Disc, point: Point): Turn {
    // 打とうとした石が、次の石でない場合は置くことはできない
    if (disc !== this._nextDisc) {
      throw new DomainError(
        "SelectedDiscIsNotNextDisc",
        "SelectedDiscIsNotNextDisc"
      );
    }
    const move = new Move(disc, point);
    const nextBoard = this._board.place(move);
    const nextDisc = this.decideNextDisc(nextBoard, disc);

    return new Turn(
      this._gameId,
      this._turnCount + 1,
      nextDisc,
      move,
      nextBoard,
      new Date()
    );
  }

  private decideNextDisc(board: Board, previousDisc: Disc): Disc | undefined {
    const existDarkValidMove = board.existValidMove(Disc.Dark);
    const existLightValidMove = board.existValidMove(Disc.Light);
    if (existDarkValidMove && existLightValidMove) {
      return previousDisc === Disc.Dark ? Disc.Light : Disc.Dark;
    } else if (!existDarkValidMove && !existLightValidMove) {
      return undefined;
    } else if (existDarkValidMove) {
      return Disc.Dark;
    } else {
      return Disc.Light;
    }
  }
  gameEnded(): boolean {
    // 次の手がない場合、すなわちnextDisc===undefinedの場合はゲーム終了
    return this.nextDisc === undefined;
  }

  winnerDisc(): WinnterDisc {
    const darkCount = this._board.count(Disc.Dark);
    const lightCount = this._board.count(Disc.Light);

    if (darkCount === lightCount) {
      return WinnterDisc.Draw;
    } else if (darkCount > lightCount) {
      return WinnterDisc.Dark;
    } else {
      return WinnterDisc.LIGHT;
    }
  }

  get gameId() {
    return this._gameId;
  }

  get turnCount() {
    return this._turnCount;
  }

  get nextDisc() {
    return this._nextDisc;
  }

  get endAt() {
    return this._endAt;
  }

  get board() {
    return this._board;
  }

  get move() {
    return this._move;
  }
}

export function firstTurn(gameId: number, endAt: Date) {
  return new Turn(gameId, 0, Disc.Dark, undefined, initialBoard, endAt);
}
