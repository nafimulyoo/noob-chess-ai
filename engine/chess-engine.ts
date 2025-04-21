import { Chess } from "chess.js";
import { waitForDebugger } from "inspector";

export const Engines = [
    {
        id: "random",
        name: "Random",
        description: "A random engine that makes random moves.",
        searchAlgorithm: randomSearch,
        evaluationAlgorithm: randomEvaluation,
        depthSettingAvailable: false,
    },
    {
        id: "minimax",
        name: "Minimax (Not Implemented)",
        description: "A simple Minimax engine.",
        searchAlgorithm: minimaxSearch,
        evaluationAlgorithm: minimaxEvaluation,
        depthSettingAvailable: true,
    },
]

export class ChessEngine {
    private engine_id: any;
    private searchDepth: number;
    private searchAlgorithm: any;
    private evaluationAlgorithm: any;

    constructor(engine_id: string = "random", searchDepth: number = 15) {
        this.engine_id = engine_id;
        this.searchDepth = searchDepth;

        const selectedEngine = Engines.find(e => e.id === engine_id);
        if (selectedEngine) {
            this.searchAlgorithm = selectedEngine.searchAlgorithm;
            this.evaluationAlgorithm = selectedEngine.evaluationAlgorithm;
        } else {
            throw new Error(`Engine with id ${engine_id} not found`);
        }
    }

    setEngine(engine_id: string) {
        const selectedEngine = Engines.find(e => e.id === engine_id);
        if (selectedEngine) {
            this.engine_id = selectedEngine.id;
            this.searchAlgorithm = selectedEngine.searchAlgorithm;
            this.evaluationAlgorithm = selectedEngine.evaluationAlgorithm;
        }
    }

    setSearchDepth(depth: number) {
        this.searchDepth = depth;
    }

    getBestMove(game: Chess) {
        if (!this.engine_id) {
            throw new Error("Engine not set");
        }

        const bestMove = this.searchAlgorithm(game, this.searchDepth);
        return bestMove;
    }

    getEvaluation(game: Chess) {
        if (!this.engine_id) {
            throw new Error("Engine not set");
        }

        const evaluation = this.evaluationAlgorithm(game);
        return evaluation;
    }
}


// RANDOM ENGINE
function randomSearch(game: Chess, depth: number) {
        const moves = game.moves();
        const randomIndex = Math.floor(Math.random() * moves.length);
        sleep(2000)
        return moves[randomIndex];
}

function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function randomEvaluation(game: Chess) {
    return Math.floor(Math.random() * 2001) - 1000;
}

// MINIMAX ENGINE
function minimaxSearch(game: Chess, depth: number) {
    const moves = game.moves();
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
}

function minimaxEvaluation(game: Chess) {
return Math.floor(Math.random() * 2001) - 1000;
}