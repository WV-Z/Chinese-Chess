/**
 * 游戏主逻辑模块
 */

class ChineseChessGame {
    constructor() {
        this.board = null;
        this.renderer = null;
        this.currentTurn = 'red';
        this.gameMode = 'double'; // 'single' or 'double'
        this.moveCount = 0;
        this.moveHistory = [];
        this.capturedPieces = { red: [], black: [] };
        this.selectedPos = null;
        this.ai = null;
        this.isAIThinking = false;
        this.settings = {
            difficulty: 2,
            pieceStyle: 'text',
            showHint: true,
            soundEnabled: true
        };

        this.init();
    }

    /**
     * 初始化游戏
     */
    init() {
        this.renderer = new BoardRenderer('boardCanvas');
        this.ai = new ChessAI(this.settings.difficulty);
        
        // 绑定画布点击事件
        this.renderer.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // 开始新游戏
        this.newGame('double');
    }

    /**
     * 开始新游戏
     */
    newGame(mode) {
        this.gameMode = mode;
        this.board = initializeBoard();
        this.currentTurn = 'red';
        this.moveCount = 0;
        this.moveHistory = [];
        this.capturedPieces = { red: [], black: [] };
        this.selectedPos = null;
        this.isAIThinking = false;

        // 关闭弹窗
        document.getElementById('gameOverModal').classList.remove('active');

        // 更新 UI
        this.updateInfo();
        this.render();
        this.clearHistory();
        this.updateCapturedPieces();
        this.updateTips('红方先行，点击棋子选择');

        // 单人模式，黑方 AI 先思考
        if (mode === 'single') {
            this.updateTips('单人模式 - 红方先行');
        }
    }

    /**
     * 重新开始
     */
    restart() {
        this.newGame(this.gameMode);
    }

    /**
     * 渲染棋盘
     */
    render() {
        this.renderer.draw(this.board);
    }

    /**
     * 处理画布点击
     */
    handleCanvasClick(e) {
        if (this.isAIThinking) return;

        const pos = this.renderer.getClickPosition(e.clientX, e.clientY);
        if (!pos) return;

        const { x, y } = pos;
        const piece = this.board[y][x];

        // 如果已选中棋子
        if (this.selectedPos) {
            // 点击的是己方棋子，重新选择
            if (piece && piece.color === this.currentTurn) {
                this.selectPiece(x, y);
                return;
            }

            // 尝试走棋
            const fromX = this.selectedPos.x;
            const fromY = this.selectedPos.y;
            
            if (this.isValidMove(fromX, fromY, x, y)) {
                this.makeMove(fromX, fromY, x, y);
            } else {
                // 取消选择
                this.deselectPiece();
            }
        } else {
            // 选择己方棋子
            if (piece && piece.color === this.currentTurn) {
                this.selectPiece(x, y);
            }
        }
    }

    /**
     * 选择棋子
     */
    selectPiece(x, y) {
        this.selectedPos = { x, y };
        this.renderer.setSelectedPosition(x, y);

        // 显示可行走位置
        const moves = Rules.getValidMoves(this.board, x, y);
        const validMoves = moves.filter(move => 
            !Rules.wouldBeInCheck(this.board, x, y, move.x, move.y, this.currentTurn)
        );

        this.renderer.setValidMoves(validMoves);
        this.render();

        if (this.settings.showHint) {
            this.updateTips(`可走 ${validMoves.length} 步`);
        }
    }

    /**
     * 取消选择
     */
    deselectPiece() {
        this.selectedPos = null;
        this.renderer.clearHighlights();
        this.render();
    }

    /**
     * 检查走法是否合法
     */
    isValidMove(fromX, fromY, toX, toY) {
        const moves = Rules.getValidMoves(this.board, fromX, fromY);
        return moves.some(m => m.x === toX && m.y === toY) &&
               !Rules.wouldBeInCheck(this.board, fromX, fromY, toX, toY, this.currentTurn);
    }

    /**
     * 执行走棋
     */
    makeMove(fromX, fromY, toX, toY) {
        const piece = this.board[fromY][fromX];
        const captured = this.board[toY][toX];

        // 记录走棋
        this.moveHistory.push({
            fromX, fromY, toX, toY,
            piece: piece.getSymbol(),
            captured: captured ? captured.getSymbol() : null,
            color: this.currentTurn
        });

        // 记录被吃棋子
        if (captured) {
            this.capturedPieces[captured.color].push(captured.getSymbol());
        }

        // 更新棋盘
        this.board[toY][toX] = piece;
        this.board[fromY][fromX] = null;
        piece.moveTo(toX, toY);

        // 更新 UI
        this.moveCount++;
        this.renderer.setLastMove(fromX, fromY, toX, toY);
        this.deselectPiece();
        this.updateInfo();
        this.updateHistory();
        this.updateCapturedPieces();

        // 播放音效
        this.playMoveSound();

        // 检查游戏状态
        const enemyColor = this.currentTurn === 'red' ? 'black' : 'red';
        
        if (Rules.isCheckmate(this.board, enemyColor)) {
            this.gameOver(this.currentTurn, '将死');
            return;
        }

        if (Rules.isInCheck(this.board, enemyColor)) {
            this.updateTips('将军！');
        } else {
            this.updateTips(`${this.currentTurn === 'red' ? '黑方' : '红方'}走棋`);
        }

        // 切换回合
        this.currentTurn = enemyColor;
        this.updateInfo();

        // 单人模式，AI 走棋
        if (this.gameMode === 'single' && this.currentTurn === 'black') {
            this.makeAIMove();
        }
    }

