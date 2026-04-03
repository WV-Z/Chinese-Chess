/**
 * 棋子定义模块
 * 定义红黑双方的棋子类型和初始位置
 */

const PIECE_TYPES = {
    KING: 'king',      // 将/帅
    ADVISOR: 'advisor', // 士/仕
    ELEPHANT: 'elephant', // 象/相
    HORSE: 'horse',    // 马
    CHARIOT: 'chariot', // 车
    CANNON: 'cannon',  // 炮
    SOLDIER: 'soldier' // 卒/兵
};

const PIECE_SYMBOLS = {
    red: {
        king: '帅',
        advisor: '仕',
        elephant: '相',
        horse: '马',
        chariot: '车',
        cannon: '炮',
        soldier: '兵'
    },
    black: {
        king: '将',
        advisor: '士',
        elephant: '象',
        horse: '马',
        chariot: '车',
        cannon: '炮',
        soldier: '卒'
    }
};

const PIECE_VALUES = {
    king: 10000,
    advisor: 20,
    elephant: 20,
    horse: 40,
    chariot: 90,
    cannon: 45,
    soldier: 10
};

/**
 * 棋子类
 */
class Piece {
    constructor(type, color, x, y) {
        this.type = type;
        this.color = color;
        this.x = x;
        this.y = y;
        this.hasMoved = false;
    }

    /**
     * 获取棋子符号
     */
    getSymbol() {
        return PIECE_SYMBOLS[this.color][this.type];
    }

    /**
     * 获取棋子价值
     */
    getValue() {
        return PIECE_VALUES[this.type];
    }

    /**
     * 复制棋子
     */
    clone() {
        const piece = new Piece(this.type, this.color, this.x, this.y);
        piece.hasMoved = this.hasMoved;
        return piece;
    }

    /**
     * 移动棋子
     */
    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.hasMoved = true;
    }
}

/**
 * 初始化棋盘
 * 返回 10x9 的二维数组
 */
function initializeBoard() {
    const board = Array(10).fill(null).map(() => Array(9).fill(null));

    // 黑方棋子（上方）
    // 第一行
    board[0][0] = new Piece(PIECE_TYPES.CHARIOT, 'black', 0, 0);
    board[0][1] = new Piece(PIECE_TYPES.HORSE, 'black', 1, 0);
    board[0][2] = new Piece(PIECE_TYPES.ELEPHANT, 'black', 2, 0);
    board[0][3] = new Piece(PIECE_TYPES.ADVISOR, 'black', 3, 0);
    board[0][4] = new Piece(PIECE_TYPES.KING, 'black', 4, 0);
    board[0][5] = new Piece(PIECE_TYPES.ADVISOR, 'black', 5, 0);
    board[0][6] = new Piece(PIECE_TYPES.ELEPHANT, 'black', 6, 0);
    board[0][7] = new Piece(PIECE_TYPES.HORSE, 'black', 7, 0);
    board[0][8] = new Piece(PIECE_TYPES.CHARIOT, 'black', 8, 0);

    // 第三行 - 炮
    board[2][1] = new Piece(PIECE_TYPES.CANNON, 'black', 1, 2);
    board[2][7] = new Piece(PIECE_TYPES.CANNON, 'black', 7, 2);

    // 第四行 - 卒
    for (let i = 0; i < 9; i += 2) {
        board[3][i] = new Piece(PIECE_TYPES.SOLDIER, 'black', i, 3);
    }

    // 红方棋子（下方）
    // 第十行
    board[9][0] = new Piece(PIECE_TYPES.CHARIOT, 'red', 0, 9);
    board[9][1] = new Piece(PIECE_TYPES.HORSE, 'red', 1, 9);
    board[9][2] = new Piece(PIECE_TYPES.ELEPHANT, 'red', 2, 9);
    board[9][3] = new Piece(PIECE_TYPES.ADVISOR, 'red', 3, 9);
    board[9][4] = new Piece(PIECE_TYPES.KING, 'red', 4, 9);
    board[9][5] = new Piece(PIECE_TYPES.ADVISOR, 'red', 5, 9);
    board[9][6] = new Piece(PIECE_TYPES.ELEPHANT, 'red', 6, 9);
    board[9][7] = new Piece(PIECE_TYPES.HORSE, 'red', 7, 9);
    board[9][8] = new Piece(PIECE_TYPES.CHARIOT, 'red', 8, 9);

    // 第八行 - 炮
    board[7][1] = new Piece(PIECE_TYPES.CANNON, 'red', 1, 7);
    board[7][7] = new Piece(PIECE_TYPES.CANNON, 'red', 7, 7);

    // 第七行 - 兵
    for (let i = 0; i < 9; i += 2) {
        board[6][i] = new Piece(PIECE_TYPES.SOLDIER, 'red', i, 6);
    }

    return board;
}

/**
 * 获取棋盘上所有指定颜色的棋子
 */
function getPiecesByColor(board, color) {
    const pieces = [];
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 9; x++) {
            const piece = board[y][x];
            if (piece && piece.color === color) {
                pieces.push(piece);
            }
        }
    }
    return pieces;
}

/**
 * 获取棋盘上所有棋子
 */
function getAllPieces(board) {
    const pieces = [];
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 9; x++) {
            const piece = board[y][x];
            if (piece) {
                pieces.push(piece);
            }
        }
    }
    return pieces;
}

/**
 * 查找指定位置的棋子
 */
function getPieceAt(board, x, y) {
    if (x < 0 || x >= 9 || y < 0 || y >= 10) {
        return null;
    }
    return board[y][x];
}

/**
 * 复制棋盘
 */
function cloneBoard(board) {
    return board.map(row => row.map(piece => piece ? piece.clone() : null));
}

// 导出
window.PIECE_TYPES = PIECE_TYPES;
window.PIECE_SYMBOLS = PIECE_SYMBOLS;
window.PIECE_VALUES = PIECE_VALUES;
window.Piece = Piece;
window.initializeBoard = initializeBoard;
window.getPiecesByColor = getPiecesByColor;
window.getAllPieces = getAllPieces;
window.getPieceAt = getPieceAt;
window.cloneBoard = cloneBoard;
