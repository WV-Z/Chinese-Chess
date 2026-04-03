/**
 * 走棋规则模块
 * 定义各棋子的走棋规则和胜负判定
 */

class Rules {
    /**
     * 获取棋子的所有合法走法
     */
    static getValidMoves(board, x, y) {
        const piece = board[y][x];
        if (!piece) return [];

        switch (piece.type) {
            case PIECE_TYPES.KING:
                return this.getKingMoves(board, x, y, piece.color);
            case PIECE_TYPES.ADVISOR:
                return this.getAdvisorMoves(board, x, y, piece.color);
            case PIECE_TYPES.ELEPHANT:
                return this.getElephantMoves(board, x, y, piece.color);
            case PIECE_TYPES.HORSE:
                return this.getHorseMoves(board, x, y);
            case PIECE_TYPES.CHARIOT:
                return this.getChariotMoves(board, x, y);
            case PIECE_TYPES.CANNON:
                return this.getCannonMoves(board, x, y);
            case PIECE_TYPES.SOLDIER:
                return this.getSoldierMoves(board, x, y, piece.color);
            default:
                return [];
        }
    }

    /**
     * 将/帅的走法
     */
    static getKingMoves(board, x, y, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;

            // 在九宫格内
            if (nx >= 3 && nx <= 5) {
                if ((color === 'black' && ny >= 0 && ny <= 2) ||
                    (color === 'red' && ny >= 7 && ny <= 9)) {
                    const target = board[ny][nx];
                    if (!target || target.color !== color) {
                        moves.push({ x: nx, y: ny });
                    }
                }
            }
        });

        // 检查是否可以将杀对方将（将帅对面）
        const enemyKing = this.findKing(board, color === 'red' ? 'black' : 'red');
        if (enemyKing && enemyKing.x === x && this.isPathClear(board, x, y, enemyKing.x, enemyKing.y)) {
            // 可以将帅对面
        }

        return moves;
    }

    /**
     * 士/仕的走法
     */
    static getAdvisorMoves(board, x, y, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;

            // 在九宫格内
            if (nx >= 3 && nx <= 5) {
                if ((color === 'black' && ny >= 0 && ny <= 2) ||
                    (color === 'red' && ny >= 7 && ny <= 9)) {
                    const target = board[ny][nx];
                    if (!target || target.color !== color) {
                        moves.push({ x: nx, y: ny });
                    }
                }
            }
        });

        return moves;
    }

    /**
     * 象/相的走法
     */
    static getElephantMoves(board, x, y, color) {
        const moves = [];
        const directions = [[2, 2], [2, -2], [-2, 2], [-2, -2]];
        const blockOffsets = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        directions.forEach(([dx, dy], index) => {
            const nx = x + dx;
            const ny = y + dy;

            // 不能过河
            if ((color === 'black' && ny > 4) || (color === 'red' && ny < 5)) {
                return;
            }

            // 在棋盘内
            if (nx >= 0 && nx < 9 && ny >= 0 && ny < 10) {
                // 检查象眼是否被堵
                const blockX = x + blockOffsets[index][0];
                const blockY = y + blockOffsets[index][1];

                if (!board[blockY][blockX]) {
                    const target = board[ny][nx];
                    if (!target || target.color !== color) {
                        moves.push({ x: nx, y: ny });
                    }
                }
            }
        });

        return moves;
    }

    /**
     * 马的走法
     */
    static getHorseMoves(board, x, y) {
        const moves = [];
        // 8 个方向：先直走一格，再斜走一格
        const horseMoves = [
            { dx: 1, dy: 2, blockX: 0, blockY: 1 },
            { dx: 1, dy: -2, blockX: 0, blockY: -1 },
            { dx: -1, dy: 2, blockX: 0, blockY: 1 },
            { dx: -1, dy: -2, blockX: 0, blockY: -1 },
            { dx: 2, dy: 1, blockX: 1, blockY: 0 },
            { dx: 2, dy: -1, blockX: 1, blockY: 0 },
            { dx: -2, dy: 1, blockX: -1, blockY: 0 },
            { dx: -2, dy: -1, blockX: -1, blockY: 0 }
        ];

        horseMoves.forEach(({ dx, dy, blockX, blockY }) => {
            const nx = x + dx;
            const ny = y + dy;

            // 在棋盘内
            if (nx >= 0 && nx < 9 && ny >= 0 && ny < 10) {
                // 检查马脚是否被堵
                if (!board[y + blockY][x + blockX]) {
                    const piece = board[ny][nx];
                    if (!piece || piece.color !== board[y][x].color) {
                        moves.push({ x: nx, y: ny });
                    }
                }
            }
        });

        return moves;
    }

    /**
     * 车的走法
     */
    static getChariotMoves(board, x, y) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        directions.forEach(([dx, dy]) => {
            let nx = x + dx;
            let ny = y + dy;

            while (nx >= 0 && nx < 9 && ny >= 0 && ny < 10) {
                const target = board[ny][nx];
                if (!target) {
                    moves.push({ x: nx, y: ny });
                } else {
                    if (target.color !== board[y][x].color) {
                        moves.push({ x: nx, y: ny });
                    }
                    break;
                }
                nx += dx;
                ny += dy;
            }
        });

        return moves;
    }

    /**
     * 炮的走法
     */
    static getCannonMoves(board, x, y) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        directions.forEach(([dx, dy]) => {
            let nx = x + dx;
            let ny = y + dy;
            let jumped = false;

            while (nx >= 0 && nx < 9 && ny >= 0 && ny < 10) {
                const target = board[ny][nx];
                if (!jumped) {
                    if (!target) {
                        moves.push({ x: nx, y: ny });
                    } else {
                        jumped = true;
                    }
                } else {
                    if (target) {
                        if (target.color !== board[y][x].color) {
                            moves.push({ x: nx, y: ny });
                        }
                        break;
                    }
                }
                nx += dx;
                ny += dy;
            }
        });

        return moves;
    }

    /**
     * 兵/卒的走法
     */
    static getSoldierMoves(board, x, y, color) {
        const moves = [];
        const forward = color === 'red' ? -1 : 1;

        // 前进
        const ny = y + forward;
        if (ny >= 0 && ny < 10) {
            const target = board[ny][x];
            if (!target || target.color !== color) {
                moves.push({ x, y: ny });
            }
        }

        // 过河后可以横走
        const crossedRiver = (color === 'red' && y <= 4) || (color === 'black' && y >= 5);
        if (crossedRiver) {
            [[x - 1, y], [x + 1, y]].forEach(([nx, ny]) => {
                if (nx >= 0 && nx < 9) {
                    const target = board[ny][nx];
                    if (!target || target.color !== color) {
                        moves.push({ x: nx, y: ny });
                    }
                }
            });
        }

        return moves;
    }

    /**
     * 查找将/帅的位置
     */
    static findKing(board, color) {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const piece = board[y][x];
                if (piece && piece.type === PIECE_TYPES.KING && piece.color === color) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    /**
     * 检查路径是否畅通（用于将帅对面）
     */
    static isPathClear(board, x1, y1, x2, y2) {
        if (x1 !== x2) return false;

        const minY = Math.min(y1, y2) + 1;
        const maxY = Math.max(y1, y2);

        for (let y = minY; y < maxY; y++) {
            if (board[y][x1]) return false;
        }
        return true;
    }

    /**
     * 检查是否将军
     */
    static isInCheck(board, color) {
        const kingPos = this.findKing(board, color);
        if (!kingPos) return false;

        const enemyColor = color === 'red' ? 'black' : 'red';
        const enemyPieces = getPiecesByColor(board, enemyColor);

        for (const piece of enemyPieces) {
            const moves = this.getValidMoves(board, piece.x, piece.y);
            if (moves.some(m => m.x === kingPos.x && m.y === kingPos.y)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否将死
     */
    static isCheckmate(board, color) {
        if (!this.isInCheck(board, color)) return false;

        const pieces = getPiecesByColor(board, color);
        for (const piece of pieces) {
            const moves = this.getValidMoves(board, piece.x, piece.y);
            for (const move of moves) {
                // 模拟走棋
                const testBoard = cloneBoard(board);
                testBoard[move.y][move.x] = testBoard[piece.y][piece.x];
                testBoard[piece.y][piece.x] = null;

                if (!this.isInCheck(testBoard, color)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 检查是否困毙（无子可动）
     */
    static isStalemate(board, color) {
        const pieces = getPiecesByColor(board, color);
        for (const piece of pieces) {
            const moves = this.getValidMoves(board, piece.x, piece.y);
            for (const move of moves) {
                const testBoard = cloneBoard(board);
                testBoard[move.y][move.x] = testBoard[piece.y][piece.x];
                testBoard[piece.y][piece.x] = null;

                if (!this.isInCheck(testBoard, color)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 走棋后检查是否导致自己被将军
     */
    static wouldBeInCheck(board, fromX, fromY, toX, toY, color) {
        const testBoard = cloneBoard(board);
        testBoard[toY][toX] = testBoard[fromY][fromX];
        testBoard[fromY][fromX] = null;
        return this.isInCheck(testBoard, color);
    }

    /**
     * 获取所有合法走法（排除会导致自己被将军的走法）
     */
    static getAllLegalMoves(board, color) {
        const pieces = getPiecesByColor(board, color);
        const allMoves = [];

        for (const piece of pieces) {
            const moves = this.getValidMoves(board, piece.x, piece.y);
            for (const move of moves) {
                if (!this.wouldBeInCheck(board, piece.x, piece.y, move.x, move.y, color)) {
                    allMoves.push({
                        fromX: piece.x,
                        fromY: piece.y,
                        toX: move.x,
                        toY: move.y,
                        piece: piece
                    });
                }
            }
        }

        return allMoves;
    }
}

// 导出
window.Rules = Rules;
