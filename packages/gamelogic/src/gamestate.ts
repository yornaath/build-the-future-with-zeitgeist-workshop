import update from 'immutability-helper'
import { WINNING_PATTERNS } from './constants'
import * as GB from './gameboard'

export type GameState = FreshGame | ProgressingGame | FinishedGame

export type FreshGame = GameStateBase & {
  type: 'fresh'
}

export type ProgressingGame = GameStateBase & {
  type: 'progressing'
}

export type FinishedGame = GameStateBase & {
  type: 'finished'
  winner: string
}

export type GameStateBase = {
  players: {
    challenger: string
    challenged: string
  }
  state: GB.GameBoard
  events: { event: string; blockNumber: number }[]
}

export type Turn = {
  player: string
  blockNumber: number
  coord: GB.Coordinate
}

export const empty = (
  blockNumber: number,
  players: {
    challenger: string
    challenged: string
  },
): FreshGame => ({
  type: 'fresh',
  players,
  state: GB.empty(),
  events: [
    {
      blockNumber,
      event: `FIGHT!`,
    },
  ],
})

export const turn = (state: GameState, turn: Turn): GameState => {
  if (!Object.values(state.players).includes(turn.player)) {
    return {
      ...state,
      events: [
        ...state.events,
        {
          blockNumber: turn.blockNumber,
          event: `${turn.player} tried to make a move, but isnt in the game. Ignored.`,
        },
      ],
    }
  }

  if (state.type === 'finished') {
    return {
      ...state,
      events: [
        ...state.events,
        {
          blockNumber: turn.blockNumber,
          event: `${turn.player} tried to make a move when the game was finished`,
        },
      ],
    }
  }

  if (state.type === 'fresh' && turn.player === state.players.challenger) {
    return {
      ...state,
      type: 'finished',
      winner: state.players.challenged,
      events: [
        ...state.events,
        {
          blockNumber: turn.blockNumber,
          event: `Challenger ${state.players.challenger} tried to make the first move, resulting is loss.`,
        },
      ],
    }
  }

  if (state.type === 'fresh') {
    return makeMove(state, turn)
  }

  if (state.type === 'progressing' && isPlayersTurn(state, turn)) {
    const next = makeMove(state, turn)
    const winner = hasWinner(next)
    if (winner) {
      return {
        ...next,
        type: 'finished',
        winner: state.players[winner],
        events: [
          ...next.events,
          {
            blockNumber: turn.blockNumber,
            event: `Winner ${state.players[winner]}`,
          },
        ],
      }
    }
    return next
  }

  const winnerByCheating = Object.values(state.players).find(
    playerAddress => playerAddress !== turn.player,
  ) as string

  return {
    ...state,
    type: 'finished',
    winner: winnerByCheating,
    events: [
      ...state.events,
      {
        blockNumber: turn.blockNumber,
        event: `Player ${turn.player} tried to make a move out of turn, forfeiting the game.`,
      },
    ],
  }
}

export const hasWinner = (
  state: GameState,
): keyof GameState['players'] | null => {
  const rows = WINNING_PATTERNS.map(pattern => {
    return pattern.map(([x, y]) => state.state[y][x])
  })

  const winningRow = rows.find(
    row => row.every(slot => slot === 'o') || row.every(slot => slot === 'x'),
  )

  if (winningRow && winningRow[0] === 'x') return 'challenger'
  else if (winningRow && winningRow[0] === 'o') return 'challenged'

  return null
}

export const makeMove = (state: GameState, turn: Turn): GameState => {
  const [x, y] = turn.coord
  const slot: GB.Slot = state.players.challenger === turn.player ? 'x' : 'o'
  return update(state, {
    type: { $set: 'progressing' },
    events: {
      $push: [
        { blockNumber: turn.blockNumber, event: `${slot} put in [${x}, ${y}]` },
      ],
    },
    state: { [y]: { $splice: [[x, 1, slot]] } },
  })
}

export const isPlayersTurn = (state: GameState, turn: Turn): Boolean => {
  const turnBelongsTo = getPlayerTurn(state)
  return turn.player === state.players[turnBelongsTo]
}

export const getPlayerTurn = (state: GameState) => {
  const slots = state.state.flat()
  const movesByChallenger = slots.filter(slot => slot === 'x').length
  const movesByChallenged = slots.filter(slot => slot === 'o').length
  const turnBelongsTo: keyof GameState['players'] =
    movesByChallenged > movesByChallenger ? 'challenger' : 'challenged'
  return turnBelongsTo
}
