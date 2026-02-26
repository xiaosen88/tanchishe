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

// 赛博朋克配色
export const COLORS = {
    background: ['#0a0e27', '#1a1f3a'],
    snakeGradient: ['#00f0ff', '#b537f2'],
    food: '#ff006e',
    specialFood: {
        speed: '#00f0ff',
        double: '#ffd700'
    },
    grid: 'rgba(0, 240, 255, 0.1)',
    text: '#ffffff',
    glow: '#00f0ff'
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
