import * as GS from "../src/gamestate";
import * as GB from "../src/gameboard";
import { challenged, challenger, moves } from "./fixtures";

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
