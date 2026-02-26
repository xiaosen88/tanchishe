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
