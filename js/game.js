import { GAME_STATE, CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, COLORS, DIFFICULTY } from './constants.js';
import { Snake } from './snake.js';
import { Collision } from './collision.js';

export class Game {
    constructor(ctx, food, score, particleSystem, audioManager, ui) {
        this.ctx = ctx;
        this.food = food;
        this.score = score;
        this.particleSystem = particleSystem;
        this.audioManager = audioManager;
        this.ui = ui;

        this.state = GAME_STATE.MENU;
        this.snake = null;
        this.difficulty = null;
        this.speed = 100;
        this.lastUpdateTime = 0;
        this.animationId = null;
        this.speedBoostEndTime = 0;
    }

    init(difficulty) {
        this.difficulty = DIFFICULTY[difficulty];
        this.speed = this.difficulty.initialSpeed;
        this.snake = new Snake(Math.floor(CANVAS_WIDTH / GRID_SIZE / 2), Math.floor(CANVAS_HEIGHT / GRID_SIZE / 2));
        this.food.generate(this.snake);
        this.score.reset();
        this.particleSystem.clear();
        this.state = GAME_STATE.PLAYING;
        this.lastUpdateTime = 0;
        this.speedBoostEndTime = 0;
    }

    start() {
        this.gameLoop(0);
    }

    pause() {
        if (this.state === GAME_STATE.PLAYING) {
            this.state = GAME_STATE.PAUSED;
        } else if (this.state === GAME_STATE.PAUSED) {
            this.state = GAME_STATE.PLAYING;
            this.lastUpdateTime = 0;
        }
    }

    reset(difficulty) {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.init(difficulty);
        this.start();
    }

    gameLoop(timestamp) {
        this.animationId = requestAnimationFrame((ts) => this.gameLoop(ts));

        // 更新粒子（每帧）
        this.particleSystem.update();

        // 游戏逻辑更新（根据速度）
        if (this.state === GAME_STATE.PLAYING) {
            const currentSpeed = this.getCurrentSpeed();

            if (timestamp - this.lastUpdateTime >= currentSpeed) {
                this.update();
                this.lastUpdateTime = timestamp;
            }
        }

        // 渲染（每帧）
        this.render();
    }

    getCurrentSpeed() {
        // 检查是否有加速效果
        if (Date.now() < this.speedBoostEndTime) {
            return this.speed * 0.7; // 加速30%
        }
        return this.speed;
    }

    update() {
        this.snake.move();

        // 检查碰撞
        if (Collision.checkWallCollision(this.snake) || Collision.checkSelfCollision(this.snake)) {
            this.gameOver();
            return;
        }

        // 检查食物碰撞
        if (Collision.checkFoodCollision(this.snake, this.food)) {
            this.eatFood();
        }
    }

    eatFood() {
        const foodType = this.food.getType();
        const foodPos = this.food.getPosition();
        const x = foodPos.x * GRID_SIZE + GRID_SIZE / 2;
        const y = foodPos.y * GRID_SIZE + GRID_SIZE / 2;

        this.snake.grow();

        // 根据食物类型处理
        let points = 0;
        let color = COLORS.food;

        if (foodType === 'normal') {
            points = 10;
            this.audioManager.play('eat');
        } else if (foodType === 'double') {
            points = 20;
            color = COLORS.specialFood.double;
            this.audioManager.play('eat');
            this.ui.showNotification('+20!');
        } else if (foodType === 'speed') {
            points = 10;
            color = COLORS.specialFood.speed;
            this.speedBoostEndTime = Date.now() + 3000;
            this.audioManager.play('eat');
            this.ui.showNotification('加速!');
        }

        // 添加分数
        const oldLevel = this.score.getLevel();
        this.score.addScore(points);
        const newLevel = this.score.getLevel();

        // 检查升级
        if (newLevel > oldLevel) {
            this.levelUp();
        }

        // 更新速度
        this.speed = this.score.calculateSpeed(this.difficulty);

        // 生成粒子效果
        this.particleSystem.createExplosion(x, y, color);

        // 生成新食物
        this.food.generate(this.snake);

        // 更新UI
        this.ui.updateScoreDisplay(this.score.getScore(), this.score.getLevel());
    }

    levelUp() {
        this.audioManager.play('levelup');
        this.ui.showNotification('Level Up!');
    }

    gameOver() {
        this.state = GAME_STATE.GAMEOVER;
        this.audioManager.play('gameover');
        this.score.saveHighScore();
        this.ui.showGameOverScreen(this.score.getScore(), this.score.getHighScore());
    }

    render() {
        // 清空画布
        this.ctx.fillStyle = COLORS.background[0];
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 绘制网格
        this.renderGrid();

        // 绘制食物
        this.food.render(this.ctx);

        // 绘制蛇
        if (this.snake) {
            this.snake.render(this.ctx);
        }

        // 绘制粒子
        this.particleSystem.render(this.ctx);
    }

    renderGrid() {
        this.ctx.strokeStyle = COLORS.grid;
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, CANVAS_HEIGHT);
            this.ctx.stroke();
        }

        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(CANVAS_WIDTH, y);
            this.ctx.stroke();
        }
    }

    getState() {
        return this.state;
    }

    getSnake() {
        return this.snake;
    }
}
