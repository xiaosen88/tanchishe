import { COLS, ROWS, GRID_SIZE, COLORS, FOOD_TYPE } from './constants.js';
import { Collision } from './collision.js';

export class Food {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.type = FOOD_TYPE.NORMAL;
        this.animationPhase = 0;
    }

    generate(snake) {
        // 随机决定食物类型
        const rand = Math.random();
        if (rand < 0.9) {
            this.type = FOOD_TYPE.NORMAL;
        } else if (rand < 0.95) {
            this.type = FOOD_TYPE.DOUBLE;
        } else {
            this.type = FOOD_TYPE.SPEED;
        }

        // 生成随机位置，避开蛇身
        let validPosition = false;
        while (!validPosition) {
            this.position.x = Math.floor(Math.random() * COLS);
            this.position.y = Math.floor(Math.random() * ROWS);
            validPosition = Collision.isPositionValid(this.position.x, this.position.y, snake);
        }

        this.animationPhase = 0;
    }

    getPosition() {
        return this.position;
    }

    getType() {
        return this.type;
    }

    render(ctx) {
        const x = this.position.x * GRID_SIZE + GRID_SIZE / 2;
        const y = this.position.y * GRID_SIZE + GRID_SIZE / 2;

        // 呼吸动画
        this.animationPhase += 0.05;
        const scale = 0.9 + Math.sin(this.animationPhase) * 0.1;
        const radius = (GRID_SIZE / 2 - 2) * scale;

        // 根据类型设置颜色
        let color = COLORS.food;
        if (this.type === FOOD_TYPE.DOUBLE) {
            color = COLORS.specialFood.double;
        } else if (this.type === FOOD_TYPE.SPEED) {
            color = COLORS.specialFood.speed;
        }

        // 发光效果
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;

        // 绘制食物
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 额外的光晕层
        ctx.shadowBlur = 30;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.fill();

        // 重置
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}
