import { Chess } from 'chess.js'
import { PIECE_VALUES, PAWN_STRUCTURE_VALUE, MOBILITY_VALUE } from '../variable/piece'
import { GAME_SPLIT } from '../variable/game'

function evaluateExample(
    game: Chess, 
    customPhase: any = {
        gameSplit: GAME_SPLIT,
        customOpening : false,
        customMiddleGame : false,
        customEndgame : false,
    }
) {
    let evaluation = 0
    
    // EVALUATION 

    return evaluation
}

export function evaluatePieceCount(
    game: Chess, 
    customPhase: any = {
        gameSplit: GAME_SPLIT,
        customOpening : false,
        customMiddleGame : false,
        customEndgame : false,
    }
) {
    let evaluation = 0
    const board = game.board()
    
    // Use default values for the piece values 
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const piece = board[i][j]
            if (piece) {
                const pieceValue = PIECE_VALUES[piece.type].main_value['default']
                evaluation += piece.color === 'w' ? pieceValue: -(pieceValue)
                
            }
        }
    }
   
    return evaluation
}

export function evaluatePiecePosition(
    game: Chess, 
    customPhase: any = {
        gameSplit: GAME_SPLIT,
        customOpening : false,
        customMiddleGame : false,
        customEndgame : false,
    }
) {
    let evaluation = 0
    
    // EVALUATION 

    return evaluation
}

export function evaluateMobility(
    game: Chess, 
    customPhase: any = {
        gameSplit: GAME_SPLIT,
        customOpening : false,
        customMiddleGame : false,
        customEndgame : false,
    }
) {
    let evaluation = 0
    
    // EVALUATION 

    return evaluation
}

export function evaluatePawnStructure(
    game: Chess, 
    customPhase: any = {
        gameSplit: GAME_SPLIT,
        customOpening : false,
        customMiddleGame : false,
        customEndgame : false,
    }
) {
    let evaluation = 0
    
    // EVALUATION 

    return evaluation 
}

