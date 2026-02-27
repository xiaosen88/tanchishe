import { GRID_SIZE, DIRECTION } from './constants.js';

export class Snake {
    constructor(x, y) {
        this.body = [
            { x, y },
            { x: x - 1, y },
            { x: x - 2, y },
            { x: x - 3, y },
            { x: x - 4, y }
        ];
        this.prevBody = this.body.map(s => ({ ...s }));
        this.direction = DIRECTION.RIGHT;
        this.nextDirection = DIRECTION.RIGHT;
        this.growing = false;
        this.tonguePhase = 0;
    }

    move() {
        // 保存上一帧位置用于插值
        this.prevBody = this.body.map(s => ({ ...s }));

        this.direction = this.nextDirection;
        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        this.body.unshift(head);

        if (!this.growing) {
            this.body.pop();
            this.prevBody.unshift({ ...this.prevBody[0] });
        } else {
            this.growing = false;
            this.prevBody.unshift({ ...this.prevBody[0] });
        }
    }

    grow() { this.growing = true; }

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

    // 获取插值后的像素坐标
    _interpPos(cur, prev, t) {
        const cx = cur.x * GRID_SIZE + GRID_SIZE / 2;
        const cy = cur.y * GRID_SIZE + GRID_SIZE / 2;
        const px = prev.x * GRID_SIZE + GRID_SIZE / 2;
        const py = prev.y * GRID_SIZE + GRID_SIZE / 2;
        return {
            x: px + (cx - px) * t,
            y: py + (cy - py) * t
        };
    }

    render(ctx, t = 1) {
        this.tonguePhase += 0.08;
        const len = this.body.length;

        // 构建插值后的点列表
        const pts = this.body.map((seg, i) => {
            const prev = this.prevBody[i] || seg;
            return this._interpPos(seg, prev, t);
        });

        if (pts.length < 2) return;

        // 计算每段的宽度（头宽尾细）
        const headR = GRID_SIZE * 0.52;
        const tailR = GRID_SIZE * 0.18;
        const getR = (i) => headR - (headR - tailR) * (i / (len - 1));

        // 绘制蛇身（用贝塞尔曲线连接各点）
        this._drawSnakeBody(ctx, pts, len, getR);

        // 绘制蛇头
        this._drawHead(ctx, pts[0], pts[1], headR);
    }

    _drawSnakeBody(ctx, pts, len, getR) {
        if (pts.length < 2) return;

        // 用 catmull-rom 样条生成平滑路径，然后沿路径绘制变宽的蛇身
        // 先绘制身体（从尾到颈，不含头）
        for (let i = len - 1; i >= 1; i--) {
            const p0 = pts[Math.min(i + 1, len - 1)];
            const p1 = pts[i];
            const p2 = pts[i - 1];

            const r1 = getR(i);
            const r2 = getR(i - 1);

            // 计算该段的方向向量
            const dx = p2.x - p0.x;
            const dy = p2.y - p0.y;
            const len2 = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len2;
            const ny = dx / len2;

            // 颜色插值
            const ratio = i / (len - 1);
            const color = this._lerpColor('#00e8cc', '#7b2ff7', ratio);
            const darkColor = this._lerpColor('#009e8e', '#4a1a99', ratio);

            ctx.shadowBlur = 6;
            ctx.shadowColor = color;

            // 绘制该节圆形
            const grad = ctx.createRadialGradient(
                p1.x - r1 * 0.3, p1.y - r1 * 0.3, r1 * 0.05,
                p1.x, p1.y, r1
            );
            grad.addColorStop(0, this._lighten(color, 50));
            grad.addColorStop(0.5, color);
            grad.addColorStop(1, darkColor);

            ctx.beginPath();
            ctx.arc(p1.x, p1.y, r1 * 0.92, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // 连接相邻节之间的填充（消除缝隙）
            if (i < len - 1) {
                const pp = pts[i + 1];
                const rp = getR(i + 1);
                this._fillGap(ctx, pp, p1, rp * 0.9, r1 * 0.9, color, darkColor);
            }

            ctx.shadowBlur = 0;

            // 鳞片纹路
            if (i % 3 === 0 && r1 > 5) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,0.12)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(p1.x, p1.y, r1 * 0.5, 0.4, Math.PI - 0.4);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    // 填充两节之间的间隙
    _fillGap(ctx, p1, p2, r1, r2, color, darkColor) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / dist;
        const ny = dx / dist;

        ctx.beginPath();
        ctx.moveTo(p1.x + nx * r1, p1.y + ny * r1);
        ctx.lineTo(p2.x + nx * r2, p2.y + ny * r2);
        ctx.lineTo(p2.x - nx * r2, p2.y - ny * r2);
        ctx.lineTo(p1.x - nx * r1, p1.y - ny * r1);
        ctx.closePath();

        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    _drawHead(ctx, pos, nextPos, r) {
        ctx.save();
        ctx.translate(pos.x, pos.y);

        const angle = Math.atan2(pos.y - nextPos.y, pos.x - nextPos.x);
        ctx.rotate(angle);

        // 发光
        ctx.shadowBlur = 22;
        ctx.shadowColor = '#00f0ff';

        // 头部椭圆
        const headGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.05, 0, 0, r * 1.1);
        headGrad.addColorStop(0, '#60ffee');
        headGrad.addColorStop(0.45, '#00d4b8');
        headGrad.addColorStop(1, '#006e5e');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(r * 0.08, 0, r * 1.1, r * 0.92, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // 鼻尖
        ctx.fillStyle = '#00a08a';
        ctx.beginPath();
        ctx.ellipse(r * 0.95, 0, r * 0.28, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛
        this._drawEye(ctx, r * 0.18, -r * 0.42, r);
        this._drawEye(ctx, r * 0.18,  r * 0.42, r);

        // 舌头
        this._drawTongue(ctx, r);

        ctx.restore();
    }

    _drawEye(ctx, ex, ey, r) {
        const er = r * 0.22;

        // 眼白
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();

        // 瞳孔
        ctx.fillStyle = '#110022';
        ctx.beginPath();
        ctx.arc(ex + er * 0.18, ey, er * 0.58, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(ex + er * 0.05, ey - er * 0.32, er * 0.26, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawTongue(ctx, r) {
        const out = 0.5 + Math.sin(this.tonguePhase) * 0.5;
        const tLen = r * 0.65 * out;
        if (tLen < 0.05) return;

        const fLen = r * 0.28;
        const sx = r * 0.88;
        const ex = sx + tLen;

        ctx.strokeStyle = '#ff2255';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff2255';

        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(ex, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ex, 0);
        ctx.lineTo(ex + fLen * out, -fLen * 0.45 * out);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ex, 0);
        ctx.lineTo(ex + fLen * out,  fLen * 0.45 * out);
        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    _lerpColor(a, b, t) {
        const ah = a.replace('#', '');
        const bh = b.replace('#', '');
        const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
        const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
        return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`;
    }

    _lighten(color, amt) {
        const m = color.match(/\d+/g).map(Number);
        return `rgb(${Math.min(255,m[0]+amt)},${Math.min(255,m[1]+amt)},${Math.min(255,m[2]+amt)})`;
    }
}
