import { Chess } from "chess.js"
import { GAME_SPLIT } from "./variable/game"
import { evaluatePieceCount } from "./evaluation/functions"
import { evaluatePiecePosition } from "./evaluation/functions"
import { evaluateMobility } from "./evaluation/functions"
import { evaluatePawnStructure } from "./evaluation/functions"

export const Engines = [
  {
    id: "random",
    name: "Random",
    description: "A random engine that makes random moves.",
    searchAlgorithm: randomSearch,
    evaluationAlgorithm: randomEvaluation,
    evaluationBarAlgorithm: randomEvaluation,
    depthSettingAvailable: false,
    simulateThinking: true, 
  },
  {
    id: "one-depth-best-move",
    name: "One Depth Best Move",
    description: "A simple naive engine that evaluates all moves and selects the best immediate one.",
    searchAlgorithm: oneDepthBestMoveSearch,
    evaluationAlgorithm: handcraftedEvaluation,
    evaluationBarAlgorithm: handcraftedEvaluation,
    depthSettingAvailable: false,
    simulateThinking: false,
  },
  {
    id: "minimax",
    name: "Handcrafted Minimax",
    description: "A simple minimax engine.",
    searchAlgorithm: minimaxSearch,
    evaluationAlgorithm: handcraftedEvaluation,
    evaluationBarAlgorithm: handcraftedEvaluation,
    depthSettingAvailable: true,
    simulateThinking: false,
  },
]

export class ChessEngine {
  private engine_id: any
  private searchDepth: number
  private searchAlgorithm: any
  private evaluationAlgorithm: any
  private evaluationBarAlgorithm: any
  private simulateThinking: boolean

  constructor(engine_id: string = "random", searchDepth: number = 15) {
    this.engine_id = engine_id
    this.searchDepth = searchDepth

    const selectedEngine = Engines.find((e) => e.id === engine_id)
    if (selectedEngine) {
      this.searchAlgorithm = selectedEngine.searchAlgorithm
      this.evaluationAlgorithm = selectedEngine.evaluationAlgorithm
      this.simulateThinking = selectedEngine.simulateThinking || false
      this.evaluationBarAlgorithm = selectedEngine.evaluationBarAlgorithm
    } else {
      throw new Error(`Engine with id ${engine_id} not found`)
    }
  }

  setEngine(engine_id: string) {
    const selectedEngine = Engines.find((e) => e.id === engine_id)
    if (selectedEngine) {
      this.engine_id = selectedEngine.id
      this.searchAlgorithm = selectedEngine.searchAlgorithm
      this.evaluationAlgorithm = selectedEngine.evaluationAlgorithm
      this.simulateThinking = selectedEngine.simulateThinking || false
      this.evaluationBarAlgorithm = selectedEngine.evaluationBarAlgorithm
    }
  }

  setSearchDepth(depth: number) {
    this.searchDepth = depth
  }

  async getMovesOptionsEvaluated(game: Chess) {
    if (!this.engine_id) {
      throw new Error("Engine not set")

      
    }

    if (this.simulateThinking) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const movesEvaluated = this.searchAlgorithm(game, this.searchDepth, this.evaluationAlgorithm)
          resolve(movesEvaluated)
        }, 500)
      })
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const movesEvaluated = this.searchAlgorithm(game, this.searchDepth, this.evaluationAlgorithm)
          resolve(movesEvaluated)
        }, 0)
      }
      )
    }
  }


  async getEvaluationBar(game: Chess) {
    if (!this.engine_id) {
      throw new Error("Engine not set")
    }
    const evaluation = this.evaluationBarAlgorithm(game)
    return evaluation
  }
}


// RANDOM ENGINE
function randomSearch(
  game: Chess,
  depth: number,
  evaluationAlgorithm: any
) {
  const moves = game.moves({verbose: true})

  const searchResult = {
    bestMove: null, 
    movesEvaluated: []
  }

  


  for (const move of moves) {
    const evaluation = evaluationAlgorithm(game)
    const moveCopy = Object.assign({}, move)

    searchResult.movesEvaluated.push({ move: moveCopy, evaluation })
  }

  // select random move as best move
  const randomMove = searchResult.movesEvaluated[Math.floor(Math.random() * searchResult.movesEvaluated.length)]
  const moveCopy = Object.assign({}, randomMove.move)
  searchResult.bestMove = { move: moveCopy, evaluation: randomMove.evaluation }

  return searchResult
}


function randomEvaluation(
  game: Chess
) {
  return Math.floor(Math.random() * 2001) - 1000
}

