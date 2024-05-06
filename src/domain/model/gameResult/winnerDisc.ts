import { DomainError } from "../../error/domainError";

export const WinnterDisc = {
  Draw: 0,
  Dark: 1,
  LIGHT: 2,
} as const;
export type WinnterDisc = (typeof WinnterDisc)[keyof typeof WinnterDisc];

export function toWinnerDisc(value: any): WinnterDisc {
  if (!Object.values(WinnterDisc).includes(value)) {
    throw new DomainError("InvalidDiscValue", "InvalidDiscValue");
  }
  return value as WinnterDisc;
}
