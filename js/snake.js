import { GRID_SIZE, DIRECTION, COLORS } from './constants.js';

export class Snake {
    constructor(x, y) {
        this.body = [
            { x, y },
            { x: x - 1, y },
            { x: x - 2, y }
        ];
        this.direction = DIRECTION.RIGHT;
        this.nextDirection = DIRECTION.RIGHT;
        this.growing = false;
    }

    move() {
        this.direction = this.nextDirection;

        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        this.body.unshift(head);

        if (!this.growing) {
            this.body.pop();
        } else {
            this.growing = false;
        }
    }

    grow() {
        this.growing = true;
    }

    changeDirection(newDirection) {
        // 防止180度转向
        if (this.direction.x + newDirection.x === 0 &&
            this.direction.y + newDirection.y === 0) {
            return;
        }
        this.nextDirection = newDirection;
    }

    checkSelfCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }

    getHead() {
        return this.body[0];
    }

    getBody() {
        return this.body;
    }

    render(ctx) {
        this.body.forEach((segment, index) => {
            const x = segment.x * GRID_SIZE;
            const y = segment.y * GRID_SIZE;

            // 创建渐变
            const gradient = ctx.createLinearGradient(
                x, y,
                x + GRID_SIZE, y + GRID_SIZE
            );

            if (index === 0) {
                // 蛇头：更亮的渐变
                gradient.addColorStop(0, COLORS.snakeGradient[0]);
                gradient.addColorStop(1, COLORS.snakeGradient[1]);

                // 蛇头发光效果
                ctx.shadowBlur = 20;
                ctx.shadowColor = COLORS.snakeGradient[0];
            } else {
                // 蛇身：渐变效果
                const ratio = index / this.body.length;
                gradient.addColorStop(0, COLORS.snakeGradient[0]);
                gradient.addColorStop(1, COLORS.snakeGradient[1]);

                ctx.shadowBlur = 10;
                ctx.shadowColor = COLORS.snakeGradient[1];
            }

            ctx.fillStyle = gradient;

            // 绘制圆角矩形
            const radius = 5;
            const rectX = x + 1;
            const rectY = y + 1;
            const rectW = GRID_SIZE - 2;
            const rectH = GRID_SIZE - 2;

            ctx.beginPath();
            ctx.moveTo(rectX + radius, rectY);
            ctx.lineTo(rectX + rectW - radius, rectY);
            ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + radius);
            ctx.lineTo(rectX + rectW, rectY + rectH - radius);
            ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH);
            ctx.lineTo(rectX + radius, rectY + rectH);
            ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - radius);
            ctx.lineTo(rectX, rectY + radius);
            ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
            ctx.closePath();
            ctx.fill();

            // 重置阴影
            ctx.shadowBlur = 0;
        });
    }
}
