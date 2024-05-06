export const WinnterDisc = {
  Draw: 0,
  Dark: 1,
  LIGHT: 2,
} as const;
export type WinnterDisc = (typeof WinnterDisc)[keyof typeof WinnterDisc];
