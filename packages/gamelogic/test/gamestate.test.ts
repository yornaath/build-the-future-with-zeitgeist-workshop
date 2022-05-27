import * as GS from "../src/gamestate";
import { challenged, challenger, createFreshState, moves } from "./fixtures";

describe("GameState", () => {
  test("Full game.", () => {
    let state = createFreshState();

    state = GS.turn(state, {
      blockNumber: 1,
      player: challenged,
      coord: [0, 0],
    });
    state = GS.turn(state, {
      blockNumber: 2,
      player: challenger,
      coord: [1, 2],
    });
    state = GS.turn(state, {
      blockNumber: 3,
      player: challenged,
      coord: [1, 1],
    });
    state = GS.turn(state, {
      blockNumber: 4,
      player: challenger,
      coord: [0, 1],
    });
    state = GS.turn(state, {
      blockNumber: 5,
      player: challenged,
      coord: [2, 2],
    });

    expect(state.type).toBe("finished");

    expect(state.state).toStrictEqual([
      ["o", null, null],
      ["x", "o", null],
      [null, "x", "o"],
    ]);
  });

  test("Challenged should win if challenger makes the first move.", () => {
    let state = createFreshState();
    state = GS.turn(state, {
      blockNumber: 1,
      player: challenger,
      coord: [1, 1],
    });
    expect(state.type).toBe("finished");
    expect((state as GS.FinishedGame).winner).toBe(challenged);
  });

  test("Making correct turns updates the game state coordinates.", () => {
    let state = createFreshState();

    state = GS.turn(state, {
      blockNumber: 1,
      player: challenged,
      coord: [0, 0],
    });
    expect(state.type).toBe("progressing");

    state = GS.turn(state, {
      blockNumber: 2,
      player: challenger,
      coord: [1, 0],
    });
    state = GS.turn(state, {
      blockNumber: 3,
      player: challenged,
      coord: [2, 1],
    });
    state = GS.turn(state, {
      blockNumber: 4,
      player: challenger,
      coord: [1, 2],
    });

    expect(state.state).toStrictEqual([
      ["o", "x", null],
      [null, null, "o"],
      [null, "x", null],
    ]);
  });

  test("Winning moves should result in finished with correct winner.", () => {
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

    state = GS.turn(state, {
      blockNumber: 1,
      player: challenged,
      coord: [0, 0],
    });
    state = GS.turn(state, {
      blockNumber: 2,
      player: challenged,
      coord: [0, 1],
    });

    expect(state.events.filter((e) => e.match("out of turn"))?.length).toBe(1);
    expect(state.type).toBe("finished");
    expect((state as GS.FinishedGame).winner).toBe(state.players.challenger);

    state = createFreshState();

    state = GS.turn(state, {
      blockNumber: 1,
      player: challenged,
      coord: [0, 0],
    });
    state = GS.turn(state, {
      blockNumber: 2,
      player: challenger,
      coord: [0, 1],
    });
    state = GS.turn(state, {
      blockNumber: 3,
      player: challenger,
      coord: [0, 2],
    });

    expect(state.events.filter((e) => e.match("out of turn"))?.length).toBe(1);
    expect(state.type).toBe("finished");
    expect((state as GS.FinishedGame).winner).toBe(state.players.challenged);
  });
});
