import { Chess } from 'chess.js'
import { PIECE_VALUES, PAWN_STRUCTURE_VALUE, MOBILITY_VALUE, MIRROR_BOARD } from '../variable/piece'
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
    
    const board = game.board()

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const piece = board[i][j] 
            if (piece) {
                let square = piece.square as string
                if (piece.color === 'w') {
                    const pieceValue = PIECE_VALUES[piece.type].square_value['default'][square]
                    evaluation += pieceValue
                    // console.log("White Piece: ", piece.type, "Square: ", square, "Value: ", pieceValue)
                }
                if (piece.color === 'b') {
                    square = MIRROR_BOARD[square]
                    const pieceValue = PIECE_VALUES[piece.type].square_value['default'][square]
                    evaluation -= pieceValue
                    // console.log("Black Piece: ", piece.type, "Square: ", square, "Value: ", pieceValue)
                    }
                }
            }
        }
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
    const board = game.board()

    if (game.history().length === 0) {
        return evaluation
    }

    // check white mobility
    const initialFen = game.fen()
    const modifiedFenWhite = initialFen.replace(/ b /, ' w ')
    const whiteGame = new Chess(modifiedFenWhite)
    const whiteMoveCount = whiteGame.moves().length
    
    const modfiedFenBlack = initialFen.replace(/ w /, ' b ')
    const blackGame = new Chess(modfiedFenBlack)
    const blackMoveCount = blackGame.moves().length

    evaluation += (whiteMoveCount - blackMoveCount) * MOBILITY_VALUE.default
    console.log("White Moves: ", whiteGame.moves())
    console.log("White Mobility: ", whiteMoveCount)
    console.log("Black Moves: ", blackGame.moves())
    console.log("Black Mobility: ", blackMoveCount)
    console.log("Mobility: ", evaluation)

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

