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

        const pts = this.body.map((seg, i) => {
            const prev = this.prevBody[i] || seg;
            return this._interpPos(seg, prev, t);
        });

        if (pts.length < 2) return;

        const splinePts = this._buildSplinePath(pts);

        // 绘制卡通蛇身
        this._drawCartoonBody(ctx, splinePts, len);

        // 绘制蛇头（手绘）
        const headR = GRID_SIZE * 0.6;
        this._drawHead(ctx, splinePts[0], splinePts[Math.min(3, splinePts.length - 1)], headR);
    }

    _buildSplinePath(pts) {
        if (pts.length < 2) return pts;
        const result = [];
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

    // 卡通风格蛇身：圆润、有光泽、带腹部条纹
    _drawCartoonBody(ctx, splinePts, segCount) {
        const totalPts = splinePts.length;
        if (totalPts < 2) return;

        const headR = GRID_SIZE * 0.48;
        const tailR = GRID_SIZE * 0.10;

        // 构建左右轮廓
        const leftContour = [];
        const rightContour = [];

        for (let i = 0; i < totalPts; i++) {
            const ratio = i / (totalPts - 1);
            const r = headR - (headR - tailR) * ratio;

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

        ctx.save();

        // --- 主体填充：鲜亮的绿色卡通渐变 ---
        const grad = ctx.createLinearGradient(
            splinePts[0].x, splinePts[0].y,
            splinePts[totalPts - 1].x, splinePts[totalPts - 1].y
        );
        grad.addColorStop(0, '#4ade80');   // 亮绿
        grad.addColorStop(0.5, '#22c55e'); // 中绿
        grad.addColorStop(1, '#16a34a');   // 深绿

        // 描边（卡通轮廓线）
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#166534';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // 构建闭合路径
        ctx.beginPath();
        ctx.moveTo(leftContour[0].x, leftContour[0].y);
        for (let i = 1; i < leftContour.length; i++) {
            ctx.lineTo(leftContour[i].x, leftContour[i].y);
        }
        const tailPt = splinePts[totalPts - 1];
        const tailLeft = leftContour[totalPts - 1];
        const tailAngle = Math.atan2(tailLeft.y - tailPt.y, tailLeft.x - tailPt.x);
        ctx.arc(tailPt.x, tailPt.y, tailR, tailAngle, tailAngle + Math.PI);
        for (let i = rightContour.length - 1; i >= 0; i--) {
            ctx.lineTo(rightContour[i].x, rightContour[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.stroke();

        // --- 腹部浅色条纹（沿中心线偏下） ---
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(187, 247, 208, 0.45)';
        ctx.lineWidth = headR * 0.55;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(splinePts[0].x, splinePts[0].y);
        for (let i = 1; i < totalPts; i++) {
            ctx.lineTo(splinePts[i].x, splinePts[i].y);
        }
        ctx.stroke();

        // --- 高光条纹（沿中心线偏上，模拟光泽） ---
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = headR * 0.22;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // 偏移高光位置
        for (let i = 0; i < totalPts; i++) {
            const ratio = i / (totalPts - 1);
            const r = (headR - (headR - tailR) * ratio) * 0.3;
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
            const nx = -ty / tLen;
            const ny = tx / tLen;
            const hx = splinePts[i].x + nx * r;
            const hy = splinePts[i].y + ny * r;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.stroke();

        // --- 卡通斑纹（深色圆点） ---
        const spotInterval = Math.floor(totalPts / segCount) * 2;
        for (let i = spotInterval; i < totalPts - spotInterval; i += spotInterval) {
            const ratio = i / (totalPts - 1);
            const r = (headR - (headR - tailR) * ratio) * 0.28;
            if (r > 2) {
                ctx.beginPath();
                ctx.arc(splinePts[i].x, splinePts[i].y, r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(21, 128, 61, 0.4)';
                ctx.fill();
            }
        }

        ctx.restore();
    }

    _drawHead(ctx, pos, nextPos, r) {
        ctx.save();
        ctx.translate(pos.x, pos.y);

        const angle = Math.atan2(pos.y - nextPos.y, pos.x - nextPos.x);
        ctx.rotate(angle);

        // 头部椭圆
        const headGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.05, 0, 0, r * 1.1);
        headGrad.addColorStop(0, '#86efac');
        headGrad.addColorStop(0.45, '#4ade80');
        headGrad.addColorStop(1, '#166534');
        ctx.fillStyle = headGrad;
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(r * 0.08, 0, r * 1.1, r * 0.92, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 鼻尖
        ctx.fillStyle = '#15803d';
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
    }
}
