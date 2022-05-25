import * as GS from "../src/gamestate";
import * as GB from "../src/gameboard";

const challenger = "foo";
const challenged = "bar";

const createFreshState = () => {
  const state: GS.GameState = {
    type: "fresh",
    players: {
      challenger,
      challenged,
    },
    state: GB.empty(),
    events: [],
  };

  return state;
};

describe("GameState", () => {
  test("Challenged should win if challenger makes the first move.", () => {
    const state = createFreshState();
    const next = GS.turn(state, { player: challenger, coord: [1, 1] });
    expect(next.type).toBe("finished");
    expect((next as GS.FinishedGame).winner).toBe(challenged);
  });

  test("General moves", () => {
    const state = createFreshState();

    let next = GS.turn(state, { player: challenged, coord: [0, 0] });
    expect(next.type).toBe("progressing");

    next = GS.turn(next, { player: challenger, coord: [1, 0] });
    next = GS.turn(next, { player: challenged, coord: [2, 1] });
    next = GS.turn(next, { player: challenger, coord: [1, 2] });

    expect(next.state).toStrictEqual([
      ["o", "x", null],
      [null, null, "o"],
      [null, "x", null],
    ]);
  });

  test("Winning moves", () => {
    const moves: [GB.GameBoard, GS.Turn, GB.GameBoard][] = [
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
    ];

    for (const [start, turn, end] of moves) {
      const state: GS.GameState = {
        type: "progressing",
        players: {
          challenger,
          challenged,
        },
        state: start,
        events: [],
      };

      const next = GS.turn(state, turn);

      expect(next.state).toStrictEqual(end);

      expect(next.type).toBe("finished");
      expect((next as GS.FinishedGame).winner).toBe(turn.player);
    }
  });
});
