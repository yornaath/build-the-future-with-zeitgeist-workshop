import { empty, GameBoard, GameState, Turn } from "../src";

export const challenger = "foo";
export const challenged = "bar";

export const createFreshState = (): GameState => {
  return {
    type: "fresh",
    players: {
      challenger,
      challenged,
    },
    state: empty(),
    events: [],
  };
};

export const moves: [GameBoard, Turn, GameBoard][] = [
  [
    [
      ["o", null, "x"],
      [null, "o", null],
      [null, "x", null],
    ],
    { player: challenged, coord: [2, 2] },
    [
      ["o", null, "x"],
      [null, "o", null],
      [null, "x", "o"],
    ],
  ],
  [
    [
      [null, "x", null],
      [null, "o", null],
      ["o", "x", null],
    ],
    { player: challenged, coord: [2, 0] },
    [
      [null, "x", "o"],
      [null, "o", null],
      ["o", "x", null],
    ],
  ],
  [
    [
      ["o", null, "x"],
      [null, "x", "o"],
      [null, "o", null],
    ],
    { player: challenger, coord: [0, 2] },
    [
      ["o", null, "x"],
      [null, "x", "o"],
      ["x", "o", null],
    ],
  ],
  [
    [
      ["o", "o", null],
      [null, null, null],
      [null, "x", "x"],
    ],
    { player: challenged, coord: [2, 0] },
    [
      ["o", "o", "o"],
      [null, null, null],
      [null, "x", "x"],
    ],
  ],
  [
    [
      [null, null, null],
      ["o", "o", null],
      [null, "x", "x"],
    ],
    { player: challenged, coord: [2, 1] },
    [
      [null, null, null],
      ["o", "o", "o"],
      [null, "x", "x"],
    ],
  ],
  [
    [
      [null, null, null],
      [null, "x", "x"],
      ["o", "o", null],
    ],
    { player: challenged, coord: [2, 2] },
    [
      [null, null, null],
      [null, "x", "x"],
      ["o", "o", "o"],
    ],
  ],
  [
    [
      ["o", "x", null],
      ["o", "x", null],
      [null, null, null],
    ],
    { player: challenged, coord: [0, 2] },
    [
      ["o", "x", null],
      ["o", "x", null],
      ["o", null, null],
    ],
  ],
  [
    [
      [null, "o", "x"],
      [null, "o", "x"],
      [null, null, null],
    ],
    { player: challenged, coord: [1, 2] },
    [
      [null, "o", "x"],
      [null, "o", "x"],
      [null, "o", null],
    ],
  ],
  [
    [
      [null, "x", "o"],
      [null, "x", "o"],
      [null, null, null],
    ],
    { player: challenged, coord: [2, 2] },
    [
      [null, "x", "o"],
      [null, "x", "o"],
      [null, null, "o"],
    ],
  ],
];
