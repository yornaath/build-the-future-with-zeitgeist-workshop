import * as GS from "../src/gamestate";
import * as GB from "../src/gameboard";
import { challenged, challenger, createFreshState, moves } from "./fixtures";

describe("GameState", () => {
  test("Challenged should win if challenger makes the first move.", () => {
    let state = createFreshState();
    state = GS.turn(state, { player: challenger, coord: [1, 1] });
    expect(state.type).toBe("finished");
    expect((state as GS.FinishedGame).winner).toBe(challenged);
  });

  test("General moves", () => {
    let state = createFreshState();

    state = GS.turn(state, { player: challenged, coord: [0, 0] });
    expect(state.type).toBe("progressing");

    state = GS.turn(state, { player: challenger, coord: [1, 0] });
    state = GS.turn(state, { player: challenged, coord: [2, 1] });
    state = GS.turn(state, { player: challenger, coord: [1, 2] });

    expect(state.state).toStrictEqual([
      ["o", "x", null],
      [null, null, "o"],
      [null, "x", null],
    ]);
  });

  test("Winning moves", () => {
    for (const [start, turn, end] of moves) {
      let state: GS.GameState = {
        type: "progressing",
        players: {
          challenger,
          challenged,
        },
        state: start,
        events: [],
      };

      state = GS.turn(state, turn);

      expect(state.state).toStrictEqual(end);

      expect(state.type).toBe("finished");
      expect((state as GS.FinishedGame).winner).toBe(turn.player);
    }
  });

  test("Opponent should win when player makes to subsequent moves", () => {
    let state = createFreshState();

    state = GS.turn(state, { player: challenged, coord: [0, 0] });
    state = GS.turn(state, { player: challenged, coord: [0, 1] });

    expect(state.events.filter((e) => e.match("out of turn"))?.length).toBe(1);
    expect(state.type).toBe("finished");
    expect((state as GS.FinishedGame).winner).toBe(state.players.challenger);

    state = createFreshState();

    state = GS.turn(state, { player: challenged, coord: [0, 0] });
    state = GS.turn(state, { player: challenger, coord: [0, 1] });
    state = GS.turn(state, { player: challenger, coord: [0, 2] });

    expect(state.events.filter((e) => e.match("out of turn"))?.length).toBe(1);
    expect(state.type).toBe("finished");
    expect((state as GS.FinishedGame).winner).toBe(state.players.challenged);
  });
});