// One Depth Best Move
function oneDepthBestMoveSearch(
  game: Chess,
  depth: number,
  evaluationAlgorithm: any
) {
  const moves = game.moves({ verbose: true });

  const searchResult = {
    bestMove: null,
    movesEvaluated: [],
    bestMoves: [] 
  };

  const turn_multiplier = game.turn() === "w" ? 1 : -1
  for (const move of moves) {
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move.san);
    const evaluation = evaluationAlgorithm(gameCopy) * turn_multiplier;
    const moveCopy = Object.assign({}, move);
    
    searchResult.movesEvaluated.push({ move: moveCopy, evaluation });

    // First move case
    if (!searchResult.bestMove) {
      searchResult.bestMove = { move: moveCopy, evaluation };
      searchResult.bestMoves = [{ move: moveCopy, evaluation }];
      continue;
    }

    // Found a better move
    if (evaluation > searchResult.bestMove.evaluation) {
      searchResult.bestMove = { move: moveCopy, evaluation };
      searchResult.bestMoves = [{ move: moveCopy, evaluation }];
    } 
    // Found an equally good move
    else if (evaluation === searchResult.bestMove.evaluation) {
      searchResult.bestMoves.push({ move: moveCopy, evaluation });
    }
  }

  // If multiple moves have the same evaluation, pick one uniformly at random
  if (searchResult.bestMoves.length > 1) {
    const randomIndex = Math.floor(Math.random() * searchResult.bestMoves.length);
    searchResult.bestMove = searchResult.bestMoves[randomIndex];
  }

  console.log("movesEvaluated by One Depth", searchResult);
  return searchResult;
}

function mini(game: Chess, depth: number, evaluationAlgorithm: any) {
  const gameCopy = new Chess(game.fen());
  if (depth === 0 || gameCopy.isGameOver()) {
    return evaluationAlgorithm(gameCopy);
  }
  let min = Infinity;
  const moves = gameCopy.moves();
  for (const move of moves) {
    gameCopy.move(move);
    const evaluation = maxi(gameCopy, depth - 1, evaluationAlgorithm);
    if (evaluation < min) {
      min = evaluation;
    }
    gameCopy.undo();
  }
  return min;
}

function maxi(game: Chess, depth: number, evaluationAlgorithm: any) {
  const gameCopy = new Chess(game.fen());
  if (depth === 0 || gameCopy.isGameOver()) {
    return evaluationAlgorithm(gameCopy);
  }
  let max = -Infinity;
  const moves = gameCopy.moves();
  for (const move of moves) {
    gameCopy.move(move);
    const evaluation = mini(gameCopy, depth - 1, evaluationAlgorithm);
    if (evaluation > max) {
      max = evaluation;
    }
    gameCopy.undo();
  }
  return max;
}

function minimaxEvaluation(
  game: Chess,
  depth: number = 3,
  evaluationAlgorithm: any = handcraftedEvaluation
) {
  const gameCopy = new Chess(game.fen());

  let evaluation = 0;
  if (gameCopy.turn() === "w") {
    evaluation = maxi(gameCopy, depth, evaluationAlgorithm);
  } else {
    evaluation = mini(gameCopy, depth, evaluationAlgorithm);
  }
  return evaluation
}

function minimaxSearch(
  game: Chess,
  depth: number,
  evaluationAlgorithm: any
) {

  const moves = game.moves({ verbose: true });
  const eval_turn_multiplier = game.turn() === "w" ? 1 : -1

  let searchResult = {
    bestMove: {
      move: null as any,
      evaluation: -Infinity
    },
    movesEvaluated: [],
    bestMoves: []
  };

  

  for (const move of moves) {
    const gameCopy = new Chess(game.fen());
    const turn = gameCopy.turn()
    gameCopy.move(move.san);
    console.log("move", move)
    let evaluation = 0;
    if (turn == "b") {
      evaluation = maxi(gameCopy, depth - 1, evaluationAlgorithm)*eval_turn_multiplier
    }
    else {
      evaluation = mini(gameCopy, depth - 1, evaluationAlgorithm)*eval_turn_multiplier
    }

    console.log("Evaluation", evaluation)
    const moveCopy = Object.assign({}, move);

    searchResult.movesEvaluated.push({ move: moveCopy, evaluation });

    // First move case
    if (!searchResult.bestMove) {
      searchResult.bestMove = { move: moveCopy, evaluation };
      searchResult.bestMoves = [{ move: moveCopy, evaluation }];
      continue;
    }

    // Found a better move
    if (evaluation > searchResult.bestMove.evaluation) {
      searchResult.bestMove = { move: moveCopy, evaluation };
      searchResult.bestMoves = [{ move: moveCopy, evaluation }];
    } 
    // Found an equally good move
    else if (evaluation === searchResult.bestMove.evaluation) {
      searchResult.bestMoves.push({ move: moveCopy, evaluation });
    }
  }

  if (searchResult.bestMoves.length > 1) {
    const randomIndex = Math.floor(Math.random() * searchResult.bestMoves.length);
    searchResult.bestMove = searchResult.bestMoves[randomIndex];
  }

  console.log("movesEvaluated by minimax", searchResult);
  return searchResult;
}


function handcraftedEvaluation(
  game: Chess,

  isEvaluatePieceCount: boolean = true,
  isEvaluatePiecePosition: boolean = true,
  isEvaluateMobility: boolean = true,
  isEvaluatePawnStructure: boolean = false,

  customPhase: any = {
    gameSplit: GAME_SPLIT,
    customOpening : false,
    customMiddleGame : false,
    customEndgame : false,
  }
) {
  let evaluation = 0

  if (isEvaluatePieceCount) {
    evaluation += evaluatePieceCount(game, customPhase)
  }
  if (isEvaluatePiecePosition) {
    evaluation += evaluatePiecePosition(game, customPhase)
  }
  if (isEvaluateMobility) {
    evaluation += evaluateMobility(game, customPhase)
  }
  if (isEvaluatePawnStructure) {
    evaluation += evaluatePawnStructure(game, customPhase)
  }
  return evaluation
}
