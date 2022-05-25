export type GameBoard = [
  [Slot, Slot, Slot],
  [Slot, Slot, Slot],
  [Slot, Slot, Slot]
];

export type SlotRange = 0 | 1 | 2;

export type Coordinate = [SlotRange, SlotRange];

export type Challenger = "x";
export type Challenged = "o";
export type Empty = null;

export type Slot = Challenger | Challenged | Empty;
