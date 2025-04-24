import { Chess } from "chess.js"
import { GAME_SPLIT } from "./variable/game"
import { evaluatePieceCount, movesOrdered } from "./evaluation/functions"
import { evaluatePiecePosition } from "./evaluation/functions"
import { evaluateMobility } from "./evaluation/functions"
import { evaluatePawnStructure } from "./evaluation/functions"

var node = 0;
export const Engines = [
  {
    id: "random",
    name: "1. Random",
    description: "A random engine that makes random moves.",
    searchAlgorithm: randomSearch,
    evaluationAlgorithm: randomEvaluation,
    evaluationBarAlgorithm: randomEvaluation,
    depthSettingAvailable: false,
    maxDepth: 1,
    simulateThinking: true, 
  },
  {
    id: "one-depth-best-move",
    name: "2. One-Depth Best Move",
    description: "A simple naive engine that evaluates all moves and selects the best immediate one.",
    searchAlgorithm: oneDepthBestMoveSearch,
    evaluationAlgorithm: handcraftedEvaluation,
    evaluationBarAlgorithm: handcraftedEvaluation,
    depthSettingAvailable: false,
    maxDepth: 1,
    simulateThinking: false,
  },
  {
    id: "minimax",
    name: "3. Handcrafted Simple Minimax",
    description: "A simple minimax engine.",
    searchAlgorithm: minimaxSearch,
    evaluationAlgorithm: handcraftedEvaluation,
    evaluationBarAlgorithm: handcraftedEvaluation,
    depthSettingAvailable: true,
    maxDepth: 3,
    simulateThinking: false,
  },
  {
    id: "minimax-alpha-beta",
    name: "4. Handcrafted Minimax Alpha-Beta",
    description: "A simple minimax engine with alpha-beta pruning.",
    searchAlgorithm: minimaxSearchAlphaBeta,
    evaluationAlgorithm: handcraftedEvaluation,
    evaluationBarAlgorithm: handcraftedEvaluation,
    depthSettingAvailable: true,
    maxDepth: 5,
    simulateThinking: false,
  },
  {
    id: "minimax-alpha-beta-move-ordering",
    name: "5. Handcrafted Minimax Alpha-Beta with Move Ordering",
    description: "A simple minimax engine with alpha-beta pruning and move ordering.",
    searchAlgorithm: minimaxSearchAlphaBetaMoveOrdering,
    evaluationAlgorithm: handcraftedEvaluation,
    evaluationBarAlgorithm: handcraftedEvaluation,
    depthSettingAvailable: true,
    maxDepth: 5,
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

  return searchResult;
}

function mini(game: Chess, depth: number, evaluationAlgorithm: any) {
  node = node + 1
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
  node = node + 1
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


function miniAlphaBeta(game: Chess, depth: number, evaluationAlgorithm: any, alpha: number, beta: number) {
  node = node + 1
  const gameCopy = new Chess(game.fen());
  if (depth === 0 || gameCopy.isGameOver()) {
    return evaluationAlgorithm(gameCopy);
  }
  let min = Infinity;
  const moves = gameCopy.moves();
  for (const move of moves) {
    gameCopy.move(move);
    const evaluation = maxiAlphaBeta(gameCopy, depth - 1, evaluationAlgorithm, alpha, beta);
    if (evaluation < min) {
      min = evaluation;
    }
    if (min <= beta) {
      beta = min;
    }
    if (beta <= alpha) {
      gameCopy.undo();
      break;
    }
    gameCopy.undo();
  }
  return min;
}

function maxiAlphaBeta(game: Chess, depth: number, evaluationAlgorithm: any, alpha: number, beta: number) {
  node = node + 1
  const gameCopy = new Chess(game.fen());
  if (depth === 0 || gameCopy.isGameOver()) {
    return evaluationAlgorithm(gameCopy);
  }
  let max = -Infinity;
  const moves = gameCopy.moves();
  for (const move of moves) {
    gameCopy.move(move);
    const evaluation = miniAlphaBeta(gameCopy, depth - 1, evaluationAlgorithm, alpha, beta);
    if (evaluation > max) {
      max = evaluation;
    }
    if (max >= alpha) {
      alpha = max;
    }
    if (alpha >= beta) {
      gameCopy.undo();
      break;
    }
    gameCopy.undo();
  }
  return max;
}

function miniAlphaBetaMoveOrdered(game: Chess, depth: number, evaluationAlgorithm: any, alpha: number, beta: number) {
  node = node + 1
  const gameCopy = new Chess(game.fen());
  if (depth === 0 || gameCopy.isGameOver()) {
    return evaluationAlgorithm(gameCopy);
  }
  let min = Infinity;
  const moves = movesOrdered(gameCopy)
  for (const move of moves) {
    gameCopy.move(move);
    const evaluation = maxiAlphaBeta(gameCopy, depth - 1, evaluationAlgorithm, alpha, beta);
    if (evaluation < min) {
      min = evaluation;
    }
    if (min <= beta) {
      beta = min;
    }
    if (beta <= alpha) {
      gameCopy.undo();
      break;
    }
    gameCopy.undo();
  }
  return min;
}

function maxiAlphaBetaMoveOrdered(game: Chess, depth: number, evaluationAlgorithm: any, alpha: number, beta: number) {
  node = node + 1
  const gameCopy = new Chess(game.fen());
  if (depth === 0 || gameCopy.isGameOver()) {
    return evaluationAlgorithm(gameCopy);
  }
  let max = -Infinity;
  const moves = movesOrdered(gameCopy)
  for (const move of moves) {
    gameCopy.move(move);
    const evaluation = miniAlphaBeta(gameCopy, depth - 1, evaluationAlgorithm, alpha, beta);
    if (evaluation > max) {
      max = evaluation;
    }
    if (max >= alpha) {
      alpha = max;
    }
    if (alpha >= beta) {
      gameCopy.undo();
      break;
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
    node = node + 1
    const gameCopy = new Chess(game.fen());
    const turn = gameCopy.turn()
    gameCopy.move(move.san);
    let evaluation = 0;
    if (turn == "b") {
      evaluation = maxi(gameCopy, depth - 1, evaluationAlgorithm)*eval_turn_multiplier
    }
    else {
      evaluation = mini(gameCopy, depth - 1, evaluationAlgorithm)*eval_turn_multiplier
    }

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
  console.log("Nodes evaluated: ", node)
  node = 0
  console.log("movesEvaluated by minimax", searchResult);
  return searchResult;
}

function minimaxSearchAlphaBeta(
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
    node = node + 1
    const gameCopy = new Chess(game.fen());
    const turn = gameCopy.turn()
    gameCopy.move(move.san);
    let evaluation = 0;
    let alpha = -Infinity;
    let beta = Infinity;

    if (turn == "b") {
      evaluation = maxiAlphaBeta(gameCopy, depth - 1, evaluationAlgorithm, alpha, beta)*eval_turn_multiplier
    }
    else {
      evaluation = miniAlphaBeta(gameCopy, depth - 1, evaluationAlgorithm, alpha, beta)*eval_turn_multiplier
    }

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
  console.log("Nodes evaluated: ", node)
  node = 0

  console.log("movesEvaluated by minimax", searchResult);
  return searchResult;
}




function minimaxSearchAlphaBetaMoveOrdering(
  game: Chess,
  depth: number,
  evaluationAlgorithm: any
) {

  const eval_turn_multiplier = game.turn() === "w" ? 1 : -1

  let searchResult = {
    bestMove: {
      move: null as any,
      evaluation: -Infinity
    },
    movesEvaluated: [],
    bestMoves: []
  };

  let move_order = movesOrdered(game)


  for (const move of move_order) {
    node = node + 1
    const gameCopy = new Chess(game.fen());
    const turn = gameCopy.turn()
    gameCopy.move(move.san);
    let evaluation = 0;
    let alpha = -Infinity;
    let beta = Infinity;

  
    if (turn == "b") {
      evaluation = maxiAlphaBetaMoveOrdered(gameCopy, depth - 1, evaluationAlgorithm, alpha, beta)*eval_turn_multiplier
    }
    else {
      evaluation = miniAlphaBetaMoveOrdered(gameCopy, depth - 1, evaluationAlgorithm, alpha, beta)*eval_turn_multiplier
    }

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
  console.log("Nodes evaluated: ", node)
  node = 0
  console.log("movesEvaluated by minimax", searchResult);
  return searchResult;
}


function handcraftedEvaluation(
  game: Chess,

  isEvaluatePieceCount: boolean = true,
  isEvaluatePiecePosition: boolean = true,
  isEvaluateMobility: boolean = true,
  isEvaluatePawnStructure: boolean = true,

  customPhase: any = {
    gameSplit: GAME_SPLIT,
    customOpening : false,
    customMiddleGame : false,
    customEndgame : false,
  }
) {
  let evaluation = 0
  // console.log("====== Handcrafted Evaluation ======")
  // console.log("Game FEN: ", game.fen())
  if (isEvaluatePieceCount) {
    const pieceCountEvaluation = evaluatePieceCount(game, customPhase)
    // console.log("Piece Count Evaluation: ", pieceCountEvaluation)
    evaluation += pieceCountEvaluation
  }
  if (isEvaluatePiecePosition) {
    const piecePositionEvaluation = evaluatePiecePosition(game, customPhase)
    // console.log("Piece Position Evaluation: ", piecePositionEvaluation)
    evaluation += piecePositionEvaluation
  }
  if (isEvaluateMobility) {
    const mobilityEvaluation = evaluateMobility(game, customPhase)
    // console.log("Mobility Evaluation: ", mobilityEvaluation)
    evaluation += mobilityEvaluation
  }
  if (isEvaluatePawnStructure) {
    const pawnStructureEvaluation = evaluatePawnStructure(game, customPhase)
    // console.log("Pawn Structure Evaluation: ", pawnStructureEvaluation)
    evaluation += pawnStructureEvaluation
  }
  // console.log("Total Evaluation: ", evaluation)
  // console.log("===================================")
  return evaluation
}
