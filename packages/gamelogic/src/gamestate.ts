import { GameBoard } from "./gameboard";

export type GameState = {};

export type GameStateBase = {
  type: GameStateType;
  players: {
    challenger: string;
    challenged: string;
  };
};

export type FreshGame = GameStateBase & {
  type: "fresh";
  state: GameBoard;
};

export enum GameStateType {
  fresh = "fresh",
  inProgress = "progress",
  finished = "finished",
}
