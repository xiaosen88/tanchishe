// 游戏配置常量
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GRID_SIZE = 20;
export const COLS = CANVAS_WIDTH / GRID_SIZE;
export const ROWS = CANVAS_HEIGHT / GRID_SIZE;

// 游戏状态
export const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAMEOVER: 'gameover'
};

// 方向
export const DIRECTION = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// 难度配置
export const DIFFICULTY = {
    EASY: {
        name: '简单',
        initialSpeed: 150,
        speedDecrease: 3,
        minSpeed: 50
    },
    NORMAL: {
        name: '普通',
        initialSpeed: 100,
        speedDecrease: 5,
        minSpeed: 30
    },
    HARD: {
        name: '困难',
        initialSpeed: 70,
        speedDecrease: 7,
        minSpeed: 20
    }
};

// 简约配色
export const COLORS = {
    background: ['#ffffff', '#ffffff'],
    snakeGradient: ['#3498db', '#2980b9'],
    food: '#e74c3c',
    specialFood: {
        speed: '#3498db',
        double: '#f39c12'
    },
    grid: 'rgba(0, 0, 0, 0.05)',
    text: '#2c3e50',
    glow: '#3498db'
};

// 食物类型
export const FOOD_TYPE = {
    NORMAL: 'normal',
    SPEED: 'speed',
    DOUBLE: 'double'
};

// 分数配置
export const SCORE_CONFIG = {
    normal: 10,
    double: 20,
    levelUpScore: 100
};
