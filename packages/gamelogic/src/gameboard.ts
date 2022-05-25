export type GameBoard = [
  [Slot, Slot, Slot],
  [Slot, Slot, Slot],
  [Slot, Slot, Slot]
];

export type Slot = "x" | "o" | null;
