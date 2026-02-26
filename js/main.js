import { DIRECTION, GAME_STATE } from './constants.js';
import { Game } from './game.js';
import { Food } from './food.js';
import { Score } from './score.js';
import { ParticleSystem } from './particle.js';
import { AudioManager } from './audio.js';
import { UI } from './ui.js';

// 初始化
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 创建游戏组件
const food = new Food();
const score = new Score();
const particleSystem = new ParticleSystem();
const audioManager = new AudioManager();
const ui = new UI();

// 创建游戏实例
const game = new Game(ctx, food, score, particleSystem, audioManager, ui);

// 当前选择的难度
let currentDifficulty = null;

// 显示初始界面
ui.showStartScreen();
ui.updateHighScoreDisplay(score.getHighScore());

// 绑定开始按钮
ui.bindStartButtons((difficulty) => {
    currentDifficulty = difficulty;
    ui.hideStartScreen();
    game.reset(difficulty);
    ui.updateScoreDisplay(0, 1);
});

// 绑定重新开始按钮
ui.bindRestartButton(() => {
    ui.hideGameOverScreen();
    game.reset(currentDifficulty);
    ui.updateScoreDisplay(0, 1);
});

// 绑定返回菜单按钮
ui.bindMenuButton(() => {
    ui.hideGameOverScreen();
    ui.showStartScreen();
    ui.updateHighScoreDisplay(score.getHighScore());
});

// 绑定静音按钮
ui.bindMuteButton(() => {
    const muted = audioManager.toggleMute();
    ui.updateMuteButton(muted);
});

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (game.getState() !== GAME_STATE.PLAYING && game.getState() !== GAME_STATE.PAUSED) {
        return;
    }

    const snake = game.getSnake();
    if (!snake) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            snake.changeDirection(DIRECTION.UP);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            snake.changeDirection(DIRECTION.DOWN);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            snake.changeDirection(DIRECTION.LEFT);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            snake.changeDirection(DIRECTION.RIGHT);
            break;
        case ' ':
            e.preventDefault();
            game.pause();
            if (game.getState() === GAME_STATE.PAUSED) {
                ui.showPauseScreen();
            } else {
                ui.hidePauseScreen();
            }
            break;
        case 'r':
        case 'R':
            if (game.getState() === GAME_STATE.PLAYING) {
                game.reset(currentDifficulty);
                ui.updateScoreDisplay(0, 1);
            }
            break;
        case 'Escape':
            if (game.getState() === GAME_STATE.PLAYING) {
                game.pause();
                ui.showPauseScreen();
            }
            break;
    }
});

// 防止空格键滚动页面
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
});

// 触摸控制（移动端）
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const minSwipeDistance = 30; // 最小滑动距离

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();

    if (game.getState() !== GAME_STATE.PLAYING) {
        return;
    }

    const snake = game.getSnake();
    if (!snake) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // 判断滑动方向
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑动
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                snake.changeDirection(DIRECTION.RIGHT);
            } else {
                snake.changeDirection(DIRECTION.LEFT);
            }
        }
    } else {
        // 垂直滑动
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                snake.changeDirection(DIRECTION.DOWN);
            } else {
                snake.changeDirection(DIRECTION.UP);
            }
        }
    }
}, { passive: false });

// 防止移动端双击缩放
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// 虚拟按键控制
const virtualControls = document.getElementById('virtualControls');
if (virtualControls) {
    const virtualButtons = virtualControls.querySelectorAll('.virtual-btn');

    virtualButtons.forEach(btn => {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();

            if (game.getState() !== GAME_STATE.PLAYING) {
                return;
            }

            const snake = game.getSnake();
            if (!snake) return;

            const direction = btn.getAttribute('data-direction');

            switch (direction) {
                case 'UP':
                    snake.changeDirection(DIRECTION.UP);
                    break;
                case 'DOWN':
                    snake.changeDirection(DIRECTION.DOWN);
                    break;
                case 'LEFT':
                    snake.changeDirection(DIRECTION.LEFT);
                    break;
                case 'RIGHT':
                    snake.changeDirection(DIRECTION.RIGHT);
                    break;
            }
        }, { passive: false });
    });
}
