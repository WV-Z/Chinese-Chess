/**
 * 主入口文件
 * 初始化游戏并绑定全局事件
 */

let game = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建游戏实例
    game = new ChineseChessGame();

    // 绑定全局按钮事件
    bindGlobalEvents();

    // 键盘快捷键
    bindKeyboardEvents();

    console.log('🏮 中国象棋游戏已启动');
    console.log(' 操作说明：点击棋子选择，再点击目标位置移动');
});

/**
 * 绑定全局按钮事件
 */
function bindGlobalEvents() {
    // 单人模式按钮
    document.querySelector('button[onclick="game.newGame(\'single\')"]')?.addEventListener('click', () => {
        console.log('🎮 切换到单人模式');
    });

    // 双人模式按钮
    document.querySelector('button[onclick="game.newGame(\'double\')"]')?.addEventListener('click', () => {
        console.log('👥 切换到双人模式');
    });

    // 阻止右键菜单
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 阻止双击缩放
    document.addEventListener('dblclick', (e) => {
        e.preventDefault();
    }, { passive: false });
}

/**
 * 绑定键盘事件
 */
function bindKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
        // ESC - 取消选择
        if (e.key === 'Escape' && game) {
            game.deselectPiece();
            game.updateTips('已取消选择');
        }

        // Z - 悔棋
        if (e.key === 'z' || e.key === 'Z') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (game) game.undo();
            }
        }

        // R - 重新开始
        if (e.key === 'r' || e.key === 'R') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (confirm('确定要重新开始吗？')) {
                    if (game) game.restart();
                }
            }
        }

        // H - 提示
        if (e.key === 'h' || e.key === 'H') {
            if (game) game.showHint();
        }

        // 方向键 - 移动选择（扩展功能）
        if (game && game.selectedPos) {
            const { x, y } = game.selectedPos;
            let newX = x;
            let newY = y;

            switch (e.key) {
                case 'ArrowUp': newY = Math.max(0, y - 1); break;
                case 'ArrowDown': newY = Math.min(9, y + 1); break;
                case 'ArrowLeft': newX = Math.max(0, x - 1); break;
                case 'ArrowRight': newX = Math.min(8, x + 1); break;
                case 'Enter': case ' ': 
                    // 确认走棋（如果有选中）
                    e.preventDefault();
                    return;
                default: return;
            }

            if (newX !== x || newY !== y) {
                e.preventDefault();
                game.selectPiece(newX, newY);
            }
        }
    });
}

/**
 * 全局工具函数
 */

// 显示设置
function openSettings() {
    if (game) game.openSettings();
}

// 滚动到顶部
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 全屏切换
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('无法进入全屏模式:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// 分享游戏
function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: '中国象棋',
            text: '一起来下中国象棋吧！',
            url: window.location.href
        }).catch(console.error);
    } else {
        // 复制链接
        navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板！');
    }
}

// 显示关于
function showAbout() {
    alert('🏮 中国象棋单机版\n\n版本：1.0.0\n作者：JVS AI Assistant\n\n功能特性：\n• 单人模式（人机对战）\n• 双人模式（本地对战）\n• 三个难度等级\n• 悔棋功能\n• 走棋提示\n\n祝您游戏愉快！');
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('页面已隐藏');
    } else {
        console.log('页面已显示');
        if (game) game.render();
    }
});

// 防止意外关闭
window.addEventListener('beforeunload', (e) => {
    if (game && game.moveCount > 5) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// 移动端优化
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 调整画布大小（移动端）
function resizeCanvas() {
    if (game && game.renderer) {
        const container = document.querySelector('.board-container');
        if (container) {
            const maxWidth = container.clientWidth - 40;
            if (maxWidth < 450 && isMobile()) {
                game.renderer.canvas.style.width = maxWidth + 'px';
                game.renderer.canvas.style.height = (maxWidth * 500 / 450) + 'px';
            }
        }
    }
}

// 窗口大小变化时调整
window.addEventListener('resize', () => {
    resizeCanvas();
});

// 初始化时调整
setTimeout(resizeCanvas, 100);

// 导出全局函数
window.openSettings = openSettings;
window.scrollToTop = scrollToTop;
window.toggleFullscreen = toggleFullscreen;
window.shareGame = shareGame;
window.showAbout = showAbout;
window.game = game;
