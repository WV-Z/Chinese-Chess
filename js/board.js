/**
 * 棋盘渲染模块
 * 负责绘制棋盘和棋子
 */

class BoardRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 50;
        this.padding = 25;
        this.selectedPos = null;
        this.validMoves = [];
        this.lastMove = null;
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.canvas.width = this.cellSize * 8 + this.padding * 2;
        this.canvas.height = this.cellSize * 9 + this.padding * 2;
    }

    /**
     * 绘制整个棋盘
     */
    draw(board) {
        this.clear();
        this.drawGrid();
        this.drawRiver();
        this.drawPieces(board);
        this.drawHighlights();
    }

    /**
     * 清空画布
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 绘制棋盘网格
     */
    drawGrid() {
        const ctx = this.ctx;
        const padding = this.padding;
        const cellSize = this.cellSize;

        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 1;

        // 横线
        for (let y = 0; y < 10; y++) {
            ctx.beginPath();
            ctx.moveTo(padding, padding + y * cellSize);
            ctx.lineTo(padding + 8 * cellSize, padding + y * cellSize);
            ctx.stroke();
        }

        // 竖线（上下两部分）
        for (let x = 0; x < 9; x++) {
            // 上半部分
            ctx.beginPath();
            ctx.moveTo(padding + x * cellSize, padding);
            ctx.lineTo(padding + x * cellSize, padding + 4 * cellSize);
            ctx.stroke();

            // 下半部分
            ctx.beginPath();
            ctx.moveTo(padding + x * cellSize, padding + 5 * cellSize);
            ctx.lineTo(padding + x * cellSize, padding + 9 * cellSize);
            ctx.stroke();
        }

        // 左右边框连接线
        ctx.beginPath();
        ctx.moveTo(padding, padding + 4 * cellSize);
        ctx.lineTo(padding, padding + 5 * cellSize);
        ctx.moveTo(padding + 8 * cellSize, padding + 4 * cellSize);
        ctx.lineTo(padding + 8 * cellSize, padding + 5 * cellSize);
        ctx.stroke();

        // 九宫格斜线
        // 上方九宫
        ctx.beginPath();
        ctx.moveTo(padding + 3 * cellSize, padding);
        ctx.lineTo(padding + 5 * cellSize, padding + 2 * cellSize);
        ctx.moveTo(padding + 5 * cellSize, padding);
        ctx.lineTo(padding + 3 * cellSize, padding + 2 * cellSize);
        ctx.stroke();

        // 下方九宫
        ctx.beginPath();
        ctx.moveTo(padding + 3 * cellSize, padding + 7 * cellSize);
        ctx.lineTo(padding + 5 * cellSize, padding + 9 * cellSize);
        ctx.moveTo(padding + 5 * cellSize, padding + 7 * cellSize);
        ctx.lineTo(padding + 3 * cellSize, padding + 9 * cellSize);
        ctx.stroke();

        // 绘制位置标记（炮和兵的位置）
        this.drawPositionMarks();
    }

    /**
     * 绘制位置标记
     */
    drawPositionMarks() {
        const ctx = this.ctx;
        const padding = this.padding;
        const cellSize = this.cellSize;
        const markSize = 5;
        const markOffset = 3;

        const positions = [
            // 炮位
            [1, 2], [7, 2], [1, 7], [7, 7],
            // 兵位
            [0, 3], [2, 3], [4, 3], [6, 3], [8, 3],
            [0, 6], [2, 6], [4, 6], [6, 6], [8, 6]
        ];

        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 1;

        positions.forEach(([x, y]) => {
            const px = padding + x * cellSize;
            const py = padding + y * cellSize;

            // 左上
            if (x > 0) {
                ctx.beginPath();
                ctx.moveTo(px - markOffset - markSize, py - markOffset);
                ctx.lineTo(px - markOffset, py - markOffset);
                ctx.lineTo(px - markOffset, py - markOffset - markSize);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(px - markOffset - markSize, py + markOffset);
                ctx.lineTo(px - markOffset, py + markOffset);
                ctx.lineTo(px - markOffset, py + markOffset + markSize);
                ctx.stroke();
            }

            // 右上
            if (x < 8) {
                ctx.beginPath();
                ctx.moveTo(px + markOffset + markSize, py - markOffset);
                ctx.lineTo(px + markOffset, py - markOffset);
                ctx.lineTo(px + markOffset, py - markOffset - markSize);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(px + markOffset + markSize, py + markOffset);
                ctx.lineTo(px + markOffset, py + markOffset);
                ctx.lineTo(px + markOffset, py + markOffset + markSize);
                ctx.stroke();
            }
        });
    }

    /**
     * 绘制楚河汉界
     */
    drawRiver() {
        const ctx = this.ctx;
        const padding = this.padding;
        const cellSize = this.cellSize;

        ctx.fillStyle = '#8b4513';
        ctx.font = 'bold 24px "KaiTi", "楷体", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 楚河
        ctx.save();
        ctx.translate(padding + 2 * cellSize, padding + 4.5 * cellSize);
        ctx.fillText('楚 河', 0, 0);
        ctx.restore();

        // 汉界
        ctx.save();
        ctx.translate(padding + 6 * cellSize, padding + 4.5 * cellSize);
        ctx.fillText('汉 界', 0, 0);
        ctx.restore();
    }

    /**
     * 绘制棋子
     */
    drawPieces(board) {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 9; x++) {
                const piece = board[y][x];
                if (piece) {
                    this.drawPiece(piece, x, y);
                }
            }
        }
    }

    /**
     * 绘制单个棋子
     */
    drawPiece(piece, x, y) {
        const ctx = this.ctx;
        const padding = this.padding;
        const cellSize = this.cellSize;

        const px = padding + x * cellSize;
        const py = padding + y * cellSize;
        const radius = cellSize * 0.4;

        // 棋子背景
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        
        // 渐变背景
        const gradient = ctx.createRadialGradient(px - 5, py - 5, 0, px, py, radius);
        gradient.addColorStop(0, '#f5deb3');
        gradient.addColorStop(1, '#d2b48c');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 棋子边框
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 内圈
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.85, 0, Math.PI * 2);
        ctx.strokeStyle = '#a0826d';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 棋子文字
        ctx.fillStyle = piece.color === 'red' ? '#c41e3a' : '#1a1a1a';
        ctx.font = 'bold 24px "KaiTi", "楷体", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(piece.getSymbol(), px, py);

        // 阴影效果
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }

    /**
     * 绘制高亮效果
     */
    drawHighlights() {
        // 选中位置
        if (this.selectedPos) {
            this.drawHighlight(this.selectedPos.x, this.selectedPos.y, 'selected');
        }

        // 可行走位置
        this.validMoves.forEach(pos => {
            this.drawHighlight(pos.x, pos.y, 'valid');
        });

        // 最后移动
        if (this.lastMove) {
            this.drawHighlight(this.lastMove.fromX, this.lastMove.fromY, 'last');
            this.drawHighlight(this.lastMove.toX, this.lastMove.toY, 'last');
        }
    }

    /**
     * 绘制单个高亮
     */
    drawHighlight(x, y, type) {
        const ctx = this.ctx;
        const padding = this.padding;
        const cellSize = this.cellSize;

        const px = padding + x * cellSize;
        const py = padding + y * cellSize;

        if (type === 'selected') {
            // 选中 - 黄色方框
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.strokeRect(px - cellSize * 0.4, py - cellSize * 0.4, cellSize * 0.8, cellSize * 0.8);
        } else if (type === 'valid') {
            // 可行走 - 绿色圆点
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(px, py, cellSize * 0.15, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'last') {
            // 最后移动 - 蓝色方框
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(px - cellSize * 0.4, py - cellSize * 0.4, cellSize * 0.8, cellSize * 0.8);
        }
    }

    /**
     * 设置选中位置
     */
    setSelectedPosition(x, y) {
        this.selectedPos = x !== null ? { x, y } : null;
    }

    /**
     * 设置可行走位置
     */
    setValidMoves(moves) {
        this.validMoves = moves;
    }

    /**
     * 设置最后移动
     */
    setLastMove(fromX, fromY, toX, toY) {
        this.lastMove = { fromX, fromY, toX, toY };
    }

    /**
     * 获取点击位置
     */
    getClickPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const padding = this.padding;
        const cellSize = this.cellSize;

        // 计算最近的交叉点
        const gridX = Math.round((x - padding) / cellSize);
        const gridY = Math.round((y - padding) / cellSize);

        // 检查是否在有效范围内
        if (gridX >= 0 && gridX < 9 && gridY >= 0 && gridY < 10) {
            // 检查是否在点击范围内
            const px = padding + gridX * cellSize;
            const py = padding + gridY * cellSize;
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

            if (distance < cellSize * 0.45) {
                return { x: gridX, y: gridY };
            }
        }

        return null;
    }

    /**
     * 清除高亮
     */
    clearHighlights() {
        this.selectedPos = null;
        this.validMoves = [];
    }
}

// 导出
window.BoardRenderer = BoardRenderer;
