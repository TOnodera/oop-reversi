import { WinnterDisc } from "./winnerDisc";

export class GameResult {
  constructor(
    private _gameId: number,
    private _winnerDisc: WinnterDisc,
    private _endAt: Date
  ) {}

  get gameId() {
    return this._gameId;
  }

  get winnerDisc() {
    return this._winnerDisc;
  }

  get endAt() {
    return this._endAt;
  }
}
