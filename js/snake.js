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

        // 颜色缓存，避免每帧重复计算
        this._colorCache = new Map();
    }

    move() {
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

    // 带缓动的插值
    _ease(t) {
        // smoothstep: 更平滑的过渡
        return t * t * (3 - 2 * t);
    }

    _interpPos(cur, prev, t) {
        const et = this._ease(t);
        const cx = cur.x * GRID_SIZE + GRID_SIZE / 2;
        const cy = cur.y * GRID_SIZE + GRID_SIZE / 2;
        const px = prev.x * GRID_SIZE + GRID_SIZE / 2;
        const py = prev.y * GRID_SIZE + GRID_SIZE / 2;
        return {
            x: px + (cx - px) * et,
            y: py + (cy - py) * et
        };
    }

    render(ctx, t = 1) {
        this.tonguePhase += 0.08;
        const len = this.body.length;

        // 构建插值后的控制点
        const pts = this.body.map((seg, i) => {
            const prev = this.prevBody[i] || seg;
            return this._interpPos(seg, prev, t);
        });

        if (pts.length < 2) return;

        // 用 Catmull-Rom 样条生成高密度平滑路径点
        const splinePts = this._buildSplinePath(pts);

        // 沿样条路径绘制平滑渐变蛇身
        this._drawSmoothBody(ctx, splinePts, len);

        // 绘制蛇头
        const headR = GRID_SIZE * 0.52;
        this._drawHead(ctx, splinePts[0], splinePts[Math.min(3, splinePts.length - 1)], headR);
    }

    // Catmull-Rom 样条插值，生成平滑路径
    _buildSplinePath(pts) {
        if (pts.length < 2) return pts;

        const result = [];
        // 每两个控制点之间插入若干细分点
        const subdivisions = 8;

        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(i - 1, 0)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(i + 2, pts.length - 1)];

            for (let j = 0; j < subdivisions; j++) {
                const t = j / subdivisions;
                result.push(this._catmullRom(p0, p1, p2, p3, t));
            }
        }
        // 加入最后一个点
        result.push(pts[pts.length - 1]);
        return result;
    }

    _catmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return {
            x: 0.5 * ((2 * p1.x) +
                (-p0.x + p2.x) * t +
                (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y: 0.5 * ((2 * p1.y) +
                (-p0.y + p2.y) * t +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        };
    }

    _drawSmoothBody(ctx, splinePts, segCount) {
        const totalPts = splinePts.length;
        if (totalPts < 2) return;

        // 宽度参数
        const headR = GRID_SIZE * 0.50;
        const tailR = GRID_SIZE * 0.12;

        // 计算每个样条点的法线和宽度，构建左右轮廓
        const leftContour = [];
        const rightContour = [];

        for (let i = 0; i < totalPts; i++) {
            const ratio = i / (totalPts - 1);
            // 宽度从头到尾平滑过渡
            const r = headR - (headR - tailR) * ratio;

            // 计算切线方向
            let tx, ty;
            if (i === 0) {
                tx = splinePts[1].x - splinePts[0].x;
                ty = splinePts[1].y - splinePts[0].y;
            } else if (i === totalPts - 1) {
                tx = splinePts[i].x - splinePts[i - 1].x;
                ty = splinePts[i].y - splinePts[i - 1].y;
            } else {
                tx = splinePts[i + 1].x - splinePts[i - 1].x;
                ty = splinePts[i + 1].y - splinePts[i - 1].y;
            }

            const tLen = Math.sqrt(tx * tx + ty * ty) || 1;
            // 法线（垂直于切线）
            const nx = -ty / tLen;
            const ny = tx / tLen;

            leftContour.push({
                x: splinePts[i].x + nx * r,
                y: splinePts[i].y + ny * r
            });
            rightContour.push({
                x: splinePts[i].x - nx * r,
                y: splinePts[i].y - ny * r
            });
        }

        // 绘制蛇身填充（一个连续的闭合路径）
        ctx.save();

        // 创建沿蛇身方向的渐变
        const grad = ctx.createLinearGradient(
            splinePts[0].x, splinePts[0].y,
            splinePts[totalPts - 1].x, splinePts[totalPts - 1].y
        );
        grad.addColorStop(0, '#00e8cc');
        grad.addColorStop(0.5, '#5c4de8');
        grad.addColorStop(1, '#7b2ff7');

        // 发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';

        // 构建闭合路径：左轮廓正向 + 右轮廓反向
        ctx.beginPath();
        ctx.moveTo(leftContour[0].x, leftContour[0].y);
        for (let i = 1; i < leftContour.length; i++) {
            ctx.lineTo(leftContour[i].x, leftContour[i].y);
        }
        // 尾部圆弧
        const tailPt = splinePts[totalPts - 1];
        const tailLeft = leftContour[totalPts - 1];
        const tailAngle = Math.atan2(tailLeft.y - tailPt.y, tailLeft.x - tailPt.x);
        ctx.arc(tailPt.x, tailPt.y, tailR, tailAngle, tailAngle + Math.PI);
        // 右轮廓反向
        for (let i = rightContour.length - 1; i >= 0; i--) {
            ctx.lineTo(rightContour[i].x, rightContour[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.shadowBlur = 0;

        // 高光条纹（沿中心线偏上）
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = headR * 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(splinePts[0].x, splinePts[0].y);
        for (let i = 1; i < totalPts; i++) {
            ctx.lineTo(splinePts[i].x, splinePts[i].y);
        }
        ctx.stroke();

        // 鳞片纹路（沿路径每隔一段画弧线）
        const scaleInterval = Math.floor(totalPts / segCount) * 3;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = scaleInterval; i < totalPts - scaleInterval; i += scaleInterval) {
            const ratio = i / (totalPts - 1);
            const r = (headR - (headR - tailR) * ratio) * 0.5;
            if (r > 3) {
                ctx.beginPath();
                ctx.arc(splinePts[i].x, splinePts[i].y, r, 0.4, Math.PI - 0.4);
                ctx.stroke();
            }
        }

        ctx.restore();
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

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#110022';
        ctx.beginPath();
        ctx.arc(ex + er * 0.18, ey, er * 0.58, 0, Math.PI * 2);
        ctx.fill();

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
}
