/**
 * AI 模块
 * 实现简单的象棋 AI
 */

class ChessAI {
    constructor(difficulty = 2) {
        this.difficulty = difficulty; // 1-简单，2-中等，3-困难
        this.searchDepth = difficulty * 2;
    }

    /**
     * 获取 AI 最佳走法
     */
    getBestMove(board, color) {
        const moves = Rules.getAllLegalMoves(board, color);
        if (moves.length === 0) return null;

        if (this.difficulty === 1) {
            // 简单：随机走法 + 吃子优先
            return this.getEasyMove(moves, board);
        } else if (this.difficulty === 2) {
            // 中等：贪心算法
            return this.getGreedyMove(moves, board);
        } else {
            // 困难：Minimax 算法
            return this.getMinimaxMove(moves, board, color);
        }
    }

    /**
     * 简单难度：随机 + 吃子
     */
    getEasyMove(moves, board) {
        // 优先吃子
        const captureMoves = moves.filter(move => {
            const target = board[move.toY][move.toX];
            return target && target.color !== board[move.fromY][move.fromX].color;
        });

        if (captureMoves.length > 0) {
            // 吃价值最高的子
            captureMoves.sort((a, b) => {
                const valueA = board[a.toY][a.toX]?.getValue() || 0;
                const valueB = board[b.toY][b.toX]?.getValue() || 0;
                return valueB - valueA;
            });
            return captureMoves[0];
        }

        // 随机走法
        return moves[Math.floor(Math.random() * moves.length)];
    }

    /**
     * 中等难度：贪心算法
     */
    getGreedyMove(moves, board) {
        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of moves) {
            const score = this.evaluateMove(move, board);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    /**
     * 评估单步走法的价值
     */
    evaluateMove(move, board) {
        let score = 0;
        const piece = board[move.fromY][move.fromX];
        const target = board[move.toY][move.toX];

        // 吃子价值
        if (target) {
            score += target.getValue() * 10;
        }

        // 位置价值
        score += this.getPositionValue(piece.type, move.toX, move.toY, piece.color);

        // 保护己方棋子
        if (this.isPieceUnderAttack(board, move.toX, move.toY, piece.color)) {
            score -= piece.getValue() * 0.5;
        }

        // 攻击对方棋子
        if (this.canAttackEnemy(board, move.toX, move.toY, piece.color)) {
            score += 5;
        }

        return score;
    }

    /**
     * 困难难度：Minimax 算法
     */
    getMinimaxMove(moves, board, color) {
        let bestMove = null;
        let bestScore = -Infinity;
        const isMaximizing = color === 'black';

        for (const move of moves) {
            const testBoard = cloneBoard(board);
            testBoard[move.toY][move.toX] = testBoard[move.fromY][move.fromX];
            testBoard[move.fromY][move.fromX] = null;

            const score = this.minimax(testBoard, this.searchDepth - 1, -Infinity, Infinity, !isMaximizing, color);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    /**
     * Minimax 算法 + Alpha-Beta 剪枝
     */
    minimax(board, depth, alpha, beta, isMaximizing, aiColor) {
        if (depth === 0) {
            return this.evaluateBoard(board, aiColor);
        }

        const color = isMaximizing ? aiColor : (aiColor === 'black' ? 'red' : 'black');
        const moves = Rules.getAllLegalMoves(board, color);

        if (moves.length === 0) {
            if (Rules.isInCheck(board, color)) {
                return isMaximizing ? -10000 : 10000; // 将死
            }
            return 0; // 困毙
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                const testBoard = cloneBoard(board);
                testBoard[move.toY][move.toX] = testBoard[move.fromY][move.fromX];
                testBoard[move.fromY][move.fromX] = null;

                const score = this.minimax(testBoard, depth - 1, alpha, beta, false, aiColor);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);

                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                const testBoard = cloneBoard(board);
                testBoard[move.toY][move.toX] = testBoard[move.fromY][move.fromX];
                testBoard[move.fromY][move.fromX] = null;

                const score = this.minimax(testBoard, depth - 1, alpha, beta, true, aiColor);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);

                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    /**
     * 评估棋盘局面
     */
    evaluateBoard(board, aiColor) {
        let score = 0;

        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const piece = board[y][x];
                if (piece) {
                    const pieceValue = piece.getValue() + this.getPositionValue(piece.type, x, y, piece.color);
                    
                    if (piece.color === aiColor) {
                        score += pieceValue;
                    } else {
                        score -= pieceValue;
                    }
                }
            }
        }

        return score;
    }

    /**
     * 获取棋子位置价值
     */
    getPositionValue(pieceType, x, y, color) {
        const redY = color === 'red' ? y : 9 - y;
        
        switch (pieceType) {
            case PIECE_TYPES.SOLDIER:
                // 兵过河后价值增加
                if (redY >= 5) return 5;
                if (redY >= 7) return 10;
                return 0;
            
            case PIECE_TYPES.HORSE:
                // 马在中心位置价值高
                if (x >= 3 && x <= 5 && redY >= 3 && redY <= 6) return 5;
                return 0;
            
            case PIECE_TYPES.CHARIOT:
                // 车要出动
                if (redY >= 2 && redY <= 7) return 3;
                return 0;
            
            case PIECE_TYPES.CANNON:
                // 炮在中路价值高
                if (x >= 3 && x <= 5) return 3;
                return 0;
            
            default:
                return 0;
        }
    }

    /**
     * 检查棋子是否被攻击
     */
    isPieceUnderAttack(board, x, y, color) {
        const enemyColor = color === 'red' ? 'black' : 'red';
        const enemyPieces = getPiecesByColor(board, enemyColor);

        for (const piece of enemyPieces) {
            const moves = Rules.getValidMoves(board, piece.x, piece.y);
            if (moves.some(m => m.x === x && m.y === y)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检查是否能攻击对方棋子
     */
    canAttackEnemy(board, x, y, color) {
        const enemyColor = color === 'red' ? 'black' : 'red';
        const enemyPieces = getPiecesByColor(board, enemyColor);

        for (const piece of enemyPieces) {
            const moves = Rules.getValidMoves(board, x, y);
            if (moves.some(m => m.x === piece.x && m.y === piece.y)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 设置难度
     */
    setDifficulty(level) {
        this.difficulty = level;
        this.searchDepth = level * 2;
    }
}

// 导出
window.ChessAI = ChessAI;
