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
        this.tonguePhase = 0; // 舌头动画相位
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
        if (this.direction.x + newDirection.x === 0 &&
            this.direction.y + newDirection.y === 0) return;
        this.nextDirection = newDirection;
    }

    checkSelfCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) return true;
        }
        return false;
    }

    getHead() { return this.body[0]; }
    getBody() { return this.body; }

    render(ctx) {
        this.tonguePhase += 0.1;
        const len = this.body.length;

        // 从尾到头绘制，确保头在最上层
        for (let index = len - 1; index >= 0; index--) {
            const seg = this.body[index];
            const cx = seg.x * GRID_SIZE + GRID_SIZE / 2;
            const cy = seg.y * GRID_SIZE + GRID_SIZE / 2;

            if (index === 0) {
                this._drawHead(ctx, cx, cy);
            } else if (index === len - 1) {
                this._drawTail(ctx, index, cx, cy);
            } else {
                this._drawBody(ctx, index, len, cx, cy);
            }
        }
    }

    // 绘制蛇身节
    _drawBody(ctx, index, len, cx, cy) {
        const r = GRID_SIZE / 2 - 1;
        const ratio = index / len;

        // 身体颜色：从青色渐变到紫色
        const bodyColor = this._lerpColor('#00e5cc', '#7b2ff7', ratio);
        const darkColor = this._lerpColor('#009e8e', '#4a1a99', ratio);

        // 发光
        ctx.shadowBlur = 8;
        ctx.shadowColor = bodyColor;

        // 主体圆形
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
        grad.addColorStop(0, this._lighten(bodyColor, 40));
        grad.addColorStop(0.6, bodyColor);
        grad.addColorStop(1, darkColor);
        ctx.fillStyle = grad;
        ctx.fill();

        // 鳞片花纹（每隔一节画）
        if (index % 2 === 0) {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.55, 0.3, Math.PI - 0.3);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    }

    // 绘制蛇头（卡通风格）
    _drawHead(ctx, cx, cy) {
        const r = GRID_SIZE / 2;
        const dir = this.direction;

        ctx.save();
        ctx.translate(cx, cy);

        // 旋转使头朝向移动方向
        const angle = Math.atan2(dir.y, dir.x);
        ctx.rotate(angle);

        // 发光
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f0ff';

        // 头部主体（椭圆形，稍大）
        const headGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r * 1.1);
        headGrad.addColorStop(0, '#40ffee');
        headGrad.addColorStop(0.5, '#00c8b0');
        headGrad.addColorStop(1, '#007a6a');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(r * 0.1, 0, r * 1.05, r * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // 鼻子（前端凸起）
        ctx.fillStyle = '#00b09a';
        ctx.beginPath();
        ctx.ellipse(r * 0.9, 0, r * 0.3, r * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛（左上、右上）
        this._drawEye(ctx, r * 0.2, -r * 0.45);
        this._drawEye(ctx, r * 0.2, r * 0.45);

        // 舌头（伸缩动画）
        this._drawTongue(ctx, r);

        ctx.restore();
    }

    // 绘制眼睛
    _drawEye(ctx, ex, ey) {
        const er = GRID_SIZE * 0.18;

        // 眼白
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();

        // 瞳孔
        ctx.fillStyle = '#1a0033';
        ctx.beginPath();
        ctx.arc(ex + er * 0.2, ey, er * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(ex + er * 0.1, ey - er * 0.3, er * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制舌头
    _drawTongue(ctx, r) {
        const tongueOut = 0.5 + Math.sin(this.tonguePhase) * 0.5; // 0~1
        const tongueLen = r * 0.7 * tongueOut;
        const forkLen = r * 0.3;

        if (tongueLen < 0.05) return;

        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ff3366';

        // 舌根到舌尖
        const startX = r * 0.85;
        const endX = startX + tongueLen;

        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(endX, 0);
        ctx.stroke();

        // 分叉
        ctx.beginPath();
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX + forkLen * tongueOut, -forkLen * 0.5 * tongueOut);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX + forkLen * tongueOut, forkLen * 0.5 * tongueOut);
        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    // 绘制蛇尾（尖细）
    _drawTail(ctx, index, cx, cy) {
        const len = this.body.length;
        const prev = this.body[index - 1];
        const pcx = prev.x * GRID_SIZE + GRID_SIZE / 2;
        const pcy = prev.y * GRID_SIZE + GRID_SIZE / 2;

        const angle = Math.atan2(cy - pcy, cx - pcx);
        const r = GRID_SIZE / 2 - 1;
        const ratio = index / len;
        const tailColor = this._lerpColor('#00e5cc', '#7b2ff7', ratio);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.shadowBlur = 6;
        ctx.shadowColor = tailColor;

        const grad = ctx.createRadialGradient(-r * 0.3, 0, 0, 0, 0, r);
        grad.addColorStop(0, this._lighten(tailColor, 30));
        grad.addColorStop(1, tailColor);
        ctx.fillStyle = grad;

        // 尖尾形状
        ctx.beginPath();
        ctx.moveTo(-r, -r * 0.7);
        ctx.quadraticCurveTo(r * 0.5, -r * 0.5, r * 1.2, 0);
        ctx.quadraticCurveTo(r * 0.5, r * 0.5, -r, r * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // 颜色插值
    _lerpColor(a, b, t) {
        const ah = a.replace('#', '');
        const bh = b.replace('#', '');
        const ar = parseInt(ah.slice(0, 2), 16);
        const ag = parseInt(ah.slice(2, 4), 16);
        const ab = parseInt(ah.slice(4, 6), 16);
        const br = parseInt(bh.slice(0, 2), 16);
        const bg = parseInt(bh.slice(2, 4), 16);
        const bb = parseInt(bh.slice(4, 6), 16);
        const rr = Math.round(ar + (br - ar) * t);
        const rg = Math.round(ag + (bg - ag) * t);
        const rb = Math.round(ab + (bb - ab) * t);
        return `rgb(${rr},${rg},${rb})`;
    }

    // 颜色加亮
    _lighten(color, amount) {
        const m = color.match(/\d+/g).map(Number);
        return `rgb(${Math.min(255, m[0] + amount)},${Math.min(255, m[1] + amount)},${Math.min(255, m[2] + amount)})`;
    }
}
