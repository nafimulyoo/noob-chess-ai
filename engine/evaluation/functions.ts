import { Chess, Color, Square } from 'chess.js'
import { PIECE_VALUES, PAWN_STRUCTURE_VALUE, MOBILITY_VALUE, MIRROR_BOARD, SQUARE_ARRAY_BY_COLUMN, ROWS, COLUMNS, COLUMN_BEFORE, COLUMN_AFTER, ROW_AFTER, ROW_BEFORE } from '../variable/piece'
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

    if (game.history().length === 0) {
        return evaluation
    }

    // check white mobility
    try {
        const initialFen = game.fen()
        const modifiedFenWhite = initialFen.replace(/ b /, ' w ')
        const whiteGame = new Chess(modifiedFenWhite)
        const whiteMoveCount = whiteGame.moves().length
        
        const modfiedFenBlack = initialFen.replace(/ w /, ' b ')
        const blackGame = new Chess(modfiedFenBlack)
        const blackMoveCount = blackGame.moves().length
    
        evaluation += (whiteMoveCount - blackMoveCount) * MOBILITY_VALUE.default
    }
    catch (error) {
        console.error("Error in mobility evaluation: ", error)
    }

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

    const doubledPawnEvaluation = evaluateDoubledPawns(game, customPhase)
    console.log("- Doubled Pawn Evaluation: ", doubledPawnEvaluation)
    evaluation += doubledPawnEvaluation

    const isolatedPawnEvaluation = evaluateIsolatedPawns(game, customPhase)
    console.log("- Isolated Pawn Evaluation: ", isolatedPawnEvaluation)
    evaluation += isolatedPawnEvaluation

    const blockedPawnEvaluation = evaluateBlockedPawns(game, customPhase)
    console.log("- Isolated Pawn Evaluation: ", blockedPawnEvaluation)
    evaluation += blockedPawnEvaluation

    return evaluation
}


export function evaluateDoubledPawns(
    game: Chess, 
    customPhase: any = {
        gameSplit: GAME_SPLIT,
        customOpening : false,
        customMiddleGame : false,
        customEndgame : false,
    }
) {
    let evaluation = 0
    let whiteDoubledPawns = 0
    let blackDoubledPawns = 0

    const whitePawns = game.findPiece({color: 'w', type: 'p'})
    const blackGamePawns = game.findPiece({color: 'w', type: 'b'})

    for (const column of COLUMNS) {
        let whitePawnCount = 0
        for (const whitePawn of whitePawns) {
            if (whitePawn[0] === column) {
                whitePawnCount++
            }
        }
        if (whitePawnCount > 1) {
            whiteDoubledPawns += whitePawnCount - 1
        }

        let blackPawnCount = 0
        for (const blackPawn of blackGamePawns) {
            if (blackPawn[0] === column) {
                blackPawnCount++
            }
        }
        if (blackPawnCount > 1) {
            blackDoubledPawns += blackPawnCount - 1
        }
    }
    console.log("- Doubled Pawns Black: ", blackDoubledPawns, "Doubled Pawns White: ", whiteDoubledPawns)
    evaluation += (whiteDoubledPawns - blackDoubledPawns) * PAWN_STRUCTURE_VALUE.doubled.default

    return evaluation
}

export function evaluateIsolatedPawns(
    game: Chess,
    customPhase: any = {
        gameSplit: GAME_SPLIT,
        customOpening : false,
        customMiddleGame : false,
        customEndgame : false,
    }
) {
    let evaluation = 0

    const pawns = {
        "w": game.findPiece({color: 'w', type: 'p'}),
        "b":  game.findPiece({color: 'b', type: 'p'})
    }

    let isolatedPawns = {
        "w": 0,
        "b": 0
    }

    for ( const color of ['w', 'b']) {
        for (const pawn of pawns[color]) {
            const column = pawn[0]
            let leftNeighbor = false
            let rightNeighbor = false

            for (const pawn of pawns[color]) {
                if (pawn[0] == COLUMN_BEFORE[column]) {
                    leftNeighbor = true
                    break
                }
                if (pawn[0] == COLUMN_AFTER[column]) {
                    rightNeighbor = true
                    break
                }
            }

            if  (!leftNeighbor && !rightNeighbor) {
                isolatedPawns[color]++
            }
        }
    }

    evaluation += (isolatedPawns['w'] - isolatedPawns['b']) * PAWN_STRUCTURE_VALUE.isolated.default
    return evaluation
}

export function evaluateBlockedPawns(
    game: Chess,
    customPhase: any = {
        gameSplit: GAME_SPLIT,
        customOpening : false,
        customMiddleGame : false,
        customEndgame : false,
    }
) {
    let evaluation = 0

    const pawns = {
        "w": game.findPiece({color: 'w', type: 'p'}),
        "b":  game.findPiece({color: 'b', type: 'p'})
    }

    let blockedPawns = {
        "w": 0,
        "b": 0
    }

    for ( const color of ['w', 'b']) {
        for (const pawn of pawns[color]) {
            const column = pawn[0]
            const row = pawn[1]

            let squareAhead = ''
            if (color === 'w') {
                const rowAhead = ROW_AFTER[row]
                squareAhead = column + rowAhead
            }
            if (color === 'b') {
                const rowAhead = ROW_BEFORE[row]
                squareAhead = column + rowAhead
            }
            const pieceAhead = game.get(squareAhead as Square)
            if (pieceAhead !== undefined && pieceAhead.type === 'p') {
                blockedPawns[color]++
            }
        }
    }

    evaluation += (blockedPawns['w'] - blockedPawns['b']) * PAWN_STRUCTURE_VALUE.blocked.default
    return evaluation
}