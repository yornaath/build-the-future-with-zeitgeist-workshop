# Build the future with the Zeitgeist SDK

#### A tick tack toe game using event sourcing and prediction markets.

This is the code for the talk given at the Polkadot Global Series North America edition for [Zeitgeist.pm](https://zeitgeist.pm/).

[Watch the code walk on Crowdcast!](https://www.crowdcast.io/e/building-the-future-with)

## Build & Run

Build the source and the run the docker containers rusing docker compose.
You only need to start the gui service, this will allso start the referee and mongodb services.

```bash
yarn install
yarn build
docker compose up --build gui
```

## Architecture

This application has two main components/apps. It is built loosely on event sourcing principles for aggregating game state.

### The Referee.
This is a nodejs service that runs the event source aggregator, listening to market creation events and remarks(moves) on the chain and builds the state of the games which is stores to mongodb.

The referee is also the designated [oracle](https://docs.zeitgeist.pm/docs/learn/using-zeitgeist-markets#the-life-cycle-of-a-zeitgeist-prediction-market) that listens to the MarketEnded event on chain and resolves the market with the correct outcome.

The referee service also exposes a simple REST api for querying aggregated game states.

### The GUI

This is a react application for interacting with the game. It is responsible for showing the gui for the gamestates and for letting the user sign and send transactions for creating markets(new game), buying assets(betting) and making moves(remarks).


### Game Logic

The packages folder also contains a module for the core gamelogic with some tests.