    /**
     * AI 走棋
     */
    makeAIMove() {
        this.isAIThinking = true;
        this.updateTips('AI 思考中...');

        setTimeout(() => {
            const move = this.ai.getBestMove(this.board, 'black');
            
            if (move) {
                this.makeMove(move.fromX, move.fromY, move.toX, move.toY);
            } else {
                this.gameOver('red', '困毙');
            }

            this.isAIThinking = false;
        }, 500);
    }

    /**
     * 悔棋
     */
    undo() {
        if (this.moveHistory.length === 0 || this.isAIThinking) return;

        // 单人模式悔两步
        const steps = this.gameMode === 'single' ? 2 : 1;
        
        for (let i = 0; i < steps && this.moveHistory.length > 0; i++) {
            const lastMove = this.moveHistory.pop();
            
            // 恢复棋子
            const piece = this.board[lastMove.toY][lastMove.toX];
            this.board[lastMove.fromY][lastMove.fromX] = piece;
            this.board[lastMove.toY][lastMove.toX] = null;
            
            piece.moveTo(lastMove.fromX, lastMove.fromY);

            // 恢复被吃棋子
            if (lastMove.captured) {
                this.capturedPieces[lastMove.color === 'red' ? 'black' : 'red'].pop();
            }

            // 切换回合
            this.currentTurn = lastMove.color;
            this.moveCount--;
        }

        this.deselectPiece();
        this.updateInfo();
        this.updateHistory();
        this.updateCapturedPieces();
        this.render();
        this.updateTips('悔棋成功');
    }

    /**
     * 游戏结束
     */
    gameOver(winner, reason) {
        const winnerText = winner === 'red' ? '🎉 红方获胜！' : '🎉 黑方获胜！';
        const resultText = reason === '将死' ? '将军！对方无路可走' : '对方无子可动';

        document.getElementById('winnerText').textContent = winnerText;
        document.getElementById('gameResult').textContent = resultText;
        document.getElementById('gameOverModal').classList.add('active');
    }

    /**
     * 显示提示
     */
    showHint() {
        if (!this.selectedPos) {
            this.updateTips('请先选择一个棋子');
            return;
        }

        const moves = Rules.getValidMoves(this.board, this.selectedPos.x, this.selectedPos.y);
        if (moves.length === 0) {
            this.updateTips('此棋子无法移动');
        } else {
            this.updateTips(`可走位置：${moves.length} 个`);
        }
    }

    /**
     * 更新信息栏
     */
    updateInfo() {
        document.getElementById('gameMode').textContent = 
            this.gameMode === 'single' ? '单人模式' : '双人模式';
        
        document.getElementById('currentTurn').textContent = 
            this.currentTurn === 'red' ? '🔴 红方' : '⚫ 黑方';
        
        document.getElementById('moveCount').textContent = this.moveCount;
    }

    /**
     * 更新走棋记录
     */
    updateHistory() {
        const historyEl = document.getElementById('moveHistory');
        
        if (this.moveHistory.length === 0) {
            historyEl.innerHTML = '<div class="history-empty">暂无走棋记录</div>';
            return;
        }

        let html = '';
        for (let i = 0; i < this.moveHistory.length; i += 2) {
            const redMove = this.moveHistory[i];
            const blackMove = this.moveHistory[i + 1];
            const moveNum = Math.floor(i / 2) + 1;

            html += `
                <div class="move-record">
                    <span class="move-number">${moveNum}.</span>
                    <span class="move-detail">${redMove.piece} (${redMove.fromX},${redMove.fromY})→(${redMove.toX},${redMove.toY})${redMove.captured ? ' 吃' + redMove.captured : ''}</span>
                    ${blackMove ? `<span class="move-detail">${blackMove.piece} (${blackMove.fromX},${blackMove.fromY})→(${blackMove.toX},${blackMove.toY})${blackMove.captured ? ' 吃' + blackMove.captured : ''}</span>` : ''}
                </div>
            `;
        }

        historyEl.innerHTML = html;
        historyEl.scrollTop = historyEl.scrollHeight;
    }

    /**
     * 清空历史记录
     */
    clearHistory() {
        document.getElementById('moveHistory').innerHTML = '<div class="history-empty">暂无走棋记录</div>';
    }

    /**
     * 更新被吃棋子
     */
    updateCapturedPieces() {
        const redEl = document.getElementById('capturedRed');
        const blackEl = document.getElementById('capturedBlack');

        redEl.innerHTML = this.capturedPieces.red.map(p => 
            `<span class="captured-piece red">${p}</span>`
        ).join('');

        blackEl.innerHTML = this.capturedPieces.black.map(p => 
            `<span class="captured-piece black">${p}</span>`
        ).join('');
    }

    /**
     * 更新提示
     */
    updateTips(text) {
        document.getElementById('gameTips').textContent = text;
    }

    /**
     * 播放音效
     */
    playMoveSound() {
        if (!this.settings.soundEnabled) return;
        
        // 简单的点击音效
        const audio = document.getElementById('moveSound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        this.settings.difficulty = parseInt(document.getElementById('difficulty').value);
        this.settings.pieceStyle = document.getElementById('pieceStyle').value;
        this.settings.showHint = document.getElementById('showHint').checked;
        this.settings.soundEnabled = document.getElementById('soundEnabled').checked;

        this.ai.setDifficulty(this.settings.difficulty);
        
        document.getElementById('settingsModal').classList.remove('active');
        this.updateTips('设置已保存');
    }

    /**
     * 打开设置
     */
    openSettings() {
        document.getElementById('difficulty').value = this.settings.difficulty;
        document.getElementById('pieceStyle').value = this.settings.pieceStyle;
        document.getElementById('showHint').checked = this.settings.showHint;
        document.getElementById('soundEnabled').checked = this.settings.soundEnabled;
        
        document.getElementById('settingsModal').classList.add('active');
    }
}

// 导出
window.ChineseChessGame = ChineseChessGame;
